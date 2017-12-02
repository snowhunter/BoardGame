var actionPanel = function (rowSpan, tileSize) {

    //properties for positioning the panel
    this.startX = Math.sqrt(3)*tileSize*(rowSpan + 0.5);
    this.startY = 1;
    this.width = window.innerWidth - this.startX; // ~275
    console.log("board width" + this.startX);
    this.height = window.innerHeight;


    //reference to selected stuff
    this.selectedTile = null;
    this.selectedNeighbours = null;
    this.selectedTileType = null;
    this.selectedUnit = {type: null};

    //button bounding rectangles
    this.buttons = {};
    this.panelLoaded = false;

    this.show = function (context, image) {

        this.drawPanel(context);

        this.displayTileData(context, image);


        if(this.selectedUnit.type){

            this.displayUnitData(context);

            this.displayActions(context);

            this.panelLoaded = true;
        }



    };
    
    this.drawPanel = function (context) {
        context.fillStyle = "#FF6B33";
        context.fillRect(this.startX, this.startY, this.width, this.height);
        context.strokeStyle = "#471158";
        context.strokeRect(this.startX + 3, this.startY + 3, this.width - 5, this.height - 5);
    };
    
    this.displayTileData = function (context, image) {

        let start_x = this.startX + 7, start_y = this.startY + 7, height = this.height/3, width = this.width - 12;
        let fontsize = 25, textlength, message, placeHolderY, offset = getPortraitOffset(this.selectedTileType);

        //frame
        context.strokeStyle = "#110520";
        context.strokeRect(start_x, start_y, width , height);


        //text info
        context.fillStyle = "#000000";
        message = "Terrain:";
        textlength = context.measureText(message).width;
        context.font = fontsize + "px Arial";
        placeHolderY = this.startY  + 50 + fontsize;
        context.fillText(message, this.startX + (width - textlength)/2 , this.startY + 40);

        if(this.selectedTile) {
            context.drawImage(image, offset, 0, 220, 200, start_x + 3, placeHolderY, this.width - 20, height - placeHolderY);
        }
        else{
            //placeholder
            context.fillStyle = "#FFFFFF";
            context.fillRect(start_x+ 3, placeHolderY, this.width - 20, height - placeHolderY);
        }


    };
    
    this.displayUnitData = function (context) {
        let start_x = this.startX + 7, start_y  = this.startY + this.height/3 + 10, height = this.height/3;
        let wordHeight = height/10, offset, ratio;


        //frame
        context.strokeStyle = "#110520";
        context.strokeRect(start_x, start_y, this.width - 10, height);

        //text info
        context.fillStyle= "#000000";
        context.font = wordHeight + "px Arial";
        context.fillText("Unit: " + this.selectedUnit.type, start_x + 3, start_y + 7 + wordHeight);


        ratio = this.selectedUnit.hp/this.selectedUnit.maxhp;
        offset = context.measureText("hp: ").width;


        //hp bar
        context.fillStyle = "#FF0030";
        context.fillRect(start_x + offset, start_y + 10 + wordHeight, 102, wordHeight);
        context.fillStyle = "#00CC11";
        context.fillRect(start_x + offset + 1, start_y + 10 + wordHeight, ratio*100, wordHeight);

        context.fillStyle = "#000000";

        context.fillText("hp: " + this.selectedUnit.hp + "/" + this.selectedUnit.maxhp, start_x + 3, start_y + 7 + 2*wordHeight);
        context.fillText("attack: " + this.selectedUnit.attack, start_x + 3, start_y + 7 + 3*wordHeight);
        context.fillText("move range: " + this.selectedUnit.movementRange, start_x + 3, start_y + 7 + 4*wordHeight);

    };

    this.displayActions = function (context) {
        let start_x = this.startX + 7, start_y = this.startY + 10 + 2*this.height/3;
        let textheight = 25, height = this.height - start_y, textwidth, message = "Actions: ";

        //frame
        context.strokeStyle = "#000000";
        context.strokeRect(start_x, start_y, this.width - 12, 300);

        context.font = textheight + "px Arial";
        textwidth = context.measureText(message).width;
        context.fillText("Actions: ", start_x + (this.width - textwidth)/2, start_y + textheight);


        this.drawActionButtons(context);

        
        
    };
    
    this.drawActionButtons = function (context) {

        let button_height = (this.height - this.startY - 10 - 2*this.height/3)/5, button_width;
        let start_x = this.startX + 7, start_y = this.startY + 10 + 2*this.height/3 + button_height;

        let map = {
            "attack" : ["#220C22", "#DDDDDD"],
            "move": ["#3300CD","#AAAAAA"]
        };

        context.font = (button_height-3)+"px Arial";
        button_width = context.measureText("atttack").width;

        context.fillStyle = map["attack"][0];
        this.buttons["attack"] = {x: start_x + (this.width - button_width)/2, y: start_y, width: button_width, height: button_height};
        context.fillRect(this.buttons["attack"].x, this.buttons["attack"].y, button_width, button_height);

        context.fillStyle = map["attack"][1];
        context.fillText("attack", this.buttons["attack"].x, this.buttons["attack"].y + button_height);

        context.fillStyle = map["move"][0];
        this.buttons["move"] = {x: start_x + (this.width - button_width)/2, y: start_y + 2*button_height, width: button_width, height: button_height};
        context.fillRect(this.buttons["move"].x, this.buttons["move"].y, button_width, button_height);

        context.fillStyle = map["move"][1];
        context.fillText("move", this.buttons["move"].x, this.buttons["move"].y + button_height);

    };

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

    };

    this.selectNeighbours = function (tiles) {

        this.selectedNeighbours = tiles; //***

    };
    
    this.checkButtonPress = function (clickX, clickY) {


        if(!this.selectedUnit.type || !this.panelLoaded){
            return 0;
        }



        if(clickX > this.buttons["attack"].x &&
            clickY > this.buttons["attack"].y &&
            (clickY - this.buttons["attack"].y)< this.buttons["attack"].height &&
            (clickX - this.buttons["attack"].x)< this.buttons["attack"].width){

            this.attack();

        }
        else if(clickX > this.buttons["move"].x &&
            clickY > this.buttons["move"].y &&
            (clickY - this.buttons["move"].y) < this.buttons["move"].height &&
            (clickX - this.buttons["move"].x) < this.buttons["move"].width){

            this.move();
        }
    };

    this.attack = function () {
        let neighbours  = getNeighboursDistanceN(hexmap, this.selectedTile.getVector(), this.selectedUnit.attackRange);
        this.selectNeighbours(vectorsToTiles(neighbours));
        mode = 3;
    };

    this.move = function () {
        mode = 2;
    };

};
