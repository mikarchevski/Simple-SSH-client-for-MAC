import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Инициализация терминала
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e', // Темный фон как в Termius
        foreground: '#cccccc',
        cursor: '#cccccc',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    // Приветственное сообщение (пока без SSH)
    term.writeln('Welcome to MySSH Client! 🚀');
    term.writeln('Type something...');
    term.write('$ ');

    // Обработка ввода пользователя
    term.onData((data) => {
      term.write(data);
    });

    // Ресайз при изменении размера окна
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      term.dispose();
      resizeObserver.disconnect();
    };
  }, []);

  return <div ref={terminalRef} className="w-full h-full" />;
}