const express = require("express");
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
const { connection: movies } = mongoose;
//const cors = require("./cors");
const authenticate = require("../authenticate")
const movieRouter = express.Router();

//const Favorites = require("../models/favorites");

// HOME
movieRouter.get("/home", authenticate.jwtCheck, (req,res,next) => {
  movies.db
  .collection("favorites")
  .find({})
  .toArray()
  .then( async result =>{
    let userList = []
    result.forEach((user) => {
      userList.push(user.user)
    })
  if (!userList.includes(req.user.sub)){
    movies.db
    .collection("favorites")
    .insert({user: req.user.sub, faveMovies: []})
  }
  const movie =  await movies.db
  .collection("movieDetails")
  .find({})
  .sort( { "tomato.rating": -1 } )
  .limit(1)
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
  })
});

// ADD DELETE FAVE
movieRouter.post("/favorites/:id", authenticate.jwtCheck, async(req,res,next) => {
  const fave = await movies.db
  .collection("favorites")
  .findOneAndUpdate({user: req.user.sub}, { $push: { faveMovies: req.params.id}})
  res.json({update: "success"})
})
.delete("/favorites/:id", authenticate.jwtCheck, async(req,res,next) => {
  const fave = await movies.db
  .collection("favorites")
  .findOneAndUpdate({user: req.user.sub}, { $pull: { faveMovies: req.params.id}})
  res.json({delete: "success"})
})

// FAVE LIST
movieRouter.get("/favorites", authenticate.jwtCheck, async(req,res,next) => {
  const fave = await movies.db
  .collection("favorites")
  .find({ user: req.user.sub })
  .sort( { title: 1 } )
  .toArray()
  res.json(fave);
});

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

      const movieCount = await movies.db
      .collection("movieDetails")
      .find({})
      .count()

      res.json({movie: movie, count: movieCount})
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
  } else if (req.query.country){
      const movie =  await movies.db
      .collection("movieDetails")
      .find({ countries: req.query.country })
      .sort( { title: 1 } ) 
      .skip((page * size) - size)
      .limit(size)
      .toArray();

      const movieCount = await movies.db
      .collection("movieDetails")
      .find({ countries: req.query.country })
      .count()

      movie.forEach((item) => {
        if (item.poster!=null)
          item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
      })

      res.json({movie: movie, count: movieCount})
  } else {
      const movie =  await movies.db
      .collection("movieDetails")
      .find({})
      .sort( { "tomato.rating": -1 } ) 
      .skip((page * size) - size)
      .limit(size)
      .toArray();

      const movieCount = await movies.db
      .collection("movieDetails")
      .find({})
      .count()

      movie.forEach((item) => {
        if (item.poster!=null)
          item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
      })

      res.json({movie: movie, count: movieCount})
  }
  } catch (err){
    console.log(err)
  }       
});

// // HOME WITHOUT FAVORITES
// movieRouter.get("/home", authenticate.jwtCheck, async(req,res,next) => {
//   try {
//     const fave = await movies.db
//     .collection("favorites")
//     .insert({user: req.user.sub, faveMovies: []})

//     const movie =  await movies.db
//     .collection("movieDetails")
//     .find({})
//     .sort( { "tomato.rating": -1 } )
//     .limit(1)
//     .toArray();

//     movie.forEach((item) => {
//       if (item.poster!=null)
//         item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
//       })

//     const moviecount = await movies.db
//     .collection("movieDetails")
//     .find({})
//     .count()

