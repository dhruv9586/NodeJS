// AuthController.js
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// module requires
const fs = require('fs');
const request = require('request');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Jimp = require("jimp");

// javascripts files
const User = require('./User');
const config = require('../config');

// Routes
// Get validated User
router.get('/me', (req, res, next)=>{
    let token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, config.secret, (err, decoded)=> {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      
    User.findById(decoded.id,{password:0},  (err, user)=> {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        next(user);
      });
    });
  });

// Register a user
router.post('/register', (req, res)=> {
    let hashedPassword = bcrypt.hashSync(req.body.password, 8);
    
    // Create a User
    User.create({
      name : req.body.name,
      email : req.body.email,
      password : hashedPassword
    },
     (err, user)=> {
      if (err) return res.status(500).send("There was a problem registering the user.")
      // create a token
      let token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours || You can mention in Seconds.
      });
      res.status(200).send({ auth: true, token: token });
    }); 
  });

// user login
router.post('/login', (req, res)=> {
    User.findOne({ name: req.body.name },  (err, user)=> {
      if (err) return res.status(500).send('Error on the server.');
      if (!user) return res.status(404).send('No user found.');
      let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
      let token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 
      });
      res.status(200).send({ auth: true, token: token });
    });
});


  router.get('/logout', (req, res)=> {
    res.status(200).send({ auth: false, token: null });
  });

  

router.post('/download',function(req, res){
    Jimp.read(req.body.url, function(err,img){
        if (err){
            res.status(500).send('Error while getting image on  the server.');
        }
        img.resize(50, 50).write('gogle.png'); // You can mentioned File Name in body also.
        res.status(200).send({ message:"dowloaded into your main Directory" });
    });
});


// Middleware 
router.use(function (user, req, res, next) {
    res.status(200).send(user);
});
  
  module.exports = router;