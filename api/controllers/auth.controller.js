const { User } = require("../models/user.model.js");
const bcryptjs = require('bcryptjs');

exports.signup = async function (req, res, next) {
    const { username, email, password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password, 10); 
    try {
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json('User created successfully!');
    } catch (error) {
        next(error);
    }
};