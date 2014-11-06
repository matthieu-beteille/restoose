var assert = require('assert');
var should = require('should');
var request = require('supertest');
var _ = require('underscore');
var mongoose = require('mongoose');

var expressApp = require('./index');

describe('Custom test method', function() {

  before(function(done){
    agent =  request.agent(expressApp);
    done();
  });

  it('should return respond "test" with get ', function(done){
    agent
      .get('/test')
      .end(function (err, res) {
        assert(res.body=='test');
        done();
      });
  });

  it('should return respond "test" with delete ', function(done){
    agent
      .delete('/test')
      .end(function (err, res) {
        assert(res.body=='test');
        done();
      });
  });
  it('should return respond "test" with put ', function(done){
    agent
      .put('/test')
      .end(function (err, res) {
        
        assert(res.body=='test');
        done();
      });
  });
  it('should return respond "test" with post ', function(done){
    agent
      .post('/test')
      .end(function (err, res) {
        
        assert(res.body=='test');
        done();
      });
  });

  it('should override cat query method', function(done){
    agent
      .get('/cat')
      .end(function (err, res) {
        
        assert(res.body=='override');
        done();
      });
  })
});