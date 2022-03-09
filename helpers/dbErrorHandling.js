"use strict";


/**
 * Get the erroror message from error object
 */
exports.errorHandler = error => {
    let message = "";
    if (error.code) {
        console.log('error code:',error.code)
        switch (error.code) {
            case 11000:
            case 11001:
                message = uniqueMessage(error);
                break;
            case 13:
                // Error code is Unauthorized
                message = "Please contact administrator for DB connection error.";
                break;
            default:
                message = "Something went wrong";
        }
    } else if (error.errorors) {
        for (let errorName in error.errorors) {
            if (error.errorors[errorName].message)
                message = error.errorors[errorName].message;
        }
    }
    if (!message) {
        message = error;
    }
    console.log('errorHandler message: ', message)
    return message;
};