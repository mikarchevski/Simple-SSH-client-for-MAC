use anyhow::Result;
use russh::client;
use russh_keys::*;
use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::{AppHandle, Emitter};
use lazy_static::lazy_static;
use std::collections::HashMap;
use tokio::sync::mpsc;

lazy_static! {
    static ref SESSIONS: Mutex<HashMap<String, mpsc::Sender<Vec<u8>>>> = 
        Mutex::new(HashMap::new());
}

#[derive(Debug, serde::Deserialize)]
pub struct SshCredentials {
    pub session_id: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
}

struct Client;

#[async_trait::async_trait]
impl client::Handler for Client {
    type Error = anyhow::Error;

    async fn check_server_key(
        &mut self,
        _server_public_key: &key::PublicKey,
    ) -> Result<bool, Self::Error> {
        Ok(true)
    }
}

#[tauri::command]
pub async fn ssh_connect(
    app_handle: AppHandle,
    creds: SshCredentials,
) -> Result<String, String> {
    let config = client::Config::default();
    
    let mut session = client::connect(
        Arc::new(config),
        (creds.host.clone(), creds.port),
        Client,
    )
    .await
    .map_err(|e| format!("Connection failed: {}", e))?;

    let auth_res = session
        .authenticate_password(creds.username.clone(), creds.password.clone())
        .await
        .map_err(|e| format!("Authentication failed: {}", e))?;

    if !auth_res {
        return Err("Authentication failed".to_string());
    }

    let mut channel = session
        .channel_open_session()
        .await
        .map_err(|e| format!("Failed to open channel: {}", e))?;

    channel
        .request_pty(true, "xterm-256color", 80, 24, 0, 0, &[])
        .await
        .map_err(|e| format!("Failed to request PTY: {}", e))?;

    channel
        .request_shell(true)
        .await
        .map_err(|e| format!("Failed to request shell: {}", e))?;

    // Создаем канал для отправки данных от пользователя
    let (tx, mut rx) = mpsc::channel::<Vec<u8>>(100);
    
    // Сохраняем sender
    {
        let mut sessions = SESSIONS.lock().await;
        sessions.insert(creds.session_id.clone(), tx.clone());
    }

    let session_id_clone = creds.session_id.clone();
    let app_handle_clone = app_handle.clone();
    
    // ОДНА фоновая задача для чтения И записи через tokio::select!
    tokio::spawn(async move {
        loop {
            tokio::select! {
                // 1. Читаем данные от сервера
                msg = channel.wait() => {
                    match msg {
                        Some(russh::ChannelMsg::Data { ref data }) => {
                            let text = String::from_utf8_lossy(data).to_string();
                            let _ = app_handle_clone.emit("ssh-data", (session_id_clone.clone(), text));
                        }
                        Some(russh::ChannelMsg::Eof) => {
                            let _ = app_handle_clone.emit("ssh-closed", session_id_clone.clone());
                            break;
                        }
                        _ => {}
                    }
                }
                // 2. Отправляем данные от пользователя
                data = rx.recv() => {
                    if let Some(data_bytes) = data {
                        // ИСПРАВЛЕНИЕ: используем .as_slice(), чтобы передать &[u8], который реализует AsyncRead
                        if let Err(e) = channel.data(data_bytes.as_slice()).await {
                            eprintln!("Failed to send data: {}", e);
                        }
                    } else {
                        break; // Канал закрыт
                    }
                }
            }
        }
    });

    Ok(creds.session_id)
}

#[tauri::command]
pub async fn ssh_send(session_id: String, data: String) -> Result<(), String> {
    let sessions = SESSIONS.lock().await;
    if let Some(tx) = sessions.get(&session_id) {
        tx.send(data.into_bytes())
            .await
            .map_err(|e| format!("Failed to send: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn ssh_resize(_session_id: String, _cols: u32, _rows: u32) -> Result<(), String> {
    // Заглушка, чтобы компилятор не ругался на неиспользуемые переменные
    // Реализация ресайза добавляется позже при необходимости
    Ok(())
}