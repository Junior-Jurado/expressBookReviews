const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let regd_users = require("./auth_users.js").authenticated;
const public_users = express.Router();

const doesExist = (user) =>{
    let userWithSameName = users.filter((usr) => {
        return usr.user === user
    });
    if (userWithSameName.length > 0){
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const user = req.body.user;
    const password = req.body.password;

    if (user && password) {
        if (!doesExist(user)) {
            users.push({"user":user, "password":password});
            return res.status(200).json({message: "User successfully registred. Now you can login"});
        } else {
            return res.status(404).json({message:"User already exists!"});
        }
    }
    return res.status(404).json({message: "Unable to register user."})
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books,null,4));
});



// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.send(books[isbn]);
 });

 public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    
    try {
      const bookDetails = await getBookDetailsByISBN(isbn);
      res.json(bookDetails);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching book details' });
    }
  });
  
  const getBookDetailsByISBN = (isbn) => {
    return axios.get(`https://germanejurad-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/isbn/${isbn}`)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        throw new Error('Error fetching book details');
      });
  };

  







  
 public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const booksByAuthor = [];
  
    for (const isbn in books) {
      if (books.hasOwnProperty(isbn)) {
        const book = books[isbn];
        if (book.author === author) {
          booksByAuthor.push(book);
        }
      }
    }
    if (booksByAuthor.length > 0) {
      return res.json(booksByAuthor);
    } else {
      return res.status(404).json({ message: "No books found for the provided author" });
    }
  });

  // Function to retrieve book details by Author using async-await with Axios
const getBookDetailsByAuthor = async (author) => {
    try {
        // Replace the URL with the correct API endpoint for fetching books by author
        const response = await axios.get(`https://germanejurad-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/author/${author}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching book details by author');
    }
};

// Modified route using async-await with Axios to get books by author
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const booksByAuthor = await getBookDetailsByAuthor(author);
        
        if (booksByAuthor.length > 0) {
            return res.json(booksByAuthor);
        } else {
            return res.status(404).json({ message: "No books found for the provided author" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books by author" });
    }
});






  
  

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const booksByTitle = [];
  
    for (const isbn in books) {
      if (books.hasOwnProperty(isbn)) {
        const book = books[isbn];
        if (book.title.toLowerCase() === title.toLowerCase()) {
          booksByTitle.push(book);
        }
      }
    }
  
    if (booksByTitle.length > 0) {
      return res.json(booksByTitle);
    } else {
      return res.status(404).json({ message: "No books found for the provided title" });
    }
  });
  



// Function to retrieve book details by Title using async-await with Axios
const getBookDetailsByTitle = async (title) => {
    try {
        // Replace the URL with the correct API endpoint for fetching books by title
        const response = await axios.get(`https://germanejurad-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/title/${title}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching book details by title');
    }
};

// Modified route using async-await with Axios to get books by title
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const booksByTitle = await getBookDetailsByTitle(title);
        
        if (booksByTitle.length > 0) {
            return res.json(booksByTitle);
        } else {
            return res.status(404).json({ message: "No books found for the provided title" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books by title" });
    }
});












//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
  
    if (books[isbn] && books[isbn].reviews && books[isbn].reviews.length > 0) {
      return res.json(books[isbn].reviews);
    } else {
      return res.status(404).json({ message: "No reviews found for the provided ISBN" });
    }
  });  

// Eliminar una reseña del libro
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.user;
  
    if (!username) {
      return res.status(401).json({ message: "Usuario no ha iniciado sesión." });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Libro no encontrado." });
    }
  
    if (!Array.isArray(books[isbn].reviews)) {
      return res.status(400).json({ message: "El libro no tiene reseñas." });
    }
  
    const filteredReviews = books[isbn].reviews.filter(
      (review) => review.username === username
    );
  
    if (filteredReviews.length === 0) {
      return res.status(404).json({
        message: "No se encontraron reseñas para eliminar con el usuario actual.",
      });
    }
  
    // Eliminar las reseñas del usuario actual para el ISBN dado
    books[isbn].reviews = books[isbn].reviews.filter(
      (review) => review.username !== username
    );
  
    return res.status(200).json({
      message: `Reseñas eliminadas para el ISBN ${isbn} y el usuario ${username}.`,
    });
  });
  




public_users.post('/customer/auth/review/:isbn', function(req, res) {
const isbn = req.params.isbn;
const review = req.body.review;
const username = req.session.authorization.user;

if (!username) {
    return res.status(401).json({ message: "User not logged in." });
}

if (!review) {
    return res.status(400).json({ message: "Review content is required." });
}

if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
}

// Verifica si el libro tiene un array de reseñas, si no, inicialízalo como un array vacío
if (!Array.isArray(books[isbn].reviews)) {
    books[isbn].reviews = [];
}

// Busca la reseña del usuario para este libro
let userReview = books[isbn].reviews.find((userReview) => userReview.username === username);

if (userReview) {
    // Si el usuario ya revisó el libro, actualiza la reseña
    userReview.review = review;
    return res.status(200).json({ message: "Review updated successfully." });
} else {
    // Si el usuario está agregando una nueva reseña
    books[isbn].reviews.push({ username, review });
    return res.status(201).json({ message: "Review added successfully." });
}
});



const axios = require('axios');

const getBookList = () => {
  return new Promise((resolve, reject) => {
    axios.get('https://germanejurad-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/')
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject('Error fetching book list');
      });
  });
};

getBookList()
  .then(bookList => {
    console.log(bookList);
  })
  .catch(error => {
    console.error(error);
  });


 
module.exports.general = public_users;
