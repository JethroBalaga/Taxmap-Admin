import { app, BrowserWindow, Menu, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional: Hide security warnings during development
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

async function clearAllCache() {
  console.log('Starting comprehensive cache clearing...');
  
  const ses = session.defaultSession;
  
  try {
    await ses.clearCache();
    await ses.clearStorageData();
    await ses.clearAuthCache();
    await ses.clearHostResolverCache();
    
    await ses.clearStorageData({
      storages: [
        'appcache', 'cookies', 'filesystem', 'indexdb', 
        'localstorage', 'shadercache', 'websql', 
        'serviceworkers', 'cachestorage'
      ],
      quotas: ['temporary', 'persistent', 'syncable']
    });
    
    console.log('All caches cleared successfully');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

async function createWindow() {
  // Clear cache BEFORE creating window
  await clearAllCache();

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
      partition: 'persist:supabase-auth',
      webSecurity: true,
      allowRunningInsecureContent: false
    },
  });

  Menu.setApplicationMenu(null);

  // Additional cache clearing for this specific window
  console.log('Clearing window-specific cache...');
  await win.webContents.session.clearCache();

  const indexPath = path.resolve(__dirname, '../dist/index.html');
  console.log('Loading from:', indexPath);
  console.log('Index.html exists:', fs.existsSync(indexPath));
  
  try {
    // Load with cache disabled
    await win.loadFile(indexPath, {
      extraHeaders: 'pragma: no-cache\n'
    });
    
    console.log('App loaded successfully');
    
    // Inject navigation helpers for React
    await win.webContents.executeJavaScript(`
      console.log('Injecting Electron navigation helpers...');
      
      window.electronNavigate = function(path) {
        if (path.startsWith('/')) {
          path = path.substring(1);
        }
        window.location.hash = '#' + path;
        return true;
      };
      
      window.addEventListener('hashchange', function(event) {
        console.log('Hash changed from:', event.oldURL);
        console.log('Hash changed to:', event.newURL);
        console.log('Current hash:', window.location.hash);
      });
      
      window.addEventListener('popstate', function(event) {
        console.log('Popstate event:', event.state);
        console.log('Current URL:', window.location.href);
      });
      
      console.log('Electron navigation helpers injected successfully');
    `);
    
  } catch (error) {
    console.error('Failed to load index.html:', error);
    try {
      await win.loadURL('http://localhost:3001');
      console.log('Loaded from development server instead');
    } catch (fallbackError) {
      console.error('Failed to load from dev server:', fallbackError);
    }
  }

  // Removed win.webContents.openDevTools() to prevent inspect popup

  win.webContents.on('did-finish-load', () => {
    console.log('Page finished loading - current URL:', win.webContents.getURL());
  });

  // Handle navigation events and block devtools shortcuts
  win.webContents.on('before-input-event', (event, input) => {
    // Block F12, Ctrl+Shift+I, Ctrl+Shift+J
    if (
      input.key === 'F12' ||
      (input.key.toLowerCase() === 'i' && input.control && input.shift) ||
      (input.key.toLowerCase() === 'j' && input.control && input.shift)
    ) {
      event.preventDefault();
    }
    // Optional: Force clear cache on manual reload
    if (input.key === 'F5' || (input.key === 'r' && input.control)) {
      win.webContents.session.clearCache();
    }
  });

  win.webContents.on('will-navigate', (event, navigationUrl) => {
    console.log('Navigating to:', navigationUrl);
  });

  win.webContents.on('did-navigate', (event, navigationUrl) => {
    console.log('Successfully navigated to:', navigationUrl);
  });

  win.webContents.on('did-navigate-in-page', (event, navigationUrl) => {
    console.log('In-page navigation to:', navigationUrl);
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorDescription);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await clearAllCache();
    createWindow();
  }
});
