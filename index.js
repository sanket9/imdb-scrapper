const express = require('express');
const cors = require('cors');

const scraper = require('./scraper'); 
const app = express();
app.use(cors());


const port = 3000;

app.listen(port, ()=>{
    console.log("Lissining on: "+port)
});

app.get('/', (req, res)=>{
    res.json({
        'mssg':'Scrapping is Fun'
    });
    
});

app.get('/search/:title', (req, res)=>{
    scraper.searchMovies(req.params.title).then(movies=>{
        res.json(movies);
    })
    
});

app.get('/movie/:imdb', (req, res)=>{
    scraper.getMovieDetails(req.params.imdb).then(movies=>{
        res.json(movies);
    })
    
})