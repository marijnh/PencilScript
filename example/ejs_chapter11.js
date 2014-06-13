var setFont = function(){/*
  <style>
    @font-face {
      font-family: 'PT Mono';
      font-style: normal;
      font-weight: 400;
      src: local('PT Mono'), local('PTMono-Regular'), url(http://themes.googleusercontent.com/static/fonts/ptmono/v1/jmle3kzCPnW8O7_gZGRDlQ.woff) format('woff');
    }
    .ast-text { font-family: "PT Mono"; font-size: 14px; stroke: none; }
  </style>
*/};

function dot(x, y, text) {
  var box = ps.circle({centerX: x, centerY: y, radius: 5, fill: "black"});
  if (text) ps.text({left: box.right + 8, centerY: box.centerY, text: text, class: "ast-text"});
  return box;
}

function connect(from, to) {
  ps.curvedArrow({startX: from.centerX, startY: from.bottom, startDir: 2,
                  endX: to.left, endY: to.centerY, endDir: 1, stroke: "black", radius: 10});
}

picture("syntax_tree", {prelude: setFont}, function() {
  var shift = 30, margin = 20;
  var _do = dot(0, 0, "do");
  var y = 1;
  var def = dot(_do.centerX + shift, _do.centerY + y++ * margin, "define");
  connect(_do, def);
  var xdef = dot(def.centerX + shift, _do.centerY + y++ * margin, "x");
  connect(def, xdef);
  var ten = dot(def.centerX + shift, _do.centerY + y++ * margin, "10");
  connect(def, ten);
  var _if = dot(_do.centerX + shift, _do.centerY + y++ * margin, "if");
  connect(_do, _if);
  var gt = dot(_if.centerX + shift, _do.centerY + y++ * margin, ">");
  connect(_if, gt);
  var xgt = dot(gt.centerX + shift, _do.centerY + y++ * margin, "x");
  connect(gt, xgt);
  var five = dot(gt.centerX + shift, _do.centerY + y++ * margin, "5");
  connect(gt, five);
  var print1 = dot(_if.centerX + shift, _do.centerY + y++ * margin, "print");
  connect(_if, print1);
  var large = dot(print1.centerX + shift, _do.centerY + y++ * margin, "\"large\"");
  connect(print1, large);
  var print2 = dot(_if.centerX + shift, _do.centerY + y++ * margin, "print");
  connect(_if, print2);
  var small = dot(print2.centerX + shift, _do.centerY + y++ * margin, "\"small\"");
  connect(print2, small);
});
