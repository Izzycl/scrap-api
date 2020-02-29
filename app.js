const express = require('express');
const app = express();

//settings
app.set('port', process.env.PORT || 4000);


//middlerwares
app.use(express.json());


//routes
app.use('/api/products', require('./routes/product'));





module.exports = app;