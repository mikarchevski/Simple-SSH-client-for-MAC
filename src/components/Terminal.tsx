import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  sessionId: string;
}

export function Terminal({ sessionId }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) {
      console.error('❌ Terminal container not found');
      return;
    }

    console.log('✅ Terminal container found, size:', terminalRef.current.getBoundingClientRect());

    // Инициализация терминала
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e2e',
        foreground: '#cccccc',
        cursor: '#cccccc',
        selectionBackground: '#264f78',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    
    // Открываем терминал в контейнере
    term.open(terminalRef.current);
    termRef.current = term;

    // Ждём, пока элемент получит размеры, потом делаем fit
    requestAnimationFrame(() => {
      fitAddon.fit();
      console.log('✅ Terminal fitted, size:', term.cols, 'x', term.rows);
      setIsReady(true);
    });

    // Обработка ввода пользователя
    const onDataDisposable = term.onData((data) => {
      console.log('️ Sending data:', JSON.stringify(data));
      invoke('ssh_send', { sessionId, data })
        .catch((err) => console.error(' Failed to send data:', err));
    });

    // Обработка ресайза
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      if (termRef.current) {
        invoke('ssh_resize', {
          sessionId,
          cols: termRef.current.cols,
          rows: termRef.current.rows,
        }).catch((err) => console.error('❌ Failed to resize:', err));
      }
    });
    resizeObserver.observe(terminalRef.current);

    // Слушаем данные от сервера
    const unlistenData = listen<[string, string]>('ssh-data', (event) => {
      const [eventId, data] = event.payload;
      console.log('📥 Received data for', eventId, ':', data.substring(0, 50));
      if (eventId === sessionId && termRef.current) {
        termRef.current.write(data);
      }
    });

    // Слушаем закрытие соединения
    const unlistenClosed = listen<string>('ssh-closed', (event) => {
      if (event.payload === sessionId && termRef.current) {
        termRef.current.write('\r\n\x1b[31mConnection closed by remote host.\x1b[0m\r\n');
      }
    });

    // Фокус на терминал
    setTimeout(() => term.focus(), 100);

    // Очистка при размонтировании
    return () => {
      resizeObserver.disconnect();
      onDataDisposable.dispose();
      unlistenData.then(fn => fn());
      unlistenClosed.then(fn => fn());
      term.dispose();
    };
  }, [sessionId]);

  return (
    <div 
      ref={terminalRef} 
      className="w-full h-full"
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '500px'
      }}
    />
  );
}