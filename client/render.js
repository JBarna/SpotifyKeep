let state = {}

function setState(newState) {
  state = Object.assign({}, state, newState)
  render(state)
}

const getDomElements = () => ({
  hotkeyContainer: document.getElementById('hotkey-container'),
  targetSelect: document.getElementById('target-select'),
  existingTable: document.getElementById('existing-container-table'),
  newHotkeyKey: document.getElementById('new-hotkey-key'),
  newHotkeyTarget: document.getElementById('new-hotkey-target')
})

function handleRemoveHotkey(hotkey) {
  const { newHotkeyKey, newHotkeyTarget } = getDomElements()
  sendHotkeyConfiguration({
    action: 'remove',
    configuration: {
      hotkey: newHotkeyKey.value,
      target: state.targetLists[newHotkeyTarget.selectedIndex].id
  }})

}

function handleAddHotkey(){
  const { newHotkeyKey, newHotkeyTarget } = getDomElements()
  sendHotkeyConfiguration({
    action: 'add',
    configuration: {
      hotkey: newHotkeyKey.value,
      target: state.targetLists[newHotkeyTarget.selectedIndex].id
  }})
}

function render() {

  const elems = getDomElements()

  function populateTargetLists(targetLists) {

    function playlistOptions() {
      return targetLists.map(list => `<option value="${list.name}">${list.name}</option>`).join('')
    }

    return `
      <select id="new-hotkey-target" name="targets">
        ${playlistOptions()}
      </select>
      `
  }

  function populateExistingHotkeys(hotkeys) {

    return hotkeys.map(key => `
    <tr>
        <td>Hotkey</td>
        <td>${key.hotkey}</td>
    </tr>
    <tr>
        <td>Target</td>
        <td>${state.targetLists.find(list => list.id === key.target).name}</td>
    </tr>
    <tr>
        <td></td>
        <td><input id="remove-button" onclick="handleRemoveHotkey('${key.hotkey}')" type="button" value="🗑️" /></td>
    </tr>
    `).join("<br/>")
  }

  // clear out previous contents
  elems.targetSelect.innerHTML = ''
  elems.existingTable.innerHTML = ''

  if (state.targetLists && state.existingHotkeys) {
    elems.existingTable.innerHTML = populateExistingHotkeys(state.existingHotkeys)
    const content = `<div class="myclass">${populateTargetLists(state.targetLists)}</div>`
    elems.targetSelect.innerHTML = content
  }
}