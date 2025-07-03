import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import * as path from 'node:path';
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Utilise le preload sécurisé
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    mainWindow.setMenuBarVisibility(false);

    // Dév : npm run dev + npm run dev:electron
    await mainWindow.loadURL('http://localhost:5173');

    // Prod : npm run dist
    // await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(async () => {
    // Base SQLite
    // await initializeDatabase()
    //     .catch(err => console.error('Database initialization error:', err));

    await createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    app.setAppUserModelId("com.example.pomodoroapp")
});

app.on('window-all-closed', () => {
    // Quitte l'app sur Windows/Linux, reste ouverte sur MacOS
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Notifications
ipcMain.handle('notify', (_, { title, body }: { title: string; body: string }) => {
    new Notification({ title, body }).show();
});
