const express = require('express');
const {
  getAllReviews,
  getReview,
  setTourUserIds,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, restrict } = require('../controllers/authController');

// const router = express.Router();
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(protect, getAllReviews)
  .post(protect, restrict('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(updateReview)
  .delete(protect, deleteReview);

module.exports = router;
