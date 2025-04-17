// models/book.js
'use strict';
const mongoose = require('mongoose');

// Define the schema for a book
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] }, // Array of strings, default empty
  commentcount: { type: Number, default: 0 } // Number, default 0
});

// Create the model from the schema
const Book = mongoose.model('Book', bookSchema);

// Export the model to be used in other files
module.exports = Book;