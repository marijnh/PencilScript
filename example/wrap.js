var ps = PencilScript;

var files = [];

function picture(name, conf, f) {
  if (!f) { f = conf; conf = {}; }
  var svg;
  conf.place = function(node) {
    svg = node;
    document.body.appendChild(node);
    document.body.appendChild(document.createElement("br"));
  };
  ps.picture(conf, f);
  if (svg.offsetWidth > 640) console.log(name + " is too wide (" + svg.offsetWidth + ")");
  files.push({name: name, content: toText(svg)});
}

function toText(node) {
  return node.outerHTML.replace(/^<svg\s*/, '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ');
}

function getZip() {
  var zip = new JSZip();
  files.forEach(function(file) {
    zip.file(file.name + ".svg", file.content);
  });
  var content = zip.generate();
  location.href="data:application/zip;base64,"+content;
}
