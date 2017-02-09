var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
mongoose.Promise = Promise;

var ScriptSchema = new mongoose.Schema({
    script: {
        type: String,
        default: 'Insert python script',
        required: true
    },
    name: {
        type: String,
        default: 'Insert script name',
        required: true,
        unique: true
    }
});
ScriptSchema.plugin(uniqueValidator);
var model = mongoose.model('Script', ScriptSchema);

//model.collection.ensureIndex({
//    name: 'name'
//}, function(error, res) {
//    if(error){
//        return console.error('failed ensureIndex with error', error);
//    }
//    console.log('ensureIndex succeeded with response', res);
//});


module.exports = model;