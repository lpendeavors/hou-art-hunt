'use strict';

const axios = require('axios');
const csvFilePath = './raw data/set5.csv';
const csv = require('csvtojson');
const Art = require('./models/Art');

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/cohpa');

csv()
    .fromFile(csvFilePath)
    .on('json', (jsonObj) => {
        let art = new Art();
        art.title = jsonObj['Display Title'];
        art.artist = jsonObj['Display Artist'];
        art.creationDate = jsonObj['Creation Date'];
        art.mediaAndSupport = jsonObj['Media & Support'];
        art.creditLine = jsonObj['Credit Line'];
        art.address = jsonObj['Current Location'];
        art.specificLocation = jsonObj['Specific Location'];
        
        if (jsonObj['Current Location']) {
            let url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + art.address + "&key=AIzaSyBboBsItuuFFMlLKSkP-5ZZaSH--ypvgZw";
            axios.get(url)
                .then(function (response) {
                    if(response.data.results[0]) {
                        art.location.coordinates.push(Number(response.data.results[0].geometry.location.lng));
                        art.location.coordinates.push(Number(response.data.results[0].geometry.location.lat));
                    
                        art.save();
                    } else {
                        console.log(response.data);
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    })
    .on('done', (error) => {
        if(error) return error;
    });