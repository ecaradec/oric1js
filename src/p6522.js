
//
// VIA 6522
//
var VIA = {
    ira: 0,
    ier: 0,
    ifr: 0,
    ddrb: 0,
    ddra: 0,
    acr: 0,
    pcr: 0,
    orb: 0,
    porta: 0,
    portb: 0,
    write: function(addr, value) {
        value = value&0xff;
        switch(addr) {
            case 0:
                // port b (in/out)
                this.orb = value;
                this.portb = (this.orb & this.ddrb) | (this.portb & ((~this.ddrb)&0xff));
                if( (this.pcr&0xe0 == 0x20) ||
                    (this.pcr&0xe0 == 0x60) ) {
                    this.ifr &= 0xef;
                } else {
                    this.ifr &= 0xe7;
                }

                break;
            case 1:
                // port a (in/out)
                // port a directly address columns of keyboard grid (3 lowest bits )
                this.ora = value;
                this.porta = (this.ora & this.ddra) | (this.porta & ((~this.ddra)&0xff));
                if( (this.pcr & 0x0e) == 0x02 || (this.pcr & 0x0e) == 0x06 )
                    this.ifr &= 0xfd;
                else
                    this.ifr &= 0xfc;
                this.idr |= 0x0e;

                break;
            case 2:
                // define port b input / output. output if set. each bit count
                this.ddrb = value;
                break;
            case 3:
                // define port a input / output. output if set. each bit count
                this.ddra = value;
                break;
            case 12:
                // peripheral control register
                this.pcr = value;
                if(this.pcr == 1)
                    this.ifr |= 2;
                if((this.pcr & 0x0e) == 0x04)
                    this.ifr |= 1;
                if(this.pcr & 0x10)
                    this.ifr |= 0x10;
                if((this.pcr & 0xe0) == 0x40)
                    this.ifr |= 0x08;
                break;
            case 13:
                // interrupt flag register
                this.ifr&=~value;
                break;
            case 14:
                // interrupt enable register
                if(value & 0x80) {
                    this.ier |= value;
                } else {
                    this.ier &= ((~value)&0xff);
                }
                this.ier &= 0x7f;
                break;
            case 15:
                // the column to write of 8912 is written here
                
                // direct porta read / write
                this.ora = value;
                this.porta = (this.ora & this.ddra) | (this.porta & ((~this.ddra)&0xff));
                break;
        }
    },
    read: function(addr, value) {
        switch(addr) {
            case 0:
                if((this.pcr & 0xe0) == 0x020 || (this.pcr & 0xe0) == 0x60) {
                    this.ifr &= 0xef;
                } else {
                    this.ifr &= 0xe7;
                }

                var r = this.orb & this.ddrb;
  
                if(this.acr & 0x02) {
                    r |= this.irb & ((~this.ddrb)&0xff);
                } else {
                    r |= this.portb & ((~this.ddrb)&0xff);
                }

                return r;
            case 1:
                if((this.pcr & 0x0e) == 0x2 ||
                   (this.pcr & 0x0e == 0x6))
                    this.ifr &= 0xfd;
                else
                    this.ifr &= 0xfc;

                if(this.acr == 1) {
                    return this.ira;
                } else {
                    return this.porta;
                }
            case 2:
                return this.ddrb;
            case 1:
                return this.ddra;
            case 12:
                return this.pcr;
//            case 13:
//                return this.ifr | 0x80;
            case 14:
                return this.ier | 0x80;
            case 15:
                if(this.acr & 1) {
                    return this.ira;
                } else {
                    return this.porta;
                }
        }
        return 0xff;
    },
};

module.exports = VIA; 
