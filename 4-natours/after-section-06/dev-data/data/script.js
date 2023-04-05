const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tours = require('./../../modals/tourModals');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
mongoose
  .connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
  })
  .then(con => {
    console.log('Db Connection sucessFull');
  });

const toursString = fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8');
const toursObj = JSON.parse(toursString);
// console.log(tours);
// console.log('[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]');
// console.log(toursObj);
// console.log(typeof toursObj);

const importData = async () => {
  try {
    await Tours.create(toursObj);
    console.log('Data loaded sucessfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tours.deleteMany();
    console.log('Data deleted sucessfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
