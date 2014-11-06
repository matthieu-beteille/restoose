var assert = require('assert');
var should = require('should');
var request = require('supertest');
var _ = require('underscore');
var mongoose = require('mongoose');

var expressApp = require('./index');

var agent;

var userAndCollection = {
  username: 'test',
  age: 15,
  weapons: [{name: 'uzi'}, {name: 'deagle'}]
  };

var newUser = {
  username: 'test1',
  age: 15
};

var editedUser =  {
  username:'test2',
  age: 22
};

var id;

describe('User : example of classic resource', function() {

  before(function(){
    agent =  request.agent(expressApp);
  });

  it('should create a new user', function(done){
    agent
      .post('/api/user')
      .send(newUser)
      .end(function (err, res) {
        assert(res.status==200);
        id=res.body._id;
        res.body.username.should.be.ok;
        res.body.age.should.be.ok;
        assert(res.body.username==newUser.username);
        assert(res.body.age==newUser.age);
        User.findById(id).exec(function(err, user){
          assert(newUser.username==user.username);
          assert(newUser.age)==newUser.age;
          done();
        });
      });
  });

  xit('should create a new user and its nested collection', function(done){
    agent
      .post('/api/user')
      .send(userAndCollection)
      .end(function (err, res) {
        assert(res.status==200);
        done();
      });
  });

  it('should edit an existing user', function(done){
    agent
      .put('/api/user/' + id)
      .send(editedUser)
      .end(function (err, res) {
        assert(res.status==200);
        assert(res.body.username==editedUser.username);
        assert(res.body.age==editedUser.age);
        User.findById(id).exec(function(err, user){
          assert(editedUser.username==user.username);
          assert(editedUser.age)==newUser.age;
          done();
        });
      });
  });

  it('should retrieve a specific user', function(done){
    agent
      .get('/api/user/' + id)
      .end(function (err, res) {
        assert(res.status==200);
        assert(res.body.username==editedUser.username);
        assert(res.body.age==editedUser.age);
        User.findById(id).exec(function(err, user){
          assert(editedUser.username==user.username);
          assert(editedUser.age)==newUser.age;
          done();
        });
      });
  });


  it('should retrieve every users', function(done){
    agent
      .get('/api/user/')
      .end(function (err, res) {
        assert(res.status==200);
        assert(Array.isArray(res.body));
        assert(res.body[0].username==editedUser.username);
        assert(res.body[0].age==editedUser.age);
        done();
      });
  });

  it('should delete an existing user', function(done){
    agent
      .delete('/api/user/' + id)
      .end(function (err, res) {
        assert(res.status==200);
        User.findById(id).exec(function(err, user){
          (user===undefined || user===null).should.be.true;
          done();
        });
      });
  });
});


