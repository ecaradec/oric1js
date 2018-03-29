function hex(n,p) {
    if(p==undefined) p = 2;
    if(n==undefined) return "XX";
    
    var tmp = pad(n.toString(16).toUpperCase(), p);
    if(tmp.length == 3)
        return "0"+tmp;
    return tmp;
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function toBin(v) {
    if(v==undefined) v = 0;
    return pad(v.toString(2), 8, "0").replace(/0/g,'_').replace(/1/g,'#');
}

var addr_space = {
    write:function(addr, src) {
        if(addr>=0x300 && addr<0x400) {
            VIA.write(addr&0xf, src);
        }

        memory[addr] = src&0xFF;
    },
    read:function(addr) {
        if(addr >= 0xc000)
            return rom[addr-0xc000];
        if(addr >= 0x300 && addr<0x400) {
            return VIA.read(addr&0xf);
        }

        return memory[addr];
    }
}

var memory = Array(0xFFFF);
var rom = require('./basic11ROM.js')

var cycles = 0;

var rastercycles     = 20000;  // every 1/50s  = 20ms
var IRQCycles        = 100000; // every 1/100s = 10ms
var rasterlinecycles = 200;  // every 1/50s  = 20ms
var rasterLine = 0;

var n = 0 ;
var VIA = require('./p6522.js');
var CPU = require('./p6502.js');
var p8912 = require('./p8912.js');
var keyboard = require('./keyboard.js');
var screen = require('./screen.js')();
var cpu = CPU({addr_space: addr_space, memory: memory});

var oric1 = {
    stats: {},
    run: function(opts) {
        this.VIA = VIA;
        this.p8912 = p8912;
        this.keyboard = keyboard;
        
        cpu.reset();
        this.opts = opts;

        var self=this;
        function once() {
            var c = 1000;
            while(c--) {
                self.step();
            }
            
            window.setTimeout(once,0);
        }
        
        once();
    },
    step: function() {
        cpu.step();
        var icycles = cpu.icycles;

        p8912.step(this);
        
        VIA.step(this);

        // count cycles
        if(icycles==1)
            icycles = 2;
        cycles += icycles;

        // count raster line
        rasterlinecycles-=icycles;
        if(rasterlinecycles <= 0) {
            rasterlinecycles+=200;
            rasterline = (rasterLine++)%200;
            screen.rasterline(rasterline, memory);
            if(rasterline == 0) {
                screen.vsync();
            }
        }

        // count IRQ cycles
        IRQCycles -= icycles;
        if(IRQCycles<=0) {
            //IRQCycles += 100000;
            IRQCycles += 10000;
            cpu.irq();
        }
    }
}

oric1.run();
//module.exports = oric1;
