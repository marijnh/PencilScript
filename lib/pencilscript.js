(function(exports) {
  function combine(obj, defaults) {
    var result = {};
    for (var prop in defaults) result[prop] = defaults[prop];
    for (var prop in obj) result[prop] = obj[prop];
    return result;
  }
  function inherit(parent, proto) {
    var result = Object.create(parent.prototype);
    if (proto) for (var prop in proto)
      Object.defineProperty(result, prop, Object.getOwnPropertyDescriptor(proto, prop));
    return result;
  }

  var currentDefaults = {};
  exports.defaults = function(obj, f) {
    var old = currentDefaults;
    currentDefaults = combine(obj, old);
    try { return f(); }
    finally { currentDefaults = old; }
  };
  function wrap(f) {
    return function(conf, extra, arg) {
      if (extra) conf = combine(conf, extra);
      return f(combine(conf, currentDefaults), arg);
    };
  }

  var styleProps = {fill: true, stroke: true, strokeWidth: true, fontSize: true};
  var transformProps = {scale: true, translate: true, matrix: true, rotate: true, skewX: true, skewY: true};

  var SVG = "http://www.w3.org/2000/svg";
  var svg = exports.svg = function(type, attrs, styleFrom, restrict) {
    var node = document.createElementNS(SVG, type);
    if (attrs) for (var attr in attrs) {
      var val = attrs[attr];
      if (val != null) node.setAttribute(attr, attrs[attr]);
    }
    if (styleFrom) {
      var transform = "";
      for (var prop in styleFrom) {
        if ((!restrict || restrict == "style") && styleProps.hasOwnProperty(prop))
          node.style[prop] = styleFrom[prop];
        if ((!restrict || restrict == "tranform") && transformProps.hasOwnProperty(prop))
          transform += prop + "(" + styleFrom[prop] + ") ";
      }
      if (transform) node.setAttribute("transform", transform);
    }
    return node;
  };

  function Node(node) { this.node = node; }
  Node.prototype = {
    get clientRect() { return this.node && this.node.getBoundingClientRect(); }
  };

  function Box(left, top, width, height, node) {
    this.left = left; this.width = width;
    this.top = top; this.height = height;
    this.node = node;
  }
  Box.prototype = inherit(Node, {
    get right() { return this.left + this.width; },
    get bottom() { return this.top + this.height; },
    get centerX() { return this.left + this.width / 2; },
    get centerY() { return this.top + this.height / 2; }
  });
  Box.resolve = function(conf) {
    var left, width, top, height;
    if (conf.left == null) {
      if (conf.right == null) throw new Error("No X position for box");
      if (conf.width == null) throw new Error("No width for box");
      width = conf.width;
      left = conf.right - width;
    } else {
      left = conf.left;
      if (conf.width != null)
        width = conf.width;
      else if (conf.right != null)
        width = conf.right - left;
      else
        throw new Error("No width for box");
    }
    if (conf.top == null) {
      if (conf.bottom == null) throw new Error("No Y position for box");
      if (conf.height == null) throw new Error("No height for box");
      height = conf.height;
      top = conf.bottom - height;
    } else {
      top = conf.top;
      if (conf.height != null)
        height = conf.height;
      else if (conf.bottom != null)
        height = conf.bottom - top;
      else
        throw new Error("No height for box");
    }
    if (conf.round !== false) {
      left = Math.round(left); top = Math.round(top);
      width = Math.round(width); height = Math.round(height);
    }
    return new Box(left, top, width, height);
  };

  exports.rect = wrap(function(conf) {
    var box = Box.resolve(conf);
    box.node = add(svg("rect", {x: box.left, y: box.top, width: box.width, height: box.height,
                                rx: conf.radius, ry: conf.radius}, conf), conf);
    return box;
  });
  
  var mu = .0001;

  exports.grid = wrap(function(conf) {
    var box = Box.resolve(conf);
    box.node = add(svg("g", null, conf, "transform"), conf);
    var unit = conf.unit || 1;
    for (var x = box.left, e = box.right + mu; x <= e; x += unit) {
      if (conf.open && (x == box.left || x > e - 2 * mu)) continue;
      box.node.appendChild(svg("line", {x1: x, x2: x, y1: box.top, y2: box.bottom}, conf, "style"));
    }
    for (var y = box.top, e = box.bottom + mu; y <= e; y += unit) {
      if (conf.open && (y == box.top || y > e - 2 * mu)) continue;
      box.node.appendChild(svg("line", {x1: box.left, x2: box.right, y1: y, y2: y}, conf, "style"));
    }
    return box;
  });

  exports.ellipse = exports.circle = wrap(function(conf) {
    if (conf.width == null)
      conf.width = (conf.radiusX || conf.radius || 0) * 2;
    if (conf.height == null)
      conf.height = (conf.radiusY || conf.radius || 0) * 2;
    var box = Box.resolve(conf);
    box.node = add(svg("ellipse", {cx: box.left + box.width / 2, cy: box.top + box.height / 2,
                                   rx: box.width / 2, ry: box.height / 2}, conf), conf);
    return box;
  });

  exports.line = wrap(function(conf) {
    return new Node(add(svg("line", {x1: conf.startX, x2: conf.endX, y1: conf.startY, y2: conf.endY},
                            conf), conf));
  });

  var Vec = function(x, y) { this.x = x; this.y = y; }
  Vec.prototype = {
    plus: function(other) { return new Vec(this.x + other.x, this.y + other.y); },
    minus: function(other) { return new Vec(this.x - other.x, this.y - other.y); },
    times: function(n) { return new Vec(this.x * n, this.y * n); },
    onto: function(dir) { return new Vec(this.x * dirVec[dir].x, this.y * dirVec[dir].y); },
    nears: function(dir) {
      var dirV = dirVec[dir];
      return dirV.x * this.x + dirV.y * this.y > 0;
    },
    get length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  };
  Vec.corner = function(r, dir1, dir2) {
    return dirVec[dir1].times(r).plus(dirVec[dir2].times(r));
  };

  // Dir encoded as 0 (↑), 1 (→), 2 (↓), 3 (←)
  var dirVec = [new Vec(0, -1), new Vec(1, 0), new Vec(0, 1), new Vec(-1, 0)];

  exports.curvedLine = wrap(function(conf) {
    var pos = new Vec(conf.startX, conf.startY);
    var goal = new Vec(conf.endX, conf.endY);
    var radius = conf.radius || 20;
    var dir = conf.startDir, goalDir = conf.endDir;

    var path = "M " + pos.x + " " + pos.y;
    function arcTo(r, left, v) {
      path += " A " + r + " " + r + " 0 0 " + (+!left) + " " + v.x + " " + v.y;
    }
    function moveTo(v) {
      path += " L " + v.x + " " + v.y;
    }

    for (;;) {
      var d = goal.minus(pos);
      var dirDiff = (dir - goalDir + 4) % 4;
      var dirLeft = (dir + 3) % 4, dirRight = (dir + 1) % 4;
      var dirApp = d.nears(dirLeft) ? dirLeft : dirRight;
      var approaching = d.nears(dir);
      if (dirDiff == 2) { // Need a U-turn
        if (approaching) moveTo(pos = pos.plus(d.onto(dir)));
        var turn = Math.min(d.onto(dirApp).length / 2, radius);
        pos = pos.plus(Vec.corner(turn, dir, dirApp));
        arcTo(turn, dirApp == dirLeft, pos);
        dir = dirApp;
      } else if (!approaching || (dirDiff == 1 || dirDiff == 3) && !d.nears(goalDir)) { // Going the wrong way. Immediate turn
        pos = pos.plus(Vec.corner(radius, dir, dirApp));
        arcTo(radius, dirApp == dirLeft, pos);
        dir = dirApp;
      } else if (dirDiff == 0) { // Straight ahead, possibly with a curve
        var gapDir = d.onto(dirApp), gap = gapDir.length;
        if (gap == 0) {
          moveTo(goal);
        } else {
          var center = pos.plus(goal).times(.5);
          var aheadDir = d.onto(dir), ahead = aheadDir.length;
          var turn = Math.min(radius, ahead / 2), arcWidth = turn;
          var gapStraight = Math.max(0, gap - 2 * turn);
          if (gapStraight == 0)
            arcWidth = Math.sin(Math.acos(gapStraight / (2 * turn))) * turn;
          var aheadStraight = Math.max(0, ahead - 2 * arcWidth);
          var gapStraightVec = gapDir.times(gapStraight / gap);
          var aheadStraightVec = aheadDir.times(aheadStraight / (2 * ahead));
          if (aheadStraight > 0) moveTo(pos = pos.plus(aheadStraightVec));
          arcTo(turn, dirApp == dirLeft, pos = center.plus(gapStraightVec.times(-.5)));
          if (gapStraight > 0) moveTo(pos.plus(gapStraightVec));
          arcTo(turn, dirApp != dirLeft, goal.minus(aheadStraightVec));
          if (aheadStraight > 0) moveTo(goal);
        }
        break;
      } else { // dirDiff is 1 or 3, turn a corner
        var before = d.onto(dir), after = d.onto(dirApp);
        var beforeLen = before.length, afterLen = after.length;
        var turn = Math.min(radius, beforeLen, afterLen);
        moveTo(pos = pos.plus(before.times((beforeLen - turn) / beforeLen)));
        arcTo(turn, dirApp == dirLeft, pos.plus(Vec.corner(turn, dir, dirApp)));
        moveTo(goal);
        break;
      }
    }
    return new Node(add(svg("path", {d: path}, combine({fill: "none"}, conf)), conf));
  });

  exports.polygon = wrap(function(conf) {
    var path = conf.path;
    if (!path) {
      var points = conf.points;
      path = "M " + points[0].x + " " + point[0].y;
      for (var i = 1; i < points.length; i++)
        path += " L " + points[i].x + " " + points[i].y;
      path += "Z";
    }
    return new Node(add(svg("path", {d: path}, conf), conf));
  });

  exports.curvedArrow = wrap(function(conf) {
    exports.polygon({translate: conf.endX + " " + conf.endY,
                     rotate: conf.endDir * 90,
                     scale: conf.pointSize || conf.strokeWidth,
                     path: "M 0 0 L 3 1 L 0 -8 L -3 1 Z",
                     stroke: "none", fill: conf.stroke});
    return exports.curvedLine(conf);
  });

  exports.text = wrap(function(conf) {
    var node = add(svg("text", {x: conf.left, y: conf.top}, conf), conf);
    node.appendChild(document.createTextNode(conf.text));
    return new Node(node);
  });

  exports.textBox = wrap(function(conf) {
    var text = exports.text(combine({fill: conf.textColor || "black",
                                     stroke: "none",
                                     left: 0, top: 0}, conf));
    var textRect = text.clientRect, marginX = textRect.height * .4, marginY = textRect.height * .15;
    conf.width = Math.max(conf.width || 0, textRect.width + 2 * marginX);
    conf.height = Math.max(conf.height || 0, textRect.height + 2 * marginY);
    var rect = exports.rect(combine({behind: text}, conf));
    text.node.setAttribute("x", rect.left + marginX);
    text.node.setAttribute("y", rect.top + .75 * rect.height);
    return rect;
  });

  function Group(conf, f, top) {
    this.node = svg("g", null, conf);
    if (top) top.appendChild(this.node);
    else add(this.node, conf);

    this.children = [];
    var old = Group.cur;
    Group.cur = this;
    try { f(); }
    finally { Group.cur = old; }
    if (this.sort())
      for (var i = 0; i < this.children.length; i++)
        this.node.appendChild(this.children[i].node);
  }
  Group.prototype = inherit(Node);
  Group.prototype.sort = function() {
    // These can be unsolvable (A before B, B before A), so give up after N tries.
    var shapes = this.children, changed = false;
    for (var repeat = 0; repeat < shapes.length; repeat++) {
      var didSomething = false;
      for (var i = 0; i < shapes.length; i++) {
        var shape = shapes[i];
        if (shape.behind) for (var j = 0; j < i; j++) {
          if (shapes[j].node == shape.behind.node) {
            shapes.splice(i, 1);
            shapes.splice(j, 0, shape);
            didSomething = changed = true;
            break;
          }
        }
        if (shape.before) for (var j = i + 1; j < shapes.length; j++) {
          if (shapes[j].node == shape.before.node) {
            shapes.splice(i--, 1);
            shapes.splice(j, 0, shape);
            didSomething = changed = true;
            break;
          }
        }
      }
      if (!didSomething) return changed;
    }
  };

  function add(node, conf) {
    Group.cur.children.push({node: node, before: conf.before, behind: conf.behind});
    Group.cur.node.appendChild(node);
    return node;
  }

  exports.group = function(conf, defaults, f) {
    if (!f) { f = defaults; defaults = null; }
    if (defaults) conf = combine(conf, defaults);
    return new Group(combine(conf, currentDefaults), f);
  };
  
  var pictureDefaults = {
    translate: "0.5 0.5",
    margin: 1.5,
    parentNode: document.body
  };

  exports.picture = function(conf, f) {
    if (!f) { f = conf; conf = {}; }
    conf = combine(conf, pictureDefaults);
    var node = svg("svg");
    if (conf.place) conf.place(node);
    else if (conf.parentNode) conf.parentNode.appendChild(node);
    else throw new Error("Can't place svg node in document.");

    var group = new Group(conf, f, node);
    var box = group.node.getBoundingClientRect();
    var svgBox = node.getBoundingClientRect();
    var margin = conf.margin;
    node.setAttribute("width", box.width + 2 * margin);
    node.setAttribute("height", box.height + 2 * margin);
    node.setAttribute("viewBox", [box.left - svgBox.left - margin, box.top - svgBox.top - margin,
                                  box.width + 2 * margin, box.height + 2 * margin].join(" "));
  };
}(this.PencilScript = {}));
