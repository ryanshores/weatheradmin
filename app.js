require('dotenv').config({path: './vars.env'});

const express         = require('express'),
    app             = express(),
    mongoose        = require("mongoose"),
    bodyParser      = require("body-parser"),
    methodOverride  = require("method-override");
    
const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
    
const Storms = require("./models/storms");

const authRoutes = require("./routes/auth");
const stormRoutes = require("./routes/storms");
const fileRoutes = require("./routes/files");

app.set("view engine", "ejs"); 
app.use(methodOverride("_method"));
mongoose.connect(process.env.MLAB_DB);
mongoose.Promise = global.Promise;
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

// requires the model with Passport-Local Mongoose plugged in
const Admin = require('./models/user');
 
app.use(require("express-session")({
    secret: "anything that we want",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()); 

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(Admin.authenticate()));
 
// use static serialize and deserialize of model for passport session support
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.path = req.path;
    next();
});

// Home page
app.get('/', function(req, res){
   res.render('home');
});

app.use(authRoutes);
app.use("/storms", stormRoutes);
app.use("/files", fileRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Serving weather");
});