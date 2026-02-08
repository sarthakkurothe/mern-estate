const Listing = require('../models/listing.model.js');
const { errorHandler } = require('../utils/error.js');
const { sendSuccess, sendMessage } = require('../utils/response.js');

const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    sendSuccess(res, 201, listing);
  } catch (error) {
    next(error);
  }
};

const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing)
    return next(
      errorHandler(404, 'Listing not found!', 'LISTING_NOT_FOUND')
    );

  if (req.user.id !== listing.userRef)
    return next(
      errorHandler(401, 'You can only delete your own listings!', 'FORBIDDEN')
    );

  try {
    await Listing.findByIdAndDelete(req.params.id);
    sendMessage(res, 200, 'Listing has been deleted!');
  } catch (error) {
    next(error);
  }
};

const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing)
    return next(
      errorHandler(404, 'Listing not found!', 'LISTING_NOT_FOUND')
    );

  if (req.user.id !== listing.userRef)
    return next(
      errorHandler(401, 'You can only update your own listings!', 'FORBIDDEN')
    );

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    sendSuccess(res, 200, updatedListing);
  } catch (error) {
    next(error);
  }
};

const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing)
      return next(
        errorHandler(404, 'Listing not found!', 'LISTING_NOT_FOUND')
      );

    sendSuccess(res, 200, listing);
  } catch (error) {
    next(error);
  }
};

const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    let offer = req.query.offer;
    if (offer === undefined || offer === 'false')
      offer = { $in: [false, true] };

    let furnished = req.query.furnished;
    if (furnished === undefined || furnished === 'false')
      furnished = { $in: [false, true] };

    let parking = req.query.parking;
    if (parking === undefined || parking === 'false')
      parking = { $in: [false, true] };

    let type = req.query.type;
    if (type === undefined || type === 'all')
      type = { $in: ['sale', 'rent'] };

    const searchTerm = req.query.searchTerm || '';
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: 'i' },
      offer,
      furnished,
      parking,
      type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    sendSuccess(res, 200, listings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
};