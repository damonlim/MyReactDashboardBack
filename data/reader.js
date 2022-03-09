const fs = require('fs');
const path = require("path");
const dataService = require("../lib/dataService").instance;
const {FileClass} = require('./fileClass');

const reportTypes = ['layout', 'others', 'schematic'];
const headerArray = ['','Lib','Cell','View','Revision','User','CO_Date','CO_Duration',
'Prev_CI','Prev_User'];

const readFileFn= (param) => {

  const dateObj = new Date();
  // make month 2 digits
  const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
  // make date 2 digits
  const date = ('0' + dateObj.getDate()).slice(-2);
  // get 4 digit year
  const year = dateObj.getFullYear().toString();

  reportTypes.forEach((reportType) => {

    const reportFilePath = path.join(process.env.BASE_RPT_FILEPATH, year, month, date, reportType);

    // If directory has not been created yet. Skip!
    if (!fs.existsSync(reportFilePath)) return;  

    const latestFileObj = getMostRecentFile(reportFilePath);

    if (latestFileObj !== undefined && (FileClass.lastFile[reportType] === undefined || 
      FileClass.lastFile[reportType] !== latestFileObj.file) ) {

      FileClass.lastFile[reportType] = latestFileObj.file;
      console.debug(reportType,' has new file: ', FileClass.lastFile[reportType]);

      const latestFilePath = path.join(reportFilePath, latestFileObj.file);

      const reportArray = readEachReportFile(reportType, latestFilePath);

      console.log(`\nCalling UpdDB on ${reportType} for ${latestFileObj.file}`);
      updateDB(reportType, reportArray);

    }      
    
  });

}

const getMostRecentFile = (dir) => {

  const files = orderReccentFiles(dir);

  return files.length ? files[0] : undefined;
};

const orderReccentFiles = (dir) => {

  return fs.readdirSync(dir)
    .filter((file) => {
      fsStats = fs.lstatSync(path.join(dir, file));
      return fsStats.isFile() && fsStats.size > 0 })
    .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
};

const readEachReportFile = (reportType, latestFilePath) => {

  console.debug('readEachReportFile starts');

  const objectArray = [];

  const data = fs.readFileSync(latestFilePath, 'utf8');

    const rows = data.split("\n");
    const todate = new Date();

    rows.forEach((row, indexRow) => {
      if (indexRow !== 0) {
        const columns = row.split(",");

        //Filter out not valid/empty row
        if (columns.length < 2) return;

        let reportObj = {};
        reportObj.type = reportType;
        reportObj.createdAt = todate;
        reportObj.updatedAt = todate;

        columns.forEach((col, index) => {
          if (index !== 0) {
            reportObj[headerArray[index]] = col;
          }
        });
        objectArray.push(reportObj);
      }
    });

  console.debug('readEachReportFile ends ',objectArray.length);

  return objectArray;
};

const updateDB = async (reportType, reportArray) => {

  console.debug(reportType,' updateDB start: ', reportArray.length);

  const objTypeToRemove = {
    'type': reportType
  }

  // Update Cells Collection - Used for Active Dashboard
  await dataService.clearDailyCellsCol(objTypeToRemove); 
  await dataService.updateDailyCellsCol(reportArray);

  // Update Layout, Others, and Schematic Collections - History purposes
  switch (reportType) {
    case reportTypes[0]:
      await dataService.addLayoutReports(reportArray);
      break;
    case reportTypes[1]:
      await dataService.addOthersReports(reportArray);
      break;
    case reportTypes[2]:
      await dataService.addSchematicReports(reportArray);
      break;
  }

};

module.exports = readFileFn;