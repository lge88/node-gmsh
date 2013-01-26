debugger;
var msh = require('../lib/msh.js');

// t1.geo
var t1 = [
    'lc = 2.5e-2;',
    'Point(1) = {0, 0, 0, lc};',
    'Point(2) = {.1, 0,  0, lc} ;',
    'Point(3) = {.1, .3, 0, lc} ;',
    'Point(4) = {0,  .3, 0, lc} ;',
    'Line(1) = {1,2} ;',
    'Line(2) = {3,2} ;',
    'Line(3) = {3,4} ;',
    'Line(4) = {4,1} ;',
    'Line Loop(5) = {4,1,-2,3} ;',
    'Plane Surface(6) = {5} ;',
    'Physical Point(1) = {1,2} ;',
    'MyLine = 99;',
    'Physical Line(MyLine) = {1,2,4} ;',
    'Physical Surface("My fancy surface label") = {6} ;',
    'Field[1] = Box;',
    'Recombine Surface {6};'
].join('\n');

msh.mesh(t1, ['-3', '-format', 'msh'], function(stream, stdout, stderr) {
    debugger;
    // console.log('', data.toString());
    stream.on('open', function() {
        console.log('Stream opened');
    });
    
    stream.on('data', function(data) {
        console.log('Data Stream:', data.string());
    });
    
    stream.on('end', function() {
        console.log('Stream end:');
    });
    
    stream.on('error', function(err) {
        console.error(err);
    });
    
    console.log('stdout:', stdout.toString());
    console.log('stderr:', stderr.toString());
});

