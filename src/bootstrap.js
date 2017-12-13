
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
                    // TODO 这样能拿到吗
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
}

module.exports = {
    config : Bootstrap.generateConfig()
};