(function(exports) {
  // Builtin shapes

  function type(parent, ctor, proto) {
    if (!ctor) ctor = function() { parent.apply(this, arguments); };
    ctor.prototype = Object.create((parent || Object).prototype);
    for (var prop in proto)
      Object.defineProperty(ctor.prototype, prop, Object.getOwnPropertyDescriptor(proto, prop));
    return ctor;
  }

  function plus(a, b) {
    if (typeof a == "number" && typeof b == "number") return a + b;
    return new PlusQ(a, b);
  }
  function times(a, b) {
    if (typeof a == "number" && typeof b == "number") return a * b;
    return new TimesQ(a, b);
  }
  function resolve(q) {
    if (typeof q == "number") return q;
    if (!q.resolve) debugger;
    if (q.resolved == null) {
      if (resolve.stack.indexOf(q) >= 0) throw new Error("Cyclic dependency");
      resolve.stack.push(q);
      q.resolved = q.resolve();
      resolve.stack.pop();
    }
    return q.resolved;
  }
  resolve.stack = [];

  var PlusQ = type(null, function(a, b) { this.a = a; this.b = b; }, {
    resolve: function() { return resolve(this.a) + resolve(this.b); }
  });

  var TimesQ = type(null, function(a, b) { this.a = a; this.b = b; }, {
    resolve: function() { return resolve(this.a) * resolve(this.b); }
  });

  var Block = type(null, function(left, top, width, height) {
    this.left = left; this.top = top;
    this.width = width; this.height = height;
  }, {
    get right() { return this.left + this.width; },
    get bottom() { return this.top + this.height; }
  });

  var Shape = type(null, function(conf) {
    this.conf = conf;
    registerShape(this);
  }, {});

  var BlockShape = type(Shape, function(conf) {
    Shape.call(this, conf);
    this.resolved = null;
  }, {
    get left() { return new BlockQ(this, "x", 0); },
    get top() { return new BlockQ(this, "y", 0); },
    get right() { return new BlockQ(this, "x", 1); },
    get bottom() { return new BlockQ(this, "y", 1); },
    get centerX() { return new BlockQ(this, "x", .5); },
    get centerY() { return new BlockQ(this, "y", .5); },
    percentX: function(frac) { return new BlockQ(this, "x", frac); },
    percentY: function(frac) { return new BlockQ(this, "y", frac); },
    get width() { return new BlockQ(this, "w"); },
    get height() { return new BlockQ(this, "h"); },

    resolve: function() {
      if (this.resolved) return this.resolved;

      var left, top, width, height, conf = this.conf;
      if (conf.left == null) {
        if (conf.right == null) throw new Error("No X position for rect");
        if (conf.width == null) throw new Error("No width for rect");
        width = resolve(conf.width);
        left = resolve(conf.right) - width;
      } else {
        left = resolve(conf.left);
        if (conf.width != null)
          width = resolve(conf.width);
        else if (conf.right != null)
          width = resolve(conf.right) - left;
        else
          throw new Error("No width for rect");
      }
      if (conf.top == null) {
        if (conf.bottom == null) throw new Error("No Y position for rect");
        if (conf.height == null) throw new Error("No height for rect");
        height = resolve(conf.height);
        top = resolve(conf.bottom) - height;
      } else {
        top = resolve(conf.top);
        if (conf.height != null)
          height = resolve(conf.height);
        else if (conf.bottom != null)
          height = resolve(conf.bottom) - top;
        else
          throw new Error("No height for rect");
      }
      return this.resolved = new Block(left, top, width, height);
    }
  });

  var BlockQ = type(null, function(block, type, frac) {
    this.block = block; this.type = type; this.frac = frac;
  }, {
    resolve: function() {
      var res = this.block.resolve();
      if (this.type == "x")
        return res.left + this.frac * res.width;
      else if (this.type == "y")
        return res.top + this.frac * res.height;
      else if (this.type == "w")
        return res.width;
      else if (this.type == "h")
        return res.height;
    }
  });

  var styleProps = {fill: true, stroke: true, strokeWidth: true};

  var SVG = "http://www.w3.org/2000/svg";
  function svg(type, attrs, styleFrom) {
    var node = document.createElementNS(SVG, type);
    if (attrs) for (var attr in attrs)
      node.setAttribute(attr, attrs[attr]);
    if (styleFrom) for (var prop in styleFrom) if (styleProps.hasOwnProperty(prop))
      node.style[prop] = styleFrom[prop];
    return node;
  }

  var mu = .0001;

  var Rect = type(BlockShape, null, {
    draw: function() { // FIXME rx and ry for rounded corners
      var res = this.resolve();
      return svg("rect", {x: res.left, y: res.top, width: res.width, height: res.height}, this.conf);
    }
  });

  var Grid = type(BlockShape, null, {
    draw: function() {
      var res = this.resolve(), unit = this.conf.unit || 1;
      var parent = svg("g");
      for (var x = res.left, e = res.right + mu; x <= e; x += unit) {
        if (this.conf.open && (x == res.left || x > e - 2 * mu)) continue;
        parent.appendChild(svg("line", {x1: x, x2: x, y1: res.top, y2: res.bottom}, this.conf));
      }
      for (var y = res.top, e = res.bottom + mu; y <= e; y += unit) {
        if (this.conf.open && (y == res.top || y > e - 2 * mu)) continue;
        parent.appendChild(svg("line", {x1: res.left, x2: res.right, y1: y, y2: y}, this.conf));
      }
      return parent;
    }
  });

  function require(name) { // FIXME
    if (name == "style") return {
      foreground: "#56f",
      background: "#aaf"
    };
  }
  
  var builtin = {
    Rect: Rect,
    Grid: Grid,
    plus: plus,
    times: times,
    require: require
  };

  var shapeList;
  function gatherShapes(f) {
    var old = shapeList;
    shapeList = [];
    try { f(); return shapeList; }
    finally { shapeList = old; }
  }
  function registerShape(shape) {
    shapeList.push(shape);
  }

  function run(program) {
    var picture = {scale: 1};
    var args = ["picture"], argVals = [picture];
    for (var name in builtin) {
      args.push(name);
      argVals.push(builtin[name]);
    }
    var f = new Function(args.join(","), program);
    picture.shapes = gatherShapes(function() { f.apply(null, argVals); });
    return picture;
  }

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

  function buildSVG(picture) {
    var shapes = sortShapes(picture.shapes);
    var node = svg("svg");
    var group = node.appendChild(svg("g", {transform: "translate(0.5,0.5) scale(" + picture.scale + ")"}));
    shapes.forEach(function(shape) {
      group.appendChild(shape.draw());
    });
    return node;
  }

  exports.render = function(input) {
    return buildSVG(run(input));
  };
}(this.decladraw = {}));
