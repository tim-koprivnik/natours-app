const Tour = require('../models/tourModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTourStats = async (req, res, next) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          // _id: null,
          // _id: '$ratingsAverage',
          _id: '$difficulty',
          numTours: { $sum: 1 }, // 1 for each document
          numRating: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 }, // 1 for ascending order
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: stats,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMonthlyPlan = async (req, res, next) => {
  try {
    const year = Number(req.params.year); // e.g. 2021
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $sort: { numTourStarts: -1 }, // -1 for descending order
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: plan,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getToursWithin = async (req, res, next) => {
  try {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat && !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng',
          400,
        ),
      );
    }

    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
      status: 'Success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getDistances = async (req, res, next) => {
  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat && !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng',
          400,
        ),
      );
    }

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'Success',
      data: {
        data: distances,
      },
    });
  } catch (err) {
    next(err);
  }
};
