const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('is-dev');

// This will be set via an environment variable
if (!process.env.API_KEY) {
    console.error("API_KEY environment variable is not set for the main process.");
    // In a real app, you might want to prevent the app from starting
    // or show an error dialog. For now, we'll log and continue.
}

// Dynamically import @google/genai as it's an ES module
let GoogleGenAI;
import('@google/genai').then(genai => {
    GoogleGenAI = genai.GoogleGenAI;
}).catch(err => {
    console.error("Failed to load @google/genai module", err);
    app.quit();
});


function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'index.html')}`;

  win.loadURL(startUrl);

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

// This is the secure bridge for Gemini API calls
ipcMain.handle('call-gemini', async (event, { isStream, args }) => {
    if (!GoogleGenAI) {
        throw new Error('AI SDK not initialized.');
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const model = ai.models;
        if (isStream) {
            // For the desktop app, we'll collect the full response from the stream
            // and return it as a single payload. The frontend will then simulate
            // a one-chunk stream to maintain component compatibility. The typing effect will be lost.
            const response = await model.generateContent(args);
            return JSON.stringify(response);
        } else {
            const response = await model.generateContent(args);
            return JSON.stringify(response);
        }
    } catch (error) {
        console.error('Gemini API Error in Main Process:', error);
        // Re-throw a sanitized error to the renderer process
        throw new Error(`An error occurred while calling the Gemini API: ${error.message}`);
    }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
