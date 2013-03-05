var gmsh = require('../index.js');
var fs = require('fs');
// t1.geo
var t1 = [
  'lc = 1e-2;',
  'Point(1) = {0, 0, 0};',
  'Point(2) = {.1, 0,  0} ;',
  'Point(3) = {.1, .3, 0} ;',
  'Point(4) = {0,  .3, 0} ;',
  // 'Point(1) = {0, 0, 0, lc};',
  // 'Point(2) = {.1, 0,  0, lc} ;',
  // 'Point(3) = {.1, .3, 0, lc} ;',
  // 'Point(4) = {0,  .3, 0, lc} ;',
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

var m = gmsh(t1, 'geo')
  .options(['-3', '-format', 'msh'])
  .mesh(function(err, data, stdout, stderr){
    if (err) {
      console.error(err);
      return;
    } else {
      console.log('msh:', m.msh);
      console.log('stdout:\n', stdout);
      console.log('stderr:\n', stderr);
    }
  });

