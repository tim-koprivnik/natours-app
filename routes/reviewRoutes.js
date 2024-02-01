const express = require('express');
const {
  getAllReviews,
  getReview,
  setTourUserIds,
  createReview,
  updateReview,
  deleteReview,
  checkIfAuthor,
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
  .patch(protect, checkIfAuthor, updateReview)
  .delete(protect, restrict('user', 'admin'), checkIfAuthor, deleteReview);

module.exports = router;
