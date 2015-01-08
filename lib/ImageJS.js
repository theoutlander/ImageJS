var ImageJS = function(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.imageObj = new Image();
};

ImageJS.prototype = {
    loadImageURL: function(url, callback) {
        var self = this;
        this.imageObj.onload = function() {
            self.context.drawImage(self.imageObj, 0, 0, self.canvas.width, self.canvas.height);
            self.imageData = self.getImageData();
            self.originalData = new Uint8ClampedArray(self.imageData.data);
            if(callback)
            {
                callback();
            }
        };

        this.imageObj.src = url;
    },

    getOriginalData: function() {
      return this.originalData;
    },

    getData: function() {
        if(this.imageData) {
            return this.imageData.data;
        }

        return getImageData.data;
    },

    getImageData: function() {
        if(this.imageData)
        {
            return this.imageData;
        }

        return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    },

    copyData: function(data) {
        for(var i=0; i<this.imageData.data.length; i++) {
            this.imageData.data[i] =  data[i];
        }
    },

    renderImageData: function(data) {
        if(data)
        {
            this.copyData(data);
        }

        this.context.putImageData(this.imageData, 0, 0)
    },

    reset: function() {
        this.copyData(this.originalData);
        this.renderImageData();
    },

    changeColors: function(n) {
        for(var i=0; i<this.imageData.data.length; i++) {
            if(i%4==3 || i%4==2 || i%4==1){
                continue;
            }
            this.imageData.data[i] = (this.imageData.data[i] / n);
        }

        this.renderImageData();
    },

    grayScaleAverage: function() {
        for(var i=0; i<this.imageData.data.length; i+=4) {
            var gray = (this.imageData.data[i] + this.imageData.data[i+1] + this.imageData.data[i+2]) / 3;
            this.imageData.data[i] = this.imageData.data[i+1] = this.imageData.data[i+2] = gray;
        }

        this.renderImageData();
    },

    grayScaleLightness: function() {
        for(var i=0; i<this.imageData.data.length; i+=4) {
            var max = Math.max(this.imageData.data[i], this.imageData.data[i+1], this.imageData.data[i+2]);
            var min = Math.min(this.imageData.data[i], this.imageData.data[i+1], this.imageData.data[i+2]);

            var gray = (max + min) / 2;
            this.imageData.data[i] = this.imageData.data[i+1] = this.imageData.data[i+2] = gray;
        }

        this.renderImageData();
    },

    grayScaleLuma: function(r, g, b) {
        for(var i=0; i<this.imageData.data.length; i+=4) {
            var gray = (this.imageData.data[i] * r + this.imageData.data[i + 1] * g + this.imageData.data[i + 2] * b);
            this.imageData.data[i] = this.imageData.data[i + 1] = this.imageData.data[i + 2] = gray;
        }

        this.renderImageData();
    },

    grayScaleLumaBT709: function() {
        this.grayScaleLuma(0.2126, 0.7152, 0.0722);
    },

    grayScaleLumaBT601: function() {
        this.grayScaleLuma(0.299, 0.587, 0.114);
    },

    grayScaleDecomposeHighest: function() {
        for(var i=0; i<this.imageData.data.length; i+=4) {
            var max = Math.max(this.imageData.data[i], this.imageData.data[i+1], this.imageData.data[i+2]);
            this.imageData.data[i] = this.imageData.data[i + 1] = this.imageData.data[i + 2] = max;
        }

        this.renderImageData();
    },

    grayScaleDecomposeLowest: function() {
        for(var i=0; i<this.imageData.data.length; i+=4) {
            var max = Math.min(this.imageData.data[i], this.imageData.data[i+1], this.imageData.data[i+2]);
            this.imageData.data[i] = this.imageData.data[i + 1] = this.imageData.data[i + 2] = max;
        }

        this.renderImageData();
    },

    negate: function() {
        for(var i=0; i<this.imageData.data.length; i++) {
            if(i%4 == 3) // skip alpha
            {
                continue;
            }

            this.imageData.data[i] = 255 - this.imageData.data[i];
        }

        this.renderImageData();
    },

    blackAndWhite: function() {

        for(var i=0; i<this.imageData.data.length; i+=4) {
            var gray = (this.imageData.data[i] + this.imageData.data[i + 1] + this.imageData.data[i + 2]) / 3;
            gray = gray > 127 ? 255 : 0;

            this.imageData.data[i] = this.imageData.data[i + 1] = this.imageData.data[i + 2] = gray;
        }

        this.renderImageData();
    },

    flipVerticalAndHorizontal: function() {
        var length = this.imageData.data.length;

        for(var i=0; i<length / 2; i+=4) {
            for(var j=0; j< 4; j++) {
                var tmp = this.imageData.data[i+j];
                this.imageData.data[i+j] = this.imageData.data[length-(i + (3-j)) - 1];
                this.imageData.data[length-(i + (3-j)) - 1] = tmp;
            }
        }

        this.renderImageData();
    },

    flipVertical: function() {

        var rows = this.imageData.height;//this.imageData.data.length / (this.imageData.height*4);
        var cols = this.imageData.width*4;

        for(var i=0; i<rows / 2; i++){
            var rowOffset = i * cols;

            for(var j=0; j<cols; j++) {
                var tmp = this.imageData.data[rowOffset + j];
                this.imageData.data[rowOffset + j] = this.imageData.data[((rows - i) * cols) + j];
                this.imageData.data[((rows - i)*cols) + j] = tmp;
            }
        }

        this.renderImageData();
    },

    flipHorizontal: function() {

        var width = this.imageData.width*4;

        for(var i=0; i<this.imageData.height; i++)
        {
            var rowOffset = i*this.imageData.width*4;
            for(var j=0; j<this.imageData.width/2; j++)
            {
                var col = j*4;
                var offset = rowOffset + col;

                for(var k=0; k<4; k++)
                {
                    var tmp = this.imageData.data[offset+k];
                    this.imageData.data[offset+k] = this.imageData.data[(rowOffset + width) - (col + (3-k)) - 1]
                    this.imageData.data[(rowOffset + width) - (col + (3-k)) - 1] = tmp;
                }
            }
        }

        this.renderImageData();
    },

    getSize: function() {
        return this.imageData.data.length / 1024;  //(this.imageData.width * this.imageData.height * 32) / (8 * 1024);
    },

    computeFourNeighborhood: function(overlap) {

        var data = overlap ? this.imageData.data : new Uint8ClampedArray(this.imageData.data);

        for(var c=0; c<4; c++) {
            for (var row = 0; row < this.imageData.height; row++) {
                var rowOffset = row * this.imageData.width;
                for (var col = 0; col < this.imageData.width; col++) {
                    var result = this.fourNeighborhood(rowOffset + col, c);
                    data[(rowOffset*4)+(col*4)+c] = result.arr.reduce(function(a, b) { return a+b;}) / result.arr.length;
                }
            }
        }

        if(!overlap){
            this.copyData(data);
        }

        this.renderImageData();

        console.log("Done with Four Neighborhood Computation!");
    },

    fourNeighborhood: function(i, channel)
    {
        var result = {
            arr: []
        }

        var index = (i*4);
        if(channel<0
            || channel>3
            || index>this.imageData.data.length-(4-1)) // 4 channels - 1 for 0 based index
        {
            return result;
        }

        var rows = this.imageData.height;
        var cols = this.imageData.width;

        var rowLength = cols * 4;

        var indexRow = Number.parseInt(index / rowLength);
        var indexCol = (index - (indexRow * rowLength))/4;

        // North
        if((indexRow-1)>=0)
        {
            result.north = this.imageData.data[((indexRow-1)*rowLength) + (indexCol*4) + channel];
            result.arr.push(result.north);
        }

        // West
        if((indexCol-1)>=0)
        {
            result.west = this.imageData.data[(indexRow*rowLength) + ((indexCol-1)*4) + channel];
            result.arr.push(result.west);
        }

        // Self
        result.self = this.imageData.data[(indexRow*rowLength) + (indexCol*4)];
        result.arr.push(result.self);

        // East
        if((indexCol+1)<cols)
        {
            result.east = this.imageData.data[(indexRow*rowLength) + ((indexCol+1)*4) + channel];
            result.arr.push(result.east);
        }

        // South
        if((indexRow+1)<rows)
        {
            result.south = this.imageData.data[((indexRow+1)*rowLength) + (indexCol*4) + channel];
            result.arr.push(result.south);
        }

        return result;
    },

    computeEightNeighborhood: function(overlap) {
        var data = overlap ? this.imageData.data : new Uint8ClampedArray(this.imageData.data);

        for(var c=0; c<4; c++) {
            for (var row = 0; row < this.imageData.height; row++) {
                var rowOffset = row * this.imageData.width;
                for (var col = 0; col < this.imageData.width; col++) {
                    var result = this.eightNeighborhood(rowOffset + col, c);
                    data[(rowOffset*4)+(col*4)+c] = result.arr.reduce(function(a, b) { return a+b;}) / result.arr.length;
                }
            }
        }

        if(!overlap) {
            this.copyData(data);
        }
        this.renderImageData();

        console.log("Done with Eight     Neighborhood Computation!");
    },

    eightNeighborhood: function(i, channel) {
        var result = {
            arr: []
        }

        var index = (i*4);
        if(channel<0
            || channel>3
            || index>this.imageData.data.length-(4-1)) // 4 channels - 1 for 0 based index
        {
            return result;
        }

        var rows = this.imageData.height;
        var cols = this.imageData.width;

        var rowLength = cols * 4;

        var indexRow = Number.parseInt(index / rowLength);
        var indexCol = (index - (indexRow * rowLength))/4;


        // North West
        if((indexRow-1)>=0 && (indexCol-1)>=0)
        {
            result.northwest = this.imageData.data[((indexRow-1)*rowLength) + ((indexCol-1)*4) + channel];
            result.arr.push(result.northwest);
        }

        // North
        if((indexRow-1)>=0)
        {
            result.north = this.imageData.data[((indexRow-1)*rowLength) + (indexCol*4) + channel];
            result.arr.push(result.north);
        }

        // North East
        if((indexRow-1)>=0 && (indexCol+1)<cols)
        {
            result.northeast = this.imageData.data[((indexRow-1)*rowLength) + ((indexCol+1)*4) + channel];
            result.arr.push(result.northeast);
        }

        // West
        if((indexCol-1)>=0)
        {
            result.west = this.imageData.data[(indexRow*rowLength) + ((indexCol-1)*4) + channel];
            result.arr.push(result.west);
        }

        // Self
        result.self = this.imageData.data[(indexRow*rowLength) + (indexCol*4)];
        result.arr.push(result.self);

        // East
        if((indexCol+1)<cols)
        {
            result.east = this.imageData.data[(indexRow*rowLength) + ((indexCol+1)*4) + channel];
            result.arr.push(result.east);
        }

        // South West
        if((indexRow+1)<rows && (indexCol-1)>=0)
        {
            result.southwest = this.imageData.data[((indexRow+1)*rowLength) + ((indexCol+1)*4) + channel];
            result.arr.push(result.southwest);
        }

        // South
        if((indexRow+1)<rows)
        {
            result.south = this.imageData.data[((indexRow+1)*rowLength) + (indexCol*4) + channel];
            result.arr.push(result.south);
        }

        // South East
        if((indexRow+1)<rows && (indexCol+1)<cols)
        {
            result.southeast = this.imageData.data[((indexRow+1)*rowLength) + ((indexCol+1)*4) + channel];
            result.arr.push(result.southeast);
        }

        return result;
    },

    addImage: function(image1, image2) {

    },

    subtractImage: function(image1, image2) {

    },

    union: function(i1, i2) {

    }

}