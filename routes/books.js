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

  //Get books
  router.get('/books', asyncHandler(async (req, res) => {
    const books = await Book.findAll({ order: [['createdAt', 'DESC']]});
    res.render('index', { books });
  }));

  //create new book
  router.get('/books/new', asyncHandler(async (req, res) => {
      const book = await Book.create(req.body);
      res.redirect("/books/" + book.id);
  }));

  //add new book to db
  router.post('/books/new', asyncHandler(async (req, res) => {

  }));

  //show book detail form
  router.get('/books/:id', asyncHandler(async (req, res) => {

  }));

  //Updates book info in the database
  router.post('/books/:id', asyncHandler(async (req, res) => {

  }));

  //Deletes book from database
  router.post('/books/:id/delete', asyncHandler(async (req, res) => {

  }));
  module.exports = router;