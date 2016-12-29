var prelude = function() {/*
<defs>
  <g id="squirrel">
    <path d="M 30 0 C 13 0 0 14 0 31 C 0 41 5 50 13 55 C 13 55 13 55 13 54 C 13 49 17 44 22 44 C 22 44 24 44 24 45 C 26 45 29 47 30 51 C 30 55 30 60 28 63 L 28 63 C 28 64 26 65 26 67 C 26 69 25 71 25 72 C 25 73 25 73 25 73 C 25 73 25 73 25 73 C 24 85 29 96 39 99 C 42 100 43 100 46 99 C 38 94 36 83 39 74 C 42 69 46 65 50 60 C 54 56 57 50 59 44 C 59 40 61 36 61 32 C 61 32 61 32 61 32 C 61 32 61 31 61 31 C 61 14 47 0 30 0 z" fill="#ea4" stroke="none"/>
    <path d="M 74 14 C 70 17 67 19 64 23 C 64 23 64 23 64 23 C 64 24 64 24 64 26 C 62 32 68 40 76 41 C 86 44 93 40 96 33 C 95 29 91 26 84 23 C 82 22 79 22 78 21 L 74 14 z M 79 26 C 80 26 82 27 82 28 C 82 29 80 31 79 31 C 78 31 76 29 76 28 C 76 27 78 26 79 26 z" fill="#ea4" stroke="none"/>
    <path d="M 68 41 C 68 41 68 41 68 41 L 68 41 L 68 41 C 64 46 57 56 43 71 C 43 72 42 73 42 74 C 39 81 39 88 43 94 C 43 94 45 94 45 95 C 45 95 45 95 45 95 C 46 95 46 95 46 95 C 46 95 46 95 46 95 C 46 96 47 96 47 96 C 49 97 50 97 50 99 C 53 99 55 100 57 100 L 57 100 L 96 100 C 96 100 96 100 96 100 C 99 100 100 97 100 95 C 100 94 99 91 96 91 L 96 91 L 79 91 L 78 91 L 75 91 C 75 91 75 91 75 91 C 75 91 76 91 76 90 C 76 90 78 90 78 90 C 78 90 78 90 78 90 C 78 88 78 88 78 88 C 79 88 79 88 79 88 C 79 88 79 88 79 88 C 84 83 86 77 82 73 C 79 71 76 69 74 68 C 72 68 72 68 71 68 C 71 68 71 68 70 68 C 70 68 70 68 70 68 C 70 68 68 68 68 68 C 68 68 68 68 68 68 C 68 68 68 68 68 68 C 67 68 67 68 67 68 C 67 68 67 68 67 68 C 67 68 66 68 66 68 C 66 68 66 68 66 68 C 64 68 64 69 64 69 C 63 69 63 69 62 69 C 62 69 62 69 62 69 C 61 71 61 71 61 71 C 59 71 59 71 59 72 C 59 72 59 72 59 72 C 58 72 58 72 58 72 C 58 72 58 72 58 72 C 57 73 57 73 57 73 C 57 73 57 73 57 73 C 57 73 57 73 57 73 C 55 74 55 74 55 74 C 55 74 55 74 55 74 C 55 74 55 76 55 76 C 54 76 54 76 54 77 C 54 77 54 77 54 77 L 51 76 C 51 74 53 74 53 73 C 54 72 55 71 57 69 C 61 67 64 65 70 65 C 70 65 71 65 71 65 C 72 65 74 65 74 67 C 74 65 75 65 75 64 C 76 60 79 58 82 56 C 82 56 82 56 82 56 C 83 55 84 55 86 55 L 88 55 C 88 56 91 59 93 59 C 96 59 97 56 97 54 C 97 51 96 49 93 49 L 93 49 L 79 49 L 78 45 C 75 44 71 42 68 41 z" fill="#ea4" stroke="none"/>
  </g>
  <g id="pizza">
    <path d="M 4 96 L 74 38 A 92 92 0 0 0 4 4 Z" stroke="#b44" stroke-width="8" fill="none" stroke-linejoin="round"/>
    <circle cx="20" cy="20" r="10" fill="#b44"/>
    <circle cx="40" cy="30" r="9" fill="#b44"/>
    <circle cx="15" cy="66" r="11" fill="#b44"/>
    <circle cx="12" cy="36" r="10" fill="#b44"/>
    <circle cx="37" cy="51" r="11" fill="#b44"/>
    <circle cx="62" cy="34" r="8" fill="#b44"/>
  </g>
</defs>
*/};

picture("pizza-squirrel", {prelude: prelude}, function() {
  var ux = 250, uy = 170;
  var grid = ps.grid({unitX: ux, unitY: uy, width: 2 * ux, height: 2 * uy, strokeWidth: 2, stroke: "black", top: 0, left: 0});
  for (var pizza = 0; pizza < 2; pizza++) {
    for (var squirrel = 0; squirrel < 2; squirrel++) {
      var x = pizza * ux, y = squirrel * uy;
      ps.use({href: "#pizza", left: 150 + x, top: 20 + y, opacity: pizza ? null : .3});
      ps.use({href: "#squirrel", left: 20 + x, top: 20 + y, opacity: squirrel ? null : .3});
      ps.text({text: (squirrel ? "S" : "No s") + "quirrel, " + (pizza ? "" : "no ") + "pizza",
               left: x + 20, bottom: y + uy - 10, fontFamily: "Georgia", fontSize: 17});
      ps.text({text: [76, 9, 4, 1][pizza + squirrel * 2],
               right: x + ux - 20, bottom: y + uy - 10, fontFamily: "Georgia", fontSize: 31});
    }
  }
});

picture("linked-list", {prelude: objPrelude}, function() {
  var between = 30, width = 50;
  var c1 = objbox(null, ["value: 1", "rest:"], {left: 0, top: 0, width: width});
  var c2 = objbox(null, ["value: 2", "rest:"], {left: c1.box.right + between, top: c1.box.top + 10, width: width});
  var a1y = c1.lines[1].centerY + 1;
  ps.arrow({startX: c1.lines[1].right + 8, startY: a1y, endX: c2.box.left, endY: a1y, class: "sep"});
  var c3 = objbox(null, ["value: 3", "rest: null"], {left: c2.box.right + between, top: c2.box.top + 10, width: width});
  var a2y = c2.lines[1].centerY + 1;
  ps.arrow({startX: c2.lines[1].right + 8, startY: a2y, endX: c3.box.left, endY: a2y, class: "sep"});
});
