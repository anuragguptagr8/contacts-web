'use strict';

/**
 * Contacts WEB Application script
 */

/* Globals */
var express = require('express'),
  path = require('path'),
  app = express();
var port = process.env.PORT || 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
/**
 * Configuring root path
 */
app.get('/', function(req, res) {
  res.render('index', {
    title : 'Contacts Web Dashboard'
  });
});
// start the application
app.listen(port);
console.log('Express server listening on ' + port);