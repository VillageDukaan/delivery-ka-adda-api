const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

exports.setBoyUserIds = (req, res, next) => {
  // Allow nested routes
  if(!req.body.boy) req.body.boy = req.params.boyId;
  if(!req.body.user) req.body.user = req.user.id;
  next();
}

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
