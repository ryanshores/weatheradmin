var express = require("express"),
    router  = express.Router(),
    async   = require("async"),
    turf    = require("@turf/turf");
    
var Storms = require("../models/storms");
var Cards = require("../models/cards");

var saveFile = require("./files");
const fileUpload = require("express-fileupload");
router.use(fileUpload());

// STORMS
// get
router.get('/', function(req, res){
    Storms.find({}, function( err, foundStorms ){
        if(err){
            console.log(err.message);
            res.redirect("/");
        } else {
            res.render("./storms/list", { storms: foundStorms });
        }
    });
});
// add
router.get('/add', function(req, res){
    res.render('./storms/add');
});
router.post('/add', function(req, res){
    var newStorm = {
        name: req.body.name,
        category: req.body.category,
        isActive: false,
    };
    Storms.create(newStorm, function( err, newStorm ){
        if ( err ) 
        {
           console.log(err.message);
           res.send('Something went wrong.');
        }
        else 
        { 
            res.redirect('/storms');
        }
    });
});
// edit
router.get('/edit/:id', function(req, res){
    Storms.findById(req.params.id, function(err, foundStorm) {
        if(err){ res.send(err) }
        else { res.render("./storms/edit", {storm: foundStorm} ); }
    });
});
router.post("/edit/:id", function(req, res) {
    let storm = {
        name: req.body.name,
        category: req.body.category
    };
    Storms.findByIdAndUpdate(req.params.id, storm, function(err, foundStorm) {
        if(err){ res.send(err); }
        else { res.redirect("/storms/" + foundStorm._id); }
    });
});
// delete
router.get('/:id/delete', function(req, res){
    Storms.findByIdAndRemove(req.params.id, function(err){
        if(err) { res.send(err); }
        else { res.redirect("/storms")}
    });
});
// change storm active
router.post("/:id/active", function(req, res){
   Storms.findById(req.params.id, function(err, foundStorm) {
       if( err ){ res.send(err); }
       else{
           foundStorm.isActive = req.body.isActive;
           foundStorm.save();
           res.redirect("/storms/" + foundStorm._id);
       }
   });
});
// get individual storm
router.get('/:id', function(req, res){
    async.waterfall([
        // get the points
        function(callback){
            var locations = [
        		{
        			geometry: [-90, 25]
        		},
        		{
        			geometry: [-90.5, 25]
        		},
        		{
        			geometry: [-91, 25]
        		},
        		{
        			geometry: [-90, 28]
        		},
        		{
        			geometry: [-90.5, 28]
        		},
        		{
        			geometry: [-91, 28]
        		}
        	];
        	callback(null, locations);
        },
        // Get the storm
        function(points, callback){
            Storms.findById(req.params.id).populate("cards").exec(function( err, storm ){
                if( err ){ callback(err); }
                else { callback(null, points, storm); }
            });
        },
        // make polygons
        function(points, storm, callback){
            var level1;
            var level2;
            var result = false;
            if(storm.json){
                var jsonObj = storm.json.toObject();
                if(jsonObj.features){
                    jsonObj.features.forEach(function(feat){
                        if(feat.properties.name == "hf50"){
                            level1 = turf.polygon(feat.geometry.coordinates);
                        } else if(feat.properties.name == "hf64"){
                            level2 = turf.polygon(feat.geometry.coordinates);
                        }
                    });
                }
            }
            if(level1 != undefined && level2 != undefined){
                result = true;
            }
            callback(null, points, storm, level1, level2, result);
        },
        // color code points
        function(points, storm, level1, level2, result, callback){
            if(result){
                points.forEach(function(pt){
                    pt.properties = {};
                    if(turf.booleanWithin(turf.point(pt.geometry), level2)){
                        pt.properties.color = "red";
                    } else if(turf.booleanWithin(turf.point(pt.geometry), level1)){
                        pt.properties.color = "orange";
                    } else {
                        pt.properties.color = "green";
                    }
                });
                callback(null, points, storm, "Waterfall Finished");    
            } else {
                points.forEach(function(pt){
                    pt.properties = {};
                    pt.properties.color = "green";
                });
                callback(null, points, storm, "Waterfall finished");
            }
            
        }
        ], 
    function(err, points, storm, result){
        if( err ){ res.send(err.message); }
        else{
            res.render("./storms/storm", {storm: storm, points: points});
        }
    });
});

