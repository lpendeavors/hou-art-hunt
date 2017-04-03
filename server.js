'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Art = require('./models/Art');
const path = require('path');

//GET total number of art
app.get('/api/art/total/', (req, res) => {
    Art.find({}, function (err, artList) {
        if (err) return res.status(400).json(err);
        
        res.json({ total: artList.length });
    });
});

// GET an art object by ID
app.get('/api/art/:artId', (req, res) => {
    Art.findById(req.params.artId, (err, artObj) => {
        if (err) return res.status(400).json(err);
        
        res.json(artObj);
    });
});

// GET nearby art
app.get('/api/art/near/:location', (req, res) => {
    let coords = req.params.location.split(',');
    coords = coords.map((coordinate) => {
        return Number(coordinate);
    });
    
    Art.aggregate([
        {
            $geoNear: {
                near: { type: 'Point', coordinates: coords },
                distanceField: 'distance',
                distanceMultiplier: 0.000621371,
                maxDistance: 16093.4,
                spherical: true,
                limit: 1000
            }
        }
    ], (err, results) => {
        if (err) return res.status(400).json(err);
        
        res.json(results);
    });
});

// POST to add like
app.post('/api/art/:artId/like', (req, res) => {
    Art.findOne({ _id: req.params.artId }, (err, artObj) => {
        if (err) return res.status(400).json(err);
        artObj.likes += 1;
        artObj.save((err, result) => {
            if (err) return res.status(400).json(err);
            
            res.status(200).json(result);
        });
    });
});

app.use(express.static(__dirname + '/cohpa/www/'));

app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/cohpa/www/index.html'));
});

mongoose.connect('mongodb://localhost:27017/cohpa');

app.listen(process.env.PORT, process.env.IP);