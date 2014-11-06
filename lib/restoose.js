/*
 Import des modules nécessaires
 */
var _ = require('underscore');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');


/*
 Configuration
 */

var modelPath, controllerPath, configPath, rootPath ;
/*
 Fonctions et variables accessibles depuis le module
 */
module.exports = {
  /*
   Fonction lançant l'application
   */
  start: function(app, port, options, cb){

    var opts = options;

    /*
     Configuration of the express application (using different middlewares)
     */
    app.use( bodyParser.json() );
    app.use( bodyParser.urlencoded({extended: true}) );

    var self=this;

    if(opts){
      if(!opts.rootPath){
        rootPath = require('path').dirname(require.main.filename);
        modelPath = path.join(rootPath,'models');
        controllerPath = path.join(rootPath,'controllers');
        configPath = path.join(rootPath,'config');
      }

      if(opts.rootPath){
        rootPath = opts.rootPath;
        modelPath = path.join(opts.rootPath,'models');
        controllerPath = path.join(opts.rootPath,'controllers');
        configPath = path.join(opts.rootPath,'config');
      }

      if(opts.modelPath){
        modelPath = opts.modelPath;
      }

      if(opts.controllerPath){
        controllerPath = opts.controllerPath;
      }

      if(opts.configPath){
        configPath = options.configPath;
      }

    } else {
      rootPath= require('path').dirname(require.main.filename);
      modelPath = path.join(rootPath,'models');
      controllerPath = path.join(rootPath,'controllers');
      configPath = path.join(rootPath,'config');
    }

    var dbHost = require(path.join(configPath, 'db.js')).host;
    //  Database connection
    mongoose.connect(dbHost);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'error with MongoDB : \n '));
    // If the connection succeed
    db.once('open', function callback () {

      require(path.join(configPath, 'auth.js')).initAuthentication();

      require('./APIgenerator.js').generateAPI(app, {modelPath: modelPath, configPath: configPath, controllerPath: controllerPath}, cb);

      app.listen(port);

      console.log('API launched Listening on port ' + port);
    });

  },

  configPath: function(){
    return configPath;
  },

  modelPath: function(){
    return modelPath;
  },

  controllerPath: function(){
    return controllerPath;
  }



};


