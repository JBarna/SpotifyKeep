const { ipcRenderer } = require('electron')
const CHANNEL = 'hotkey-communcation'

init()

function init() {

  ipcRenderer.send(CHANNEL, 'load-target-lists')
  ipcRenderer.send(CHANNEL, 'load-existing-hotkeys')
  ipcRenderer.on(CHANNEL, (event, type, data) => {
    if (type == "target-lists") {
      setState({
        targetLists: data
      })
    }

    if (type == "existing-hotkeys") {
      setState({
        existingHotkeys: data
      })
    }
  })
}

function sendHotkeyConfiguration(configuration) {
  ipcRenderer.send(CHANNEL, 'hotkey-change', configuration)
}
