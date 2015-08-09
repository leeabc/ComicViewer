var express = require('express');
var kukudm = require('./kukudm.js');
var app = express();
var kukudmObj = new kukudm();

// init 海賊王
//kukudmObj.init("http://www.kukudm.com/comiclist/4/");
// init 食戟之靈
kukudmObj.init("http://www.kukudm.com/comiclist/1694/");
// init 死神
//kukudmObj.init("http://www.kukudm.com/comiclist/6/");

app.get('/comic/:chURL/:page', function(req, res){
	kukudmObj.getImgSrc(req.params.chURL, req.params.page).then(
		function(imgSrc){
			res.send(imgSrc);
		},
		function(err){
			res.send(err);
		}
	);
});

app.get('/comic/getList', function(req, res){
	kukudmObj.getChapterList().then(
		function(data){
			res.send(data);
		},
		function(err){
			console.log(err);
		}
	);
});

app.use(express.static('public'));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

