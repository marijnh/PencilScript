var ps = PencilScript;

var unit = 20;

picture("game-grid", function() {
  var grid = ps.grid({
    open: true,
    width: 6 * unit,
    height: 5 * unit,
    strokeWidth: 1,
    stroke: "#888",
    unit: unit,
    left: 0,
    top: 0
  });

  var player = ps.rect({
    width: .8 * unit,
    height: 1.5 * unit,
    fill: "#404040",
    left: grid.left + 2.725 * unit,
    top: grid.top + 1.825 * unit
  });

  var color = ps.rect({
    behind: grid,
    width: 2 * unit,
    height: 3 * unit,
    fill: "#e0e0ff",
    left: grid.left + 2 * unit,
    top: grid.top + unit
  });
});
