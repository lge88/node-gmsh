var request = require('request');

var t1 = [
  'lc = 5e-3;',
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

request.post('http://localhost:9999', {
  form : {
    format : 'geo',
    options : '-3 -format msh',
    data : t1
  }
}, function (error, response, body) {
  if (error) {
    console.error(error);
    return;
  }
  
  if (response.statusCode == 200) {
    console.log('response:', body);
  } else {
    console.log('error:', body);
  }
});

setTimeout(function() {
  console.log('Test error handling...');
  request.post('http://localhost:9999', {
    form : {
      format : 'geo',
      options : '-3 format msh',
      data : t1
    }
  }, function (error, response, body) {
    if (error) {
      console.error(error);
      return;
    }
    
    if (response.statusCode == 200) {
      console.log('response:', body);
    } else {
      console.log('error:', body);
    }
  });
}, 2000);