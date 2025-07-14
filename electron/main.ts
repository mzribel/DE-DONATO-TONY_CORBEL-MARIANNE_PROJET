import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'node:path';
import { Notification } from 'electron';
let mainWindow: BrowserWindow | null = null;

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 400,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Utilise le preload sécurisé
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
        icon: 'public/favicon.ico' // sets window icon
    });

    mainWindow.setMenuBarVisibility(false);

    // Dév : npm run dev + npm run dev:electron
    await mainWindow.loadURL('http://localhost:5173');

    // Prod : npm run dist
    // await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(async () => {
    await createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // Quitte l'app sur Windows/Linux, reste ouverte sur MacOS
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('notify', (_event, { title, body }: { title: string; body: string }) => {
    new Notification({
        title,
        body,
        silent: true, // ou false si tu veux un son
        icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    }).show();
});