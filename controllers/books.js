const Book = require('../models/book');
const fs = require('fs');


//*$*Logique métier**$//


//Création de nouveau livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
  .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};


//Récupération des 3 livres les mieux notés
exports.getBestRating = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => { res.status(400).json( { error })})
}


//Renvoie tout les livres 
exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
  };



  //Renvoie le livre selon l'_id fourni
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
  };




// Définition de la note pour le user ID fourni
exports.postRating = (req, res, next) => {
    const { userId, rating } = req.body;
    
    // Vérification que la note est entre 0 et 5
    if (rating < 0 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 0 and 5.' });
    }

    Book.findById(req.params.id)
    .then(book => {
        if (!book) {
            return res.status(404).json({ error: 'Book not found.' });
        }

        // Vérification de si l'utilisateur a déjà noté le livre
        const existingRating = book.ratings.find(r => r.userId === userId);
        if (existingRating) {
            return res.status(400).json({ error: 'User has already rated this book.' });
        }

        // Ajout nouvelle note
        book.ratings.push({ userId, rating });

        // Calcule nouvelle moyenne des notes
        const totalRatings = book.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        book.averageRating = totalRatings / book.ratings.length;

        // Sauvegarde du livre avec les nouvelles informations de notation
        book.save()
        .then(updatedBook => res.status(200).json(updatedBook))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};




//Mis à jour du livre selon l'_id fourni 
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message : '403: unauthorized request'});
          } else {
              Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id })
              .then(() => res.status(200).json({ message : 'Livre modifié!' }))
              .catch((error) => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};




//Suppression du livre selon l'_id fourni ainsi que l'image associée
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
  .then(book => {
      if (book.userId != req.auth.userId) {
          res.status(401).json({message: 'Not authorized'});
      } else {
          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
              Book.deleteOne({ _id: req.params.id })
                  .then(() => { res.status(200).json({ message: 'Livre supprimé !'})})
                  .catch(error => res.status(401).json({ error }));
          });
      }
  })
  .catch( error => {
      res.status(500).json({ error });
  });
};