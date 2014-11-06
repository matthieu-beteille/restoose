module.exports = {
  get: function(req, res){
    res.json('override');
    console.log(User);
  }
};