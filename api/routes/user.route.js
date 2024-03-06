const express = require('express');
const { test, updateUser, deleteUser } = require('../controllers/user.controller');
const { verifyToken } = require('../utils/verifyUser');

const router = express.Router();

router.get('/test', test);
router.post('/update/:id', updateUser)
router.delete('/delete/:id', verifyToken, deleteUser)

module.exports = router;
