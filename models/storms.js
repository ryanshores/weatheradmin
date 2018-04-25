var mongoose = require('mongoose');

var stormSchema = new mongoose.Schema({
    
    name: String,
    isActive: Boolean
    
});

module.exports = mongoose.model('Storm', stormSchema);