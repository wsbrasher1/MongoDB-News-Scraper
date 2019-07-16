//Require our dependencies
var express = require("express");
var mongoose = require("mongoose");
var expressHandlebars = require("express-handlebars");
var bodyParser = require("body-parser");

//Set up our PORT
var PORT = process.env.PORT || 3000;

//Instantiate our Express App
var app = express();

//Set up an Express Router
var router = express.Router();

//Require our routes file pass our router object
require("./config/routes")(router);

//Designate our public folder as a static directory
app.use(express.static("public"));

//Connect Handlebars to our Express app
app.engine("handlebars", expressHandlebars({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

//Use bodyParser in our app
app.use(bodyParser.urlencoded({
    extended: false
}));

//To have every request go through our router middleware
app.use(router);

//If deployed, use the deployed database. Otherwise, use the local mongo database
var db = process.env.MONGODB_URI || "mongodb://localhost/stories";

//Connect mongoose to our database
mongoose.connect(db, function(error){
    if(error) {
        console.log(error);
    }
    else{
        console.log("Yay, mongoose connection is lit!");
    }
});

//Listen on the PORT
app.listen(PORT, function(){
    console.log("Listening on port: " + PORT);
});