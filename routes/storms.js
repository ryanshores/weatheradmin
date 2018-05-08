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
    let cards = [];
    Storms.findById(req.params.id).populate("cards").exec(function( err, foundStorm ){
        if( err ) { res.send( err.message ); }
        else { res.render("./storms/storm", { storm: foundStorm, cards: cards }); }
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


module.exports = router;