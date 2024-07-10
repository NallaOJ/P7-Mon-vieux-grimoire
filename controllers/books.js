const Book = require('../models/book');
const fs = require('fs');


//***LOGIQUE METIER***//


//CREATION NOUVEAU LIVRE
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


//RECUPERATION DES 3 LIVRES LES MIEUX NOTES
exports.getBestRating = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => { res.status(400).json( { error })})
}


//RENVOIE DE TOUS LES LIVRES
exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
  };



  //RENVOIE LIVRE SELON L'ID FOURNI
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
  };




//CREATION D'UNE NOUVELLE NOTE
exports.postRating = (req, res, next) => {
    const { rating } = req.body;
    
    // Vérification que la note est entre 0 et 5
    if (rating < 0 || rating > 5) {
        return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' });
    }

    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                return res.status(404).json({ error });
            }

            // Vérification si l'utilisateur a déjà noté le livre
            const existingRating = book.ratings.find(rating => rating.userId === req.auth.userId);
            if (existingRating) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            // Ajout de la nouvelle note
            const newRating = {
                userId: req.auth.userId,
                grade: rating
            };
            book.ratings.push(newRating);

            // Calcul nouvelle moyenne de note
            const totalRatings = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
            book.averageRating = totalRatings / book.ratings.length;

           
            book.save()
                .then(updatedBook => res.status(201).json(updatedBook))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};




//MISE A JOUR DU LIVRE
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    } : { ...req.body };
  
    delete bookObject._userId;
  
    Book.findOne({ _id: req.params.id })
      .then((book) => {
        if (book.userId != req.auth.userId) { //vérifie si le userID actuel et le userID du livre est différent
          return res.status(401).json({ message: '403: unauthorized request' });
        }
  
        if (req.file) {
          // Supprime l'ancienne image
          const oldFilename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${oldFilename}`, (err) => {
            if (err) {
              console.error(`Failed to delete old image: ${err.message}`);
            }
  
            // Met à jour le livre avec la nouvelle image
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
              .then(() => res.status(200).json({ message: 'Livre modifié!' }))
              .catch((error) => res.status(401).json({ error }));
          });
        } else {
          // Met à jour le livre sans changer l'image
          Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Livre modifié!' }))
            .catch((error) => res.status(401).json({ error }));
        }
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  };




//SUPPRESSION DU LIVRE
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