/*
*
* FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
* -----[Keep the tests in the same order!]-----
*
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server'); // Ensure this points to your running server instance
const mongoose = require('mongoose');

chai.use(chaiHttp);

// Use a variable to store the ID of the book created in the first POST test
let testBookId;
// Use a different variable for the book to be deleted
let bookIdToDelete;


suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  // test('#example Test GET /api/books', function(done){
  //    chai.request(server)
  //     .get('/api/books')
  //     .end(function(err, res){
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, 'response should be an array');
  //       assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
  //       assert.property(res.body[0], 'title', 'Books in array should contain title');
  //       assert.property(res.body[0], '_id', 'Books in array should contain _id');
  //       done();
  //     });
  // });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {

      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .keepOpen() // Keep connection open for subsequent tests if needed
          .post('/api/books')
          .send({ title: 'Test Book Title' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Book should contain _id');
            assert.property(res.body, 'title', 'Book should contain title');
            assert.equal(res.body.title, 'Test Book Title');
            testBookId = res.body._id; // Save the id for later tests
            bookIdToDelete = res.body._id; // Also mark this one for deletion test later
            done();
          });
      });

      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .keepOpen()
          .post('/api/books')
          .send({}) // Send empty body or without title field
          .end(function(err, res){
            assert.equal(res.status, 200); // Requirement implies 200 status even for this error
            assert.isString(res.text); // Response is plain text
            assert.equal(res.text, 'missing required field title');
            done();
          });
      });

    });


    suite('GET /api/books => array of books', function(){

      test('Test GET /api/books',  function(done){
        chai.request(server)
          .keepOpen()
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            // Check if the array is not empty (assuming the previous POST succeeded)
            if (res.body.length > 0) {
               assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
               assert.property(res.body[0], 'title', 'Books in array should contain title');
               assert.property(res.body[0], '_id', 'Books in array should contain _id');
            } else {
              // Handle case where DB might be empty if tests run independently or POST failed
              console.log("GET /api/books returned empty array, might be expected if DB is clean.")
            }
            done();
          });
      });

    });


    suite('GET /api/books/[id] => book object with [id]', function(){

      test('Test GET /api/books/[id] with id not in db',  function(done){
         // Use a valid format but non-existent ID
         const invalidId = new mongoose.Types.ObjectId();
         chai.request(server)
          .keepOpen()
          .get('/api/books/' + invalidId)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isString(res.text);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db',  function(done){
         chai.request(server)
          .keepOpen()
          .get('/api/books/' + testBookId) // Use the ID saved from POST test
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Book should contain _id');
            assert.property(res.body, 'title', 'Book should contain title');
            assert.property(res.body, 'comments', 'Book should contain comments');
            assert.isArray(res.body.comments, 'Comments should be an array');
            assert.equal(res.body._id, testBookId);
            done();
          });
      });

    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){

      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .keepOpen()
          .post('/api/books/' + testBookId)
          .send({ comment: 'Test Comment' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Book should contain _id');
            assert.property(res.body, 'title', 'Book should contain title');
            assert.property(res.body, 'comments', 'Book should contain comments');
            assert.isArray(res.body.comments, 'Comments should be an array');
            assert.include(res.body.comments, 'Test Comment', 'Comments array should include the new comment');
            assert.equal(res.body._id, testBookId);
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
          .keepOpen()
          .post('/api/books/' + testBookId)
          .send({}) // Send empty body or without comment field
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isString(res.text);
            assert.equal(res.text, 'missing required field comment');
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        const invalidId = new mongoose.Types.ObjectId();
        chai.request(server)
          .keepOpen()
          .post('/api/books/' + invalidId)
          .send({ comment: 'Comment for non-existent book' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isString(res.text);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
          .keepOpen()
          .delete('/api/books/' + bookIdToDelete) // Use the specific ID marked for deletion
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isString(res.text);
            assert.equal(res.text, 'delete successful');
            done();
          });
      });

      test('Test DELETE /api/books/[id] with id not in db', function(done){
         const invalidId = new mongoose.Types.ObjectId();
         chai.request(server)
          .keepOpen()
          .delete('/api/books/' + invalidId)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isString(res.text);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

    });
    // No explicit test for DELETE /api/books in the provided skeleton
    // but the route handler is implemented in api.js

  });

});