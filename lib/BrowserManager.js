module.exports = {
  createWindow: createWindow,
  loadURL: loadURL,
  loadFile,
  sendMessage,
  isOpen,
};

const { BrowserWindow } = require("electron"),
  URL = require("url"),
  Lib = require("./");

// keep our global reference so we don't get garbage collected
let win;

function createWindow() {
  const preloadPath = Lib.fs.getFullPath("settings/preload.js");
  win = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      preload: preloadPath,
    },
  });

  win.on("closed", () => {
    // Dereference the window object
    win = null;
  });
}

function sendMessage(channel, message) {
  if (win) {
    win.webContents.send(channel, message);
  }
}

function isOpen() {
  return win != null;
}

function loadURL(url) {
  if (!win) createWindow();

  win.loadURL(URL.format(url));
}

function loadFile(file) {
  if (!win) createWindow();

  win.loadFile(file);
}
