const dashboardCellReader = require("./reader");

const timerReader = () => {

  //read for the first time
  dashboardCellReader();

  //read based on interval (in milli seconds)
  const intervalId = setInterval(dashboardCellReader, process.env.READ_DASHBOARD_FREQ);
};

module.exports = timerReader;