const mongoose = require('mongoose');

const boySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Delivery Person must have a name'],
    },
    phone: {
      type: Number,
      required: [true, 'Mobile Number is Required'],
      unique: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Delivery Boy must belong to a User'],
    },
    travelDistance: {
      type: String,
      required: [true, 'Delivery Person must set delivery distance'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Delivery Price is needed'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'Delivery Person must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Delivery person must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    selectedLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

boySchema.index({ price: 1, ratingsAverage: -1 });
boySchema.index({ slug: 1 });
boySchema.index({ selectedLocation: '2dsphere' });

boySchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'boy',
  localField: '_id',
});

const Boy = mongoose.model('Boy', boySchema);

module.exports = Boy;
