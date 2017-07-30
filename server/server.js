require("dotenv").config({
    path: __dirname + "../myvariables.env"
});

const express = require("express");
const hbs = require("hbs");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const session = require("express-session");
const axios = require("axios");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const authentication = require("./controller/authentication");

var mongoose = require("./models/users").mongoose;
var Users = require("./models/users").Users;
var Products = require("./models/products").Products;

const port = process.env.PORT || process.env.localPort;
var app = express();

// #################################################################

// next 2lines indicate that static files to be used from public folder
const publicPath = path.join(__dirname, "../public");
// dirname==/Users/Nishant/Desktop/indian-food/server
// to get to public folder we move back up by one and then move into public folder
app.use(express.static(publicPath)); //--> this indicates to express that all routes that start with "/" should be served static assets from public folder. So, if its "/:id" or "/home" or "/anything", it will look for static files in the public folder.

app.use("/product", express.static(publicPath)); //but for nested paths like "/product/:id" or "/anything/something", we need to specify how to serve static files. Here, we have said that any route that starts with "/product", whether it be "/product/id" or "product/id/liked", we want to serve files from public folder.

app.use("/home", express.static(publicPath));

// #################################################################


// using bodyparser for taking incoming data and putting it on req.body
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// #################################################################

// setting up view engine to be hbs
app.set("view engine", "hbs");

hbs.registerHelper("totalPrice", (qty, price) => {
    return qty * price;
});

hbs.registerHelper("finalPayment", (arr) => {
    return arr.reduce((sum, e) => {
        return sum + (e.qty * e.price);
    }, 0);
});

// #################################################################

// this is for setting up sessions
app.use(session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        name: "signup-login"
    }
}));

// #################################################################
// connect-flash middleware for flashing messages
app.use(flash());


// #################################################################

// the following two lines are needed to initialize passportJS
app.use(passport.initialize());
app.use(passport.session());


// ################  Sample adding products#############


// ############  MAIN PAGE ROUTE IS HERE ########################

app.get("/", (req, res) => {
    // passport stores all errors under"error" tag in sessions object
    // so instead of us being able to give any tagname to our flash messages, we have to stick with only one tagname - errors OR success

    var finalMessage;
    let myerrors = req.flash("error");
    let mysuccess = req.flash("success");
    if (myerrors) {
        finalMessage = myerrors;
    } else if (mysuccess) {
        finalMessage = mysuccess;
    }
    if (req.session) {
        req.session.destroy();
    }
    res.render("login", {
        message: finalMessage
    });
});


// ##################### LOCAL SIGNING UP STRATEGY  ###################


app.post("/signup", passport.authenticate("local-signup", {
    successRedirect: "/home",
    failureRedirect: "/",
    failureFlash: true,
    successFlash: true
}));


// ##################### LOCAL LOGGING IN STRATEGY  ###################


app.post("/login", passport.authenticate("local-login", {
    successRedirect: "/home",
    failureRedirect: "/",
    failureFlash: true, //this sets flash messages for next page
    successFlash: true
}));


// ##############  FACEBOOK LOGIN AND SIGNUP STRATEGY  #######


app.get("/auth/facebook", passport.authenticate("facebook", {
    scope: ["email"]
}));

app.get("/auth/facebook/callback", passport.authenticate("facebook", {
    successRedirect: "/home",
    failureRedirect: "/",
    failureFlash: true,
    successFlash: true
}));



// #########  GOOGLE LOGIN AND SIGNUP STRATEGY  #################


// first route sends user to google to get authenticated
app.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

// second route tells google to redirect the user back to us
app.get("/auth/google/callback", passport.authenticate("google", {
    successRedirect: "/home",
    failureRedirect: "/",
    failureFlash: true,
    successFlash: true
}));


// ******* GENERAL PAGES START HERE ************************

