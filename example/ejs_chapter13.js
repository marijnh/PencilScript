var ps = PencilScript;

var preludeArrows = function(){/*
  <style>
    @font-face {
      font-family: 'PT Mono';
      font-style: normal;
      font-weight: 400;
      src: local('PT Mono'), local('PTMono-Regular'), url(http://themes.googleusercontent.com/static/fonts/ptmono/v1/jmle3kzCPnW8O7_gZGRDlQ.woff) format('woff');
    }
    .box {
      stroke: #666;
      fill: url(#boxgrad);
      border-radius: 4px;
    }
    .leafbox {
      fill: url(#leafgrad);
    }
    .boxtext {
      font-size: 20px;
      font-family: "PT Mono";
      stroke: none;
      fill: black;
    }
    .leafboxtext { font-family: "Georgia"; }
    .arrow { stroke: black; }
  </style>
  <defs>
    <linearGradient id="boxgrad" x1="0" x2="0" y1="0" y2="1">
      <stop stop-color="#f8f8f8" offset="0%"/>
      <stop stop-color="#e8e8f2" offset="100%"/>
    </linearGradient>
    <linearGradient id="leafgrad" x1="0" x2="0" y1="0" y2="1">
      <stop stop-color="#f8f8f8" offset="0%"/>
      <stop stop-color="#caf0f0" offset="100%"/>
    </linearGradient>
  </defs>
*/};

function tagbox(left, top, text, props) {
  var leaf = props && props.leaf;
  var conf = {text: text,
              class: "box" + (leaf ? " leafbox" : ""),
              textClass: "boxtext" + (leaf ? " leafboxtext" : ""),
              left: left, top: top};
  if (props) for (var p in props) conf[p] = props[p];
  return ps.textBox(conf);
}
function arr(startX, startY, startDir, endX, endY, endDir) {
  return ps.curvedArrow({startX: startX, startY: startY, startDir: startDir,
                         endX: endX, endY: endY, endDir: endDir,
                         class: "arrow", radius: 4, pointSize: 1});
}
function arrRight(from, to) {
  var endY = from.top == to.top ? from.centerY : to.centerY;
  return arr(from.right, from.centerY, 1,
             to.left, endY, 1);
}
var gap = 15, indent = 25, arrOff = 8;

ps.picture({prelude: preludeArrows}, function() {
  var html = tagbox(0, 0, "html");
  var head = tagbox(html.right + indent, html.top, "head");
  arrRight(html, head);
  var title = tagbox(head.right + indent, head.top, "title");
  arrRight(head, title);
  var titleText = tagbox(title.right + indent, title.top, "My home page", {leaf: true});
  arrRight(title, titleText);
  var body = tagbox(head.left, head.bottom + gap, "body");
  arr(html.right + arrOff, html.centerY, 2, body.left, body.centerY, 1);
  var h1 = tagbox(body.right + indent, body.top, "h1", {width: title.width});
  arrRight(body, h1);
  var hText = tagbox(h1.right + indent, h1.top, "My home page", {leaf: true});
  arrRight(h1, hText);
  var p1 = tagbox(body.right + indent, body.bottom + gap, "p", {width: h1.width});
  arr(body.right + arrOff, body.centerY, 2, p1.left, p1.centerY, 1);
  var p1Text = tagbox(p1.right + indent, p1.top, "Hello! I am...", {leaf: true, width: hText.width});
  arrRight(p1, p1Text);
  var p2 = tagbox(body.right + indent, p1.bottom + gap, "p", {width: h1.width});
  arr(body.right + arrOff, body.centerY, 2, p2.left, p2.centerY, 1);
  var p2Text = tagbox(p2.right + indent, p2.top, "I also wrote...", {leaf: true, width: hText.width});
  arrRight(p2, p2Text);
  var linkText = tagbox(null, p2.bottom + gap, "here", {leaf: true, right: p2Text.right});
  var link = tagbox(p2Text.left, p2.bottom + gap, "a", {width: titleText.width - indent - linkText.width});
  arr(p2.right + arrOff, p2.centerY, 2, link.left, link.centerY, 1);
  arrRight(link, linkText);
  var p2Text2 = tagbox(link.left, link.bottom + gap, ".", {leaf: true});
  arr(p2.right + arrOff, p2.centerY, 2, p2Text2.left, p2Text2.centerY, 1);
});

function boundingBox(elts) {
  var left = Infinity, right = -Infinity;
  var top = Infinity, bottom = -Infinity;
  elts.forEach(function(elt) {
    left = Math.min(elt.left, left); right = Math.max(elt.right, right);
    top = Math.min(elt.top, top); bottom = Math.max(elt.bottom, bottom);
  });
  return new ps.Box(left, top, right - left, bottom - top);
}

var spaceX = 12, spaceY = 12, spaceYH = 6;

function wrapbox(name, around, conf) {
  if (!conf) conf = {};
  var box = boundingBox(around);
  var label = ps.text({text: name, class: "wraptext", left: box.left, bottom: box.top - (conf.nearTop ? -12 : 8)});
  var box = ps.rect({class: "wrap", left: box.left - spaceX, width: Math.max(conf.width || 0, box.width + 2 * spaceX),
                     top: label.top - spaceYH, bottom: box.bottom + spaceY});
  box.label = label;
  return box;
}

