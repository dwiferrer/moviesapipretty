const express = require("express");
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
const { connection: movies } = mongoose;
//const cors = require("./cors");
const authenticate = require("../authenticate")
const movieRouter = express.Router();


//const jwtAuthz = require('express-jwt-authz');

// var jwt = require('express-jwt');
// var jwks = require('jwks-rsa');

// var jwtCheck = jwt({
//   secret: jwks.expressJwtSecret({
//       cache: true,
//       rateLimit: true,
//       jwksRequestsPerMinute: 5,
//       jwksUri: 'https://dwightferrer.auth0.com/.well-known/jwks.json'
// }),
// aud: 'https://test/api',
// issuer: 'https://dwightferrer.auth0.com/',
// algorithms: ['RS256']
// });

//GET MOVIES with proper link
movieRouter.get("/movies", authenticate.jwtCheck, async(req,res,next) => {
  try {
    var page = parseInt(req.query.page)
    var size = parseInt(req.query.size)

    if (req.query.sort === "title") {
      const movie =  await movies.db
      .collection("movieDetails")
      .find({})
      .sort( { title: 1 } ) 
      .skip((page * size) - size)
      .limit(size)
      .toArray();

      movie.forEach((item) => {
        if (item.poster!=null)
          item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
        })

      const moviecount = await movies.db
      .collection("movieDetails")
      .find({})
      .count()

      res.json({movie: movie, count: moviecount})
    } else if (req.query.sort === "year") {
      const movie =  await movies.db
      .collection("movieDetails")
      .find({})
      .sort( { year: -1 } ) 
      .skip((page * size) - size)
      .limit(size)
      .toArray();

      movie.forEach((item) => {
        if (item.poster!=null)
          item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
      })

      const moviecount = await movies.db
      .collection("movieDetails")
      .find({})
      .count()

      res.json({movie: movie, count: moviecount})
  } else {
      const movie =  await movies.db
      .collection("movieDetails")
      .find({})
      .sort( { "tomato.rating": -1 } ) 
      .skip((page * size) - size)
      .limit(size)
      .toArray();

      movie.forEach((item) => {
        if (item.poster!=null)
          item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
      })

      const moviecount = await movies.db
      .collection("movieDetails")
      .find({})
      .count()

      res.json({movie: movie, count: moviecount})
  }
  } catch (err){
    console.log(err)
  }       
});

// HOME
movieRouter.get("/home", authenticate.jwtCheck, async(req,res,next) => {
  try{
    if (req.query.size!=null){
      var page = parseInt(req.query.page)
      var size = parseInt(req.query.size)
      const movie =  await movies.db
      .collection("movieDetails")
      .find({})
      .sort( { "tomato.rating": -1 } ) 
      .skip((page * size) - size)
      .limit(size)
      .toArray();

      movie.forEach((item) => {
        if (item.poster!=null)
          item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
        })

      const moviecount = await movies.db
      .collection("movieDetails")
      .find({})
      .count()

      res.json({movie: movie, count: moviecount})  
    } else {
      const moviecount = await movies.db
      .collection("movieDetails")
      .find({})
      .count()

      res.json({count: moviecount})  
     }
  } catch (err){
    console.log(err)
  }     
});

// GET MOVIE ID
movieRouter.get("/movies/:id", authenticate.jwtCheck, async(req,res,next) => {
  try {
    const movie = await movies.db
    .collection("movieDetails")
    .findOne({ _id: new ObjectId(req.params.id) })      
    
    if (movie.poster != null){
      movie.poster = movie.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
    }

    res.json(movie)
  } catch (err){
    console.log(err)
  } 
});

// GET MOVIE ID COUNTRIES
movieRouter.get("/movies/:id/countries", authenticate.jwtCheck, async(req,res,next) => {
  try {
    const movie = await movies.db
    .collection("movieDetails")
    .findOne({ _id: new ObjectId(req.params.id) }, 
      { projection: { _id: 0, countries: 1 }})

    res.json(movie)
  } catch (err){
    console.log(err)
  } 
}); 