app.get("/home", (req, res) => {

    if (req.isAuthenticated()) {
        let mymessages = req.flash("success");
        if (mymessages) {
            Products.find({}).then((resp) => {
                if (!resp) {
                    return res.send("no products exist yet!");
                }
                let numberOfItems = cartItems.reduce((sum, e) => {
                    return sum + parseInt(e.qty);
                }, 0);
                return res.render("home", {
                    myproducts: resp,
                    message: mymessages,
                    numberOfItems: numberOfItems
                });
            }).catch((e) => {
                res.send(e);
            });
        }

    } else {
        req.flash("error", "Session Expired, log back in again");
        res.redirect("/");
    }
});




var cartItems = []; //this will be used to render view cart option
app.post("/home", (req, res) => {

    if (req.body.qty) {
        // lean function converts mongoose objects into plain JS obj so we can add more properties to them, can use toObject() too
        Products.findById(req.body.id).lean().then((prod) => {
            prod.qty = req.body.qty;
            cartItems.push(prod);
            let numberOfItems = cartItems.reduce((sum, e) => {
                return sum + parseInt(e.qty);
            }, 0);
            res.send(`View Cart (${numberOfItems})`);
        }).catch((er) => {
            console.log(`hit is hitty with add to cart ${er}`);
            res.send("ERROR!");
        });


    } else if (req.body.heartsCount || req.body.heartsCount === 0) {

        Products.findOneAndUpdate({
            _id: req.body.id
        }, {
            $set: {
                hearts: req.body.heartsCount
            }
        }, {
            new: true
        }).then((resp) => {
            console.log(resp);
            res.send("All is well");
        }).catch((e) => {
            console.log("something went wrong while updating", e);
            res.send("all has failed");
        });


    } else if (req.body.likesCount || req.body.likesCount === 0) {

        Products.findOneAndUpdate({
            _id: req.body.id
        }, {
            $set: {
                likes: req.body.likesCount
            }
        }, {
            new: true
        }).then((resp) => {
            console.log(resp);
            res.send("All is well with likes");
        }).catch((e) => {
            console.log("something went wrong while updating", e);
            res.send("All has failed");
        });

    }

});





app.get("/home/:category", (req, res) => {

    if (req.isAuthenticated()) {
        Products.find({
            category: req.params.category
        }).then((result) => {
            let numberOfItems = cartItems.reduce((sum, e) => {
                return sum + parseInt(e.qty);
            }, 0);
            res.render("home", {
                myproducts: result,
                numberOfItems: numberOfItems
            });
        });
    } else {
        res.redirect("/");
    }

});





app.get("/product/:id", async(req, res) => {
    if (req.isAuthenticated()) {
        var id = req.params.id;

        try {
            let foundProduct = await Products.findById(id);

            if (!foundProduct) {
                return res.send("no product found with that id");
            }
            let numberOfItems = cartItems.reduce((sum, e) => {
                return sum + parseInt(e.qty);
            }, 0);
            res.render("single-product", {
                productName: foundProduct.productName,
                imgSrc: foundProduct.imgSrc,
                _id: foundProduct._id,
                description: foundProduct.description,
                likes: foundProduct.likes,
                hearts: foundProduct.hearts,
                price: foundProduct.price,
                numberOfItems: numberOfItems
            });
        } catch (e) {
            res.send(`shit went south fetching single product:${e}`);
        }

    } else {
        req.flash("error", "Session Expired, log back in again");
        res.redirect("/");
    }

});





app.get("/mycart", (req, res) => {

    if (req.isAuthenticated()) {
        res.render("mycart", {
            myproducts: cartItems
        });
    } else {
        res.redirect("/");
    }

});



app.post("/mycart", (req, res) => {

    if (req.isAuthenticated()) {
        cartItems = cartItems.filter((e) => {
            return e._id.toString() !== req.body.id; //tostring was used coz e._id from cartitems was coming up as an object
        });
        res.render("mycart", {
            myproducts: cartItems
        });
    } else {
        res.redirect("/");
    }

});




app.get("/logout", (req, res) => {
    if (req.isAuthenticated()) { //this is given by passport too
        req.logout(); //this is given by passport
        req.flash("success", "You Have Logged Out Successfully!");
        res.redirect("/");

    } else {
        req.flash("error", "Session Expired, log back in again");
        res.redirect("/");
    }
})


// listening on port 3000
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
