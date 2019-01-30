const { app, BrowserWindow, dialog, ipcMain, Tray, Menu} = require('electron');
const fs = require('fs');
const os_util = require('node-os-utils');
const os = require("os");
const child_process = require("child_process");

let mainWindow;
let isQuiting;
let tray;


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 420,
        // maxWidth:1000,
        icon:"icon.png",

    });
    mainWindow.loadFile('index.html');
    mainWindow.maximize();

    // create system tray
    var appIcon = new Tray("icon.png");
    var contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App', click: function () {
                mainWindow.show()
            }
        },

        {
            label: 'Open Program Files', click: function () {
                child_process.exec('start "" "C:\\Program Files"')
            }
        },

        {
            label: 'Open Temp Folder', click: function () {
                child_process.exec('start ' + os.tmpdir());
            }
        },

        {
            label: 'Open NotePad', click: function () {
                child_process.spawn('C:\\windows\\notepad.exe')
            }
        },

        {
            label: 'Quit', click: function () {
                app.isQuiting = true;
                app.quit()
            }
        }
    ]);
    appIcon.setContextMenu(contextMenu);

    mainWindow.on('close', function (event) {
        if(!app.isQuiting){
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });

    mainWindow.on('minimize', function (event) {
        event.preventDefault();
        mainWindow.hide()
    });

    mainWindow.on('show', function () {
        appIcon.setHighlightMode('always')
    });

}

app.on('ready', createWindow);


// Open Select file dialog
ipcMain.on('select-file', (event, arg) => {
    const path = (dialog.showOpenDialog({ properties: ['openFile', 'openDirectory', 'multiSelections'] }));
    fs.readdir(path[0], (err, files) =>{
        files.forEach(file =>{
            console.log(path[0]+ '\\' + file);
        })
    })
});

// Get CPU Usage
ipcMain.on('get-cpu', (event, arg) => {
    setInterval(getcpuusage, 100)
});

function getcpuusage() {
    var cpu = os_util.cpu;
    cpu.usage()
        .then(info => {
            mainWindow.webContents.send('cpu', info)
            // send uptime to front end
            mainWindow.webContents.send('uptime', os.uptime());
        })
}

// open notepad
ipcMain.on('open-notepad', (event, arg) => {
    child_process.spawn('C:\\windows\\notepad.exe')
});

// open folder
ipcMain.on('open-folder', (event, arg) => {
    child_process.exec('start "" "C:\\Program Files"')
});