var preludeBoxes = function(){/*
  <style>
    @font-face {
      font-family: 'PT Mono';
      font-style: normal;
      font-weight: 400;
      src: local('PT Mono'), local('PTMono-Regular'), url(http://themes.googleusercontent.com/static/fonts/ptmono/v1/jmle3kzCPnW8O7_gZGRDlQ.woff) format('woff');
    }
    .leaf {
      font-family: "Georgia";
      font-size: 17px;
    }
    .wraptext {
      font-family: "PT Mono";
      font-size: 14px;
    }
    .wrap {
      border-radius: 14px;
      stroke-width: 1px; stroke: #666;
      fill: none;
    }
  </style>
*/};

ps.picture({prelude: preludeBoxes}, function() {
  var at = ps.text({text: "here", class: "leaf", top: 0, left: 0});
  var a = wrapbox("a", [at]);
  var dot = ps.text({text: ".", class: "leaf", top: at.top, left: at.right + 2 * spaceX});
  var p2t = ps.text({text: "I also wrote a book! Read it", class: "leaf", top: at.top, right: at.left - 2 * spaceX});
  var p2 = wrapbox("p", [a, dot, p2t], {nearTop: true});
  var p1t = ps.text({text: "Hello, I am Marijn and this is...", class: "leaf", bottom: p2.top - spaceY * 2, left: p2t.left});
  var p1 = wrapbox("p", [p1t], {width: p2.width});
  var h1t = ps.text({text: "My home page", class: "leaf", bottom: p1.top - spaceY * 2, left: p1t.left});
  var h1 = wrapbox("h1", [h1t], {width: p1.width});
  var body = wrapbox("body", [h1, p1, p2]);
  var tt = ps.text({text: "My home page", class: "leaf", bottom: body.top - spaceY * 3, left: h1t.left});
  var title = wrapbox("title", [tt], {width: h1.width});
  var head = wrapbox("head", [title]);
  var html = wrapbox("html", [head, body]);
});


var preludeLinks = function(){/*
  <style>
    @font-face {
      font-family: 'PT Mono';
      font-style: normal;
      font-weight: 400;
      src: local('PT Mono'), local('PTMono-Regular'), url(http://themes.googleusercontent.com/static/fonts/ptmono/v1/jmle3kzCPnW8O7_gZGRDlQ.woff) format('woff');
    }
    .leaf {
      font-family: "Georgia";
      font-size: 17px;
    }
    .wraptext, .linktext, .index {
      font-family: "PT Mono";
      font-size: 14px;
    }
    .wrap {
      border-radius: 14px;
      stroke: #666;
      fill: none;
    }
    .link { stroke: #6aa; }
    .linktext, .index { fill: #6aa; }
  </style>
*/};

var arrowGap = 20;

function link(x, y, d, x2, y2, d2, conf) {
  ps.curvedArrow({startX: x, startY: y, startDir: d, endX: x2, endY: y2, endDir: d2,
                  class: "link", radius: 7,
                  start: conf && conf.start, end: conf && conf.end});
}

ps.picture({prelude: preludeLinks}, function() {
  var p2t = ps.text({text: "I also wrote a book! ...", class: "leaf", top: 0, right: 0});
  var p2 = wrapbox("p", [p2t]);
  var p1t = ps.text({text: "Hello, I am Marijn...", class: "leaf", bottom: p2.top - spaceY * 3, left: p2t.left});
  var p1 = wrapbox("p", [p1t], {width: p2.width});
  var h1t = ps.text({text: "My home page", class: "leaf", bottom: p1.top - spaceY * 3, left: p1t.left});
  var h1 = wrapbox("h1", [h1t], {width: p1.width});
  var body = wrapbox("body", [h1, p1, p2]);
  var zero = ps.text({text: "0", class: "index", right: body.left - spaceX - arrowGap, top: h1.label.top});
  var one = ps.text({text: "1", class: "index", right: zero.right, top: p1.label.top});
  var two = ps.text({text: "2", class: "index", right: zero.right, top: p2.label.top});
  var childNodes = ps.rect({class: "wrap", right: zero.right + spaceX, left: zero.left - spaceX, top: zero.top - spaceY, bottom: two.bottom + spaceY});
  [zero, one, two].forEach(function(n) {
    link(childNodes.right, n.centerY, 1, h1.left, n.centerY, 1);
  });
  link(body.left + 15, body.top, 0, childNodes.centerX, childNodes.top, 2, {start: 5});
  ps.text({left: body.left + 20, bottom: body.top - 5, text: "childNodes", class: "linktext"});
  link(body.centerX + 40, body.top, 0, body.centerX + 20, h1.top, 2, {start: 5});
  ps.text({left: body.centerX + 45, bottom: body.top - 5, text: "firstChild", class: "linktext"});
  link(body.centerX + 40, body.bottom, 2, body.centerX + 20, p2.bottom, 0, {start: 5});
  ps.text({left: body.centerX + 45, top: body.bottom + 5, text: "lastChild", class: "linktext"});
  link(p1.left + 20, p1.top, 0, p1.left + 20, h1.bottom, 0);
  ps.text({left: p1.left + 25, centerY: (p1.top + h1.bottom) / 2, text: "previousSibling", class: "linktext"});
  link(p1.left + 20, p1.bottom, 2, p1.left + 20, p2.top, 2);
  ps.text({left: p1.left + 25, centerY: (p1.bottom + p2.top) / 2, text: "nextSibling", class: "linktext"});
  link(p1.right, p1.centerY, 1, body.right, p1.centerY - 20, 3, {end: 7});
  ps.text({left: body.right + 5, top: p1.centerY + 5, text: "parentNode", class: "linktext"});
});
