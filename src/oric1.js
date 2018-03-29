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

var p8912 = {
    registers:[]
};
p8912.registers.fill(0,0,0xF);

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

var logInstruction = false;
var logWrite = false;
var logRead = false;

var cycles = 0;

var str="";

var rastercycles     = 20000;  // every 1/50s  = 20ms
var IRQCycles        = 100000; // every 1/100s = 10ms
var rasterlinecycles = 200;  // every 1/50s  = 20ms
var rasterLine = 0;

var n = 0 ;
var VIA = require('./p6522.js');
var CPU = require('./p6502.js');
var keyboard = require('./keyboard.js');
var screen = require('./screen.js')();
var cpu = CPU({addr_space: addr_space, memory: memory});

var oric1 = {
    stats: {},
    run: function(opts) {
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
        if(logInstruction) {
            str = hex(PC,4)+" ";

            regStr =" A:"+hex(A)+" X:"+hex(X)+" Y:"+hex(Y)+" P:"+hex(getP())+" SP:"+hex(SP)+" ";
            
            var cyclesStr = 'CYC : '+((cycles*3)%340);
            operStr = "";
        }

        cpu.step();
        var icycles = cpu.icycles;

        // update 6522 ports
        var row = 3;
        var col = 4;
       
        //
        // col est ecrite sur le 8912 via 6522. steps :
        // write address (register)
        // - set porta du 6522 to 0xE (30F)
        // - set CA2=1, CB2=1  (0x30C) 8912 selectionne le registre (0xE pour clavier )
        // - set CA2=1, CB2=1  (0x30C) 8912 arrete de recopier le registre
        // write data
        // - set porta du 6522 (0x30F)
        // - set CA2=0, CB2=1 (w 0x30C) => lecture du porta, ecriture sur le 8912 (CA2=BC1 du 8912 et CB2=BDIR du 8912 )
        // - set CA2=0, CB2=0 (w 0x30C) => arrete de lire les données

        // 1110
        // 12>>11111111
        // 12>>11011101
        // 11111011
        // 12>>11111101
        // 12>>11011101

        // should test only flags CA2 and CB2
        if(VIA.pcr == 0xFF) {
            p8912.address = VIA.porta;
        }

        if(VIA.pcr == 0xFD) {
            p8912.registers[p8912.address] = VIA.porta;
        }

        if( keyboard.getKeyState(VIA.portb&7, p8912.registers[0xE]) ) {
            VIA.portb |= 0x8;
        } else {
            VIA.portb &= ~0x8;
        }

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

        if(logInstruction) {
            str = rpad(str, 16, " ");

            str+=ins.name+" ";
            str+=operStr+" ";
            str = rpad(str, 48, " ");

            str += regStr + cyclesStr; // + " " + dump;
            
            console.log(str);
        }
        
    },
    debugStatus: function() {
        console.log(getStatusStr()+"\n");
        this.disassemble(PC, 20);
        //this.dumpScreen();
    }            
}

oric1.run();
//module.exports = oric1;
