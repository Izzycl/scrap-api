const express = require('express');
const path = require('path');
const app = express();
const exphbs  = require('express-handlebars');

//settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs'
}));
app.set('view engine', '.hbs');

app.use(express.static('views/assets')); 
//middlerwares
app.use(express.json());


//routes
app.use('/api/products', require('./routes/product'));
app.use('/products', require('./routes/index'))

//public 
app.use(express.static(path.join(__dirname, 'public')));


module.exports = app;