export interface IElectronAPI {
  callGemini: (payload: { isStream: boolean, args: any }) => Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
  }
}
