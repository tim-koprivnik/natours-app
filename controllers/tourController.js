const mongoose = require('mongoose');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.getAllTours = async (req, res, next) => {
  try {
    // 1. Execute query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // 2. Send response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getTour = async (req, res, next) => {
  // const { id } = req.params;

  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   return next(new AppError('Invalid ID format', 400)); // 400 Bad Request
  // }

  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createTour = async (req, res, next) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTour = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid ID format', 400));
  }

  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTour) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTour = async (req, res, next) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);

    if (!deletedTour) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

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
      data: stats,
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
      data: plan,
    });
  } catch (err) {
    next(err);
  }
};
