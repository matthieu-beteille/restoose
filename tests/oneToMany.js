var assert = require('assert');
var should = require('should');
var request = require('supertest');
var _ = require('underscore');
var mongoose = require('mongoose');

var expressApp = require('./index');

describe('Weapons : example of nested collection (oneToMany) (many-side)', function() {

  var id, agent, weaponId;

  var newWeapon = {name: 'ak47'};

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
      Weapon.remove(function(err, groups){
        done()
      });
    });
  });

  it('should create a new weapon for a specific user', function(done){
    agent
      .post('/api/user/' + id + '/weapons')
      .send(newWeapon)
      .end(function (err, res) {
        assert(res.status==200);
        assert(res.body.owner==id);
        Weapon.findOne(newWeapon).exec(function(err, weapon){
          weaponId=weapon._id;
          assert(weapon.name=='ak47');
          assert(weapon.owner==id);
          User.findById(id).exec(function(err, user){
            var a  = user.weapons[0];
            var b = weapon._id;
            assert(a.toString()== b.toString());
            done();
          });
        });
      });
  });

  it('should retrieve a nested collection', function(done){
    agent
      .get('/api/user/' + id + '/weapons')
      .end(function (err, res) {
        assert(res.status==200);
        assert(Array.isArray(res.body));
        assert(res.body[0]._id==weaponId);
        assert(res.body.length==1);
        done();
      });
  });

  it('should retrieve an user and populate the nested collection', function(done){
    agent
      .get('/api/user/' + id )
      .send({populate: 'weapons'})
      .end(function (err, res) {
        
        assert(res.status==200);
        assert(Array.isArray(res.body.weapons));
        assert(res.body.weapons[0].name=='ak47');
        assert(res.body.weapons[0]._id==weaponId);
        done();
      });
  });

  it('should retrieve a nested collection item', function(done){
    agent
      .get('/api/user/' + id + '/weapons/' + weaponId )
      .end(function (err, res) {
        
        assert(res.status==200);
        assert(res.body.name==newWeapon.name);
        assert(res.body._id==weaponId);
        done();
      });
  });

  it('should retrieve a nested collection item and populate', function(done){
    agent
      .get('/api/user/' + id + '/weapons/' + weaponId)
      .send({populate: 'owner'})
      .end(function (err, res) {
        assert(res.body.owner.username == newUser.username);
        assert(res.body.owner._id==id);
        done();
      });
  });

  it('should delete a resource from a collection', function(done){
    agent
      .delete('/api/user/' + id + '/weapons/' + weaponId )
      .end(function (err, res) {
        Weapon.findById(weaponId).exec(function(err, weapon){
          assert(weapon.owner == undefined);
          User.findById(id).exec(function(err, user){
            assert(user.weapons.length==0);
            done();
          });
        });
      });
  });

  it('should add a new weapon to a collection', function(done){
    var weapon = new Weapon({name: 'm4a1'});
    weapon.save(function(err){
      agent
        .post('/api/user/' + id + '/weapons/' + weapon._id )
        .end(function (err, res) {
          assert(res.status==200);
          Weapon.findById(weapon._id).exec(function(err, weapon){
            assert(weapon.owner == id);
            User.findById(id).exec(function(err, user){
              assert(user.weapons.length==1);
              assert(user.weapons[0].toString()==weapon._id.toString());
              done();
            });
          });
        });
    });
  });

});

describe('Weapons : example of nested collection (oneToMany) (one-side)', function() {

  var newWeapon = {name: 'knife'};


  var newUser = {
    username: 'test22',
    age: 15
  };

  before(function(done){
    agent =  request.agent(expressApp);
    agent
      .post('/api/weapon')
      .send(newWeapon)
      .end(function (err, res) {
        weaponId=res.body._id;
        done();
      });
  });

  after(function(done){
    User.remove().exec(function(err, users){
      Weapon.remove(function(err, groups){
        done()
      });
    });
  });

  it('should create an owner for a specific weapon', function(done){
    agent
      .post('/api/weapon/' + weaponId + '/owner')
      .send(newUser)
      .end(function (err, res) {
        
        res.body.username.should.be.ok;
        res.body.age.should.be.ok;
        assert(res.status==200);
        User.findById(res.body._id).exec(function(err, user){
          user.should.be.ok;
          assert(user.username==newUser.username);
          assert(user.age==newUser.age);
          var contains = false;
          _.each(user.weapons, function(id){
            if(id.toString()==weaponId.toString()){contains=true;}
          });
          assert(contains);
          done();
        });
      });
  });

  it('should set a weapon owner', function(done){
    User.create(newUser, function(err, user){
      var userId=user._id;
      Weapon.create(newWeapon, function(err, weapon){
        var weaponId = weapon._id;
        agent
          .post('/api/weapon/' + weaponId + '/owner/' + userId)
          .send(newUser)
          .end(function (err, res) {
            assert(res.status==200);
            res.body.username.should.be.ok;
            res.body.age.should.be.ok;
            User.findById(userId).exec(function(err, user){
              var contains = false;
              _.each(user.weapons, function(id){
                if(id.toString()==weaponId.toString()){contains=true;}
              });
              assert(contains);
              Weapon.findById(weaponId).exec(function(err, weapon){
                var contains = false;
                _.each(user.weapons, function(id){
                  if(id.toString()==weaponId.toString()){contains=true;}
                });
                assert(contains);
                done();
              });

            })
          })
      })
    })
  });

  it('should remove a user from a weapon', function(done){
    agent
      .delete('/api/weapon/' + weaponId + '/owner')
      .end(function (err, res) {
        assert(res.status==200);
        
        res.body.username.should.be.ok;
        res.body.age.should.be.ok;
        Weapon.findById(weaponId).exec(function(err, weapon){
          assert(weapon.owner==null ||weapon.owner ==undefined);
          
          User.findById(res.body._id).exec(function(err, user){
            assert(user.weapons.length==0);
            done();
          })
        });
      });
  });


});

