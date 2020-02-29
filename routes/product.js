const { Router } = require('express');
const router = Router();

const { getProducts } = require('../controllers/product.controller');


router.route('/:key')
    .get(getProducts);



module.exports = router;