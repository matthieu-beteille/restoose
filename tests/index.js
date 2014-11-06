var express = require('express');
var server = require('../lib/restoose');
var MongoClient = require('mongodb').MongoClient;
var path = require('path');

var app = express();

module.exports = app;

//before Function
before(function(done) {
  var dirname = __dirname;
    MongoClient.connect("mongodb://localhost:27017/test-api-generator", function(err, db) {
        if(!err) {
            db.dropDatabase(function(err, don){
                db.close();

                server.start(app, 8080, {rootPath: '..', modelPath: path.join(__dirname, 'models'), controllerPath: path.join(__dirname, 'controllers'), configPath: path.join(__dirname, 'config')}, done);
        });
        }
    });
});

// After Function
after(function(done){
  done();
});


