import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  // Debug the icon path
  const iconPath = path.join(__dirname, '../public/favicon.png');
  console.log('Main.js icon path:', iconPath);
  console.log('Main.js icon exists:', fs.existsSync(iconPath));
  
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    },
  });

  Menu.setApplicationMenu(null);

  // Clear cache before loading
  console.log('Clearing Electron cache...');
  win.webContents.session.clearCache().then(() => {
    console.log('Cache cleared successfully');
    
    const indexPath = path.resolve(__dirname, '../dist/index.html');
    console.log('Loading from:', indexPath);
    console.log('Index.html exists:', fs.existsSync(indexPath));
    
    // Load the app after cache clear
    win.loadFile(indexPath).then(() => {
      console.log('App loaded successfully');
      
      // Force reload ignoring cache (extra safety)
      setTimeout(() => {
        win.webContents.reloadIgnoringCache();
      }, 1000);
      
    }).catch((error) => {
      console.error('Failed to load index.html:', error);
    });
  });

  win.webContents.openDevTools();

  // Debug: Log when page finishes loading
  win.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
    // Extra cache clear after load
    win.webContents.session.clearCache();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});