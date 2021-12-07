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
  router.get('/books/new',(req, res) => {
    res.render("/books/new", { book: {}, title: "New Book"});
  });

  //add new book to db
  router.post('/books/new', asyncHandler(async (req, res) => {
    let book;
    try {
        const book = await Book.create(req.body);
        res.redirect('/books/' + book.id);
    } catch (error) {
        if (error.name === 'SeqeuelizeValidationError') {
            book = await Book.build(req.body);
            res.render('/books/new', { book, errors: error.errors, title: 'New Book'})
        } else {
            throw error;
        }
    }
  }));

  //show book detail form
  router.get('/books/:id', asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render('/books/:id', { book, title: 'Update Book'});
    } else {
        res.sendStatus(404);
    }
  }));

  //Updates book info in the database
  router.post('/books/:id', asyncHandler(async (req, res) => {
    let book;
    try {
        book = await Book.findByPk(req.params.id);
        if (book) {
            await book.update(req.body);
            res.redirect('/books/' + book.id);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        if (error.name === 'SequelizationValidationError') {
            book = await Book.build(req.body);
            book.id = req.params.id;
            res.render('/books/:id', { book, errors: error.errors, title: 'Edit Article'})
        } else {
            throw error;
        }
    }
  }));

  //Deletes book from database
  router.post('/books/:id/delete', asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
       await book.destroy();
       res.redirect('/books');
    } else {
        res.sendStatus(404);
    }
  }));
  
  module.exports = router;