var PC = 0;

var SP = 0x0;
var A = 0;
var X = 0;
var Y = 0;

var C = 0;
var Z = 0;
var I = 1;
var D = 0;
var B = 0;
var V = 0;
var N = 0;

var icycles = 0;

function addr_space_read(addr) {
    icycles ++;
    return addr_space.read(addr);
}

function addr_space_write(addr,v) {
    icycles ++;
    addr_space.write(addr,v);
}

function setN(f) {
    N = !!f;
}
function setV(f) {
    V = !!f;
}
function setZ(f) {
    Z = !f;
}
function setC(f) {
    C = !!f;
}
function setI(f) {
    I = f;
}
function setD(f) {
    D = f;
}

function dumpAround(addr) {
    console.log(hex(addr-2,4) + " " + hex(addr_space.read(addr-2)));
    console.log(hex(addr-1,4) + " " + hex(addr_space.read(addr-1)));
    console.log(hex(addr  ,4) + " " + hex(addr_space.read(addr)));
    console.log(hex(addr+1,4) + " " + hex(addr_space.read(addr+1)));
    console.log(hex(addr+2,4) + " " + hex(addr_space.read(addr+2)));
}

function dumpStack() {
    for(var i=0;i<10;i++)
        console.log(hex(0x100+SP+i,4) + " " + hex(addr_space.read(0x100+SP+i)));    
}

function getP() {
    // N V 1 B D I Z C
    return (N<<7) + (V<<6) + (1<<5) + (B<<4) + (D<<3) + (I<<2) + (Z<<1) + C; 
}

function push(v) {
    addr_space.write(0x100+SP, v);
    SP--;
    SP&=0xFF;
    icycles ++;
}

function pull() {
    SP++;
    SP&=0xFF;
    var v = addr_space.read(0x100+SP);
    return v;
}

function push16(v) {
    push((v>>8)&0xFF);
    push(v&0xFF);
}

function pull16() {
    var lo = pull();
    var hi = pull();
    return (hi<<8) + lo;
}

