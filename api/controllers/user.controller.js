const bcryptjs = require('bcryptjs');
const User = require('../models/user.model.js');
const { errorHandler } = require('../utils/error.js');
const Listing = require('../models/listing.model.js');
const { sendSuccess, sendMessage } = require('../utils/response.js');

const test = (req, res) => {
  sendSuccess(res, 200, { message: 'Api route is working!' });
};

const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(
      errorHandler(401, 'You can only update your own account!', 'FORBIDDEN')
    );

  try {
    if (req.body.password)
      req.body.password = bcryptjs.hashSync(req.body.password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    sendSuccess(res, 200, rest);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(
      errorHandler(401, 'You can only delete your own account!', 'FORBIDDEN')
    );

  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    sendMessage(res, 200, 'User has been deleted!');
  } catch (error) {
    next(error);
  }
};

const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      sendSuccess(res, 200, listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(
      errorHandler(401, 'You can only view your own listings!', 'FORBIDDEN')
    );
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return next(errorHandler(404, 'User not found!', 'USER_NOT_FOUND'));

    const { password: pass, ...rest } = user._doc;
    sendSuccess(res, 200, rest);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  test,
  updateUser,
  deleteUser,
  getUserListings,
  getUser,
};