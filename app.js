'use strict';

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const indexRouter = require('./routes/index');
const auth = require('./routes/auth');
const categories = require('./routes/categories');
const accounts = require('./routes/accounts');
const records = require('./routes/records');

const app = express();

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/miwalletdb', {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE
});

// midelwares

app.use(cors({
  credentials: true,
  origin: ['http://localhost:4200']
}));

// session setup
app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  }),
  secret: 'some-string',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/categories', categories);
app.use('/auth', auth);
app.use('/accounts', accounts);
app.use('/records', records);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({ code: 'not-found' });
});

app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500).json({ code: 'unexpected' });
  }
});

module.exports = app;