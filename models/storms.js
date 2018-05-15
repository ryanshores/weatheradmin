var mongoose = require('mongoose');

var stormSchema = new mongoose.Schema({
    
    name: String,
    category: Number,
    isActive: Boolean,
    
    cards: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Card"
        }
    ],
    
    json: {default: {}}
    
});

module.exports = mongoose.model('Storm', stormSchema);