const { Router } = require('express');
const router = Router();

const { getProducts } = require('../controllers/product.controller');


router.route('/')
    .get(getProducts);



module.exports = router;