var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var shortId = require('shortid');
// var fifojs = require('fifojs');

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var _ = require('lodash');

mkdirp(__dirname + '/tmp');

process.on('exit', function() {
  console.log('clean up');
  exec('rm -rf ' + __dirname + '/tmp/*');
});

process.on('SIGINT', function () {
  process.exit();
});

process.stdout.on('data', function() {
  console.log('stdout:', data);
});

process.stderr.on('data', function() {
  console.log('stderr:', data);
});

var gmsh = function(source, format) {
  if (!(this instanceof gmsh)) {
    return new gmsh(source, format);
  }

  format || (format = 'geo');
  this.inFile = __dirname + '/tmp/in.' + shortId.generate() + '.' + format;
  this.outFile = __dirname + '/tmp/out.' + shortId.generate();

  fs.writeFileSync(this.inFile, source);

  this.cmdOptions = '';
  this.msh = '';
  return this;
};

gmsh.prototype.options = function(opt) {
  if (typeof opt === 'string') {
    this.cmdOptions += opt;
  } else if (Array.isArray(opt)){
    this.cmdOptions += opt.join(' ');
  }
  return this;
};

gmsh.prototype.mesh = function(cb) {
  var cmd = ['gmsh']
    .concat(this.cmdOptions || '-3 -format msh')
    .concat([
      path.resolve(this.inFile),
      '-o',
      path.resolve(this.outFile)
    ]).join(' ');

  var _this = this;
  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      fs.unlink(_this.inFile);
      return cb(err);
    }
    
    return fs.readFile(_this.outFile, 'utf8', function(e, data) {
      if (e) {
        fs.unlink(_this.outFile);
        return cb(e);
      } else {
        fs.unlink(_this.inFile);
        fs.unlink(_this.outFile);
        _this.msh = data;
        return cb(null, data, stdout, stderr);
      }
    });
  });

  return this;
};

gmsh.prototype.exec = gmsh.prototype.run = gmsh.prototype.mesh;

module.exports = gmsh;
