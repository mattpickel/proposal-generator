/**
 * useFileManager Hook
 *
 * Manages a collection of files with add/remove operations
 */

import { readFileAsText } from '../utils/fileUtils';

export function useFileManager(files, setFiles, showToast) {
  const addFiles = async (fileList) => {
    const newFiles = [];

    for (const file of fileList) {
      try {
        const content = await readFileAsText(file);
        const newId = Math.max(...files.map(f => f.id), 0) + 1;
        newFiles.push({
          id: newId,
          name: file.name,
          file: file,
          content: content
        });
      } catch (error) {
        console.error('Error reading file:', error);
        showToast(`Failed to read ${file.name}`, 'error');
      }
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      showToast(`Added ${newFiles.length} file(s)`, 'success');
    }
  };

  const addFromDrive = (driveFiles) => {
    const newFiles = driveFiles.map((file, index) => ({
      id: Math.max(...files.map(f => f.id), 0) + index + 1,
      name: file.name,
      content: file.content,
      fromDrive: true
    }));

    setFiles(prev => [...prev, ...newFiles]);
    showToast(`Added ${newFiles.length} file(s) from Drive`, 'success');
  };

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    showToast('All files cleared', 'success');
  };

  return {
    addFiles,
    addFromDrive,
    removeFile,
    clearAll
  };
}
