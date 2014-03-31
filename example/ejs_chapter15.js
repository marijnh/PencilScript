var ps = PencilScript;
var style = {background: "#ccf", foreground: "#34c"};

var unit = 20;

ps.picture(function() {
  var grid = ps.grid({
    open: true,
    width: 6 * unit,
    height: 5 * unit,
    strokeWidth: 1,
    stroke: "black",
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
    fill: style.background,
    left: grid.left + 2 * unit,
    top: grid.top + unit
  });
});
