// import { app, BrowserWindow, ipcMain } from 'electron';
// import notifier from 'node-notifier';
// import * as path from 'node:path';
// let mainWindow: BrowserWindow | null = null;
// import {createClient} from "@supabase/supabase-js";
//
// const supabaseUrl = "uuu"
// const supabaseAnonKey = "uuu"
// const supabaseAdmin = createClient(
//     supabaseUrl,
//     supabaseAnonKey,
// );
//
// ipcMain.handle('delete-account', async (_event, token: string) => {
//     try {
//         const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
//         if (userError || !userData?.user) {
//             return { error: userError?.message ?? "Utilisateur introuvable" };
//         }
//
//         const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
//         if (deleteError) {
//             return { error: deleteError.message };
//         }
//
//         return { success: true };
//     } catch (err: any) {
//         return { error: err.message };
//     }
// });
//
// async function createWindow() {
//     mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         minWidth: 400,
//         webPreferences: {
//             preload: path.join(__dirname, 'preload.js'), // Utilise le preload sécurisé
//             contextIsolation: true,
//             nodeIntegration: false,
//             sandbox: false,
//         },
//     });
//
//     mainWindow.setMenuBarVisibility(false);
//
//     // Dév : npm run dev + npm run dev:electron
//     // await mainWindow.loadURL('http://localhost:5173');
//
//     // Prod : npm run dist
//     await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
//     mainWindow.webContents.openDevTools(); // aide à voir les erreurs du renderer
// }
//
// // Empêche les doubles instances
// // const gotTheLock = app.requestSingleInstanceLock();
// // function handleDeepLink(url: string) {
// //     try {
// //         const fragmentIndex = url.indexOf('#');
// //         if (fragmentIndex === -1) {
// //             console.warn('Pas de fragment dans l’URL');
// //             return;
// //         }
// //
// //         const fragment = url.substring(fragmentIndex + 1); // skip "#"
// //         const params = new URLSearchParams(fragment);
// //
// //         const token = params.get('access_token');
// //         const refreshToken = params.get('refresh_token');
// //         const type = params.get('type');
// //         const error = params.get('error_code');
// //
// //         if (mainWindow) {
// //             if (error) {
// //                 mainWindow.webContents.send('recovery-error', error);
// //             } else if (token && refreshToken && type === 'recovery') {
// //                 mainWindow.webContents.send('recovery-token', {
// //                     token,
// //                     refreshToken
// //                 });
// //             } else {
// //                 console.warn('Paramètres manquants ou type incorrect');
// //             }
// //         }
// //     } catch (err) {
// //         console.error('Erreur parsing deep link :', err);
// //     }
// // }
//
//
// // if (!gotTheLock) {
// //     app.quit();
// // } else {
// //     app.on('second-instance', (_event, argv) => {
// //         // argv contient le lien protocol (sur Windows uniquement)
// //         const deepLink = argv.find(arg => arg.startsWith('pomodoro://'));
// //
// //         if (deepLink && mainWindow) {
// //             handleDeepLink(deepLink);
// //             if (mainWindow.isMinimized()) mainWindow.restore();
// //             mainWindow.focus();
// //         }
// //     });
//
//     app.whenReady().then(async () => {
//         // Force Windows à utiliser le bon binaire en dev
//         const exe = process.execPath;
//         const args = [path.resolve(process.argv[1])];
//         app.setAsDefaultProtocolClient('pomodoro', exe, args);
//
//         await createWindow();
//
//         app.on('activate', () => {
//             if (BrowserWindow.getAllWindows().length === 0) {
//                 createWindow();
//             }
//         });
//     });
// // }
//
// app.on('window-all-closed', () => {
//     // Quitte l'app sur Windows/Linux, reste ouverte sur MacOS
//     if (process.platform !== 'darwin') {
//         app.quit();
//     }
// });
//
//
// ipcMain.handle('notify', (_, { title, body }: { title: string; body: string }) => {
//     notifier.notify({
//         title,
//         message: body,
//         sound: false, // essaie de couper le son si supporté
//         icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
//     });
// });
//
// app.on('open-url', (event, urlStr) => {
//     event.preventDefault();
//
//     try {
//         const [_base, hash] = urlStr.split('#');
//         const params = new URLSearchParams(hash);
//
//         const token = params.get('access_token');
//         const refreshToken = params.get('refresh_token'); // manquant !
//         const type = params.get('type');
//         const error = params.get('error_code');
//
//         if (error) {
//             mainWindow?.webContents.send('recovery-error', error);
//             return;
//         }
//
//         if (type === 'recovery' && token) {
//             mainWindow?.webContents.send('recovery-token', {
//                 token,
//                 refreshToken,
//             });
//         }
//     } catch (err) {
//         console.error('Erreur parsing URL personnalisée :', err);
//     }
// })

import { app, BrowserWindow, ipcMain } from 'electron';
import notifier from 'node-notifier';
import * as path from 'node:path';
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
        icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    });
});
