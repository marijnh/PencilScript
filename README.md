# PencilScript

This is a crude, undocumented, set of helpers for generating
nice-looking SVG diagrams. The examples/ folder contains some scripts
for illustrations in the second edition of Eloquent JavaScript.

It runs as JavaScript in the browser, querying the browser's layout
and CSS engines during the generation of the picture. It currently
only seems to fully work in Chrome, because FF's often reports crazy
bounding boxes for SVG nodes.

This helps in a few ways compared to writing raw SVG:

 - You can write code, and thus abstract repeated drawing concepts in
   functions/variables.

 - Shapes can be positioned by giving any combination of
   right/left/center/top/bottom/width/height info that fully specifies
   their position.
   
 - Creating a (box) shape returns a rectangle that you can use to base
   the position of other shapes on.
   
 - Declarative z-index ordering (before/behind option).
 
 - Some primitives, such as curved arrows, do quite a lot of
   computation, generating such shapes by hand is a pain.

 - It handles aligning to pixel boundaries, so the picture looks crisp
   when not zoomed.
