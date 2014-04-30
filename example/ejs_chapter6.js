picture("rabbits", {prelude: objPrelude}, function() {
  var kr = objbox("killerRabbit", ["teeth: \"long, sharp, ...\"", "adjective: \"killer\""], {top: 0, left: 0});
  var rp = objbox(null, ["teeth: \"small\"", "speak: <function>"], {top: kr.box.bottom - 5, left: kr.box.centerX, behind: kr});
  var op = objbox(null, ["toString: <function>", "..."], {top: rp.box.bottom - 5, left: rp.box.centerX, behind: rp});
  var rc = objbox("Rabbit", ["prototype"], {top: kr.box.top - 80, left: kr.box.right + 40});
  ps.arrow({startX: rc.lines[0].centerX, startY: rc.lines[0].bottom + 2, endX: rp.box.right - 40, endY: rp.box.top, class: "sep"});
  var oc = objbox("Object", ["create: <function>", "prototype", "..."], {top: kr.box.top - 10, left: rc.box.right + 30});
  ps.arrow({startX: oc.lines[1].left - 4, startY: oc.lines[1].bottom, endX: op.box.centerX + 20, endY: op.box.top, class: "sep"});
});
