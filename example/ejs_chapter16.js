function ext(conf, vals) {
  var obj = {};
  for (var prop in conf) obj[prop] = conf[prop];
  for (var prop in vals) obj[prop] = vals[prop];
  return obj;
}

var size = 80;
function axes(conf) {
  (conf.arrow ? ps.arrow : ps.line)(ext(conf, {startX: 0, endX: 0, startY: -size, endY: size}));
  (conf.arrow ? ps.arrow : ps.line)(ext(conf, {startX: -size, endX: size, startY: 0, endY: 0}));
}

var preludeTransform = function(){/*
  <style>
    @font-face {
      font-family: 'PT Mono';
      font-style: normal;
      font-weight: 400;
      src: local('PT Mono'), local('PTMono-Regular'), url(http://themes.googleusercontent.com/static/fonts/ptmono/v1/jmle3kzCPnW8O7_gZGRDlQ.woff) format('woff');
    }
    .caption { font-family: 'PT Mono'; font-size: 13px; }
  </style>
*/};

picture("transform", {prelude: preludeTransform}, function() {
  axes({stroke: "black"});
  axes({stroke: "#0a0", transform: "translate(50 50)"});
  ps.arrow({startX: 0, startY: 0, endX: 50, endY: 50, stroke: "#0a0"});
  axes({stroke: "#44f", transform: "translate(50 50) rotate(20)"});
  ps.arrow({startX: 110, startY: 50, endX: 110, endY: 72, stroke: "#44f"});
  ps.text({text: "translate(50, 50)", fill: "#0a0", left: 75, top: 15, class: "caption"});
  ps.text({text: "rotate(0.1*Math.PI)", fill: "#44f", left: 130, top: 55, class: "caption"});

  axes({stroke: "black", transform: "translate(360 0)"});
  axes({stroke: "#0a0", transform: "translate(360 0) rotate(20)"});
  ps.arrow({startX: 360, startY: -60, endX: 380, endY: -60, stroke: "#0a0"});
  axes({stroke: "#44f", transform: "translate(360 0) rotate(20) translate(50, 50)"});
  ps.arrow({startX: 360, startY: 0, endX: 390, endY: 65, stroke: "#44f"});
  ps.text({text: "rotate(0.1*Math.PI)", fill: "#0a0", left: 390, top: -60, class: "caption"});
  ps.text({text: "translate(50, 50)", fill: "#44f", left: 415, top: 45, class: "caption"});
});

size = 60;
picture("mirror", {prelude: preludeTransform}, function() {
  axes({stroke: "black", arrow: true});
  axes({stroke: "black", transform: "translate(200 0) scale(-1 1)", arrow: true});
  ps.line({startX: 100, startY: -65, endX: 100, endY: 65, stroke: "#888"});
  ps.text({text: "mirror", fill: "#888", centerX: 100, bottom: -67, class: "caption"});
  var tri = "M -15 -25 L 30 0 L -15 25 z";
  ps.polygon({path: tri, stroke: "#0a0", fill: "none", transform: "translate(100 0)"});
  ps.polygon({path: tri, stroke: "#44f", fill: "none", transform: "translate(200 0)"});
  ps.polygon({path: tri, stroke: "#f44", fill: "none", transform: "scale(-1 1)"});
  ps.polygon({path: tri, stroke: "black", fill: "none", transform: "scale(-1 1) translate(-100 0)"});
  ps.text({text: "1", fill: "#0a0", left: 72, top: -30, class: "caption"});
  ps.text({text: "2", fill: "#44f", left: 172, top: -30, class: "caption"});
  ps.text({text: "3", fill: "#f44", left: 20, top: -30, class: "caption"});
  ps.text({text: "4", fill: "black", left: 120, top: -30, class: "caption"});
});

size = 80;
var circle = 60;
picture("cos_sin", {prelude: preludeTransform}, function() {
  axes({stroke: "black"});
  ps.polygon({path: "M 14.7 3 A 15 15 0 1 1 10.6 -10.6", stroke: "black", fill: "none"});
  ps.arrow({startX: 12.6, startY: -8.6, endX: 13.6, endY: -7.6, stroke: "black"});
  ps.circle({stroke: "black", radius: circle, centerX: 0, centerY: 0, fill: "none"});

  var a1 = .25 * Math.PI;
  var x1 = circle * Math.cos(a1), y1 = circle * Math.sin(a1);
  ps.circle({fill: "#44f", radius: 3, centerX: x1, centerY: y1});
  ps.arrow({stroke: "#44f", startX: 0, endX: x1 - 3, startY: y1, endY: y1});
  ps.arrow({stroke: "#44f", startX: x1, endX: x1, startY: 0, endY: y1 - 3});
  ps.text({text: "cos(¼π)", left: x1 - 10, top: y1 + 10, class: "caption", fill: "#44f"});
  ps.text({text: "sin(¼π)", left: x1 + 20, bottom: y1 - 10, class: "caption", fill: "#44f"});

  var a2 = -.66666666667 * Math.PI;
  var x2 = circle * Math.cos(a2), y2 = circle * Math.sin(a2);
  ps.circle({fill: "#0a0", radius: 3, centerX: x2, centerY: y2});
  ps.arrow({stroke: "#0a0", startX: 0, endX: x2 + 3, startY: y2, endY: y2});
  ps.arrow({stroke: "#0a0", startX: x2, endX: x2, startY: 0, endY: y2 + 3});
  ps.text({text: "cos(-⅔π)", right: x2 + 15, bottom: y2 - 15, class: "caption", fill: "#0a0"});
  ps.text({text: "sin(-⅔π)", right: x2 - 30, top: y2 + 10, class: "caption", fill: "#0a0"});

});
