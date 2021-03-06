const createError = require('http-errors');
const express = require('express');
const path = require('path');
const app = express();

const metrics = require('./metrics/index');
metrics.start(app);

app.use(express.static(path.join(__dirname, 'www')));
app.use('/dashboard',express.static(path.join(__dirname, 'www')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;