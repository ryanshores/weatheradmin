var mongoose = require('mongoose');

var cardSchema = new mongoose.Schema({
    
    title: String,
    destination: String,
    url: String,
    
    storm: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Storm"
        },
        stormName: String
    }
    
});

module.exports = mongoose.model('Card', cardSchema);