const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { upload, resizeImage }= require('../middleware/multer-config');


const booksCtrl = require('../controllers/books');




//***LOGIQUE DES ROUTES***//

router.get('/', booksCtrl.getAllBooks);
router.get('/bestrating', booksCtrl.getBestRating);
router.post('/', auth, upload, resizeImage, booksCtrl.createBook);
router.get('/:id', booksCtrl.getOneBook);
router.post('/:id/rating', auth, booksCtrl.postRating);
router.put('/:id', auth, upload, resizeImage, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);


module.exports = router;