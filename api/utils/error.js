const errorHandler = (statusCode, message, code = 'ERROR') => {
    const error = new Error();
    error.statusCode = statusCode;
    error.message = message;
    error.code = code;
    return error;
};

module.exports = { errorHandler };
