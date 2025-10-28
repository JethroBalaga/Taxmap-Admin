import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const indexPath = path.resolve(__dirname, '../dist/index.html');
  console.log('Loading index.html from:', indexPath);
  
  // Use loadFile which works better with relative paths
  win.loadFile(indexPath).then(() => {
    console.log('App loaded successfully');
    
    // Force navigation to /login after a short delay
    setTimeout(() => {
      win.webContents.executeJavaScript(`
        console.log('Current location before navigation:', window.location.href);
        // Use hash routing as fallback
        window.location.hash = '/login';
        console.log('Navigated to hash route');
      `);
    }, 500);
    
  }).catch((error) => {
    console.error('Failed to load index.html:', error);
  });

  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});