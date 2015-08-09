var request = require('request');
var Parser5 = require('parse5');
var Iconv = require('iconv-lite');
var q = require('q');

// http://www.kukudm.com/comiclist/4/ OnePiece

var kukudm = module.exports = function(){
	this.comicURL = "";
};

kukudm.prototype.init = function(comicURL){
	this.comicURL = comicURL;
	return this;
};

kukudm.prototype.getChapterList = function(){
	var def = q.defer();
	var ChaptersBody = "";

	var ComicArr = [];
	var parser = new Parser5.SimpleApiParser({
		startTag: function(tagName, attrs, selfClosing /*, [location] */) {
	        //Handle start tags here
	        if(tagName == "a"){
				var chapterURLArr = attrs.filter(function(el, idx, arr){
					if(el.name=="href" && /comic\.kukudm\.com\/comiclist\//.test(el.value)){
				    	return true;
				  	}else{
				   		return false;
					}
				});
				
				if(chapterURLArr && chapterURLArr.length > 0){
					// push to Global Array, ready to parser content.
					ComicArr.push(chapterURLArr[0].value.replace(/1\.htm/,""));
				}
	        }
	    }
	});

	request
		.get(this.comicURL, function(err, response, body){
			if(!err && response.statusCode == 200){
				ChaptersBody = body;
				parser.parse(body);
				def.resolve(JSON.stringify(ComicArr));				
			}else{
				def.reject(err, response.statusCode);
			}
		});
	return def.promise;
};

kukudm.prototype.getComicImgPage = function(url, page){
	var def = q.defer();
	var ComicPageBody = "";
	request({
		method: 'GET',
		uri: url+page+".htm",
		encoding: null
	},function(err, response, body){
			if(!err && response.statusCode == 200){
				ComicPageBody = body;
				def.resolve(body);
			}else{
				def.reject(err);
			}
	});
	return def.promise;
};

kukudm.prototype.getImgSrc = function(chURL, page){
	var def = q.defer();

	var url = chURL;
	this.getComicImgPage(url, page).then(
		function(data){
			console.log("Image Page RawData");
			console.log(data);

			//convert GBK to UTF8
			// var gbk_to_utf8 = new Iconv('GBK', 'UTF8');
			// var buffer = gbk_to_utf8.convert(data);
			data = Iconv.decode(data,'gbk');
			data = Iconv.encode(data,'utf8').toString();
			console.log(data.toString());
			//data = buffer.toString();
			var resultArr = data.match(/src=\'(.*.[jpg|png])\'>/);
			var imgSrc = "";
			if(resultArr[1]){
				imgSrc = resultArr[1].replace(/".*"/,"http://n.kukudm.com/");
			}
			console.log(imgSrc);
			def.resolve(imgSrc);
		},
		function(err){
			console.log(err);
			def.reject(err);
		}
	);

	return def.promise;
};