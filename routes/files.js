const express   = require("express"),
    router      = express.Router(),
    fs			= require("fs"),
    toGeoJSON	= require("@mapbox/togeojson"),
    DOMParser	= require('xmldom').DOMParser,
    async		= require("async");

const fileUpload = require("express-fileupload");
router.use(fileUpload());

// router.get("/upload", function(req, res){
// 	res.render("./upload");
// });

// router.post("/upload", function(req, res){
// 	if (!req.files) {
// 		return res.status(400).send('No files were uploaded.');
// 	}
	
// 	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
// 	let sampleFile = req.files.sampleFile;
// 	let path = "./uploads/" + sampleFile.name;
	
// 	saveFile(sampleFile, sampleFile.name, path, ".kml", function(err, result){
// 		if(err){
// 			console.log("Error: " + err);
			
// 		}
// 		else{
// 			console.log("Success: ");
// 			console.log(result);
			
// 		}
// 	});
	
// });

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
					callback(null, file);
				}
			});
		}
	],
	function(err, result){
		callback(err, result);
	});
}


module.exports = saveFile;