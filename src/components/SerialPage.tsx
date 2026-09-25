import { Usb, Settings, Terminal, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function SerialPage() {
  const [serialPort, setSerialPort] = useState('');
  const [baudRate, setBaudRate] = useState('9600');
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Заголовок */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-[#2a2a3a] flex items-center justify-center">
            <Usb size={24} className="text-gray-300" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-100">Serial</h1>
        </div>

        {/* Прогресс-бар */}
        <div className="relative h-1 bg-[#3a3a4a] rounded-full">
          <div className="absolute left-0 top-0 h-full w-1/3 bg-blue-500 rounded-full" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <Settings size={12} className="text-white" />
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#3a3a4a] flex items-center justify-center">
            <Terminal size={12} className="text-gray-400" />
          </div>
        </div>

        {/* Форма */}
        <div className="space-y-4">
          <div className="relative">
            <select
              value={serialPort}
              onChange={(e) => setSerialPort(e.target.value)}
              className="w-full bg-[#252535] border border-[#3a3a4a] rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="">Serial Port</option>
              <option value="/dev/ttyUSB0">/dev/ttyUSB0</option>
              <option value="/dev/ttyUSB1">/dev/ttyUSB1</option>
              <option value="/dev/ttyACM0">/dev/ttyACM0</option>
            </select>
            <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative">
            <label className="absolute -top-2 left-3 bg-[#1e1e2e] px-1 text-xs text-gray-500">Baud rate</label>
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(e.target.value)}
              className="w-full bg-[#252535] border border-[#3a3a4a] rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="9600">9600</option>
              <option value="19200">19200</option>
              <option value="38400">38400</option>
              <option value="57600">57600</option>
              <option value="115200">115200</option>
            </select>
            <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full bg-[#252535] border border-[#3a3a4a] rounded-lg px-4 py-3 text-gray-200 hover:bg-[#2a2a3a] transition-colors flex items-center justify-between"
          >
            <span className="font-medium">Advanced</span>
            <ChevronRight size={16} className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Кнопки */}
        <div className="flex justify-between pt-4">
          <button className="bg-[#2a2a3a] hover:bg-[#3a3a4a] text-gray-200 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            Close
          </button>
          <button 
            disabled={!serialPort}
            className="bg-[#007AFF] hover:bg-[#0062cc] disabled:bg-[#3a3a4a] disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}