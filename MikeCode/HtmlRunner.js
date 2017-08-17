var s = new TileMap(30, 30, 60);
s.print()
var point = [5, 5];
var pts = s.findNeighbors(point);
document.write(pts);