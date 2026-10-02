use anyhow::Result;
use russh::client;
use russh_keys::*;
use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::{AppHandle, Emitter};
use lazy_static::lazy_static;
use std::collections::HashMap;
use tokio::sync::mpsc;
use serde::{Deserialize, Serialize};

#[derive(Debug, serde::Deserialize, Clone)]
pub struct SshCredentials {
    pub session_id: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
}

pub struct SessionData {
    pub shell_tx: mpsc::Sender<Vec<u8>>,
    pub creds: SshCredentials,
}

lazy_static! {
    static ref SESSIONS: Mutex<HashMap<String, SessionData>> = 
        Mutex::new(HashMap::new());
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

    let (tx, mut rx) = mpsc::channel::<Vec<u8>>(100);
    
    {
        let mut sessions = SESSIONS.lock().await;
        sessions.insert(creds.session_id.clone(), SessionData {
            shell_tx: tx.clone(),
            creds: creds.clone(), 
        });
    }

    let session_id_clone = creds.session_id.clone();
    let app_handle_clone = app_handle.clone();
    
    tokio::spawn(async move {
        loop {
            tokio::select! {
                msg = channel.wait() => {
                    match msg {
                        Some(russh::ChannelMsg::Data { ref data }) => {
                            let text = String::from_utf8_lossy(data).to_string();
                            let _ = app_handle_clone.emit("ssh-data", (session_id_clone.clone(), text));
                        }
                        Some(russh::ChannelMsg::Eof) | Some(russh::ChannelMsg::Close) => {
                            let _ = app_handle_clone.emit("ssh-closed", session_id_clone.clone());
                            SESSIONS.lock().await.remove(&session_id_clone);
                            break;
                        }
                        _ => {}
                    }
                }
                data = rx.recv() => {
                    if let Some(data_bytes) = data {
                        if let Err(e) = channel.data(data_bytes.as_slice()).await {
                            eprintln!("Failed to send data: {}", e);
                        }
                    } else {
                        break;
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
    if let Some(session_data) = sessions.get(&session_id) {
        session_data.shell_tx.send(data.into_bytes())
            .await
            .map_err(|e| format!("Failed to send: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn ssh_resize(_session_id: String, _cols: u32, _rows: u32) -> Result<(), String> {
    Ok(())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HostMetricsResponse {
    pub cpu: f64,
    pub mem_str: String,
    pub mem_pct: f64,
    pub disk_str: String,
    pub disk_pct: f64,
    pub uptime: String,
    pub net_str: String,
}

#[tauri::command]
pub async fn get_host_metrics(session_id: String) -> Result<HostMetricsResponse, String> {
    let creds = {
        let sessions = SESSIONS.lock().await;
        let session_data = sessions.get(&session_id)
            .ok_or_else(|| "Session not found or disconnected".to_string())?;
        session_data.creds.clone()
    };

    let bash_script = r#"
        OS=$(uname -s)
        if [ "$OS" = "Darwin" ]; then
            # === macOS команды ===
            CPU=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | tr -d '%')
            if [ -z "$CPU" ]; then CPU=0; fi

            MEM_TOTAL_GB=$(sysctl hw.memsize | awk '{printf "%.1f", $2/1024/1024/1024}')
            MEM_USED_GB=$(top -l 1 | grep "PhysMem" | awk '{print $2}' | tr -d 'a-zA-Z')
            if [ -z "$MEM_USED_GB" ]; then MEM_USED_GB=0; fi
            
            MEM_PCT=$(awk -v used="$MEM_USED_GB" -v total="$MEM_TOTAL_GB" 'BEGIN { if (total > 0) printf "%.0f", used*100/total; else print 0 }')
            MEM_STR="${MEM_USED_GB}/${MEM_TOTAL_GB} GB"

            # === РАСЧЕТ ДИСКА для macOS ===
            # Проверяем, существует ли том Data (macOS Catalina и новее)
            if mount | grep -q "/System/Volumes/Data"; then
                DISK_TOTAL_KB=$(df -k /System/Volumes/Data | awk 'NR==2{print $2}')
                DISK_USED_KB=$(df -k /System/Volumes/Data | awk 'NR==2{print $3}')
            else
                # Для старых версий macOS
                DISK_TOTAL_KB=$(df -k / | awk 'NR==2{print $2}')
                DISK_USED_KB=$(df -k / | awk 'NR==2{print $3}')
            fi
            
            if [ -n "$DISK_TOTAL_KB" ] && [ "$DISK_TOTAL_KB" -gt 0 ] 2>/dev/null; then
                DISK_PCT=$(awk -v used="$DISK_USED_KB" -v total="$DISK_TOTAL_KB" 'BEGIN { printf "%.0f", used*100/total }')
                DISK_STR=$(awk -v used="$DISK_USED_KB" -v total="$DISK_TOTAL_KB" 'BEGIN { printf "%.1f/%.1f GB", used/1024/1024, total/1024/1024 }')
            else
                DISK_PCT=0; DISK_STR="N/A"
            fi

            UPTIME=$(uptime | awk -F'up ' '{print $2}' | awk -F',' '{print $1}' | xargs)
            if [ -z "$UPTIME" ]; then UPTIME="N/A"; fi

            NET_IFACE=$(netstat -rn | grep default | head -n 1 | awk '{print $4}')
            if [ -z "$NET_IFACE" ]; then NET_IFACE="en0"; fi
            NET_STATS=$(netstat -ib | grep "$NET_IFACE" | head -n 1 | awk '{print $7, $10}')
            NET_STR=$(echo "$NET_STATS" | awk '{printf "%.0f MB / %.0f MB", $1/1024/1024, $2/1024/1024}')
            if [ "$NET_STR" = "0 MB / 0 MB" ] || [ -z "$NET_STATS" ]; then NET_STR="N/A"; fi
        else
            # === Linux команды ===
            CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}' | head -n 1)
            if [ -z "$CPU" ]; then CPU=0; fi

            MEM_TOTAL=$(free -m | awk 'NR==2{print $2}')
            MEM_USED=$(free -m | awk 'NR==2{print $3}')
            if [ -n "$MEM_TOTAL" ] && [ "$MEM_TOTAL" -gt 0 ] 2>/dev/null; then
                MEM_PCT=$(awk -v used="$MEM_USED" -v total="$MEM_TOTAL" 'BEGIN { printf "%.0f", used*100/total }')
                MEM_STR=$(awk -v used="$MEM_USED" -v total="$MEM_TOTAL" 'BEGIN { printf "%.1f/%.1f GB", used/1024, total/1024 }')
            else
                MEM_PCT=0; MEM_STR="0/0 GB"
            fi

            # === РАСЧЕТ ДИСКА для Linux ===
            DISK_TOTAL_KB=$(df -k / | awk 'NR==2{print $2}')
            DISK_USED_KB=$(df -k / | awk 'NR==2{print $3}')
            
            if [ -n "$DISK_TOTAL_KB" ] && [ "$DISK_TOTAL_KB" -gt 0 ] 2>/dev/null; then
                DISK_PCT=$(awk -v used="$DISK_USED_KB" -v total="$DISK_TOTAL_KB" 'BEGIN { printf "%.0f", used*100/total }')
                DISK_STR=$(awk -v used="$DISK_USED_KB" -v total="$DISK_TOTAL_KB" 'BEGIN { printf "%.1f/%.1f GB", used/1024/1024, total/1024/1024 }')
            else
                DISK_PCT=0; DISK_STR="N/A"
            fi

            UPTIME=$(awk '{print int($1/86400)"d "int(($1%86400)/3600)"h "int(($1%3600)/60)"m"}' /proc/uptime 2>/dev/null)
            if [ -z "$UPTIME" ]; then UPTIME="N/A"; fi

            NET_IFACE=$(ip -o link show 2>/dev/null | awk -F': ' '{print $2}' | grep -E '^(eth|enp|ens|wlan)' | head -n 1)
            if [ -n "$NET_IFACE" ]; then
                NET_STATS=$(awk -v iface="$NET_IFACE" '$0 ~ iface {print $2, $10}' /proc/net/dev)
                NET_STR=$(echo "$NET_STATS" | awk '{printf "%.0f MB / %.0f MB", $1/1024/1024, $2/1024/1024}')
            else
                NET_STR="N/A"
            fi
        fi

        echo "{\"cpu\": ${CPU:-0}, \"mem_str\": \"${MEM_STR:-0/0 GB}\", \"mem_pct\": ${MEM_PCT:-0}, \"disk_str\": \"${DISK_STR:-N/A}\", \"disk_pct\": ${DISK_PCT:-0}, \"uptime\": \"${UPTIME:-N/A}\", \"net_str\": \"${NET_STR:-N/A}\"}"
    "#;

    let config = client::Config::default();
    let mut session = client::connect(
        Arc::new(config),
        (creds.host.clone(), creds.port),
        Client,
    )
    .await
    .map_err(|e| format!("Metrics connection failed: {}", e))?;

    let auth_res = session
        .authenticate_password(creds.username.clone(), creds.password.clone())
        .await
        .map_err(|e| format!("Metrics auth failed: {}", e))?;

    if !auth_res {
        return Err("Metrics authentication failed".to_string());
    }

    let mut channel = session
        .channel_open_session()
        .await
        .map_err(|e| format!("Failed to open metrics channel: {}", e))?;

    channel
        .exec(true, bash_script.as_bytes())
        .await
        .map_err(|e| format!("Failed to exec metrics script: {}", e))?;

    let mut output = String::new();
    while let Some(msg) = channel.wait().await {
        match msg {
            russh::ChannelMsg::Data { ref data } => {
                output.push_str(&String::from_utf8_lossy(data));
            }
            russh::ChannelMsg::Eof | russh::ChannelMsg::Close => {
                break;
            }
            _ => {}
        }
    }

    let clean_output = output.trim().to_string();
    
    // Добавим логирование для отладки, если JSON все еще не парсится
    if clean_output.is_empty() {
        eprintln!("WARNING: Metrics script returned empty output");
    } else {
        eprintln!("DEBUG: Raw metrics output: {}", clean_output);
    }
    
    serde_json::from_str::<HostMetricsResponse>(&clean_output)
        .map_err(|e| format!("Failed to parse metrics: {}. Raw output: {}", e, clean_output))
}