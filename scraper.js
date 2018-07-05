const fetch = require('node-fetch');
const cheerio = require('cheerio')

const url = 'https://www.imdb.com/find?ref_=nv_sr_fn&q=';
const searchURL = 'https://www.imdb.com/title/';


const searchCash = {};
const movieCash = {};


function searchMovies(searchTerm){

    if(searchCash[searchTerm]){
        console.log('Serve from Cache..')
        return Promise.resolve(searchCash[searchTerm]);
    }

    return fetch(`${url}${searchTerm}`)
     .then(resp=> resp.text())
    .then(body=>{
        const movies=[];
        const $ = cheerio.load(body);
        $('.findResult').each(function(i, element) {
            
            const $header = ($(element).find('h3.findSectionHeader'));

            const $img = ($(element).find('td a img'));
            const $title = ($(element).find('td.result_text a'));
            //const $title2 = ($(element).find('td.result_text'));
            //console.log($title.text());
            //const imdb = $title.attr('href').match(/title\/(.*)\//);
            
            if($img.attr('src')){

                if($title.attr('href').match(/title\/(.*)\//) == null){
                    imdb = $title.attr('href').match(/name\/(.*)\//)[1];
                }else{
                    imdb = $title.attr('href').match(/title\/(.*)\//)[1];
                }
                const movie ={
                    img: $img.attr('src'),
                    title:($(element).find('td.result_text').text()),
                    imdb
                };
                movies.push(movie);
            }  
        });
        searchCash[searchTerm] = movies;
       return movies;
    })
}


function getMovieDetails(imdb){

    if(movieCash[imdb]){
        console.log('Serve from Cache..');
        return Promise.resolve(movieCash[imdb]);
    }

    return fetch(`${searchURL}${imdb}`)
     .then(resp=> resp.text())
     .then(body=>{
        const $ = cheerio.load(body);
        const movieDetails=[];
        $title = $('.title_wrapper h1');
        $runtime = $('time[itemprop="duration"]');
        function getDeatails(ArrayItems) {
            return function(i, element){
                const arry = $(element).text().trim();
                ArrayItems.push(arry);
            }
        }

        $genres = [];
        $('span[itemprop="genre"]').each(getDeatails($genres));
        $releseDate = $('meta[itemprop="datePublished"]');
        $releseDate = $('span[itemprop="ratingValue"]');
        $imgPoster = $('div.poster a img');
        $summary = $('div.summary_text');
        $directors = [];
        $('span[itemprop="director"]').each(getDeatails($directors))
        $writers = [];
        $('.credit_summary_item span[itemprop="creator"]').each(getDeatails($writers));

        $actors = [];
        $('.credit_summary_item span[itemprop="actors"]').each(getDeatails($actors));

        $storyLine =  $('#titleStoryLine div p span[itemprop="description"]');        

        $comapnies = []
        $('span[itemtype="http://schema.org/Organization"]').each( getDeatails($comapnies));

        $trailer = $('a[itemprop="trailer"]').attr('href');

        const details = {
            imdb: imdb,
            title: $title.text().trim(),
            runtime: $runtime.text().trim(),
            genres: $genres,
            releseDate: $releseDate.attr('content'),
            releseDate: $releseDate.text(),
            imgPoster: $imgPoster.attr('src'),
            summary: $summary.text().trim(),
            directors: $directors,
            wiriters: $writers,
            actors: $actors,
            storyLine: $storyLine.text().trim(),
            company: $comapnies,
            trailer: `https://www.imdb.com${$trailer}`
        }
        //movieDetails.push(details)

        movieCash[imdb] = details;
     });
     
     return details;
}

// searchMovies('don').then(body=>{
//     const movies=[];
//     const $ = cheerio.load(body);
//     $('.findResult').each(function(i, element) {
//         const $element = $(element)
//         const $img = ($(element).find('td a img'));
//         const $title = ($(element).find('td.result_text a'));
//         console.log($title.text());
//         const movie ={
//             img: $img.attr('src'),
//             title: $title.text()
//         };
//         movies.push(movie);
//     });

//    console.log(movies);
// })

module.exports= {
    searchMovies,
    getMovieDetails
}