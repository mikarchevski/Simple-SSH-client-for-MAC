import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!terminalRef.current) {
      console.error('❌ Terminal container not found');
      return;
    }

    console.log('✅ Terminal container found, initializing...');

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
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    
    term.open(terminalRef.current);
    termRef.current = term;

    setTimeout(() => {
      fitAddon.fit();
      console.log('✅ Terminal fitted, size:', term.cols, 'x', term.rows);
      term.focus();
      console.log('✅ Terminal focused');
    }, 100);

    // === ВАЖНО: Отслеживаем ввод пользователя ===
    const onDataDisposable = term.onData((data) => {
      console.log('⌨️ User typed:', JSON.stringify(data));
      console.log('📤 Sending to session:', sessionId);
      
      invoke('ssh_send', { sessionId, data })
        .then(() => console.log('✅ Data sent successfully'))
        .catch((err) => console.error('❌ Failed to send data:', err));
    });

    // Отслеживаем ресайз
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      if (termRef.current) {
        invoke('ssh_resize', {
          sessionId,
          cols: termRef.current.cols,
          rows: termRef.current.rows,
        }).catch(console.error);
      }
    });
    
    resizeObserver.observe(terminalRef.current);

    // Слушаем данные от сервера
    const unlistenData = listen<[string, string]>('ssh-data', (event) => {
      const [eventId, data] = event.payload;
      console.log(' Received from server for', eventId, ':', data.substring(0, 100));
      
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

    // Принудительный фокус при клике на терминал
    const handleFocus = () => {
      term.focus();
      console.log('🎯 Terminal focused by click');
    };
    
    terminalRef.current.addEventListener('click', handleFocus);

    return () => {
      resizeObserver.disconnect();
      onDataDisposable.dispose();
      unlistenData.then(fn => fn());
      unlistenClosed.then(fn => fn());
      terminalRef.current?.removeEventListener('click', handleFocus);
      term.dispose();
    };
  }, [sessionId]);

  return (
    <div 
      ref={terminalRef} 
      className="w-full h-full outline-none"
      tabIndex={0}
      style={{ height: '100%', width: '100%' }}
    />
  );
}