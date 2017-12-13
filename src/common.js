
'use strict';

const fs     = require('fs');
const path   = require('path');
const Config = require('./config.json');

class Bootstrap {

    static generateConfig() {
        if (Config.pluginPath) {
            const pluginRootPath = path.join(__dirname, Config.pluginPath);
            let pluginDirectories = fs.readdirSync(pluginRootPath);

            let pluginDirectory;
            let pluginDirectoryPath;

            for (let idx in pluginDirectories) {
                pluginDirectory = pluginDirectories[idx];

                pluginDirectoryPath = path.join(pluginRootPath, pluginDirectory);
                if (fs.statSync(pluginDirectoryPath).isDirectory()) {
                    /** @type {{name : String, icon : String, comment : String, path : String}} */
                    let pluginConfig = require(path.join(pluginDirectoryPath, 'config.json'));
                    pluginConfig[pluginDirectory].path = path.join(pluginDirectoryPath, pluginConfig[pluginDirectory].path);
                    pluginConfig[pluginDirectory].icon = path.join(pluginDirectoryPath, pluginConfig[pluginDirectory].icon);
                    Object.assign(Config.plugins, pluginConfig);
                }
            }
        }

        return Config;
    }

    /**
     * @static
     * @public
     * @param {...string} file
     * @returns {string}
     */
    static assetsPath(...file) {
        return path.join(__dirname, `../assets/${path.join(...file)}`);
    }

    /**
     * @static
     * @public
     * @param {...string} file
     * @returns {string}
     */
    static pluginsPath(...file) {
        return path.join(__dirname, `../plugins/${path.join(...file)}`);
    }

    /**
     * @static
     * @public
     * @param {...string} file
     * @returns {string}
     */
    static windowsPath(...file) {
        return path.join(__dirname, `../src/windows/${path.join(...file)}`);
    }
}

module.exports = Bootstrap;