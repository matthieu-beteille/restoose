var express = require('express');
var restoose = require('./lib/restoose.js');

var app = express();

restoose.start(app, 8080);