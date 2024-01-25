class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1. Filtering
  filter() {
    // 2.a) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // 2.b) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const advancedQueryObj = JSON.parse(queryStr);

    this.query = this.query.find(advancedQueryObj);

    return this;
  }

  // 2. Sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy); // sort('price ratingsAverage')
    } else {
      this.query = this.query.sort('-createdAt'); // default sorting
    }

    return this;
  }

  // 3. Field Limiting
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); // select('name price ratingsAverage')
    } else {
      this.query = this.query.select('-__v'); // Exclude __v field from the response
    }

    return this;
  }

  // 4. Pagination
  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;

    // page=2&limit=10, 1-10 page 1, 11-20 page 2, 21-30 page 3, etc.
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
