/*
*
* Complete the API routing below
*
*/
'use strict';
const mongoose = require('mongoose');
const Book = require('../models/book'); // Adjust path if necessary

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const books = await Book.find({}, 'title _id commentcount'); // Project only necessary fields
        if (!books) {
          res.json([]); // Return empty array if no books
        } else {
          res.json(books);
        }
      } catch (err) {
        console.error(err);
        res.status(500).send('Database query error');
      }
    })

    .post(async function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        return res.send('missing required field title');
      }
      const newBook = new Book({
        title: title,
        comments: [], // Initialize comments array
        commentcount: 0 // Initialize commentcount
      });
      try {
        const savedBook = await newBook.save();
        res.json({ _id: savedBook._id, title: savedBook.title });
      } catch (err) {
         console.error(err);
         res.status(500).send('Could not save book');
      }
    })

    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
      try {
        const result = await Book.deleteMany({});
        // Check if deletion was acknowledged, even if 0 documents were deleted
        if (result.acknowledged) {
            res.send('complete delete successful');
        } else {
             // This case might indicate a deeper issue with the command execution
             throw new Error('Delete operation not acknowledged');
        }
      } catch (err) {
        console.error(err);
        res.status(500).send('Could not delete books');
      }
    });


  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      // Validate if bookid is a valid MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
          return res.send('no book exists'); // Treat invalid ID format as non-existent
      }
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          res.send('no book exists');
        } else {
          res.json({
            _id: book._id,
            title: book.title,
            comments: book.comments
          });
        }
      } catch (err) {
        console.error(err);
        res.send('no book exists'); // Treat DB errors also as non-existent for this test
      }
    })

    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;

      // Validate if bookid is a valid MongoDB ObjectId format
       if (!mongoose.Types.ObjectId.isValid(bookid)) {
          return res.send('no book exists');
      }

      //json res format same as .get
      if (!comment) {
        return res.send('missing required field comment');
      }

      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        book.comments.push(comment);
        book.commentcount = book.comments.length; // Update comment count
        const updatedBook = await book.save();
        res.json({
          _id: updatedBook._id,
          title: updatedBook.title,
          comments: updatedBook.comments
        });
      } catch (err) {
        console.error(err);
        res.send('no book exists'); // Treat DB errors also as non-existent
      }
    })

    .delete(async function(req, res){
      let bookid = req.params.id;

      // Validate if bookid is a valid MongoDB ObjectId format
       if (!mongoose.Types.ObjectId.isValid(bookid)) {
          return res.send('no book exists');
      }

      //if successful response will be 'delete successful'
      try {
        const deletedBook = await Book.findByIdAndDelete(bookid);
        if (!deletedBook) {
          res.send('no book exists');
        } else {
          res.send('delete successful');
        }
      } catch (err) {
        console.error(err);
        res.send('no book exists'); // Treat DB errors also as non-existent
      }
    });

};