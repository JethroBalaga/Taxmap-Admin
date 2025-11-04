import { app, BrowserWindow, Menu, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional: Hide security warnings during development
// Remove this line for production to see actual security issues
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

async function clearAllCache() {
  console.log('Starting comprehensive cache clearing...');
  
  const ses = session.defaultSession;
  
  try {
    // Clear all types of cache
    await ses.clearCache();
    await ses.clearStorageData();
    await ses.clearAuthCache();
    await ses.clearHostResolverCache();
    
    // Clear all storage data comprehensively
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
      // Enhanced hash change handling for Electron
      console.log('Injecting Electron navigation helpers...');
      
      window.electronNavigate = function(path) {
        console.log('electronNavigate called with:', path);
        if (path.startsWith('/')) {
          path = path.substring(1);
        }
        window.location.hash = '#' + path;
        return true;
      };
      
      // Enhanced hash change listener
      window.addEventListener('hashchange', function(event) {
        console.log('Hash changed from:', event.oldURL);
        console.log('Hash changed to:', event.newURL);
        console.log('Current hash:', window.location.hash);
      });
      
      // Monitor all navigation attempts
      window.addEventListener('popstate', function(event) {
        console.log('Popstate event:', event.state);
        console.log('Current URL:', window.location.href);
      });
      
      console.log('Electron navigation helpers injected successfully');
    `);
    
  } catch (error) {
    console.error('Failed to load index.html:', error);
    // Fallback: Try loading from development server
    try {
      await win.loadURL('http://localhost:3001');
      console.log('Loaded from development server instead');
    } catch (fallbackError) {
      console.error('Failed to load from dev server:', fallbackError);
    }
  }

  win.webContents.openDevTools();

  // Debug: Log when page finishes loading
  win.webContents.on('did-finish-load', () => {
    console.log('Page finished loading - current URL:', win.webContents.getURL());
  });

  // Handle redirects and monitor requests
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F5' || (input.key === 'r' && input.control)) {
      // Force clear cache on manual reload
      win.webContents.session.clearCache();
    }
  });

  // Handle navigation events for better routing
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

// Clear cache on app activation too
app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await clearAllCache();
    createWindow();
  }
});