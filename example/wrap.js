var ps = PencilScript;

var files = [];

function picture(name, conf, f) {
  if (!f) { f = conf; conf = {}; }
  var svg, link;
  conf.place = function(node) {
    svg = node;
    document.body.appendChild(node);
    link = document.body.appendChild(document.createTextNode(" "));
    link = document.body.appendChild(document.createElement("a"));
    link.textContent = "(download)";
    link.setAttribute("download", name + ".svg");
    link.href = "javascript:";
    document.body.appendChild(document.createElement("br"));
  };
  ps.picture(conf, f);
  if (svg.offsetWidth > 640) console.log(name + " is too wide (" + svg.offsetWidth + ")");
  files.push({name: name, content: toText(svg)});
  link.addEventListener("mouseover", function() {
    link.href = "data:image/svg+xml;base64," + btoa(toText(svg));
  });
}

function toText(node) {
  return node.outerHTML.replace(/^<svg\s*/, '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ');
}

function getZip(node) {
  var zip = new JSZip();
  files.forEach(function(file) {
    zip.file(file.name + ".svg", file.content);
  });
  var content = zip.generate({type: "blob"});
  var link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.setAttribute("download", "pictures.zip");
  link.innerHTML = "download";
  node.parentNode.appendChild(link);
}
