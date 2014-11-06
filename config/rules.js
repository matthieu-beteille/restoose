/*
    File specifying which middleware function apply to which methods
 */


module.exports = {

  /*
    BELOW AN EXAMPLE TO UNDERSTAND HOW IT WORKS :

   // The method called 'everybody'  exposed in config/middleware.js, will be called for every actions and every controllers method WHICH ARE NOT SPECIFIED in this file
   '*': ['everybody'],


    user : {

      // The method 'everybody'  exposed in config/middleware.js, will be called as a middleware for every user's actions if the action is not specified in this object
      '*': ['everybody2'],

      //The methods 'create' and 'test' will be called as middlewares for user's create action (in the array order, first create(), then test()) : POST /api/user
      create: ['create', 'test'],

      //The methods  'edit' and 'test' will be called as middlewares  for user's edit action : PUT /api/user/:id
      edit: ['edit', 'test'],

      //The methods 'delete' and 'test' will be called  as middlewares for user's delete action : DELETE /api/user/:id
      delete: ['delete', 'test'],

     //The methods 'get and 'test' will be called  as middlewares for user's get action : GET /api/user/:id
      get: ['get', 'test'],

      //The methods 'delete' and 'test' will be called as middlewares  for user's query action : GET /api/user
      query: ['query', 'test'],

      // To apply middlewares to a nested object
      dog : {
              // The method 'everybodyNested' will be called as a middleware for every user's dog actions, if the action is not specified
              '*': ['everybodyNested'],
              // test() called as a middleware when POST /user/:id/dog
              create: ['test'],
              // test() called as a middleware when PUT /user/:id/dog
              edit: ['test'],
              // test() called as a middleware when DELETE /user/:id/dog
              remove: ['test'],
              // test() called as a middleware when POST /user/:record/dog/:id
              set: ['test'],
              // test() called as a middleware when GET /user/:id/dog
              get: ['test']
            },

      weapons : {
                 // test() and test2() will be called as middlewares when POST /api/user/:record/weapons/:id
                  addTo: ['test', 'test2'],
                  // test() and test2() will be called as middlewares when DELETE /api/user/:record/weapons/:id
                  removeFrom: ['test', 'test2'],
                  // test() and test2() will be called as middlewares when POST /api/user/:record/weapons
                  createAndAddTo:  ['test', 'test2'],
                  // test() and test2() will be called as middlewares when GET /api/user/:record/weapons
                  getCollection: ['test', 'test2'],
                  // test() and test2() will be called as middlewares when GET /api/user/:record/weapons/:id
                  getCollectionItem: ['test', 'test2']
                }
    },


    'userController': {
      // test() will be called as a middleware when hitting the route bound to test() method in routes.js
      test: ['test']
    } */

};