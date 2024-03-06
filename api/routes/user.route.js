const express = require('express');
const { test, updateUser } = require('../controllers/user.controller');

const router = express.Router();

router.get('/test', test);
router.post('/update/:id', updateUser)

module.exports = router;
