'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {}
  Book.init({
    title: { 
      type:DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Title cannot be empty."
        },
      },
    },
    author: {
      type:DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Author cannot be empty."
        },
      },
    },
    genre: DataTypes.STRING,
    year: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};