var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var colors = require('colors');
var uuid = require('uuid')
var _ = require('lodash')
var requireDirectory = require('require-directory');

global.app = express(); //accessible from all over app
app.config = requireDirectory(module, './../config');

app.set("name", app.config.app.name)
var boot = require('./boot/index')
app.components = boot.components
//routes
_.each(boot.routes, (route) => {
  app.use(route.for, route);
})

app.emit("booted");
//include services
app.on('assignedId', () => {
  app.log.debug("Loading Services")
  if (app.id === 0) {
    require('./service-single/index')
    app.emit("servicesSingleLoaded")
  }
  require('./service-multi/index')
  app.emit("servicesMultipleLoaded")
  //all services are loaded
  app.emit("servicesLoaded")
})
//logger
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: app.name});
log.level(app.config.app.logLevel)
app.log = log;
app.use(function(req, res, next) {
  req.log = log.child({reqId: uuid()});
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, '../public')));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development'
    ? err
    : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
