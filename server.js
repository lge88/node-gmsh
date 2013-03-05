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
  debugger;
  var body = req.body;
  var m = gmsh(body.data, body.format || 'geo')
    // Doesn't work for now
    // .onOutStream('data', function(data) {
    //   res.write(data);
    // })
    .options(body.options || '-3 -format msh')
    .mesh(function(err, stdout, stderr){
      if (err) {
        debugger;
        console.error(err);
        res.json(400, err);
      } else {
        // res.status(200).set('Content-Type', 'text/plain').end(m._mshCache);
        res.send(m._mshCache);
      }
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Gmsh server listening on port " + app.get('port'));
});
