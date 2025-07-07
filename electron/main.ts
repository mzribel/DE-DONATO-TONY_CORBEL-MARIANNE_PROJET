import { app, BrowserWindow, ipcMain } from 'electron';
import notifier from 'node-notifier';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
dotenv.config();

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


ipcMain.handle('notify', (_, { title, body }: { title: string; body: string }) => {
    notifier.notify({
        title,
        message: body,
        sound: false, // essaie de couper le son si supporté
        icon: path.join(__dirname, '..', 'public', 'mariannepray.ico'), // chemin absolu ou relatif correct
    });
});
