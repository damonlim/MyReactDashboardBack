const dataService = require("../lib/dataService").instance;


exports.readDashboard = async (req, res) => {

  const data = await dataService.getActiveDashboard({});
  if (data) {
    return res.json(data);
  };
};

exports.getAllProjects = async (req, res) => {

  const data = await dataService.getProjects();
  if (data) {
    return res.json(data);
  }
};

exports.getProjectData = async (req, res) => {

  let queryObj = {};
  const project = req.body.project;
  const lib = req.body.lib;
  const cell = req.body.cell;
  project ? queryObj['project'] = project : queryObj;
  lib ? queryObj['Lib'] = lib : queryObj;
  cell ? queryObj['Cell'] = cell : queryObj;
  console.debug('getProjectData request data is: ',queryObj);
  
  const data = await dataService.getProjectData(queryObj);
  if (data) {
    console.log(data)
    return res.json(data);
  }
};

