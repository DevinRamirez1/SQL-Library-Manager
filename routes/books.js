const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const app = express();
const createError = require('http-errors');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//Handler function to wrap each route
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
      } catch(error){
        //Forward error to global error handler
        next(error);
      }
    }
  }

  //Get books for homepage
  router.get('/', asyncHandler(async (req, res) => {
    try {
      const currentPage = 
        req.query.page && Number(req.query.page) > 0 ? Number(req.query.page) : 0;
      const offset = currentPage * 10;
      const prevPage = currentPage - 1 >= 0 ? currentPage - 1 : 0;
      const nextPage = currentPage + 1;
    const {count, rows} = await Book.findAndCountAll({ 
      order: [['createdAt', 'DESC']],
      offset: offset,
      limit: 10
    });
    const totalPages = count / 10;
    const page = {
      prevPage,
      currentPage,
      nextPage,
      totalPages
    };
    res.render('index', { 
      books: rows,
      title: "Books",
      page,
     });
    } catch (error) {
      throw error
    }
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

    //Handles search
    router.get('/search', async (req, res) => {
      let { term } = req.query;
      term = term.toLowerCase();
      try {
      const results = await Book.findAll({
        order: [['createdAt', 'DESC']],
        where: {
          [Op.or]:[
          {title: { [Op.like]: '%' + term + '%'}},
          {author: { [Op.like]: '%'+ term + '%'}},
          {genre: { [Op.like]: '%' + term + '%'}},
          {year: { [Op.like]: '%' + term + '%'}}
          ]
        }
      });
      res.render('search', {
        books: results,
        title: "Search Results"
      })
    } catch (error) {
      throw error
    }
  })

  //show book detail form
  router.get('/:id', asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render('update-book', { book, title: 'Update Book'});
    } else {
        next(createError(404, 'That book does not exist.'))
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
            next(createError(404, "That book does not exist. Please try again."));
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
  router.post('/:id/delete', asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
       await book.destroy();
       res.redirect('/books/');
    } else {
        next(createError(404, 'That book does not exist'));
    }
  }));

  //Error handler
  router.get('/error', (req, res, next) => {
    const err = new Error();
    err.message = `Server Error`;
    err.status = 500;
    throw err;
  });

  module.exports = router;