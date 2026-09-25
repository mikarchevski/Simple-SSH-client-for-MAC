import { Folder } from 'lucide-react';

export function SftpPage() {
  return (
    <div className="flex-1 flex">
      {/* Левая панель */}
      <div className="flex-1 flex items-center justify-center border-r border-[#2a2a3a]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#2a2a3a] flex items-center justify-center mx-auto">
            <Folder size={32} className="text-gray-300" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Connect to host</h2>
            <p className="text-sm text-gray-400 max-w-[250px]">
              Start by connecting to a saved host to manage your files with SFTP.
            </p>
          </div>
          <button className="bg-[#2a2a3a] hover:bg-[#3a3a4a] text-gray-200 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            Select host
          </button>
        </div>
      </div>

      {/* Правая панель */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#2a2a3a] flex items-center justify-center mx-auto">
            <Folder size={32} className="text-gray-300" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Connect to host</h2>
            <p className="text-sm text-gray-400 max-w-[250px]">
              Start by connecting to a saved host to manage your files with SFTP.
            </p>
          </div>
          <button className="bg-[#2a2a3a] hover:bg-[#3a3a4a] text-gray-200 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            Select host
          </button>
        </div>
      </div>
    </div>
  );
}