function pad(n, width, z) {
  if(n==undefined) return "XX";
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function rpad(n, width, z) {
  if(n==undefined) return "XX";
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : n + new Array(width - n.length + 1).join(z);
}

function setSR(SR) {
    N = !!(SR&0x80);
    V = !!(SR&0x40);
    B = 0;
    D = !!(SR&0x08);
    I = !!(SR&0x04);
    Z = !!(SR&0x02);
    C = !!(SR&0x01);
}

var oper;
var addr;
var M;
var operStr;
var tmp;
var base;
var opcode;

//
// ADDRESSAGE
//
function ABS() {
    var lo = cpu.fetch();
    var hi = cpu.fetch();
    oper = lo + (hi<<8)

    M = addr_space_read(oper);
}

function ABS_J() {
    var lo = cpu.fetch();
    var hi = cpu.fetch();
    oper = lo + (hi<<8)

    M = addr_space_read(oper);
}

function ACC() {
    oper = A;
    M = A;
}

function IMM() {
    oper = cpu.fetch();
    M = oper;
}

function IMP() {
}

function ABS_X() {
    var lo = cpu.fetch();
    var hi = cpu.fetch();
    base = lo + (hi<<8)

        oper = base + X;
    M = addr_space_read(oper);
}

function ABS_Y() {
    var lo = cpu.fetch();
    var hi = cpu.fetch();
    base = lo + (hi<<8)

    oper = (base + Y)&0xFFFF;
    M = addr_space_read(oper);
}

function ZPG() {
    oper = cpu.fetch();

    M = addr_space_read(oper);
}

function ZPG_X() {

    base = cpu.fetch();
    oper = (base + X)&0xFF;
    M = addr_space_read(oper);
}

function ZPG_Y() {
    base = cpu.fetch();
    oper = (base + Y)&0xFF;
    M = addr_space_read(oper);
}

function IND() {
    var lo = cpu.fetch();
    var hi = cpu.fetch();
    addr = lo + (hi<<8)

    var nextAddr = (addr&0xFF00)+((addr+1)&0xFF); // next in page

    oper = addr_space_read(addr) + (addr_space.read(nextAddr)<<8);

}

function X_IND() {
    base = cpu.fetch();
    oper = (base + X)&0xFF;
    addr  = addr_space.read(oper&0xFF) + (addr_space.read((oper+1)&0xFF)<<8);
    M = addr_space_read(addr);

    oper = addr;
}

function IND_Y() {
    oper = cpu.fetch();
    addr  = addr_space.read(oper) + (addr_space.read((oper+1)&0xFF)<<8);  
    M = addr_space_read((addr+Y/*+C*/)&0xFFFF);

    oper = (addr+Y)&0xFFFF;
}

function REL() {
    var b = cpu.fetch();
    if(b > 127)
        b = (256-b) * -1;

    oper = PC + b;
}

// unknown addr mode
function UAM() {
}

function branch(pc) {
    PC = pc;
    icycles++;
}

//
// OPCODE
//

// unknown opcode
function UOP() {
}

function ADC() {
    tmp = A + M + C;

    setN( tmp&0x80 );
    setZ( tmp&0xFF );
    setC( tmp&0x100 );
    setV( (~(A^M))&(A^tmp)&0x80 );

    A = tmp&0xFF;
}

function ROR() {
    var M1 = M&1;
    tmp = M>>1;
    if(C)
        tmp|=0x80;
    setN(tmp&0x80);
    setC(M1);
   
    M = tmp&0xFF;
    addr_space_write(oper, tmp&0xFF);
}

function AND() {

    tmp = A & M;

    setN( tmp&0x80 );
    setZ( tmp&0xFF );

    A = tmp&0xFF;
}

function ASL() {
    tmp = (A<<1);

    setN( tmp&0x80 );
    setZ( tmp&0xFF );
    setC( tmp&0x100 );

    addr_space_write(oper, tmp&0xFF);
}
function ASLA() {
    tmp = (A<<1);

    setN( tmp&0x80 );
    setZ( tmp&0xFF );
    setC( tmp&0x100 );

    A = tmp&0xFF;
}
function BCC() {
    if(!C)
        branch(oper);
}
function BCS() {
    if(C) {
        branch(oper);
    }
}
function BEQ() {
    if(Z)
        branch(oper);
}
function BIT() {
    setN( M&0x80 );
    setV( M&0x40 );
    setZ( A&M );
}

function BMI() {
    if(N)
        branch(oper);
}
function BNE() {
    if(!Z)
        branch(oper);
}
function BPL() {
    if(!N)
        branch(oper);
}
function BRK() {
    push16(PC+1);
    push(getP());        
    setI(true);
    PC = (addr_space.read(0xfffe) + (addr_space.read(0xffff)<<8));
}
function BVC()  {
    if(!V)
        branch(oper);
}
function BVS() {
    if(V)
        branch(oper);
}
function CLC() {
    C = false;
}
function CLD() {
    D = false;
}
function CLI() {
    I = false;
}
function CLV() {    
    V = false;
}
function CMP() {
    tmp = A - M;

    setN( tmp&0x80 );
    setZ( tmp&0xFF );
    setC( A >= M );
}
function CPX() {
    tmp = X - M;

    setN(tmp&0x80);
    setZ(tmp&0xFF);
    setC(X >= M);
}
function CPY() {
    tmp = Y - M;

    setN(tmp&0x80);
    setZ(tmp&0xFF);
    setC( Y >= M );
}
function DEC() {

    tmp = addr_space.read(oper) - 1;

    setN(tmp&0x80);
    setZ(tmp&0xFF);

    addr_space_write(oper, tmp&0xFF);

}
function DEX() {
    tmp = X - 1;

    setN(tmp&0x80);
    setZ(tmp&0xFF);

    X = tmp&0xFF;
}
function DEY() {
    tmp = Y - 1;

    setN(tmp&0x80);
    setZ(tmp&0xFF);

    Y = tmp&0xFF;
}
function EOR() {
    tmp = A ^ M;

    setN(tmp&0x80);
    setZ(tmp&0xFF);

    A = tmp;

}
function INC() {
    tmp = M + 1;

    setN(tmp&0x80);
    setZ(tmp&0xFF);

    addr_space_write(oper, tmp&0xFF);
}
function INX() {
    tmp = X + 1;

    setN(tmp&0x80);
    setZ(tmp&0xFF);

    X = tmp&0xFF;
}
function INY() {
    tmp = Y + 1;

    setN(tmp&0x80);
    setZ(tmp&0xFF);

    Y = tmp&0xFF;
}
function JMP() {
    PC = oper;
}
function JSR() {
    push16(PC-1); icycles++;
    PC = oper;
}
function LDA() {
    tmp = M;

    setN(tmp&0x80);
    setZ(tmp&0xFF);

    A = tmp;
}
function LDX() {
    tmp = M;

    setN(tmp&0x80);
    setZ(tmp&0xFF);

    X = tmp;
}
function LDY() {
    tmp = M;

    setN(tmp&0x80);
    setZ(tmp&0xFF);

    Y = tmp;
}
function LSRA() {

    setC(M&1);
    tmp = (M>>1)
    
    setZ(tmp&0xFF);
    setN(tmp&0x80);

    A = (tmp&0xff);

}
function LSR() {

    setC(M&1);
    tmp = (M>>1)

    setZ(tmp&0xFF);
    setN(tmp&0x80);

    addr_space_write(oper, tmp&0xFF);
}
function NOP() {
}
function ORA() {
    tmp = A | M;

    setN(tmp&0x80);
    setZ(tmp&0xFF);

    A = tmp;
}
function PHA() {
    push(A);
}
function PHP() {

    push(getP()|(1<<4)); // PHP set the virtual B flag
}
function PLA() {
    tmp = A = pull();
    setN(tmp&0x80);
    setZ(tmp&0xFF);

}
function PLP() {
    var SR = pull();
    tmp = SR;;
    setSR(SR);            
}
function ROLA() {
    var M7 = !!(0x80&M);

    tmp = (M << 1);
    tmp |= (C?1:0);

    setN(tmp&0x80);
    setZ(tmp&0xFF);
    setC(M7);

    A = tmp&0xFF;
}
function ROL() {
    var M7 = !!(0x80&M);

    tmp = (M << 1);
    tmp |= (C?1:0);

    setN(tmp&0x80);
    setZ(tmp&0xFF);
    setC(M7);

    addr_space_write(oper, tmp&0xFF);
}
function RORA() {

    var M1 = !!(M&1);
    tmp = M>>1;
    tmp |= (C?0x80:0);
    setN(tmp&0x80);
    setC(M1);

    A = tmp&0xFF;

}
function RTI() {
    var SR = pull();
    setSR(SR);
    PC = pull16();
}
function RTS() {
    PC = pull16()+1;
}
function SBC() {
    if(opcode == 0xEB) opStr = "*SBC";

    tmp = A - M - (!C);           // sbc cary is revert

    setN(tmp&0x80);
    setZ(tmp&0xFF);
    setC(!(tmp&0x100));             // BLOG sbc carry is revert
    setV(((A^M))&(A^tmp)&0x80); // sbc A^M not negate

    A = tmp&0xFF;
}
function SEC() {
    setC(true);
}
function SED() {
    setD(true);
}
function SEI() {
    setI(true);
}
function STA() {
    addr_space_write(oper, A);
}
function STX() {
    addr_space_write(oper, X);
}
function STY() {
    addr_space_write(oper, Y);
}
function TAX() {
    tmp = A;
    setN(tmp&0x80);
    setZ(tmp&0xFF);
    X = tmp;
}
function TAY() {
    tmp = A;
    setN(tmp&0x80);
    setZ(tmp&0xFF);
    Y = tmp;
}
function TSX() {
    tmp = SP;
    setN(tmp&0x80);
    setZ(tmp&0xFF);
    X = tmp&0xff;
}
function TXA() {
    var tmp = X;
    setN(tmp&0x80);
    setZ(tmp&0xFF);
    A = tmp;
}
function TXS() {
    tmp = X;
    // do not change flags ??
    // N = !!(tmp&0x80);
    // Z = !(tmp&0xFF);
    SP = tmp&0xff;
}
function TYA() {
    tmp = Y;
    setN(tmp&0x80);
    setZ(tmp&0xFF);
    A = tmp;
}
function SLO() {

    var tmp = M<<1;
    addr_space_write(oper, tmp);

    tmp = A | tmp;
    setZ(tmp&0xFF);
    setN(tmp&0x80);
    setC(tmp&0x100);

    A = tmp&0xFF;

}
function SAX() {
    R = A & X;

    //setZ(R&0xFF);
    //setN(R&0x80);

    addr_space_write(oper, R);
}
function DCP() {

    tmp = M - 1;

    addr_space_write(oper, tmp&0xFF);

    tmp = A - tmp;

    setN( tmp&0x80 );
    setZ( tmp&0xFF );
    setC( A >= M );

}
function ISB() {

    // INC
    M = (M + 1)&0xFF;
    addr_space_write(oper, M);

    // SBC
    tmp = A - addr_space.read(oper) - (!C);           // sbc cary is revert

    setN(tmp&0x80);
    setZ(tmp&0xFF);
    setC(!(tmp&0x100));             // BLOG sbc carry is revert
    setV(((A^M))&(A^tmp)&0x80); // sbc A^M not negate

    A = tmp&0xFF;

}
function RLA() {
    var tmp = M<<1;
    tmp |= C?1:0;
    addr_space_write(oper, tmp);

    setC(tmp&0x100);

    tmp = A & tmp;
    setZ(tmp&0xFF);
    setN(tmp&0x80);

    A = tmp&0xFF;

}
function RRA() {
    ROR();
    ADC();
}
function SRE() {

    setC(M&1);
    tmp = (M>>1);
    setN(tmp&0x80);
    setZ(tmp&0xFF);
    addr_space_write(oper, tmp);

    tmp = A ^ tmp;

    setZ(tmp&0xFF);
    setN(tmp&0x80);

    A = tmp&0xFF;
}

function LAX() {
    A = M;
    X = M;
    setZ(A);
    setN(A&0x80);
}

var regStr;
var debugging = false;

var opcodes = [
// HI                                                                                       LO
//         00          01          02        03        04          05          06          07        08        09          0A        0B        0C          0D          0E          0F        
/* 00 */  BRK, IMP,   ORA, X_IND, UOP, UAM, UOP, UAM, UOP, UAM  , ORA, ZPG  , ASL, ZPG  , UOP, UAM, PHP, IMP, ORA, IMM  , ASLA, ACC, UOP, UAM, UOP, UAM  , ORA, ABS  , ASL, ABS  , UOP, UAM, 
/* 10 */  BPL, REL,   ORA, IND_Y, UOP, UAM, UOP, UAM, UOP, UAM  , ORA, ZPG_X, ASL, ZPG_X, UOP, UAM, CLC, IMP, ORA, ABS_Y, UOP,  UAM, UOP, UAM, UOP, UAM  , ORA, ABS_X, ASL, ABS_X, UOP, UAM, 
/* 20 */  JSR, ABS_J, AND, X_IND, UOP, UAM, UOP, UAM, BIT, ZPG  , AND, ZPG  , ROL, ZPG  , UOP, UAM, PLP, IMP, AND, IMM  , ROLA, ACC, UOP, UAM, BIT, ABS  , AND, ABS  , ROL, ABS  , UOP, UAM, 
/* 30 */  BMI, REL,   AND, IND_Y, UOP, UAM, UOP, UAM, UOP, UAM  , AND, ZPG_X, ROL, ZPG_X, UOP, UAM, SEC, IMP, AND, ABS_Y, UOP,  UAM, UOP, UAM, UOP, UAM  , AND, ABS_X, ROL, ABS_X, UOP, UAM, 
/* 40 */  RTI, IMP,   EOR, X_IND, UOP, UAM, UOP, UAM, UOP, UAM  , EOR, ZPG  , LSR, ZPG  , UOP, UAM, PHA, IMP, EOR, IMM  , LSRA, ACC, UOP, UAM, JMP, ABS_J, EOR, ABS  , LSR, ABS  , UOP, UAM, 
/* 50 */  BVC, REL,   EOR, IND_Y, UOP, UAM, UOP, UAM, UOP, UAM  , EOR, ZPG_X, LSR, ZPG_X, UOP, UAM, CLI, IMP, EOR, ABS_Y, UOP,  UAM, UOP, UAM, UOP, UAM  , EOR, ABS_X, LSR, ABS_X, UOP, UAM, 
/* 60 */  RTS, IMP,   ADC, X_IND, UOP, UAM, UOP, UAM, UOP, UAM  , ADC, ZPG  , ROR, ZPG  , UOP, UAM, PLA, IMP, ADC, IMM  , RORA, ACC, UOP, UAM, JMP, IND  , ADC, ABS  , ROR, ABS  , UOP, UAM, 
/* 70 */  BVS, REL,   ADC, IND_Y, UOP, UAM, UOP, UAM, UOP, UAM  , ADC, ZPG_X, ROR, ZPG_X, UOP, UAM, SEI, IMP, ADC, ABS_Y, UOP,  UAM, UOP, UAM, UOP, UAM  , ADC, ABS_X, ROR, ABS_X, UOP, UAM, 
/* 80 */  UOP, UAM,   STA, X_IND, UOP, UAM, UOP, UAM, STY, ZPG  , STA, ZPG  , STX, ZPG  , UOP, UAM, DEY, IMP, UOP, UAM  , TXA,  IMP, UOP, UAM, STY, ABS  , STA, ABS  , STX, ABS  , UOP, UAM, 
/* 90 */  BCC, REL,   STA, IND_Y, UOP, UAM, UOP, UAM, STY, ZPG_X, STA, ZPG_X, STX, ZPG_Y, UOP, UAM, TYA, IMP, STA, ABS_Y, TXS,  IMP, UOP, UAM, UOP, UAM  , STA, ABS_X, UOP, UAM  , UOP, UAM, 
/* A0 */  LDY, IMM,   LDA, X_IND, LDX, IMM, UOP, UAM, LDY, ZPG  , LDA, ZPG  , LDX, ZPG  , UOP, UAM, TAY, IMP, LDA, IMM  , TAX,  IMP, UOP, UAM, LDY, ABS  , LDA, ABS  , LDX, ABS  , UOP, UAM, 
/* B0 */  BCS, REL,   LDA, IND_Y, UOP, UAM, UOP, UAM, LDY, ZPG_X, LDA, ZPG_X, LDX, ZPG_Y, UOP, UAM, CLV, IMP, LDA, ABS_Y, TSX,  IMP, UOP, UAM, LDY, ABS_X, LDA, ABS_X, LDX, ABS_Y, UOP, UAM, 
/* C0 */  CPY, IMM,   CMP, X_IND, UOP, UAM, UOP, UAM, CPY, ZPG  , CMP, ZPG  , DEC, ZPG  , UOP, UAM, INY, IMP, CMP, IMM  , DEX,  IMP, UOP, UAM, CPY, ABS  , CMP, ABS  , DEC, ABS  , UOP, UAM, 
/* D0 */  BNE, REL,   CMP, IND_Y, UOP, UAM, UOP, UAM, UOP, UAM  , CMP, ZPG_X, DEC, ZPG_X, UOP, UAM, CLD, IMP, CMP, ABS_Y, UOP,  UAM, UOP, UAM, UOP, UAM  , CMP, ABS_X, DEC, ABS_X, UOP, UAM, 
/* E0 */  CPX, IMM,   SBC, X_IND, UOP, UAM, UOP, UAM, CPX, ZPG  , SBC, ZPG  , INC, ZPG  , UOP, UAM, INX, IMP, SBC, IMM  , NOP,  IMP, UOP, UAM, CPX, ABS  , SBC, ABS  , INC, ABS  , UOP, UAM, 
/* F0 */  BEQ, REL,   SBC, IND_Y, UOP, UAM, UOP, UAM, UOP, UAM  , SBC, ZPG_X, INC, ZPG_X, UOP, UAM, SED, IMP, SBC, ABS_Y, UOP,  UAM, UOP, UAM, UOP, UAM  , SBC, ABS_X, INC, ABS_X, UOP, UAM
];

function getStatusStr() {
    regStr ="A:"+hex(A)+" ";
    regStr+="X:"+hex(X)+" ";
    regStr+="Y:"+hex(Y)+" ";
    regStr+="P:"+hex(getP())+" ";
    regStr+="SP:"+hex(SP)+" "
    regStr+=(C?"C":"-");
    regStr+=(Z?"Z":"-");
    regStr+=(I?"I":"-");
    regStr+=(D?"D":"-");
    regStr+=(B?"B":"-");
    regStr+=(V?"V":"-");
    regStr+=(N?"N":"-");

    return hex(PC,4) + " " + regStr;
}

function step() {
    icycles = 1;
    // read and execute
    var opcode = this.fetch();
    var ins     = opcodes[opcode*2+0];
    var addmode = opcodes[opcode*2+1];
    addmode();
    ins();

    PC &= 0xFFFF;

    cpu.icycles = icycles;
}

function reset() {
    // simulate reset
    PC = addr_space.read(0xfffc)+(addr_space.read(0xfffd)<<8);
    push16(PC);
    push(getP());
}

function irq() {
    if(I)
        return;
    // IRQ
    push16(PC);
    push(getP());
    PC = addr_space.read(0xFFFE) + (addr_space.read(0xFFFF)<<8);
}

function fetch() {
    var tmp = addr_space_read(PC);
    PC++;
    return tmp;
}

var cpu = {
    fetch: fetch,
    step: step,
    reset: reset,
    irq: irq
}

module.exports = function(bus) {
    addr_space = bus.addr_space;
    memory = bus.memory;
    reset();
    return cpu;
};
