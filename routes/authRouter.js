const express = require('express');
const router = express.Router();

// Load Controllers
const {
  registerController,
  activationController,
  signinController,
  forgetPasswordController,
  resetPasswordController
} = require ('../controllers/authController');


const {
  validSign,
  validLogin,
  forgetPasswordValidator,
  resetPasswordValidator
} = require( '../helpers/valid');

router.post('/register',
  validSign,
  registerController);

router.post('/activation', activationController);

router.post('/login',
    validLogin, 
    signinController);

router.put('/forgetpassword', forgetPasswordValidator, forgetPasswordController);

router.put('/resetpassword', resetPasswordValidator, resetPasswordController);

module.exports = router;