var p8912 = {
    registers:[],
    step: function(oric) {

        var VIA = oric.VIA;
        // should test only flags CA2 and CB2
        if(VIA.pcr == 0xFF) {
            this.address = VIA.porta;
        }

        if(VIA.pcr == 0xFD) {
            this.registers[p8912.address] = VIA.porta;
        }

    }
};
p8912.registers.fill(0,0,0xF);

module.exports = p8912;

