var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var shortId = require('shortid');
var fifojs = require('fifojs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var _ = require('lodash');

mkdirp(__dirname + '/tmp');
// var inFifo = __dirname + '/tmp/in.' + shortId.generate() + '.fifo';
// var outFifo = __dirname + '/tmp/out.' + shortId.generate() + '.fifo';
// fifojs.mkfifo(inFifo, 0777);
// fifojs.mkfifo(outFifo, 0777);

process.on('exit', function() {
  console.log('clean up');
  exec('rm -rf ' + __dirname + '/tmp/*');
  // fs.unlink(outFifo);
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

  var inFifo = __dirname + '/tmp/in.' + shortId.generate() + '.fifo';
  var outFifo = __dirname + '/tmp/out.' + shortId.generate() + '.fifo';
  fifojs.mkfifo(inFifo, 0777);
  fifojs.mkfifo(outFifo, 0777);
  
  var _this = this;
  this._in = inFifo;
  this._in = fs.createWriteStream(inFifo);

  this._in.on('open', function() {
    if (_this._pipe) {
      _this._source.pipe(_this._in);
      _this._in.destroySoon();
    } else {
      // FIXME: Without this line it won't work. Don't know why
      _this._in.write('\n');
      _this._in.write(_this._source);
      _this._in.end();
      _this._in.destroySoon();
    }
  });

  this._in.on('error', function(err) {
    console.log("gmsh in err", err);
  });
  
  if (typeof source === 'string') {
    if (!format) {
      this._pipe = true;
      this._source =fs.createReadStream(source);
    } else {
      this._pipe = false;
      if (format === 'geo') {
        this._source = source;
      }
    }
  } else if (source instanceof fs.ReadStream){
    this._pipe = true;
    this._source = source;
  }
  
  this._out = fs.createReadStream(outFifo);
  this._out.on('end', function() {
    console.log('gmsh out end');
    _this._out.destroy();
  });
  
  this._options = {};
  this._cmdOptions = '';
  this.geo = {};
  this._mshCache = '';
  return this;
};

gmsh.prototype.options = function(opt) {
  if (typeof opt === 'string') {
    this._cmdOptions += opt;
  } else if (Array.isArray(opt)){
    this._cmdOptions += opt.join(' ');
  } else if (typeof opt === 'object') {
    _.merge(this._options, opt);
  }
  return this;
};

gmsh.prototype.onOutStream = function(name, cb) {
  this._out.on(name, cb);
  return this;
};

gmsh.prototype.onData = function(cb) {
  this._out.on('data', cb);
  return this;
};

gmsh.prototype.writeOptionsToString = function() {
  
};

gmsh.prototype.mesh = function(cb1, cb2) {
  var cmd = ['gmsh']
    .concat(this._cmdOptions)
    .concat([
      path.resolve(this._in.path),
      '-o',
      path.resolve(this._out.path)
    ]).join(' ');

  var _this = this;

  var wrap = function(fn) {
    return function() {
      fn.apply(this, arguments);
      _this._out.destroy();
    };
  };
  
  this._out.on('data', function(data) {
    _this._mshCache += data.toString();
  });
  
  if (arguments.length >= 2 && _.isFunction(cb2)) {
    this._out.on('data', cb1);
    exec(cmd, wrap(cb2));
    // exec(cmd, cb2);
  } else {
    exec(cmd, wrap(cb1));
    // exec(cmd, cb1);
  }

  return this;
};

gmsh.prototype.exec = gmsh.prototype.run = gmsh.prototype.mesh;

module.exports = gmsh;
