const { app, BrowserWindow } = require('electron');
const path = require('path');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = !app.isPackaged;
const hostname = 'localhost';
let port = 3000; // Default, will change dynamically if needed

let mainWindow;
let nextApp;
let server;

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.listen(0, () => {
      const p = s.address().port;
      s.close(() => resolve(p));
    });
    s.on('error', reject);
  });
}

async function startNextJsServer() {
  const dir = dev ? process.cwd() : app.getAppPath().replace(/\.asar$/, '.asar.unpacked');
  
  port = await getAvailablePort();
  
  // Set NEXT_ENV correctly
  process.env.NODE_ENV = dev ? 'development' : 'production';
  process.env.PORT = port;
  
  // For SQLite database persistence in production
  if (!dev) {
    const fs = require('fs');
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'prod.db');
    
    if (!fs.existsSync(dbPath)) {
      const templateDbPath = path.join(dir, 'prisma', 'dev.db');
      if (fs.existsSync(templateDbPath)) {
        fs.copyFileSync(templateDbPath, dbPath);
      } else {
        console.error('Template DB not found at', templateDbPath);
      }
    }
    
    process.env.DATABASE_URL = `file:${dbPath}`;
  }

  // Set NextAuth variables dynamically for the local desktop app
  process.env.NEXTAUTH_URL = `http://${hostname}:${port}`;
  if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = 'nj-fence-desktop-offline-secret-key-123';
  }

  nextApp = next({ dev, dir, hostname, port });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      const fs = require('fs');
      fs.appendFileSync(path.join(app.getPath('userData'), 'request-error.log'), new Date().toISOString() + ' - Error on ' + req.url + ': ' + (err.stack || err) + '\n');
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  return new Promise((resolve, reject) => {
    server.once('error', (err) => {
      console.error('Server error', err);
      reject(err);
    });
    server.listen(port, () => {
      console.log(`> Next.js Server ready on http://${hostname}:${port}`);
      resolve();
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // preload: path.join(__dirname, 'preload.js') // uncomment if needed later
    },
    icon: path.join(__dirname, 'public', 'logo.svg')
  });

  // mainWindow.setMenu(null); // uncomment to hide the top menu
  mainWindow.loadURL(`http://${hostname}:${port}`);

  if (dev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(async () => {
  try {
    await startNextJsServer();
    createWindow();

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  } catch (err) {
    const fs = require('fs');
    fs.writeFileSync(path.join(app.getPath('userData'), 'error.log'), err ? err.stack || err.toString() : 'Unknown error');
    console.error('Failed to start Next.js or create window:', err);
    app.quit();
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if (server) {
      server.close();
    }
    app.quit();
  }
});
