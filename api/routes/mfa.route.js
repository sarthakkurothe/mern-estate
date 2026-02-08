const express = require('express');
const {
    setupMfa,
    verifyMfaSetup,
    verifyMfaLogin,
    disableMfa,
} = require('../controllers/mfa.controller.js');
const { verifyToken } = require('../utils/verifyUser.js');

const router = express.Router();

router.post('/setup', verifyToken, setupMfa);
router.post('/verify', verifyToken, verifyMfaSetup);
router.post('/login', verifyMfaLogin);
router.post('/disable', verifyToken, disableMfa);

module.exports = router;
