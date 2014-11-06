/*
*   This method will be called once, before generating the API, you can initialize your passport here for example
* */

  module.exports = {
  initAuthentication: function(expressApp){
    console.log('Authentication..');
  }
};