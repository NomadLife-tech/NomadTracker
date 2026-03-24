import * as FileSystemLegacy from 'expo-file-system/legacy';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { exportAllData, importAllData } from './storage';

export async function exportData(): Promise<boolean> {
  try {
    const data = await exportAllData();
    const filename = `nomad-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    if (Platform.OS === 'web') {
      // Web: Download file
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } else {
      // Native: Save and share file using new File API
      const file = new File(Paths.document, filename);
      await file.write(data);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Nomad Tracker Data',
        });
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error('Export error:', error);
    return false;
  }
}

export async function importData(): Promise<boolean> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return false;
    }
    
    const fileUri = result.assets[0].uri;
    
    let content: string;
    if (Platform.OS === 'web') {
      // Web: Fetch file content
      const response = await fetch(fileUri);
      content = await response.text();
    } else {
      // Native: Read file using new File API
      const file = new File(fileUri);
      content = await file.text();
    }
    
    return await importAllData(content);
  } catch (error) {
    console.error('Import error:', error);
    return false;
  }
}
