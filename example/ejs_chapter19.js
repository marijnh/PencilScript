var ps = PencilScript;

var unit = 15, xoff = 0;

var bg = "#e0e0ff", add = "#ffe6c0";

function fill(c, x, y, w, h) {
  ps.rect({left: x * unit + xoff, top: y * unit, width: (w || 1) * unit, height: (h || 1) * unit,
           fill: c});
}

function basePic() {
  fill(bg, 0, 1, 5, 1);
  fill(bg, 5, 2, 4, 1);
  fill(bg, 9, 3, 1, 4);
  fill(bg, 5, 7, 4, 1);
  fill(bg, 5, 3, 1, 2);
  fill(bg, 4, 5, 1, 2);
  fill(bg, 6, 8, 2, 2);
  fill(bg, 1, 6, 1, 2);

  var grid = ps.grid({
    width: 10 * unit,
    height: 10 * unit,
    strokeWidth: 1,
    stroke: "#444",
    unit: unit,
    left: xoff,
    top: 0
  });

  ps.circle({centerX: xoff + 7.5 * unit, centerY: 4.5 * unit, radius: unit / 4, fill: "#c33"});
}

picture("flood-grid", function() {
  basePic();
  xoff = 200;
  fill(add, 5, 5, 1, 2);
  fill(add, 6, 3, 3, 4);
  basePic();
});
