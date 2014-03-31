var ps = PencilScript;

var spaceY = 8, spaceX = 10, lineSep = 5;

function box(label, lines, conf) {
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
    var w = lineBoxes.reduce(function(max, l) { return Math.max(max, l.width); },
                             Math.max(label ? label.width : 0, conf.width || 0));
    var box = ps.rect({left: conf.left, width: w + 2 * spaceX, top: conf.top, bottom: y + spaceY,
                       class: "objbox", behind: label || lineBoxes[0]});
    if (label)
      ps.line({startX: box.left, startY: label.bottom + spaceY, endX: box.right, endY: label.bottom + spaceY, class: "sep"});
    group.box = box; group.label = label; group.lines = lineBoxes;
  });
}

var prelude = function(){/*
  <style>
    @font-face {
      font-family: 'PT Mono';
      font-style: normal;
      font-weight: 400;
      src: local('PT Mono'), local('PTMono-Regular'), url(http://themes.googleusercontent.com/static/fonts/ptmono/v1/jmle3kzCPnW8O7_gZGRDlQ.woff) format('woff');
    }
    .objtext { font-family: "PT Mono"; font-size: 14px; stroke: none; }
    .objbox { border-radius: 4px; fill: url(#objboxgrad); stroke: #666 }
    .sep { stroke: #666 }
  </style>
  <defs>
    <linearGradient id="objboxgrad" x1="0" x2="0" y1="0" y2="1">
      <stop stop-color="#fafafa" offset="0%"/>
      <stop stop-color="#efefff" offset="100%"/>
    </linearGradient>
  </defs>
*/};

ps.picture({prelude: prelude}, function() {
  var kr = box("killerRabbit", ["teeth: \"long, sharp, ...\"", "adjective: \"killer\""], {top: 0, left: 0});
  var rp = box(null, ["teeth: \"small\"", "speak: <function>"], {top: kr.box.bottom - 5, left: kr.box.centerX, behind: kr, width: kr.box.width});
  var op = box(null, ["toString: <function>", "..."], {top: rp.box.bottom - 5, left: rp.box.centerX, behind: rp, width: kr.box.width});
  var rc = box("Rabbit", ["prototype"], {top: kr.box.top - 140, left: kr.box.right + 10, width: kr.box.width});
  ps.arrow({startX: rc.lines[0].centerX, startY: rc.lines[0].bottom + 2, endX: rp.box.centerX, endY: rp.box.top, class: "sep"});
  var oc = box("Object", ["create: <function>", "prototype", "..."], {top: kr.box.top - 40, left: rc.box.right - 30, width: kr.box.width});
  ps.arrow({startX: oc.lines[1].left - 4, startY: oc.lines[1].bottom, endX: op.box.centerX + 20, endY: op.box.top, class: "sep"});
});
