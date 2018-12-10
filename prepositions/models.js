'use strict';

const mongoose = require('mongoose');

const prepositionsSchema = mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    sentence: {type: String, required: true},
    answer: {type: String, required: true}
});

prepositionsSchema.pre('find', function(next) {
    this.populate('user', '-username -password -__v');
    next();
});

prepositionsSchema.pre('findOne', function(next) {
    this.populate('user', '-username -password -__v');
    next();
});

const Preposition = mongoose.model('Preposition', prepositionsSchema);

module.exports = {Preposition};