# Getting Started with Damon BackEnd

This project was developed using NodeJS

## Available Scripts

To start the Backend server, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:5000](http://localhost:5000) to verify it is running in your browser.

The page doesn't show any meaningful information aside from showing it is online.\
This server serves as backend API server for damon Dashboard.


# MongoDB setup

Install MongoDB community server version 4.4.6 or above.\
Install MongoShell (shell to connect to MongoDB), add it to your PATH

## Setup admin user in MongoDB

Launch MongoShell and connect to the newly installed DB. In Microsoft Windows, just issue:

### mongosh

Then follow the below command to setup local admin database user.
```
use admin

db.createUser(
  {
    user: "admin",
    pwd:  passwordPrompt(),   // or cleartext password
    roles: [ { role: "userAdminAnyDatabase", db: "admin" },
             { role: "readWriteAnyDatabase", db: "admin" },
             { role: "dbAdminAnyDatabase", db: "admin" },
             { role: "clusterAdmin", db: "admin" } ]
  }
)
```
To create dash application user account, use the below command:
```
db.createUser(
  {
    user: "dash",
    pwd:  "dash",
    roles: [ { role: "readWriteAnyDatabase", db: "dash" } ]
  }
)
```

## Load Project Mock Data

You may want to load a project mock data for the first time upon setting up your MongoDB.\
Follow the below command to load it.
```
node addProjectMock.js
```


# Configuration settings

Refer to config/config.env file. You may need to update some settings accordingly.\
Example: If your Active Cells report dump is located at /project/activecells/rpt, then use the below updated config for BASE_RPT_FILEPATH
```
BASE_RPT_FILEPATH = /project/activecells/rpt
```

