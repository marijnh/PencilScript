var ps = PencilScript;

var preludeControl = function(){/*
  <style>
    @font-face {
      font-family: 'PT Mono';
      font-style: normal;
      font-weight: 400;
      src: local('PT Mono'), local('PTMono-Regular'), url(http://themes.googleusercontent.com/static/fonts/ptmono/v1/jmle3kzCPnW8O7_gZGRDlQ.woff) format('woff');
    }
  </style>
*/};


var col = {cpu: "#44f", io: "#c22"};

function controlSync(y, parts) {
  var x = 0, factor = 2;
  for (var i = 0; i < parts.length; i+=2) {
    var size = parts[i], type = parts[i+1];
    var x2 = x + size * factor;
    if (type != null)
      ps.line({stroke: col[type], strokeWidth: type == "cpu" ? 3 : 1,
               startX: x, startY: y, endX: x2, endY: y});
    if (type == "io") dot(x, y);
    x = x2;
  }
}

picture("control-io", {prelude: preludeControl}, function() {
  ps.text({left: 0, top: 0, text: "synchronous, single thread of control", fontFamily: "PT Mono"});
  var y = 28.5;
  controlSync(y, [5, "cpu", 40, "io", 5, "cpu", 50, "io", 10, "cpu"]);
  ps.text({left: 0, top: y + 12, text: "synchronous, two threads of control", fontFamily: "PT Mono"});
  y += 40;
  controlSync(y, [5, "cpu", 40, "io", 10, null, 10, "cpu"]);
  y += 15;
  controlSync(y, [5, "cpu", 50, "io", 5, "cpu"]);
  ps.text({left: 0, top: y + 12, text: "asynchronous", fontFamily: "PT Mono"});
  y += 40;
  ps.line({stroke: col.io, fill: "none", path: "M 10 " + y + " a 20 20 0 0 0 20 20 l 30 0 a 20 20 0 0 0 20 -20"});
  ps.line({stroke: col.io, fill: "none", path: "M 20 " + y + " a 10 10 0 0 0 10 10 l 70 0 a 10 10 0 0 0 10 -10"});
  controlSync(y, [15, "cpu"]);
  controlSync(y, [5, null, 0, "io", 5, null, 0, "io", 30, null, 5, "cpu", 10, null, 10, "cpu"]);
//  controlSync(y, [55, null, 10, "cpu"]);
//  controlSync(y, [40, null, 5, "cpu"]);
});
