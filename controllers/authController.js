const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
//Custom error handler from database errors
const { errorHandler } = require('../helpers/dbErrorHandling');
const transporter = require ('../config/emailTransporter');
const expressJwt = require('express-jwt');
const dataService = require("../lib/dataService").instance;
const { authenticate, encryptPassword, makeSalt, resetPassword } = require('../lib/authService');


exports.registerController = async (req, res) => {
  const { username, fullname, email, password, role } = req.body;
  const errors = validationResult(req);

  //Validation to req body
  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
    let user = await dataService.findUser({username});
    
    if (user) {
      //console.log('USER is found in the DB')
      return res.json({errors: 'username is taken'});
    }

    //Generate token
    const token = jwt.sign(
      {
        username,
        fullname,
        email,
        password,
        role
      },
      process.env.JWT_ACCOUNT_ACTIVATION,
      {
        expiresIn: '5m'
      }
    );

    //Email Data Sending
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: 'Damon: Account activation link',
      html: `
                <h1>Please use the following to activate the below account</h1>
                <p>Username: ${username}</p>
                <p>Fullname: ${fullname}</p>
                <p>Role: ${role}</p>
                <p>Email: ${email}</p>
                <p><a href='${process.env.CLIENT_URL}/users/activate/${token}'>Click here</a></p>
                <hr />
                <p>Damon Confidential</p>
            `
    };
    transporter.sendMail(emailData, (err, info) => {
      if (err) {
        return res.json({
          message: err.message
        });
      } else {
        return res.json({
          message: `Email has been sent to admin at ${process.env.ADMIN_EMAIL}. Follow the instruction to activate your account`
        });
      }
    });
  }
};

//Activate and save to DB
exports.activationController = (req, res) => {
  const { token } = req.body;

  if (token) {
    //Validate the token is valid and not expired
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, async (err, decoded) => {
      if (err) {
        //console.log('Expired LINK')
        return res.status(401).json({
          errors: 'Expired link. Signup again'
        });
      } else {
        //valid, then save to db
        const { username, fullname, email, password, role } = jwt.decode(token);

        const salt = makeSalt();
        const todate = new Date();
        const userObj = {};
        userObj.username = username;
        userObj.fullname = fullname;
        userObj.email = email;
        userObj.salt = salt;
        userObj.hashed_password = encryptPassword(password, salt);
        userObj.role = role;
        userObj.createdAt = todate;
        userObj.updatedAt = todate;

        try {
          const user = await dataService.addUser(userObj);

          return res.json({
            success: true,
            user: user,
            message: 'Signup success'
          });
        } catch (error) {
            console.error('AddUser service failure: ', error);
            return res.status(401).json({
              errors: errorHandler(err)
            });
        }
      }
    });
  } else {
    return res.json({
      message: 'error happening please try again'
    });
  }
};

exports.signinController = async (req, res) => {
  const usernameIn = req.body.username;
  const passwordIn = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {

    // check if user exist
    let user = await dataService.findUser({'username':usernameIn});

    if (!user) {
      return res.status(400).json({
        errors: 'User does not exist'
      });
    }
    // authenticate
    if (!authenticate(passwordIn, user.salt, user.hashed_password)) {
      return res.status(400).json({
        errors: 'Username and password do not match'
      });
    }      

    // generate a token and send to client
    const token = jwt.sign(
      {
        _id: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );
    const { username, fullname, email, role } = user;

    return res.json({
      token, 
      username, 
      fullname, 
      email, 
      role });
  }
};

exports.forgetPasswordController = async (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
    let user = await dataService.findUser({email});

    if (!user) {
      return res.status(400).json({
        error: 'User with that email does not exist'
      });
    }

    const token = jwt.sign(
      {
        _id: user._id
      },
      process.env.JWT_RESET_PASSWORD,
      {
        expiresIn: '10m'
      }
    );

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Damon: Password Reset link`,
      html: `
                <h1>Please use the following link to reset your password</h1>
                <p><a href='${process.env.CLIENT_URL}/users/password/reset/${token}'>Click here</a></p>
                <hr />
                <p>Damon Confidential</p>
            `
    };

    try{
      await dataService.updateOneUser({email}, 'resetPasswordLink', token);

      transporter.sendMail(emailData, (err, info) => {
        if (err) {
          return res.json({
            message: err.message
          });
        } else {
          return res.json({
            message: `Email has been sent to ${email}. Follow the instruction to activate your account`
          });
        }
      });          
    }catch(error){
      console.error('DataService.updateOneUser failed: ', error)
    }
  }
};

exports.resetPasswordController = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
    if (resetPasswordLink) {
      jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, async function(
        err,
        decoded
      ) {
        if (err) {
          return res.status(400).json({
            error: 'Expired link. Try again'
          });
        }
        
        const user = await dataService.findUser({resetPasswordLink});

        if (!user) {
          return res.status(400).json({
            error: 'Something went wrong. Try later'
          });
        }

        const updatedFields = resetPassword(newPassword);

        try {
          await dataService.updateOneWithId(user._id, updatedFields);

          res.json({
            message: `Please login with your new password`
          });              
        } catch(error) {
          console.error('Reset password failure: ', error);
          return res.status(400).json({
            error: 'Error resetting user password'
          });              
        }

      });
    }
  }
};

exports.validateToken = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256']
});