//     res.json({movie: movie, count: moviecount})  
//   } catch (err){
//     console.log(err)
//   }     
// });

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

      const movieCount = await movies.db
      .collection("movieDetails")
      .find({ $or: [ {title: new RegExp(req.query.all, "i")}, 
        {actors: new RegExp(req.query.all, "i")}, 
        {plot: new RegExp(req.query.all, "i")} ] })
      .count()

      movie.forEach((item) => {
        if (item.poster!=null)
          item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
      })

      res.json({movie: movie, count: movieCount})
    } else if (req.query.title){
      console.log(req.query.title)
      const movie = await movies.db
      .collection("movieDetails")
      .find({ title: new RegExp(req.query.title, "i") })
      .sort( { "year": -1 } )
      .skip((page * size) - size)
      .limit(size)  
      .toArray();

      const movieCount = await movies.db
      .collection("movieDetails")
      .find({ title: new RegExp(req.query.title, "i") })
      .count()

      movie.forEach((item) => {
        if (item.poster!=null)
          item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
      })

      res.json({movie: movie, count: movieCount})
    } else if (req.query.actors){
      console.log(req.query.actors)
      const movie = await movies.db
      .collection("movieDetails")
      .find({ actors: new RegExp(req.query.actors, "i") })
      .sort( { "year": -1 } )
      .skip((page * size) - size)
      .limit(size)  
      .toArray();

      const movieCount = await movies.db
      .collection("movieDetails")
      .find({ actors: new RegExp(req.query.actors, "i") })
      .count()

      movie.forEach((item) => {
        if (item.poster!=null)
        item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
      })

      res.json({movie: movie, count: movieCount})
    } else if (req.query.plot){
      console.log(req.query.plot)
      const movie = await movies.db
      .collection("movieDetails")
      .find({ plot: new RegExp(req.query.plot, "i") })
      .sort( { "year": -1 } )
      .skip((page * size) - size)
      .limit(size)  
      .toArray();

      const movieCount = await movies.db
      .collection("movieDetails")
      .find({ plot: new RegExp(req.query.plot, "i") })
      .count()

      movie.forEach((item) => {
        if (item.poster!=null)
          item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
      })

      res.json({movie: movie, count: movieCount}) 
    } else if (req.query.genre){
      console.log(req.query.genre)
      const movie = await movies.db
      .collection("movieDetails")
      .find({ genres: new RegExp(req.query.genre, "i") })
      .sort( { "year": -1 } )
      .skip((page * size) - size)
      .limit(size)  
      .toArray();

      const movieCount = await movies.db
      .collection("movieDetails")
      .find({ genres: new RegExp(req.query.genre, "i") })
      .count()

      movie.forEach((item) => {
        if (item.poster!=null)
          item.poster = item.poster.replace("http://ia.media-imdb.com", "https://m.media-amazon.com")
      })

      res.json({movie: movie, count: movieCount}) 
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


// // (SYNC)
// app.use("/actors", (req, res) => {
//   movies.db
//   .collection("movieDetails")
//   .find({director: "Wes Anderson"})
//   .toArray()
//   .then(result =>{
//     res.json(result)
//   })
// });

// //MOVIE WITH CORRECT LINK (SYNC)
// movieRouter.get("/movies1", (req, res, next) => {
//   const size = 10; // results per page
//   const page = req.query.page // Page 
//   mongoose.connection.db
//   .collection("movieDetails")
//   .find({})
//   .sort({ year: -1 })
//   .skip((size * page) - size)
//   .limit(size)
//   .toArray()
//   .then((movies) => {
//   var newArray = new Array()
//   movies.forEach((arrayItem) => {
//       var poster = arrayItem.poster
//       var posterLink = poster.split("/")
//       var image = ("https://" + posterLink[2] + '/' + posterLink[3]+ '/' + posterLink[4] + '/' + posterLink[5])
//       var image = image
//       var movieDetails = {
//          title: arrayItem.title,
//          poster: image
//       }
//       newArray.push(movieDetails)
//     })
//     res.json(newArray);
// }, (err) => next(err))
// .catch((err) => next(err)); 
// });


// //GET MOVIES NOT proper link
// movieRouter.get("/movies2, async(req,res,next) => {
//   var pageNo = parseInt(req.query.pageNo)
//   var size = parseInt(req.query.size)
//   var query = {}

//   if(pageNo < 0 || pageNo === 0) {
//         response = {"error" : true,"message" : "invalid page number, should start with 1"};
//         return res.json(response)
//   }
//   query.skip = size * (pageNo - 1)
//   query.limit = size
  
//   const movie =  await movies.db
//     .collection("movieDetails")
//     .find({}, { projection: { _id: 0, title:1, year: 1, poster: 1 }})
//     .sort( { year: -1 } ) 
//     .skip(query.skip)
//     .limit(query.limit)
//     .toArray();
//     //response = {"error" : false,"message" : movie};
//     res.json(movie);  
// });


// movieRouter.get("/home", async(req,res,next) => { 
//   console.log(req.query.page)
//   try {
//     const moviecount = await movies.db
//     .collection("movieDetails")
//     .find({})
//     .count()

//     res.json({count: moviecount})  
//   } catch (err){
//     console.log(err)
//   }     
// });