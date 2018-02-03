var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var pool = require('./db');

var url = "http://php.jdsindustries.com/JDS_SITE/site1.php?D3ID=865&D2ID=62&D1ID=11&D1DESC=Gifts+%26amp%3B+Engravables&D2DESC=Gift+Items&D3DESC=Bamboo+Gift+Items&SITE=SITE3&MENU2=MENU2";
var products = [];
var itemTitle = '';
var imgSrc = '';
var itemDescr = '';
var maxProductId;

pool.getConnection(function(err, connection) {
    // Use the connection
    connection.query("SELECT MAX(product_id) AS product_id FROM oc_product_description", function (err, result, fields) {
      // And done with the connection.
      maxProductId = result[0].product_id;
      connection.release();
      
      // Handle error after the release.
      if (err) throw error;
   
      // Don't use the connection here, it has been returned to the pool.
    });
});


request(url, function (error, response, body) {
  if (!error) {
    var $ = cheerio.load(body)
    getProducts($);
    //console.log(products);

    //download each image
    //var fs = require('fs'),
    //request = require('request');

    // var download = function(uri, filename, callback){
    //     request.head(uri, function(err, res, body){
    //         console.log('content-type:', res.headers['content-type']);
    //         console.log('content-length:', res.headers['content-length']);

    //         request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    //     });
    // };

    //for testing purposes.
    //var sqlArray = [];

    //loops through array and writes output to console. - move to a seperate function?
    for (let i=0; i<products.length; i++){
        //call img download - will be used later to download images into opencart directory.
        // download(prodImg, imageTitle, function(){
        //      console.log('done');
        // });

        //set product variables
        maxProductId = maxProductId + 1;
        //console.log(maxProductId);
        var prodImg = products[i].item[0];
        //console.log(prodImg);
        var prodModel = products[i].item[1].trim();
        //console.log(prodTitle);
        var prodTitle = products[i].item[2];
        //console.log(prodTitle);
        var prodDescr = products[i].item[2];
        //console.log(prodDescr);
        var imageTitle = prodModel + '.png';
        //console.log(imageTitle);
        
        //console.log(sql);

        //create sql array and write to json file for testing purposes only.
        //sqlArray.push({sql});

        // fs.writeFile('output.json', JSON.stringify(sqlArray, null, 4), function(err){

        //     //console.log('File successfully written! - Check your project directory for the output.json file');
        
        // });
        // var sql = "INSERT INTO oc_product_descriptin (product_id) VALUES ('" + maxProductId + "');";

        //insert statement here?
        var sql = "INSERT INTO `opencart`.`oc_product_description`" +
        "(`product_id`," +
        "`language_id`," +
        "`name`," +
        "`description`," +
        "`tag`," +
        "`meta_title`," +
        "`meta_description`," +
        "`meta_keyword`)" +
        "VALUES(" +
        maxProductId + "," +
        "1," +
        "'" + prodModel + "'," +
        "'" + prodDescr + "'," +
        "''," +
        "'" + prodModel + "'," +
        "''," +
        "'');"
        //insert
        pool.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted: " + sql);
        });
        //second insert
        var sql = "INSERT INTO oc_test (product_id) VALUES ('" + maxProductId + "');";
        pool.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted: " + sql);
        });
        // delete - only when needed.
        // var sql = "DELETE FROM `opencart`.`oc_product_description` WHERE column_name='" + maxProductId + "';";
        // pool.query(sql, function (err, result) {
        //     if (err) throw err;
        //     console.log("1 record inserted: " + sql);
        // });
    }
  }
  else {
    console.log("We’ve encountered an error: " + error);
  }
});

function getProducts ($){
    $('td').each(function() {
        if ($(this).children('div').hasClass('ImageBorder')) {
            imgSrc = $(this).children('div').children('a').children('img').attr('src');
            //console.log(imgSrc);
            itemTitle = $(this).next('td').children('a.med').text();
            //console.log(itemTitle);
            itemDescr = $(this).next('td').children('p.descText').text();
            //console.log(itemDescr);
            products.push({item:[imgSrc, itemTitle, itemDescr]});
        }
    });
    return products;
}