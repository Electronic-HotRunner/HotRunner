
'use strict';

const electron = require('electron');
const CP       = require('child_process');
const fs       = require('fs');

const common = require('./common');

class HotRunner {

    constructor() {

        /**
         * @private
         * @type {electron.BrowserWindow}
         */
        this.mainWindows = null;

        /**
         * @private
         * @type {Object}
         */
        this.config = common.generateConfig();
    }

    /**
     * @public
     */
    init() {
        if (this.checkInstance()) {
            this.initApp();
            this.initIPC();
        } else {
            console.error('HotRunner is already running');
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
            this.createTray();
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

                if (plugin in this.config.plugins) {
                    exec = this.config.plugins[plugin].path;
                }

                if (!exec) {
                    exec = this.config.plugins.app.path;
                }

                CP.exec(`${exec} ${args}`, (err, stdout, stderr) => {
                    if (err) {
                        // TODO
                        console.log(err);
                        return;
                    }

                    // TODO 这里要分模块
                    event.sender.send(`${plugin}EventDropList`, stdout);
                });
            } catch(e) {
            }
        });

        electron.ipcMain.on('ipcMainExec', (event, arg) => {
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

        electron.ipcMain.on('hide', (event, arg) => {
            this.hide();
        });
    }

    checkInstance() {
        const shouldQuit = electron.app.makeSingleInstance((commandLine, workingDirectory) => {
            if (this.mainWindows) {
                if (!this.mainWindows.isVisible()) {
                    this.mainWindows.show();
                    this.mainWindows.focus();
                }

                this.mainWindows.setContentSize(this.config.width, this.config.height, true);
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
            width                   : this.config.width,
            height                  : this.config.height,
            resizable               : false,
            title                   : this.config.title,
            type                    : 'toolbar',
            frame                   : false,
            show                    : false,
            autoHideMenuBar         : true,
            transparent             : true,
            alwaysOnTop             : false,
            disableAutoHideCursor   : true,
            icon                    : common.assetsPath('HotRunner_128px.png')
        });

        return mainWindow;
    }

    /**
     * @private
     * @param {electron.BrowserWindow} mainWindow
     */
    showWindow(mainWindow) {
        const bounds    = mainWindow.getBounds();
        const positionX = this.config.position.x || bounds.x;
        const positionY = this.config.position.y || (bounds.y -150);
        const indexPage = common.windowsPath('views', 'index.html');

        mainWindow.setPosition(positionX, positionY, true);
        mainWindow.loadURL(`file://${indexPage}`);
        mainWindow.show();
        mainWindow.focus();

        // mainWindow.webContents.openDevTools()
    }

    /**
     * @private
     */
    createTray() {
        let image = electron.nativeImage.createFromPath(common.assetsPath('HotRunner_48px.png'));
        image.setTemplateImage(true);

        const tray = new electron.Tray(image);
        // tray.setToolTip('Tip');

        const contextMenu = electron.Menu.buildFromTemplate([
            {
                label : 'Show',
                click: () => console.log('Show Loading')
            },
            {
                label: 'Exit',
                click: () => electron.app.exit(0)
            },
        ]);
        tray.setContextMenu(contextMenu);
    }

    hide() {
        this.mainWindows.hide();
    }

    quit() {
        if (process.platform !== 'darwin') {
            electron.app.quit()
        }
    }
}

(new HotRunner()).init();
