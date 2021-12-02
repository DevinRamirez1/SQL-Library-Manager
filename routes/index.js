var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

//Handler function to wrap each route
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
      } catch(error){
        res.status(500).send(error);
      }
    }
  }

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/books');
});

router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll({ order: [['createdAt', 'DESC']]});
  res.render('views/index', { books });
}));
module.exports = router;
