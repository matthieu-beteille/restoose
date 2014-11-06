/*
    File specifying which middleware function apply to which methods IN DEV
 */


module.exports = {

   // '*': ['everybody'],

    user : {
 //     '*': ['everybody2'],
      create: ['create', 'test'],
     // edit: ['edit', 'test'],
      delete: ['delete', 'test'],
      get: ['get', 'test'],
      query: ['query', 'test'],

      dog : {
              '*': ['everybodyNested'],
              //create: ['test'],
              edit: ['test'],
              remove: ['test'],
              set: ['test']
              //get: ['test']
            },

      weapons : {
                 // addTo: ['test', 'test2'],
                  //removeFrom: ['test', 'test2'],
                  createAndAddTo:  ['test', 'test2'],
                  getCollection: ['test', 'test2'],
                  getCollectionItem: ['test', 'test2']
                }
    },

    'userController': {
      test: ['test']
    }
};