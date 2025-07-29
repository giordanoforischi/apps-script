class Runner {
  constructor() {
    this.app = SpreadsheetApp.getActive()
    this.enabled = this.rangedName('addonEnabled', false)
    this.tempSheetName = '__addon_temp'
    this.newRecordsColor = '#ffe599'
    if (this.enabled) {
      this.config = this.rangedName('addonConfig', true)
      this.runEachSheet(this.config)
    }
  };

  runEachSheet(config) {
    let newConfigArr = []
    config.forEach(sheet => {
      try {
        let newSheetConfig = this.runMerge(sheet)
        newConfigArr.push(newSheetConfig)
      } catch (e) { }
    })
    this.persistConfig(newConfigArr)
  }

  rangedName(name, json) {
    try {
      var value = this.app.getRangeByName(name).getValue()
      return json ? JSON.parse(value) : value
    } catch (error) {
      throw new Error(error)
    };
  };

  runMerge(sheetConfig) {
    let validator = new Validator(this.app, sheetConfig)
    if (validator.hasNewData) {
      var newData = new TempData(this.app, validator.getNewDataRange(), validator.dateColumn, this.tempSheetName, this.newRecordsColor)
      var oldData = new Data(this.app, validator.getOldDataRange(), validator.dateColumn)

      try {
        oldData.mergeByDate(newData.dataRange)
        newData.deleteTemp()
      } catch (error) {
        newData.deleteTemp()
        Logger.log(error)
        throw new Error(error)
      }
      return { ...sheetConfig, 'previousLastRow': oldData.getLastRow() }
    } else {
      return sheetConfig
    }
  };

  persistConfig(newSheetConfig) {
    this.app.getRangeByName('addonConfig').setValue(JSON.stringify(newSheetConfig))
  };
};

const trigger = () => {
  new Runner()
};