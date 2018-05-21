const fs			= require("fs"),
    toGeoJSON	= require("@mapbox/togeojson"),
    DOMParser	= require('xmldom').DOMParser,
    async		= require("async");


function KMLtoJSON(routeToFile, cb){
	var kml = new DOMParser().parseFromString(fs.readFileSync(routeToFile, 'utf8'));
	var converted = toGeoJSON.kml(kml);
	fs.unlink(routeToFile);
	cb(null, converted, "Success");
}

function validator(nameOfFile, format, cb){
	if( nameOfFile.indexOf(format) > -1 ){
		cb(null, "The query was found in the file name.");
	} else {
		cb("The query was not found in the file name");
	}
}

function saveFile(file, name, path, format, callback){
	async.waterfall([
		function(callback){
			file.mv(path, function(err) {
				if(err){
					callback(err);
				} else {
			    callback(null);
				}
			});
		},
		function(callback){
			validator(name, format, function(err, result){
				if(err){
					console.log(err);
					// Remove the file if it isn't corrent format
					fs.unlink(path);
					callback(err);
				} else {
					// If there was no error than the query was found in the file name
					callback(null);
				}
			});
		},
		function(callback){
			KMLtoJSON(path, function(err, file, result){
				if(err){
					callback(err);
				} else {
					// function removed original file after converting
					// function returns a json string
					callback(null, file, "Success");
				}
			});
		}
	],
	function(err, file, result){
		callback(err, file, result);
	});
}


module.exports = saveFile;