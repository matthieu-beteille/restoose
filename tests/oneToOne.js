var assert = require('assert');
var should = require('should');
var request = require('supertest');
var _ = require('underscore');
var mongoose = require('mongoose');

var expressApp = require('./index');

describe('User and dog : OneToOne', function(){

  var newUser = {
    username: 'test22',
    age: 15
  };
  var newDog = {name: 'rex'};
  var editedDog = {name: 'roger'};
  var id, dogId, agent;

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
      Dog.remove(function(err, groups){
        done()
      });
    });
  });

  it('should create a dog for an user', function(done){
    agent
      .post('/api/user/' + id + '/dog')
      .send(newDog)
      .end(function (err, res) {
        
        res.body.name.should.be.ok;
        res.body.owner.should.be.ok;
        assert(res.status==200);
        Dog.findOne(newDog).exec(function(err, dog){
          dogId = dog._id;
          dog.should.be.ok;
          assert(dog.name==newDog.name);
          assert(dog.owner==id);
          User.findById(id).exec(function(err, user){
            assert(user.dog.toString()==dog._id.toString());
            done();
          })
        });
      });
  });

  it('should delete a dog from an user', function(done){
    agent
      .delete('/api/user/' + id + '/dog/' )
      .send(newDog)
      .end(function (err, res) {
        
        assert(res.status==200);
        res.body.name.should.be.ok;
        assert(res.status==200);
        Dog.findById(dogId).exec(function(err, dog){
          assert(dog.owner == undefined);
          User.findById(id).exec(function(err, user){
            assert(user.dog==undefined || user.dog == null);
            done();
          })
        });
      });
  });

  it('should add an existing dog to an user', function(done){
    var dog = Dog.create({name: 'bob'}, function(err, dog){
      dogId = dog._id;
      agent
        .post('/api/user/' + id + '/dog/' + dog._id)
        .end(function (err, res) {
          
          res.body.name.should.be.ok;
          assert(res.status==200);
          Dog.findOne(dog._id).exec(function(err, dog){
            dog.should.be.ok;
            assert(dog.name=='bob');
            assert(dog.owner==id);
            User.findById(id).exec(function(err, user){
              assert(user.dog.toString()==dog._id.toString());
              done();
            })
          });
        });
    });
  });

  it('should retrieve a nested object', function(done){
    agent
      .get('/api/user/' + id + '/dog')
      .end(function (err, res) {
        
        assert(res.status==200);
        
        res.body.name.should.be.ok;
        assert(res.body._id.toString()==dogId.toString());
        done();
      });
  })

  it('should retrieve a nested object and populate a field', function(done){
    agent
      .get('/api/user/' + id + '/dog')
      .send({populate: 'owner'})
      .end(function (err, res) {
        assert(res.status==200);
        res.body.name.should.be.ok;
        
        assert(res.body.owner.username==newUser.username);
        done();
      });
  });

  it('should edit a nested object and populate a field', function(done){
    agent
      .put('/api/user/' + id + '/dog')
      .send(editedDog)
      .end(function (err, res) {
        assert(res.status==200);
        assert(res.body.name==editedDog.name);
        User.findById(id).populate('dog').exec(function(err, user){
          assert(user.dog.name==editedDog.name);
          done();
        });
      });
  })

});

describe('User and cat : not reflexive OneToOne', function(){

  var newCat = {name: 'felix'};
  var editedCat = {name: 'minou'};
  var newUser = {
    username: 'test22',
    age: 15
  };
  var id, catId, agent;


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
      Dog.remove(function(err, groups){
        done()
      });
    });
  });

  it('should create a cat for an user', function(done){
    agent
      .post('/api/user/' + id + '/cat')
      .send(newCat)
      .end(function (err, res) {
        
        assert(res.status==200);
        Cat.findOne(newCat).exec(function(err, cat){
          catId = cat._id;
          cat.should.be.ok;
          assert(cat.name==newCat.name);
          User.findById(id).exec(function(err, user){
            assert(user.cat.toString()==cat._id.toString());
            done();
          })
        });
      });
  });

  it('should delete a cat from an user', function(done){
    agent
      .delete('/api/user/' + id + '/cat/' )
      .send(newCat)
      .end(function (err, res) {
        
        assert(res.status==200);
        Cat.findById(catId).exec(function(err, cat){
          assert(cat.owner == undefined);
          User.findById(id).exec(function(err, user){
            assert(user.cat==undefined || user.cat == null);
            done();
          })
        });
      });
  });

  it('should add an existing cat to an user', function(done){
    var cat = Cat.create({name: 'bob'}, function(err, cat){
      catId = cat._id;
      agent
        .post('/api/user/' + id + '/cat/' + cat._id)
        .end(function (err, res) {
          
          assert(res.status==200);
          Cat.findOne(cat._id).exec(function(err, cat){
            cat.should.be.ok;
            assert(cat.name=='bob');
            User.findById(id).exec(function(err, user){
              assert(user.cat.toString()==cat._id.toString());
              done();
            })
          });
        });
    });
  });

  it('should retrieve a nested object', function(done){
    agent
      .get('/api/user/' + id + '/cat')
      .end(function (err, res) {
        
        assert(res.status==200);
        
        assert(res.body._id.toString()==catId.toString());
        done();
      });
  });


  it('should edit a nested object', function(done){
    agent
      .put('/api/user/' + id + '/cat')
      .send(editedCat)
      .end(function (err, res) {
        assert(res.status==200);
        assert(res.body.name==editedCat.name);
        User.findById(id).populate('cat').exec(function(err, user){
          assert(user.cat.name==editedCat.name);
          done();
        });
      });
  })

});
