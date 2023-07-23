// const fs = require('fs');
const { json } = require('express');
const Tour = require('../modals/tourModals');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.feilds = 'name,price,duration,summary,description,ratingsAverage';
  next();
};
class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryObj = { ...this.queryStr };
    const excludedFeilds = ['page', 'sort', 'limit', 'feilds'];
    excludedFeilds.forEach(el => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.query.sort) {
      // const sortBy = req.query.sort.replace(',' , ' ')
      const sortBy = this.query.sort.split(',').join(' ');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFeilds() {
    if (this.queryStr.feilds) {
      const feild = this.queryStr.feilds.split(',').join(' ');
      console.log(feild);
      this.query = this.query.select(feild);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('Invalid page');
    // }
  }
}
exports.getAllTours = async (req, res) => {
  try {
    // // BULID THE query 1A FILTERING
    const queryObj = { ...req.query };
    const excludedFeilds = ['page', 'sort', 'limit', 'feilds'];
    excludedFeilds.forEach(el => delete queryObj[el]);
    // // console.log(req.query, queryObj);
    // // req.query will return the object that will have the elements that we specify in
    // // get req url eg:{ duration: '5', difficulty: 'medium' }
    // query
    console.log(queryObj);
    // // { duration: { gte: '7' }, difficulty: 'medium' }

    // // 1B ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // // the reason for replaceing the gte ... etc with $gte is beacuse for mongoose FIND method
    // // the data should in the format like this { duration: { '$gte': '7' }, difficulty: 'medium' }
    // // for gte to work

    console.log(JSON.parse(queryStr));
    let query = Tour.find(JSON.parse(queryStr));

    // // 2 SORTING
    console.log(req.query);
    if (req.query.sort) {
      // const sortBy = req.query.sort.replace(',' , ' ')
      const sortBy = req.query.sort.split(',').join(' ');
      // console.log(sortBy);
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    // // 3 LIMITING
    if (req.query.feilds) {
      const feild = req.query.feilds.split(',').join(' ');
      console.log(feild);
      query = query.select(feild);
    } else {
      query = query.select('-__v');
    }

    // //PAGINATION

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('Invalid page');
    }
    // const tour=await Tour.find({
    //   duration: '5', difficulty: 'medium'
    // })
    // const tour = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    // EXECUTE THE query
    // const features = new APIFeatures(Tour.find(), req.query)
    //   .filter()
    //   .sort()
    //   .limitFeilds()
    //   .pagination();
    const tour = await query;
    res.status(200).json({
      status: 'success',
      length: tour.length,

      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  // console.log(req.params);
  // const id = req.params.id * 1;

  // const tour = tours.find(el => el.id === id);

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour
  //   }
  // });
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createTour = async (req, res) => {
  // console.log(req.body);

  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);

  // tours.push(newTour);

  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   err => {
  //     res.status(201).json({
  //       status: 'success',
  //       data: {
  //         tour: newTour
  //       }
  //     });
  //   }
  // );
  // const newTour=new Tour({

  // })
  // newTour.save()
  try {
    const newTours = await Tour.create(req.body);
    console.log(newTours);
    res.status(200).json({
      status: 'success',
      data: {
        newTours: newTours
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'The tour is deleted',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};
