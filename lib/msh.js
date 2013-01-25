var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var geo = require('./geo.js');
var fs = require('fs');

function makePipeForce(name, next) {
    var cb = function(err, stdout, stderr) {
        if (err) {
            console.error(err);
            return;
        } else {
            exec('mkfifo ' + name, next);
        }
    };
    debugger;
    fs.exists(name, function(exists) {
        if (exists) {
            fs.unlink(name, function(err) {
                if(err) {
                    console.error(err);
                    return;
                }
                cb();
            });
        } else {
            cb();
        }
    });
}



function mesh(obj, opt, cb) {
    var options = Array.isArray(opt) ? opt : parseOptions(opt);
    var inFileName = '/dev/stdin';
    var outFileName = '/tmp/tmp.msh';

    function execGmsh() {
        spawn('gmsh', options.concat([inFileName, '-o', outFileName]),
            function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error) {
                    console.log('exec error: ' + error);
                }

                var data = fs.readFile(tmp_out, function(err, data) {
                    debugger;
                    if (err) {
                        console.log('Error: ', err);
                        socket.emit('gmesh-stderr', err);
                    } else {
                        socket.emit('mesh-created', data.toString());
                        fs.unlinkSync(tmp_out);
                    }
                    if (socket.__geo_tmp === true) {
                        fs.unlinkSync(socket.__geo_file_name);
                    }
                });
            }
        );
    }

    makePipeForce(outFileName, function(err, stdout, sterr){
        debugger;
        if (err) {
            console.error(err);
            return;
        } else {
            var child = spawn('gmsh ', options.concat([inFileName, '-o', outFileName]));
            exports.child = child;
            var str = typeof obj === 'string' ? obj : geo.parseObject(obj);
            debugger;
            child.on('exit', function(code) {
                if (code !== 0) {
                    console.log('gmsh process exited with code ' + code);
                }
                fs.unlinkSync(outFileName);
            });
            child.stdout.on('data', cb);
            
            child.stdin.write(str);
            
            child.stdin.end();
            
        }
    });

 
    

}

function parseOptions(opt) {
    var arr = [];

    // arr = ['-3','-format','msh'];
    
    return arr;
}

exports.mesh = mesh;
exports.makePipeForce = makePipeForce;
exports.parseOptions = parseOptions;
