var express             = require("express"),
    router              = express.Router(),
    passport            = require("passport");

const Admin = require('../models/user');

    
router.get('/register', function(req, res){
    res.render('./auth/register');
});

router.post('/register', function(req, res){
    
    if( req.body.secret == "1234") {
        var newAdmin = new Admin({username: req.body.username});
        Admin.register(newAdmin, req.body.password, function( err, admin ){
           if( err ) {
               console.log(err.message);
               res.send("Something went wrong");
           } else {
                passport.authenticate("local")(req, res, function(){
                res.redirect("/");
            });
           }
        });
    } else {
        res.send("Wrong secret code");
    }
});

router.get("/login", function(req, res){
    res.render("./auth/login");
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}), function(req, res){
});

// Logout route
router.get("/logout", function(req, res) {
   req.logout();
   res.redirect("/");
});

module.exports = router;