const express = require('express');
const app = express();
const db = require('./db');

const UserController = require('./user/UserController');

app.use('/api/user', UserController);

module.exports = app;