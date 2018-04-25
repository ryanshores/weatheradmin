var express             = require("express"),
    router              = express.Router();
    
var Storms = require("../models/storms");

router.get('/', function(req, res){
    Storms.find({}, function( err, foundStorms ){
        if(err){
            console.log(err.message);
            res.redirect("/");
        } else {
            console.log(foundStorms);
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
        isActive: true
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
router.get('/edit', function(req, res){
    res.send('Edit');
});
// delete
router.get('/delete', function(req, res){
    res.send('Delete');
});

module.exports = router;