const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors')
const exphbs  = require('express-handlebars');
var qua = '';
//settings
app.use(express.urlencoded({extended: true}));
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  extname: '.hbs'
}));
app.set('view engine', '.hbs');
app.use(express.static('views/assets')); 
app.use(cors())

//middlerwares

//routes
app.use('/api/products', require('./routes/product'));
app.use('/', require('./routes/index'))

//public 
app.use(express.static(path.join(__dirname, 'public')));


module.exports = app;