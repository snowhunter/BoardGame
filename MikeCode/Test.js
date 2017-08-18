var s = new HexMap(40, 40);
var pt = new Vector(5, 5);
var ary = s.getNeighborsDistanceN(pt, 2);

for (var i = 0; i < ary.length; i++) {
    document.write(ary[i].x, ", ", ary[i].y);
    document.write("<br>");
}