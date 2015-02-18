(function() {
  var red = "#c00", size = 100;
  var radius = (size - 2) / 2;
  var smallRadius = (radius - 1) / 2;
  var dotRadius = Math.round(smallRadius / 3);

  picture("yinyang", {transform: "rotate(-30)"}, function() {
    ps.polygon({path: "M 0 -" + radius + " A " + radius + " " + radius + " 0 0 0 0 " + radius, fill: red});
    ps.circle({centerX: 0, centerY: -smallRadius, radius: smallRadius, fill: red});
    ps.circle({centerX: 0, centerY: smallRadius, radius: smallRadius, fill: "white"});
    ps.circle({centerX: 0, centerY: -smallRadius, radius: dotRadius, fill: "white"});
    ps.circle({centerX: 0, centerY: smallRadius, radius: dotRadius, fill: red});
    ps.circle({centerX: 0, centerY: 0, radius: radius, stroke: red, fill: "none"});
  });
})();
