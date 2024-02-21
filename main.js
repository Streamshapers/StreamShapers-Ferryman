const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const isDevPromise = import('electron-is-dev');


let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 1000,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        },
    });

    mainWindow.webContents.openDevTools({ mode: 'bottom'} )
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/build/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});