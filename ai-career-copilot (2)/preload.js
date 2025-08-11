const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Securely calls the Gemini API via the Electron main process.
   * @param {object} payload - The data to send, including { isStream, args }.
   * @returns {Promise<string>} A promise that resolves with the JSON stringified response.
   */
  callGemini: (payload) => ipcRenderer.invoke('call-gemini', payload),
});
