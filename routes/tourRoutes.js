const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
} = require('../controllers/tourController');
const { protect, restrict } = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// POST /tour/32543aaf/reviews
// GET /tour/32543aaf/reviews
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5').get(aliasTopTours, getAllTours);
router.route('/stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrict('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/:unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrict('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrict('admin', 'lead-guide'), updateTour)
  .delete(protect, restrict('admin', 'lead-guide'), deleteTour);

module.exports = router;
