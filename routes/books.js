const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const Sequelize = require('sequelize');
const { Op } = Sequelize.Op;

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
  router.get('/', asyncHandler(async (req, res) => {
    const books = await Book.findAll({ order: [['createdAt', 'DESC']]});
    res.render('index', { books });
  }));

  //create new book
  router.get('/new',(req, res) => {
    res.render("new-book", { book: {}, title: "New Book"});
  });

  //add new book to db
  router.post('/new', asyncHandler(async (req, res) => {
    let book;
    try {
        const book = await Book.create(req.body);
        res.redirect('/books/' + book.id);
    } catch (error) {
        if (error.name === 'SeqeuelizeValidationError') {
            book = await Book.build(req.body);
            res.render('new-book', { book, errors: error.errors, title: 'New Book'})
        } else {
            throw error;
        }
    }
  }));

  //show book detail form
  router.get('/books/:id', asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render('update-book', { book, title: 'Update Book'});
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
            res.render('update-book', { book, errors: error.errors, title: 'Update Book'})
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