use anyhow::Result;
use russh::{client, Channel};
use russh_keys::*;
use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::{AppHandle, Emitter};
use lazy_static::lazy_static;
use std::collections::HashMap;
use async_trait::async_trait;

lazy_static! {
    static ref SESSIONS: Mutex<HashMap<String, Arc<Mutex<Channel<client::Msg>>>>> = 
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

#[async_trait]
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

    let channel = session
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

    let channel_arc = Arc::new(Mutex::new(channel));
    
    {
        let mut sessions = SESSIONS.lock().await;
        sessions.insert(creds.session_id.clone(), channel_arc.clone());
    }

    let session_id_clone = creds.session_id.clone();
    let app_handle_clone = app_handle.clone();
    
    tokio::spawn(async move {
        // ЗДЕСЬ НУЖЕН mut, так как ch.wait() изменяет состояние канала
        let mut ch = channel_arc.lock().await;
        while let Some(msg) = ch.wait().await {
            match msg {
                russh::ChannelMsg::Data { ref data } => {
                    let text = String::from_utf8_lossy(data).to_string();
                    let _ = app_handle_clone.emit("ssh-data", (session_id_clone.clone(), text));
                }
                russh::ChannelMsg::Eof => {
                    let _ = app_handle_clone.emit("ssh-closed", session_id_clone.clone());
                    break;
                }
                _ => {}
            }
        }
    });

    Ok(creds.session_id)
}

#[tauri::command]
pub async fn ssh_send(session_id: String, data: String) -> Result<(), String> {
    let sessions = SESSIONS.lock().await;
    if let Some(channel_arc) = sessions.get(&session_id) {
        // Здесь mut не нужен, так как ch.data() принимает &self
        let ch = channel_arc.lock().await;
        ch.data(data.as_bytes())
            .await
            .map_err(|e| format!("Failed to send data: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn ssh_resize(session_id: String, cols: u32, rows: u32) -> Result<(), String> {
    let sessions = SESSIONS.lock().await;
    if let Some(channel_arc) = sessions.get(&session_id) {
        // Здесь mut не нужен, так как ch.request_pty() принимает &self
        let ch = channel_arc.lock().await;
        ch.request_pty(true, "xterm-256color", cols, rows, 0, 0, &[])
            .await
            .map_err(|e| format!("Failed to resize: {}", e))?;
    }
    Ok(())
}