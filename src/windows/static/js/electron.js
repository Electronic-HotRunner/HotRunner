
'use strict';

const {ipcRenderer} = require('electron');

/**
 * @constructor
 */
function Ipc() {
}

/**
 * @static
 * @public
 * @memberOf Ipc
 * @param {string} channel
 * @param {{plugin : string, args : string}|null} args
 */
Ipc.sendMessage = function(channel, args = null) {
    ipcRenderer.send(channel, args);
};

/**
 * @static
 * @public
 * @memberOf Ipc
 * @param {string} channel
 * @param {string|Function} callback
 */
Ipc.getMessage = function(channel, callback) {
    ipcRenderer.on(channel, callback);
};

module.exports = {
    Ipc : Ipc
};