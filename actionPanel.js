var actionPanel = function () {

    //properties for positioning the panel
    //todo: make these dynamic, to fit the various screen sizes the user may have
    this.startX = Math.sqrt(3)*30*21;
    this.startY = 1;
    this.width = window.innerWidth - this.startX;
    this.height = window.innerHeight;

    this.selectedTile = new Object();
    this.selectedTileType = null;
    this.selectedUnit = {type: "null"};

    this.show = function (context) {

        //drawing the container panel
        context.beginPath();
        context.rect(this.startX, this.startY, this.width, this.height);
        context.fillStyle = "#FF6B33";
        context.fill();
        context.closePath();

        //information on the tile selected
        context.fillStyle = "#000000";
        context.font = "25px Arial";
        context.fillText("Tile Type: " + this.selectedTileType, this.startX +10, this.startY+40);

        //place reserved for showing the tile image
        context.beginPath();
        context.rect(this.startX + (this.width-100)/2, this.startY + 60, 100, 100);
        context.fillStyle = "#FFFFFF";
        context.fill();

        //information on units
        context.fillStyle = "#000000";
        context.fillText("Unit type: " + this.selectedUnit.type, this.startX + 10, this.startY + 200);

    }
    
    this.selectTile = function (tile, context) {

        this.selectedTile = tile;
        this.selectedTileType = this.selectedTile.type;

        if(tile.unit){
            this.selectedUnit = tile.unit;
        }

    }


}
