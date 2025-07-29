function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('Add-on')
    .addItem('Ativar', 'ativar')
    .addItem('Desativar', 'desativar')
    .addItem('Configurar', 'configurar')
    .addToUi();
};

const testMenu = () => {
  Logger.log(checkActivation())
};

const getTriggers = () => {
  return ScriptApp.getProjectTriggers();
};

function ativar() {
  const triggers = getTriggers()
  if (triggers.length == 0) {
    ScriptApp.newTrigger('trigger')
      .timeBased()
      .everyMinutes(5)
      .create();
    SpreadsheetApp.getUi().alert('Add-on ativado com sucesso.');
  } else {
    SpreadsheetApp.getUi().alert('O add-on já está ativo.');
  }
};

function desativar() {
  const triggers = getTriggers()
  if (triggers.length > 0) {
    triggers.forEach(t => ScriptApp.deleteTrigger(t))
    SpreadsheetApp.getUi().alert('Add-on desativado com sucesso.');
  } else {
    SpreadsheetApp.getUi().alert('O add-on já está desativado.');
  }
};

function configurar() {
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
    .alert('You clicked the third menu item!');
};