// GET MOVIE ID WRITERS
movieRouter.get("/movies/:id/writers", authenticate.jwtCheck, async(req,res,next) => {
  try {
    const movie = await movies.db
    .collection("movieDetails")
    .findOne({ _id: new ObjectId(req.params.id) }, 
      { projection: { _id: 0, writers: 1 }})

    res.json(movie)
  } catch (err){
    console.log(err)
  } 
}); 

// GET WRITERS
movieRouter.get("/writers", authenticate.jwtCheck, async(req,res,next) => {
  try {
    console.log(req.query.name)
    const movie = await movies.db
    .collection("movieDetails")
    .find({ writers: new RegExp(req.query.name, "i") }, 
      { projection: { _id: 0, title:1, writers: 1 }})
    .toArray()

    res.json(movie)
  } catch (err){
    console.log(err)
  } 
});

 // UPDATE 
movieRouter.get("/update/:id", authenticate.jwtCheck, async(req, res ,next) => {
  try {
    const movie = await movies.db
    .collection("movieDetails")
    .findOne({ _id: new ObjectId(req.params.id) })

    if (movie.poster != null){
      movie.poster = movie.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
    }

    res.json(movie)
  } catch (err){
    console.log(err)
  } 
})
.post("/update/:id", authenticate.jwtCheck, async(req, res ,next) => {
  try {
    const movie = await movies.db
    .collection("movieDetails")
    .findOneAndUpdate({ _id: new ObjectId(req.params.id) },
      {$set: req.body})
   
    res.json({update: "success"})
  } catch (err){
    console.log(err)
  } 
});

// SEARCH
movieRouter.get("/search", authenticate.jwtCheck, async(req, res, next) => {
  try{
    var page = parseInt(req.query.page)
    var size = parseInt(req.query.size)
    if (req.query.all) {
      console.log(req.query.all)
      const movie = await movies.db
      .collection("movieDetails")
      .find({ $or: [ {title: new RegExp(req.query.all, "i")}, 
        {actors: new RegExp(req.query.all, "i")}, 
        {plot: new RegExp(req.query.all, "i")} ] })
      .sort( { "year": -1 } ) 
      .skip((page * size) - size)
      .limit(size)  
      .toArray();

      movie.forEach((item) => {
        if (item.poster!=null)
          item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
      })

      res.json({movie: movie, count: movie.length})
    } else if (req.query.title){
      console.log(req.query.title)
      const movie = await movies.db
      .collection("movieDetails")
      .find({ title: new RegExp(req.query.title, "i") })
      .sort( { "year": -1 } )
      .skip((page * size) - size)
      .limit(size)  
      .toArray();

      movie.forEach((item) => {
        if (item.poster!=null)
          item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
      })

      res.json({movie: movie, count: movie.length})
    } else if (req.query.actors){
      console.log(req.query.actors)
      const movie = await movies.db
      .collection("movieDetails")
      .find({ actors: new RegExp(req.query.actors, "i") })
      .sort( { "year": -1 } )
      .skip((page * size) - size)
      .limit(size)  
      .toArray();

      movie.forEach((item) => {
        if (item.poster!=null)
        item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
      })

      res.json({movie: movie, count: movie.length})
    } else if (req.query.plot){
      console.log(req.query.plot)
      const movie = await movies.db
      .collection("movieDetails")
      .find({ plot: new RegExp(req.query.plot, "i") })
      .sort( { "year": -1 } )
      .skip((page * size) - size)
      .limit(size)  
      .toArray();

      movie.forEach((item) => {
        if (item.poster!=null)
          item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
      })

      res.json({movie: movie, count: movie.length}) 
    }
  } catch (err){
    console.log(err)
  }  
});     

 //DELETE 
movieRouter.delete("/delete/:id", authenticate.jwtCheck, async(req,res,next) => {
  try {
    const movie = await movies.db
    .collection("movieDetails")
    .findOneAndDelete({ _id: new ObjectId(req.params.id) })
    
    res.json({deletion: "success" })
  } catch (err){
    console.log(err)
  } 
});

module.exports = movieRouter; 