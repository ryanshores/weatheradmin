var express             = require("express"),
    router              = express.Router();
    
var Storms = require("../models/storms");
var Cards = require("../models/cards")

// STORMS
// get
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
router.get('/delete', function(req, res){
    res.send('Delete');
});

// CARDS
// get
router.get('/:id', function(req, res){
    let cards = [];
    Storms.findById(req.params.id).populate("cards").exec(function( err, foundStorm ){
        if( err ) { res.send( err.message ); }
        else { res.render("./storms/storm", { storm: foundStorm, cards: cards }); }
    });
});
// add
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




module.exports = router;