// CARDS
// add
// id here is the parent storms id
router.get('/:id/add/card', function(req, res){
    res.render("./storms/addcard", { stormid: req.params.id });
});
router.post('/:id/add/card', function(req, res){
    var newCard = {
        title: req.body.title,
        url: req.body.url,
        desc: req.body.desc,
        isActive: false
    };
    Storms.findById(req.params.id, function( err, foundStorm ){
        if( err ){
            console.log(err);
            req.redirect("/storms");
        } else {
            Cards.create(newCard, function( err, newCard ){
                if ( err ) 
                {
                    console.log(err);
                    res.redirect("/storms");
                }
                else 
                {
                    // Add storm id to card
                    newCard.storm.id = foundStorm._id;
                    // save card
                    newCard.save();
                    // add card to storm
                    foundStorm.cards.push(newCard);
                    foundStorm.save();
                    res.redirect('/storms/' + foundStorm._id);
                }
            });
        }
    });
});
// active
router.post("/:stormid/:cardid/active", function(req, res){
   Cards.findById(req.params.cardid, function(err, card) {
       if( err ){ res.send( err ); }
       else {
           card.isActive = req.body.isActive;
           card.save();
           res.redirect("/storms/" + req.params.stormid);
       }
   });
});
// edit
router.get("/:stormid/:cardid/edit", function(req, res) {
    Cards.findById(req.params.cardid, function(err, card) {
        if( err ){ res.send( err ); }
        else { res.render("./storms/cardedit", {card: card, stormid: req.params.stormid} ); }
    });
});
router.post("/:stormid/:cardid/edit", function(req, res) {
   var card = {
       title: req.body.title,
       url: req.body.url,
       desc: req.body.desc
   };
   Cards.findByIdAndUpdate(req.params.cardid, card, function( err, card ){
       if( err ) { res.send( err ); }
       else { res.redirect("/storms/" + req.params.stormid); }
   });
});
// delete
router.get("/:stormid/:cardid/delete", function(req, res) {
   Cards.findByIdAndRemove(req.params.cardid, function( err ){
       if( err ) { res.send( err ); }
       else { res.redirect("/storms/" + req.params.stormid); }
   });
});

// Storm wind Predictions
router.post("/:stormid/upload", function(req, res){
	if (!req.files) {
		return res.status(400).send('No files were uploaded.');
	}
	
	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	let sampleFile = req.files.sampleFile;
	let path = "./uploads/" + sampleFile.name;
	
	async.waterfall([
	   // Convert KML to JSON String
	    function(callback){
	        saveFile(sampleFile, sampleFile.name, path, ".kml", function(err, result) {
	            if(err){
	               // The file was wrong, or failed to be converted
	               callback(err);
	            } else {
	               // Successful file upload and convert
	               callback(null, result);
	            }
	        });
	    }, function(GeoJSON, callback){
	       // Save JSON to database
	       Storms.findById(req.params.stormid, function(err, storm) {
	           if(err){
	               //handle err
	               callback(err);
	           } else {
	               //add json and save
	               storm.json = GeoJSON;
	               storm.save(function(err){
	                   if(err){
	                       callback(err);
	                   }
	               });
	               callback(null, "Saved to Database");
	           }
	       });
	    }
	    ], function(err, result){
	        if(err){
	            res.send(err);
	        } else {
	            res.redirect("/storms/" + req.params.stormid);
	        }
	    }
	);
});


module.exports = router;