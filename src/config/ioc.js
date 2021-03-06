const dotenv = require('dotenv-safe');
const express = require('express');
const winston = require('winston');
const expressWinston = require('express-winston');
const methodOverride = require('method-override');
const cors = require('cors');
const compression = require('compression');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const pg = require('pg');
const jsonwebtoken = require('jsonwebtoken');
const expressValidator = require('express-validator');
const axios = require('axios');
const errors = require('./errors');
Promise = require('bluebird');

dotenv.config();

const app = require('../config/app');
const database = require('../config/database')({
  pg,
  connectionString: process.env.DATABASE_URL
});

// middleware
const jwtValidation = require('../api/middleware/jwt-validation')({
  jsonwebtoken,
  secret: process.env.SECRET
});
const logger = require('../api/middleware/logger')({
  expressWinston,
  winston
});
const validator = require('../api/middleware/validator')({
  expressValidator
});
const errorHandler = require('../api/middleware/error-handler')();

// model
const userModel = require('../api/model/user.model')({
  pool: database,
  errors
});
const productModel = require('../api/model/product.model')({
  request: axios,
  errors
});
const wishlistModel = require('../api/model/wishlist.model')({
  pool: database,
  errors
});

// controller
const IndexController = require('../api/controller/index.controller');
const indexController = new IndexController();

const authController = require('../api/controller/auth.controller')({
  models: { user: userModel },
  utils: { jsonwebtoken }
});

const userController = require('../api/controller/user.controller')({
  models: { user: userModel }
});
const wishlistController = require('../api/controller/wishlist.controller')({
  models: {
    wishlist: wishlistModel,
    product: productModel
  }
});

// route
const IndexRouter = require('../api/route/index.router');

const authRoute = require('../api/route/auth.route')({
  route: express.Router({ strict: true }),
  controller: authController,
  middlewares: { validator }
});
const userRoute = require('../api/route/user.route')({
  route: express.Router({ strict: true }),
  controller: userController,
  middlewares: { validator }
});
const wishlistRoute = require('../api/route/wishlist.route')({
  route: express.Router({ strict: true }),
  controller: wishlistController,
  middlewares: { validator }
});

const config = {
  app: express(),
  middlewares: {
    methodOverride,
    cors,
    compression,
    bodyParser,
    helmet,
    jwtValidation,
    logger,
    errorHandler
  },
  resources: {
    index: new IndexRouter(indexController),
    auth: authRoute,
    user: userRoute,
    wishlist: wishlistRoute
  }
};

module.exports = app(config);
