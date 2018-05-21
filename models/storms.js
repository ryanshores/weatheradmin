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
    
    json: { type: mongoose.Schema.Types.Mixed, default: {} }
    
}, { minimize: false });

module.exports = mongoose.model('Storm', stormSchema);