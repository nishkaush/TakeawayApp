const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// mongoose.createConnection(process.env.MONGODB_URI || "mongodb://localhost:27017/TakeawayApp");

mongoose.connect(process.env.MONGODB_URI || process.env.localDB);

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true
    },
    password: {
        type: String
    },
    localName: String,
    fbId: String,
    fbName: String,
    googleId: String,
    googleName: String
});


var Users = mongoose.model("Users", userSchema);

module.exports.Users = Users;
module.exports.mongoose = mongoose;
