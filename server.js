var express = require('express'), http = require('http'), path = require('path');
var gmsh = require('./index.js');

var app = express();
app.configure(function(){
  app.set('port', process.env.PORT || 9999);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.post('/', function(req, res) {
  var body = req.body;
  gmsh(body.data)
    .options(body.options)
    .mesh()
    .then(function(data) {
      res.send(200, data);
    })
    .progress(function(msg) {
      console.log('' + msg.data);
    })
    .fail(function(err) {
      console.error(err);
      res.json(400, err);
    })
    .done();
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Gmsh server listening on port " + app.get('port'));
});
