const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.user; // Obtener el nombre de usuario de la sesión
    
    if (!username) {
      return res.status(401).json({ message: "User not logged in." });
    }
    
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found." });
    }
  
    if (!Array.isArray(books[isbn].reviews)) {
      return res.status(404).json({ message: "No reviews found for the provided ISBN." });
    }
  
    const userReviewIndex = books[isbn].reviews.findIndex((userReview) => userReview.username === username);
    
    if (userReviewIndex === -1) {
      return res.status(404).json({ message: "Review not found for the provided ISBN and user." });
    }
  
    // Eliminar la reseña correspondiente al usuario y ISBN
    books[isbn].reviews.splice(userReviewIndex, 1);
    return res.status(200).json({ message: "Review deleted successfully." });
  });
  
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
  

