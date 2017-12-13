
'use strict';

const electron = require('electron');
const CP       = require('child_process');
const fs       = require('fs');
const path     = require('path');

const Config   = require('./bootstrap').config;

class HotRunner {

    constructor() {

        /**
         * @public
         * @type {electron.BrowserWindow}
         */
        this.mainWindows = null;
    }

    /**
     * @public
     */
    init() {
        if (this.checkInstance()) {
            this.initApp();
            this.initIPC();
        } else {
            this.quit();
        }
    }

    /**
     * @private
     */
    initApp() {
        electron.app.on('ready', () => {
            this.mainWindows = this.createWindow();
            this.showWindow(this.mainWindows);
        });

        electron.app.on('window-all-closed', () => {
            this.quit();
        });

        electron.app.on('activate', () => {
            if (this.mainWindows === null) {
                this.mainWindows = this.createWindow();
            }
        });
    }

    /**
     * @private
     */
    initIPC() {
        electron.ipcMain.on('ipcDropList', (event, arg) => {
            try {
                let {plugin, args} = arg;
                let exec;

                if (plugin in Config.plugins) {
                    exec = Config.plugins[plugin].path;
                }

                if (!exec || !fs.existsSync(exec)) {
                    exec = Config.plugins.app.path;
                }

                CP.exec(`${exec} ${args}`, function(err, stdout, stderr) {
                    if (err) {
                        // TODO
                        console.log(err);
                        return;
                    }

                    let dropItems = stdout.toString().split("\n");
                    let dropList = {};
                    for (let idx = 0; idx < dropItems.length; idx++) {
                        try {
                            dropList[JSON.stringify(JSON.parse(dropItems[idx]))] = 1;
                        } catch(e) {
                        }
                    }
                    event.sender.send('eventDropList', Object.keys(dropList));
                });
            } catch(e) {
            }
        });

        electron.ipcMain.on('ipcMainExec', function(event, arg) {
            if (!arg.length) {
                return;
            }

            try {
                let child = CP.exec(arg);
            } catch(e) {
                // TODO
            }

            // TODO close window
        });
    }

    checkInstance() {
        const shouldQuit = electron.app.makeSingleInstance((commandLine, workingDirectory) => {
            if (this.mainWindows) {
                if (!this.mainWindows.isVisible()) {
                    this.mainWindows.show();
                    this.mainWindows.focus();
                }

                this.mainWindows.setContentSize(Config.width, Config.height, true);
            }
        });

        return !shouldQuit;
    }

    /**
     * @private
     * @return {electron.BrowserWindow}
     */
    createWindow() {
        // Create the browser window.
        const mainWindow = new electron.BrowserWindow({
            width                   : Config.width,
            height                  : Config.height,
            resizable               : false,
            title                   : Config.title,
            type                    : 'toolbar',
            frame                   : false,
            show                    : false,
            autoHideMenuBar         : true,
            transparent             : true,
            alwaysOnTop             : false,
            disableAutoHideCursor   : true,
            icon                    : path.join(__dirname, '../assets/HotRunner_128px.png')
        });

        return mainWindow;
    }

    /**
     *
     * @param {electron.BrowserWindow} mainWindow
     */
    showWindow(mainWindow) {
        let bounds = mainWindow.getBounds();
        let positionX = Config.position.x || bounds.x;
        let positionY = Config.position.y || (bounds.y -150);

        mainWindow.setPosition(positionX, positionY, true);
        // TODO 如果是跨平台的话，windows分隔符\\
        mainWindow.loadURL(`file://${__dirname}/windows/views/index.html`);
        mainWindow.show();
        mainWindow.focus();

        // mainWindow.webContents.openDevTools()
    }

    closeWindow(mainWindows) {
        mainWindows.hide();
    }

    quit() {
        if (process.platform !== 'darwin') {
            electron.app.quit()
        }
    }
}

(new HotRunner()).init();
