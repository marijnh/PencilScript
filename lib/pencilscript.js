(function(exports) {
  // Builtin shapes

  function type(parent, ctor, proto) {
    if (!ctor) ctor = function() { parent.apply(this, arguments); };
    ctor.prototype = Object.create((parent || Object).prototype);
    for (var prop in proto)
      Object.defineProperty(ctor.prototype, prop, Object.getOwnPropertyDescriptor(proto, prop));
    return ctor;
  }

  function combine(obj, defaults) {
    var result = {};
    for (var prop in defaults) result[prop] = defaults[prop];
    for (var prop in obj) result[prop] = obj[prop];
    return result;
  }

  var currentDefaults = {};
  exports.defaults = function(obj, f) {
    var old = currentDefaults;
    currentDefaults = combine(obj, old);
    try { return f(); }
    finally { currentDefaults = old; }
  };

  function create(ctor) {
    return function(conf, defaults) {
      if (defaults) conf = combine(conf, defaults);
      return new ctor(combine(conf, currentDefaults));
    };
  }

  var Shape = type(null, function(conf) {
    this.conf = conf;
    registerShape(this);
  }, {});

  var BlockShape = type(Shape, function(conf) {
    Shape.call(this, conf);
    this.findBox();
  }, {
    get right() { return this.left + this.width; },
    get bottom() { return this.top + this.height; },
    get centerX() { return this.left + .5 * this.width; },
    get centerY() { return this.top + .5 * this.width; },

    findBox: function() {
      var conf = this.conf;
      if (conf.left == null) {
        if (conf.right == null) throw new Error("No X position for rect");
        if (conf.width == null) throw new Error("No width for rect");
        this.width = conf.width;
        this.left = conf.right - this.width;
      } else {
        this.left = conf.left;
        if (conf.width != null)
          this.width = conf.width;
        else if (conf.right != null)
          this.width = conf.right - this.left;
        else
          throw new Error("No width for rect");
      }
      if (conf.top == null) {
        if (conf.bottom == null) throw new Error("No Y position for rect");
        if (conf.height == null) throw new Error("No height for rect");
        this.height = conf.height;
        this.top = conf.bottom - this.height;
      } else {
        this.top = conf.top;
        if (conf.height != null)
          this.height = conf.height;
        else if (conf.bottom != null)
          this.height = conf.bottom - this.top;
        else
          throw new Error("No height for rect");
      }
    }
  });

  var styleProps = {fill: true, stroke: true, strokeWidth: true};
  var transformProps = {scale: true, translate: true, matrix: true, rotate: true, skewX: true, skewY: true};

  var SVG = "http://www.w3.org/2000/svg";
  var svg = exports.svg = function(type, attrs, styleFrom) {
    var node = document.createElementNS(SVG, type);
    if (attrs) for (var attr in attrs) {
      var val = attrs[attr];
      if (val != null) node.setAttribute(attr, attrs[attr]);
    }
    if (styleFrom) {
      var transform = "";
      for (var prop in styleFrom) {
        if (styleProps.hasOwnProperty(prop))
          node.style[prop] = styleFrom[prop];
        if (transformProps.hasOwnProperty(prop))
          transform += prop + "(" + styleFrom[prop] + ") ";
      }
      if (transform) node.setAttribute("transform", transform);
    }
    return node;
  };

  var Rect = type(BlockShape, null, {
    draw: function() {
      return svg("rect", {x: this.left, y: this.top, width: this.width, height: this.height,
                          rx: this.radius, ry: this.radius}, this.conf);
    }
  });
  exports.rect = create(Rect);
  
  var mu = .0001;

  var Grid = type(BlockShape, null, {
    draw: function() {
      var unit = this.conf.unit || 1;
      var parent = svg("g");
      for (var x = this.left, e = this.right + mu; x <= e; x += unit) {
        if (this.conf.open && (x == this.left || x > e - 2 * mu)) continue;
        parent.appendChild(svg("line", {x1: x, x2: x, y1: this.top, y2: this.bottom}, this.conf));
      }
      for (var y = this.top, e = this.bottom + mu; y <= e; y += unit) {
        if (this.conf.open && (y == this.top || y > e - 2 * mu)) continue;
        parent.appendChild(svg("line", {x1: this.left, x2: this.right, y1: y, y2: y}, this.conf));
      }
      return parent;
    }
  });
  exports.grid = create(Grid);

  var Ellipse = type(BlockShape, function(conf) {
    if (conf.radiusX == null)
      conf.radiusX = conf.radius || conf.width && conf.width / 2 || 0;
    if (conf.radiusY == null)
      conf.radiusY = conf.radius || conf.height && conf.width / 2 || 0;
    conf.width = conf.radiusX * 2; conf.height = conf.radiusY * 2;
    BlockShape.call(this, conf);
  }, {
    draw: function() {
      return svg("ellipse", {cx: this.left + this.conf.radiusX, cy: this.top + this.conf.radiusY,
                             rx: this.conf.radiusX, ry: this.conf.radiusY}, this.conf);
    }
  });
  exports.circle = exports.ellipse = create(Ellipse);

  var Line = type(Shape, null, {
    draw: function() {
      return svg("line", {x1: this.conf.startX, x2: this.conf.endX,
                          y1: this.conf.startY, y2: this.conf.endY}, this.conf);
    }
  });
  exports.line = create(Line);

  var Vec = type(null, function(x, y) { this.x = x; this.y = y; }, {
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
  });

  // Dir encoded as 0 (↑), 1 (→), 2 (↓), 3 (←)
  var dirVec = [new Vec(0, -1), new Vec(1, 0), new Vec(0, 1), new Vec(-1, 0)];

  var CurvedLine = type(Shape, null, {
    draw: function() {
      var conf = this.conf;
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
      function corner(r, dir1, dir2) {
        return dirVec[dir1].times(r).plus(dirVec[dir2].times(r));
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
          pos = pos.plus(corner(turn, dir, dirApp));
          arcTo(turn, dirApp == dirLeft, pos);
          dir = dirApp;
        } else if (!approaching || (dirDiff == 1 || dirDiff == 3) && !d.nears(goalDir)) { // Going the wrong way. Immediate turn
          pos = pos.plus(corner(radius, dir, dirApp));
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
          arcTo(turn, dirApp == dirLeft, pos.plus(corner(turn, dir, dirApp)));
          moveTo(goal);
          break;
        }
      }
      return svg("path", {d: path}, this.conf);
    }
  });
  exports.curvedLine = create(CurvedLine);

  var Polygon = type(Shape, null, {
    draw: function() {
      var points = this.conf.points, path = "M " + points[0].x + " " + point[0].y;
      for (var i = 1; i < points.length; i++)
        path += " L " + points[i].x + " " + points[i].y;
      return svg("path", {d: path + "C"}, this.conf);
    }
  });
  exports.polygon = create(Polygon);

  var shapeList;
  function gatherShapes(list, f) {
    var old = shapeList;
    shapeList = list;
    try { return f(); }
    finally { shapeList = old; }
  }
  function registerShape(shape) {
    if (shapeList) shapeList.push(shape);
  }

  var Group = type(Shape, function(conf, f) {
    this.shapes = [];
    gatherShapes(this.shapes, f);
    Shape.call(this, conf);
  }, {
    draw: function() {
      var g = svg("g", null, this.conf);
      sortShapes(this.shapes).forEach(function(shape) {
        g.appendChild(shape.draw());
      });
      return g;
    }
  });

  exports.group = function(conf, f) {
    if (!f) { f = conf; conf = {}; }
    var group = new Group(conf, f);
    return group;
  };

  var pictureDefaults = {
    margin: 1.5
  };

  exports.picture = function(conf, f) {
    if (!f) { f = conf; conf = {}; }
    conf = combine(conf, pictureDefaults);
    var group = exports.group(conf, f);
    var node = svg("svg");
    node.appendChild(group.draw());
    document.body.appendChild(node);
    var box = node.firstChild.getBoundingClientRect();
    var svgBox = node.getBoundingClientRect();
    var margin = conf.margin;
    node.setAttribute("width", box.width + 2 * margin);
    node.setAttribute("height", box.height + 2 * margin);
    node.setAttribute("viewBox", [box.left - svgBox.left - margin, box.top - svgBox.top - margin,
                                  box.width + 2 * margin, box.height + 2 * margin].join(" "));
    return document.body.removeChild(node);
  };

  // Ensure ordering conforms to before/behind declarations
  function sortShapes(shapes) {
    var shapes = shapes.slice(0);
    // These can be unsolvable (A before B, B before A), so give up after N tries.
    for (var repeat = 0; repeat < shapes.length; repeat++) {
      var didSomething = false;
      for (var i = 0; i < shapes.length; i++) {
        var shape = shapes[i];
        if (shape.conf.behind) {
          var otherI = shapes.indexOf(shape.conf.behind);
          if (otherI < i && otherI > -1) {
            shapes.splice(i, 1);
            shapes.splice(otherI, 0, shape);
            didSomething = true;
          }
        }
        if (shape.conf.before) {
          var otherI = shapes.indexOf(shape.conf.before);
          if (otherI > i) {
            shapes.splice(i--, 1);
            shapes.splice(otherI, 0, shape);
            didSomething = true;
          }
        }
      }
      if (!didSomething) break;
    }
    return shapes;
  }    
}(this.PencilScript = {}));
