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
  var m = gmsh(body.data)
    .options(body.options)
    .mesh(function(err, data, stdout, stderr){
      if (err) {
        console.error(err);
        res.json(400, err);
      } else {
        res.send(200, data);
      }
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Gmsh server listening on port " + app.get('port'));
});
