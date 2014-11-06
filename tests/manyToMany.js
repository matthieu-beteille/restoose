var assert = require('assert');
var should = require('should');
var request = require('supertest');
var _ = require('underscore');
var mongoose = require('mongoose');

var expressApp = require('./index');


describe('Groups : example of nested collection (manyToMany)', function(){

  var agent, groupId, id;
  var newGroup = {name: 'bleu'};
  var newUser = {
    username: 'test22',
    age: 15
  };


  before(function(done){
    agent =  request.agent(expressApp);
    agent
      .post('/api/user')
      .send(newUser)
      .end(function (err, res) {
        id=res.body._id;
        done();
      });
  });

  after(function(done){
    User.remove().exec(function(err, users){
      Group.remove(function(err, groups){
        done()
      });
    });
  });

  it('should create a new group for a specific user', function(done){
    agent
      .post('/api/user/' + id + '/groups')
      .send(newGroup)
      .end(function(err, res){
        assert(res.status==200);
        res.body.name.should.be.ok;
        res.body._id.should.be.ok;
        res.body.users.should.be.ok;
        Group.findOne(newGroup).exec(function(err, group){
          groupId=group._id;
          assert(group.name == newGroup.name);
          group.should.be.ok;
          assert(group.users.length==1);
          assert(group.users[0].toString()==id.toString());
          User.findById(id).exec(function(err, user){

            assert(user.groups.length==1);
            assert(user.groups[0].toString()==group._id.toString());
            done();
          })
        });
      });
  });

  it('should try to add an already added group to an user', function(done){
    agent
      .post('/api/user/' + id + '/groups/' + groupId)
      .send(newGroup)
      .end(function(err, res){

        res.body._id.should.be.ok;
        res.body.name.should.be.ok;
        res.body.users.should.be.ok;
        assert(res.status==200);
        User.findById(id).exec(function(err, user){
          assert(user.groups.length==1);
          done();
        });
      });
  });

  it('should retrieve a nested collection (manyToMany)', function(done){
    agent
      .get('/api/user/' + id + '/groups')
      .end(function(err, res){

        assert(res.status==200);
        assert(Array.isArray(res.body));
        assert(res.body.length==1);
        assert(res.body[0].name==newGroup.name);
        res.body[0].users.should.be.ok;
        done();
      });
  });

  it('should delete an item from a collection (manyToMany)', function(done){
    agent
      .delete('/api/user/' + id + '/groups/' + groupId)
      .end(function(err, res){
        res.body.name.should.be.ok;
        res.body.users.should.be.ok;
        assert(res.status==200);
        User.findById(id).exec(function(err, user){
          assert(user.groups.length==0);
          Group.findById(groupId).exec(function(err, group){
            assert(group.users.length==0);
            done();
          })
        });
      });
  });


});