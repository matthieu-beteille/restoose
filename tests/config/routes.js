/*

Here you have to declare the routes and the couple function/controller they should match

  The exported object should be a hashmap where :

  The key must be a string respecting the following format :   'method route'

  The value lue must contain the controller name, and the function to match within this controller

  Example :

             'get /user/:id': {
                controller: "userController",
                action: 'getUser'
             }

             When the route /user/:id is hit with the HTTP method GET, the method getUser() in the controller userController is called


 */

module.exports = {

  'get /test': {
    controller: "userController",
    action: 'test'
  },

  'post /test': {
    controller: "userController",
    action: 'test'
  },

  'delete /test': {
    controller: "userController",
    action: 'test'
  },

  'put /test': {
    controller: "userController",
    action: 'test'
  },

  'get /cat': {
    controller: "catController",
    action: 'get'
  }

};