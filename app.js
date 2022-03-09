const express  = require ( "express");
const morgan  = require ( 'morgan');
const bodyParser  = require ( "body-parser");
const cors  = require ( "cors");
const dashboardTimerReader = require("./data/timerReader");
const dataService = require("./lib/dataService");


class Server {
  constructor() {

    // Config dotev
    require('dotenv').config({
      path: './config/config.env'
    })

    this.port = process.env.PORT;
    this.app = express();
    this.app.use(function(req, res, next) {
      res.setHeader('Permissions-Policy', 'interest-cohort=()');
      next();
    });
  }

  async configApp() {

    // Connect to database
    await dataService.instance.init();

    // Read ActiveDashboard Cell data
    dashboardTimerReader();

    // CORS, Body Parser
    this.app.use(cors(), bodyParser.urlencoded({ extended: true }), bodyParser.json());
  }

  useRoutes() {

    // Load router
    const authRouter = require ('./routes/authRouter');
    const dataRouter = require('./routes/dataRouter');

    // Logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'))
    }

    //Use routes
    this.app.use("/api", authRouter);
    this.app.use("/api", dataRouter);

    this.app.get("/", (req, res) => {
      res.send("Welcome to Damon Backend Server API!");
    });
  }

  startServer() {

    this.app.listen(this.port, () => {
      console.log(`Running on port ${this.port}`);
    });
  }

  async executeApp() {

    await this.configApp();
    this.useRoutes();
    this.startServer();
  }

}


const backendApp = new Server();
backendApp.executeApp();
