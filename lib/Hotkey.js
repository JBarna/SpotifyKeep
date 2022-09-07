module.exports = {
  init,
  change,
  getHotkey,
};

const { globalShortcut, ipcMain, app } = require("electron"),
  Lib = require("./"),
  opener = require("opener");

function init(keyPressFn) {
  const hotkeyShortcut = Lib.State.get(Lib.State.keys.HOTKEY);
  let inProgress = false;

  const shortcutHandler = () => {
    if (Lib.BrowserManager.isOpen()) {
      Lib.BrowserManager.sendMessage("hotkey:receive", true);
      return;
    }

    if (!inProgress) {
      inProgress = true;
      keyPressFn()
        .then(Lib.Notification)
        .catch(console.debug.bind(null, "error showing notification"))
        .then(() => (inProgress = false));
    }
  };

  globalShortcut.register(hotkeyShortcut, shortcutHandler);

  ipcMain.handle("hotkey:get", () => {
    return getHotkey();
  });

  ipcMain.on("hotkey:change", (event, hotkey) => {
    globalShortcut.register(hotkey, shortcutHandler);
    Lib.State.set(Lib.State.keys.HOTKEY, hotkey);
  });

  ipcMain.on("hotkey:format", (event) => {
    opener("https://www.electronjs.org/docs/latest/api/accelerator");
  });

  app.on("will-quit", () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
  });
}

function change() {
  const settingsFile = Lib.fs.getFullPath("settings/index.html");
  Lib.BrowserManager.loadFile(settingsFile);
}

function getHotkey() {
  return Lib.State.get(Lib.State.keys.HOTKEY);
}
