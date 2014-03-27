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
    this.resolve();
  }, {
    get right() { return this.left + this.width; },
    get bottom() { return this.top + this.height; },
    get centerX() { return this.left + .5 * this.width; },
    get centerY() { return this.top + .5 * this.width; },

    resolve: function() {
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
    if (attrs) for (var attr in attrs)
      node.setAttribute(attr, attrs[attr]);
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
    draw: function() { // FIXME rx and ry for rounded corners
      return svg("rect", {x: this.left, y: this.top, width: this.width, height: this.height}, this.conf);
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

  var Group = type(BlockShape, function(conf, f) {
    this.shapes = [];
    gatherShapes(this.shapes, f);
    BlockShape.call(this, conf);
  }, {
    resolve: function() {
      if (!this.shapes.length) {
        this.left = this.right = this.width = this.height = 0;
      } else {
        var left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
        this.shapes.forEach(function(shape) {
          left = Math.min(shape.left, left); right = Math.max(shape.right, right);
          top = Math.min(shape.top, top); bottom = Math.max(shape.bottom, bottom);
        });
        this.left = left; this.width = right - left;
        this.top = top; this.height = bottom - top;
      }
    },
    render: function() {
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
    translate: "0.5 0.5"
  };

  exports.picture = function(conf, f) {
    if (!f) { f = conf; conf = {}; }
    conf = combine(conf, pictureDefaults);
    var group = exports.group(conf, f);
    var node = svg("svg", {width: group.width, height: group.height,
                           viewport: [group.left, group.top, group.width, group.height].join(" ")});
    node.appendChild(group.render());
    return node;
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
