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

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(restrict('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrict('user', 'admin'), checkIfAuthor, updateReview)
  .delete(restrict('user', 'admin'), checkIfAuthor, deleteReview);

module.exports = router;
