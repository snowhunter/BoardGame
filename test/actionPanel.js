var actionPanel = function (rowSpan, tileSize) {

    //properties for positioning the panel
    //todo: make these dynamic, to fit the various screen sizes the user may have
    this.startX = Math.sqrt(3)*tileSize*(rowSpan + 0.5);
    this.startY = 1;
    this.width = window.innerWidth - this.startX; // ~275
    this.height = window.innerHeight;

    this.selectedTile = null;
    this.selectedTileType = null;
    this.selectedUnit = {type: null};
    

    this.show = function (context) {

        this.drawPanel(context);

        this.displayTileData(context);

        if(this.selectedUnit.type){

            this.displayUnitData(context);

            this.displayActions(context);
        }



    }
    
    this.drawPanel = function (context) {
        context.fillStyle = "#FF6B33";
        context.fillRect(this.startX, this.startY, this.width, this.height);
        context.strokeStyle = "#471158";
        context.strokeRect(this.startX + 3, this.startY + 3, this.width - 5, this.height - 5);
    }
    
    this.displayTileData = function (context) {
        /**
         *  ~130 pixels height
         */
        
        //frame
        context.strokeStyle = "#110520";
        context.strokeRect(this.startX + 7, this.startY + 7, this.width - 12 , 120);

        //text info
        context.fillStyle = "#000000";
        context.font = "25px Arial";
        context.fillText("Terrain:", this.startX + 10, this.startY + 40);
        context.fillText(this.selectedTileType, this.startX + 10, this.startY + 80);

        //image placeholder
        context.fillStyle = "#FFFFFF";
        context.fillRect(this.startX + this.width/2, this.startY + 15, 2*this.width/5, 2*this.width/5);
    }
    
    this.displayUnitData = function (context) {

        /**
         *  ~200 pixels height
         */

        //frame
        context.strokeStyle = "#110520";
        context.strokeRect(this.startX + 7, this.startY + 135, this.width - 12, 200);

        //text info
        context.fillStyle= "#000000";
        context.font = "25px Arial";
        context.fillText("Unit: " + this.selectedUnit.type, this.startX + 10, this.startY + 175);


        var ratio = this.selectedUnit.hp/this.selectedUnit.maxhp;

        //hp bar
        context.fillStyle = "#FF0030";
        context.fillRect(this.startX + 55, this.startY + 185, 102, 30);
        context.fillStyle = "#00CC11";
        context.fillRect(this.startX + 56, this.startY + 186, ratio*100, 28);

        context.fillStyle = "#000000";

        context.fillText("HP: " + this.selectedUnit.hp + "/300", this.startX + 10, this.startY + 210);
        context.fillText("ATTACK: " + this.selectedUnit.attack, this.startX + 10, this.startY + 245);

    }

    this.displayActions = function (context) {
        //frame
        context.strokeStyle = "#000000";
        context.strokeRect(this.startX + 7, this.startY + 345, this.width - 12, 300);

        context.font = "25px Arial";
        context.fillText("Actions: ", this.startX + 10, this.startY + 378);

        //this array should be fetched from the unit's properties.
        var temp = ["attack", "move"];
        for(var i=0; i<temp.length; i++){
            this.drawActionButtons(temp[i], this.startX + 12 + i*130, this.startY + 450, context);
        }
        
        
    }
    
    this.drawActionButtons = function (type, x, y, context) {

        var map = {
            "attack" : ["#220C22", "#DDDDDD"],
            "move": ["#3300CD","#AAAAAA"]
        }

        context.fillStyle = map[type][0];
        context.fillRect(x, y, 120, 60);

        context.fillStyle = map[type][1];
        context.font = "30px Arial";
        context.fillText(type, x+20, y+40);

    }

    this.selectTile = function (tile) {

        this.selectedTile = tile;
        this.selectedTileType = this.selectedTile.type;

        //if there are units on the selected tile, make a reference to them
        if(tile.unit){
            this.selectedUnit = tile.unit;
        }
        else{
            this.selectedUnit = {type: null};
        }

    }

    this.unselect = function () {
        this.selectedTile = null;
        this.selectedTileType = null;
        this.selectedUnit = {type: null};
    }


}
