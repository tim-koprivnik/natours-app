const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// 1. Create a schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must have less or equal than 40 characters!',
      ],
      minlength: [5, 'A tour name must have more or equal than 5 characters!'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration!'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size!'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty!'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult!',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1.0!'],
      max: [5, 'Rating must can be at most 5.0!'],
      set: (val) => Math.random(val).toFixed(1),
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price!'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price!',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary!'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image!'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // [longitude, latitude]
      address: String,
      description: String,
    },
    locations: [
      // Embedded documents
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number], // [longitude, latitude]
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      // Referencing documents
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Add indexes
// tourSchema.index({ price: 1 }); // 1 stands for asc order; -1 for desc
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

// *** Virtual schema property
tourSchema.virtual('durationWeeks').get(function () {
  return (this.duration / 7).toFixed(2);
});

// *** Virtual populate -- populate reviews from Review model
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// *** Mongooose Middlewares
// a) Document Middleware: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

// b) Query Middleware
tourSchema.pre(/^find/, function (next) {
  // /^find/ means that all strings that start with find will be matched (e.g. findOne, findOneAndUpdate, etc.)
  this.find({ secretTour: { $ne: true } }); // Filter out secret tours
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(docs);
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// c) Aggregation Middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // Filter out secret tours from the aggregation pipeline
  console.log(this.pipeline());
  next();
});

// 2. Create a model out of the schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
