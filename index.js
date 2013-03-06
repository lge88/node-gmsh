var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var shortId = require('shortid');
var Q = require('q');
// var fifojs = require('fifojs');

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var _ = require('lodash');

// mkdirp(__dirname + '/tmp');

process.on('exit', function() {
  console.log('clean up');
  exec('rm -rf ' + __dirname + '/tmp/*');
});

process.on('SIGINT', function () {
  process.exit();
});

// process.stdout.on('data', function() {
//   console.log('stdout:', data);
// });

// process.stderr.on('data', function() {
//   console.log('stderr:', data);
// });

var gmsh = function(source, format) {
  if (!(this instanceof gmsh)) {
    return new gmsh(source, format);
  }

  format || (format = 'geo');
  this.inFile = '/tmp/gmsh.in.' + shortId.generate() + '.' + format;
  this.outFile = '/tmp/gmsh.out.' + shortId.generate();

  fs.writeFileSync(this.inFile, source);

  this.cmdOptions = [];
  this.msh = '';
  return this;
};

gmsh.prototype.options = function(opt) {
  if (typeof opt === 'string') {
    opt = opt.trim().replace(/\s+/, ' ').split(' ');
  } else if (Array.isArray(opt)){

  } else {
    return this.cmdOptions;
  }
  this.cmdOptions = this.cmdOptions.concat(opt);
  return this;
};

gmsh.prototype.mesh = function() {
  var deferred = Q.defer();
  var cmd = 'gmsh';
  var args = this.options();
  args = _.isEmpty(args) ? ['-3', '-format', 'msh'] : args;
  
  var _this = this;
  var child = spawn(cmd, args.concat([
      path.resolve(this.inFile),
      '-o',
      path.resolve(this.outFile)
    ]));

  child.on('exit', function() {
    fs.readFile(_this.outFile, 'utf8', function(e, data) {
      if (e) {
        fs.unlink(_this.outFile);
        deferred.reject(e);
      } else {
        fs.unlink(_this.inFile);
        fs.unlink(_this.outFile);
        deferred.resolve(data);
      }
    });
  });
  
  child.stdout.on('data', function(d) {
    deferred.notify({
      type : 'stdout',
      data : d
    });
  });
  
  child.stderr.on('data', function(d) {
    deferred.notify({
      type : 'stderr',
      data : d
    });
  });

  return deferred.promise;
};

gmsh.prototype.exec = gmsh.prototype.run = gmsh.prototype.mesh;

module.exports = gmsh;
