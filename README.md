# node-gmsh #
Node.js binding for Gmsh.

## Basic Usage ##
node-gmsh provides a chain API which is inspired by [gm](https://github.com/aheckmann/gm).

    var gmsh = require('gmsh');
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

    gmsh(t1, 'geo')
        .dimension(3)
        .write('/path/to/t1.msh', function(err){
            if (!err) console.log('done');
        });
