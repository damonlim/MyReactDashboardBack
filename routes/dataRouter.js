const express = require('express');
const router = express.Router();

// Load Controllers
const {
  validateToken
} = require('../controllers/authController');

const {
  readDashboard,
  getAllProjects,
  getProjectData
} = require('../controllers/dataController');

router.get('/data/dashboard', validateToken, readDashboard);

router.get('/data/projects', validateToken, getAllProjects);

router.post('/data/projectData', validateToken, getProjectData);

module.exports = router;