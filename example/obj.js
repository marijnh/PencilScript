var ps = PencilScript;

var spaceY = 8, spaceX = 10, lineSep = 5;

function objbox(label, lines, conf) {
  return ps.group({behind: conf.behind}, function(group) {
    var y = conf.top + spaceY;
    if (label) {
      label = ps.text({text: label, class: "objtext", left: conf.left + spaceX, top: y});
      y = label.bottom + 2 * spaceY;
    }
    var lineBoxes = lines.map(function(line, i) {
      if (i) y += lineSep;
      var lb = ps.text({text: line, class: "objtext", left: conf.left + spaceX, top: y});
      y += lb.height;
      return lb;
    });
    var w = lineBoxes.reduce(function(max, l) { return Math.max(max, l.width + 2 * spaceX); },
                             Math.max(label ? label.width : 0, conf.width || 0));
    var box = ps.rect({left: conf.left, width: w + 2 * spaceX, top: conf.top, bottom: y + spaceY,
                       class: "objbox", behind: label || lineBoxes[0]});
    if (label)
      ps.line({startX: box.left, startY: label.bottom + spaceY, endX: box.right, endY: label.bottom + spaceY, class: "sep"});
    group.box = box; group.label = label; group.lines = lineBoxes;
  });
}

var objPrelude = function(){/*
  <style>
    @font-face {
      font-family: 'PT Mono';
      font-style: normal;
      font-weight: 400;
      src: local('PT Mono'), local('PTMono-Regular'), url(http://themes.googleusercontent.com/static/fonts/ptmono/v1/jmle3kzCPnW8O7_gZGRDlQ.woff) format('woff');
    }
    .objtext { font-family: "PT Mono"; font-size: 14px; stroke: none; }
    .objbox { border-radius: 2px; fill: white; stroke: black }
    .sep { stroke: #666 }
  </style>
*/};
