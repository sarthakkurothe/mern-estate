const { User } = require("../models/user.model.js");
const bcryptjs = require('bcryptjs');
const errorHandler = require('../utils/error.js');
const jwt = require('jsonwebtoken');

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

exports.signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found!'));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;
    res
      .cookie('access_token', token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};
