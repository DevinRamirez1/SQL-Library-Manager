const express = require('express');
const router = express.Router();
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

  router.get('/', asyncHandler(async (req, res) => {
    const books = await Book.findAll({ order: [['createdAt', 'DESC']]});
    res.render('index', { books });
  }));

  router.post('/', asyncHandler(async (req, res) => {
      const book = await Book.create(req.body);
      res.redirect("/books/" + book.id);
  }))

  module.exports = router;