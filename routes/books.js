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

  //Get books for homepage
  router.get('/', asyncHandler(async (req, res) => {
    const {count, rows} = await Book.findAndCountAll({ 
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    const pages = Math.ceil(count / 5);
    console.log(pages);
    res.render('index', { 
      books: rows,
      pages,
      activePage: 1,
     });
  }));

  //Get specific page
  router.get('/page/:id', asyncHandler(async (req, res) => {
    const limit = 10;
    const offset = req.params.id > 1 ? (req.params.id - 1) * limit : 0
    const activePage = req.params.id;
    const { count, rows } = await Book.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    const pages = Math.ceil(count / 5);
    console.log(activePage);
    res.render('index', {
      books: rows,
      pages,
      activePage,
    });
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
        res.redirect('/books/');
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            book = await Book.build(req.body);
            res.render('new-book', { book, errors: error.errors, title: 'New Book'})
        } else {
            throw error;
        }
    }
  }));

  //show book detail form
  router.get('/:id', asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render('update-book', { book, title: 'Update Book'});
    } else {
        res.sendStatus(404);
    }
  }));

  //Updates book info in the database
  router.post('/:id', asyncHandler(async (req, res) => {
    let book;
    try {
        book = await Book.findByPk(req.params.id);
        if (book) {
            await book.update(req.body);
            res.redirect('/books/');
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            book = await Book.build(req.body);
            book.id = req.params.id;
            res.render('update-book', { book, errors: error.errors, title: 'Update Book'})
        } else {
            throw error;
        }
    }
  }));

  //Deletes book from database
  router.post('/:id/delete', asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
       await book.destroy();
       res.redirect('/books/');
    } else {
        res.sendStatus(404);
    }
  }));

  module.exports = router;