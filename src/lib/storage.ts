import { writeTextFile, readTextFile, exists, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';

const STORAGE_FILE = 'my-ssh-data.json';

export interface PersistedData {
  hosts: any[];
  groups: any[];
}

export async function saveData(data: PersistedData): Promise<void> {
  try {
    console.log('💾 Attempting to save data to AppData...');
    
    // Принудительно создаем папку приложения, если её ещё нет
    await mkdir('', { 
      baseDir: BaseDirectory.AppData, 
      recursive: true 
    });
    
    await writeTextFile(STORAGE_FILE, JSON.stringify(data, null, 2), { 
      baseDir: BaseDirectory.AppData 
    });
    
    console.log('✅ Data successfully saved!');
  } catch (error) {
    console.error('❌ Failed to save data:', error);
  }
}

export async function loadData(): Promise<PersistedData | null> {
  try {
    console.log('📂 Attempting to load data from AppData...');
    const fileExists = await exists(STORAGE_FILE, { baseDir: BaseDirectory.AppData });
    
    if (!fileExists) {
      console.log('ℹ️ No saved data found, using defaults.');
      return null;
    }
    
    const content = await readTextFile(STORAGE_FILE, { baseDir: BaseDirectory.AppData });
    console.log('✅ Data successfully loaded!');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to load data:', error);
    return null;
  }
}