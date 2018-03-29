
var Screen = function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var imageData = ctx.createImageData(240,200);
    var d = imageData.data;

    var screen = {
        'vsync': function() {
            this.rebuildCanvas = !this.rebuildCanvas;
            canvas.style.backgroundColor = this.rebuildCanvas?1:0.999;
        },
       'rasterline': function(line, memory) {
            var textLine = Math.floor(line/8);
            var charLine = line%8;

            for(var col=0;col<40;col++) {

                // read char
                var ch = memory[0xbb80+textLine*40+col];
                var reverse = false;
                if(ch > 127) {
                    ch-=128;
                    ch&=0xff;
                    reverse=true;
                }

                // read character byte
                var r = memory[0xb400 + ch*8 + charLine];        

                for(var c=0;c<6;c++) {
                    var b = (reverse!=(r&040)==0) * 255;
                    r = r<<1;

                    var i = 4 * (col*6 + c + line*240);

                    d[i  ] = b;
                    d[i+1] = b;
                    d[i+2] = b;
                    d[i+3] = 255;
                }
            }

            ctx.putImageData(imageData, 0, 0);
        }
    }
    return screen;
}

module.exports = Screen;
