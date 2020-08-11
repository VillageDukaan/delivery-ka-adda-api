const mongoose = require('mongoose');
const Boy = require('./boyModel')

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review cannot be empty!'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  boy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Boy',
    required: [true, 'Review must belong to a delivery boy'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a User'],
  }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
}
);

reviewSchema.index({ boy: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path:'user',
        select: 'name photo'
    });

    next();
})

//Static Method
reviewSchema.statics.calcAverageRatings = async function(boyId) {
  const stats = await this.aggregate([
    {
      $match: { boy: boyId }
    }, 
    {
      $group: { 
        _id: '$boy',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
       }
    }
  ]);

  if(stats.length > 0) {
    await Boy.findByIdAndUpdate(boyId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Boy.findByIdAndUpdate(boyId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function(next) {
  // this points to current review
  this.constructor.calcAverageRatings(this.boy);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.rev = await this.findOne()
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  await this.rev.constructor.calcAverageRatings(this.rev.boy);
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
