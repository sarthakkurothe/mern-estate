const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');
const { errorHandler } = require('../utils/error.js');
const { sendSuccess, sendMessage } = require('../utils/response.js');

const setupMfa = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user)
            return next(errorHandler(404, 'User not found', 'USER_NOT_FOUND'));

        const secret = speakeasy.generateSecret({ name: 'Urban Estate' });

        user.mfaTempSecret = secret.base32;
        await user.save();

        const qrCode = await QRCode.toDataURL(secret.otpauth_url);
        sendSuccess(res, 200, { qrCode });
    } catch (err) {
        next(err);
    }
};

const verifyMfaSetup = async (req, res, next) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.id);

        if (!user || !user.mfaTempSecret)
            return next(
                errorHandler(400, 'MFA setup not initiated', 'MFA_NOT_INITIATED')
            );

        const verified = speakeasy.totp.verify({
            secret: user.mfaTempSecret,
            encoding: 'base32',
            token,
            window: 0,
        });

        if (!verified)
            return next(errorHandler(401, 'Invalid OTP', 'MFA_INVALID_OTP'));

        user.mfaSecret = user.mfaTempSecret;
        user.mfaTempSecret = undefined;
        user.isMfaEnabled = true;
        await user.save();

        sendMessage(res, 200, 'MFA enabled successfully');
    } catch (err) {
        next(err);
    }
};

const verifyMfaLogin = async (req, res, next) => {
    try {
        const { userId, token } = req.body;
        const user = await User.findById(userId);

        if (!user || !user.isMfaEnabled)
            return next(
                errorHandler(400, 'MFA not enabled', 'MFA_NOT_ENABLED')
            );

        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token,
            window: 0,
        });

        if (!verified)
            return next(errorHandler(401, 'Invalid OTP', 'MFA_INVALID_OTP'));

        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        const { password, mfaSecret, mfaTempSecret, ...rest } = user._doc;

        res.cookie('access_token', jwtToken, { httpOnly: true });
        sendSuccess(res, 200, rest);
    } catch (err) {
        next(err);
    }
};

const disableMfa = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        user.isMfaEnabled = false;
        user.mfaSecret = undefined;
        user.mfaTempSecret = undefined;
        await user.save();

        sendMessage(res, 200, 'MFA disabled successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    setupMfa,
    verifyMfaSetup,
    verifyMfaLogin,
    disableMfa,
};
