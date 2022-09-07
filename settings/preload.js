const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI',{
  changeHotkey: (hotkey) => ipcRenderer.send('hotkey:change', hotkey),
  receiveHotkey: (callback) => ipcRenderer.on('hotkey:receive', callback),
  getHotkey: () => ipcRenderer.invoke('hotkey:get'),
  openDocs: () => ipcRenderer.send('hotkey:format', true)
})