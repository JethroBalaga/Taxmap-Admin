import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  // Debug the icon path
  const iconPath = path.join(__dirname, '../public/favicon.png');
  console.log('🔍 Main.js icon path:', iconPath);
  console.log('📁 Main.js icon exists:', fs.existsSync(iconPath));
  
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    icon: iconPath, // ← This should point to your PNG
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  Menu.setApplicationMenu(null);

  const indexPath = path.resolve(__dirname, '../dist/index.html');
  win.loadFile(indexPath).then(() => {
    console.log('App loaded successfully');
  }).catch((error) => {
    console.error('Failed to load index.html:', error);
  });

  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});