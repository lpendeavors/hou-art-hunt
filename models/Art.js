'use strict';

const mongoose = require('mongoose');

const ArtSchema = new mongoose.Schema({
    title: {
        type: String
    },
    artist: {
        type: String
    },
    creationDate: {
        type: String
    },
    mediaAndSupport: {
        type: String
    },
    creditLine: {
        type: String
    },
    likes: {
        type: Number,
        default: 0
    },
    address: {
        type: String
    },
    specificLocation: {
        type: String
    },
    location: {
        coordinates: [{
            type: Number
        }],
        type: {
            type: String,
            default: 'Point'
        }
    }
});

module.exports = mongoose.model('Art', ArtSchema);