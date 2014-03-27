(function(exports) {
  // Builtin shapes

  function type(parent, ctor, proto) {
    if (!ctor) ctor = function() { parent.apply(this, arguments); };
    ctor.prototype = Object.create((parent || Object).prototype);
    for (var prop in proto)
      Object.defineProperty(ctor.prototype, prop, Object.getOwnPropertyDescriptor(proto, prop));
    return ctor;
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
      return svg("rect", {x: this.left, y: this.top, width: this.width, height: this.height}, this.conf);
    }
  });

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

  function require(name) { // FIXME
    if (name == "style") return {
      foreground: "#56f",
      background: "#aaf"
    };
  }
  
  var builtin = {
    Rect: Rect,
    Grid: Grid,
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
