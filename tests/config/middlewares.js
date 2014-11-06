/*
* TODO: Define a middleware system
* */

 module.exports = {

	create : function(req, res, next){

    /*res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');*/

    console.log('create');

    next();
	},

   edit : function(req, res, next){
     console.log('edit');
     next();
   },

   get: function(req, res, next){
     console.log('get');
     next();
   },

   query: function(req, res, next){
     console.log('query');
     next();
   },

   delete: function(req, res, next){
     console.log('delete');
     next();
   },

   test: function(req, res, next){
     console.log('test');
     next();
   },

   test2: function(req, res, next){
     console.log('test2');
     next();
   },

   everybody: function(req, res, next){
     console.log('everybody');
     next();
   },

   everybody2: function(req, res, next){
     console.log('everybody2');
     next();
   },

   everybodyNested: function(req, res, next){
     console.log('everybodyNested');
     next();
   }
};