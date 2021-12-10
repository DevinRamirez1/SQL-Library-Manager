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
      title: "Books",
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
    const pages = Math.ceil(count / 10);
    console.log(activePage);
    res.render('index', {
      books: rows,
      title: "Books",
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
        res.sendStatus(404, "That book does not exist. Please try again.");
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
            res.sendStatus(404, "That book does not exist. Please try again.");
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
        res.sendStatus(404, "That book does not exist. Please try again.");
    }
  }));

  //Handles search
  router.get('/search', asyncHandler(async (req, res) => {
    const searchQuery = req.search.body;
    const searchResults = await Book.findAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: '%' + searchQuery + '%',
            },
          },
          {
            author: {
              [Op.like]: '%' + searchQuery + '%',
            },
          },
          {
            genre: {
              [Op.like]: '%' + searchQuery + '%',
            },
          },
          {
            year: {
              [Op.like]: '%' + searchQuery + '%',
            },
          },
        ],
      },
    });
    let title;
    if (searchResults.length < 1) {
      title = 'No Results, Please Try Again.';
    } else {
      title = 'Search Results: ${searchResults.length}';
    }
    res.render('index', { searchResults, title:title})
  }))

  module.exports = router;