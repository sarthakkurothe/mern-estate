const sendSuccess = (res, statusCode, data) => {
    return res.status(statusCode).json({
        success: true,
        statusCode,
        data,
    });
};

const sendMessage = (res, statusCode, message) => {
    return res.status(statusCode).json({
        success: true,
        statusCode,
        message,
    });
};

module.exports = { sendSuccess, sendMessage };
