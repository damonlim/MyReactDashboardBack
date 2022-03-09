const crypto = require('crypto');

function authService() {

  function makeSalt() {
    
    return Math.round(new Date().valueOf() * Math.random()) + '';
  }

  function encryptPassword(password, salt) {

    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  }

  function authenticate(password, salt, hashed_password) {

    const encrypedPwd = encryptPassword(password, salt);

    return (encrypedPwd === hashed_password);
  }

  function resetPassword(password) {

    try {
      const salt = makeSalt();
      const encryptedPwd = encryptPassword(password, salt);
      const updatedFields = {
        'salt' : salt,
        'resetPasswordLink' : '',
        'hashed_password' : encryptedPwd
      }
      return updatedFields;

    } catch(error) {
      throw error;
    }
  }

  return { makeSalt, encryptPassword, authenticate, resetPassword };

}

module.exports = authService();




