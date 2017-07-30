const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

mongoose.createConnection(process.env.MONGODB_URI || process.env.localDB);


var productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        index: true //this is used to make this Products collection appear in robomongo even when the collection is empty
    },
    imgSrc: String,
    description: String,
    likes: Number,
    hearts: Number,
    price: Number,
});


var Products = mongoose.model("Products", productSchema);

module.exports.Products = Products;
