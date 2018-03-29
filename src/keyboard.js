
// 11111110 FE
// 11111101 FD
// 11111011 FB
// 11110111 F7
// 11101111 EF
// 11011111 DF
// 10111111 BF
// 01111111 7F

function getKeyState(row, col) {
    return keyboard[row][col];
}

function setKeyState(key,b) {
    if(key.code == 'Digit3') // 3
        keyboard[0][0x7f]=b;
    if(key.code == 'KeyX') // x
        keyboard[0][0xbf]=b;
    if(key.code == 'Digit1') // 1
        keyboard[0][0xdf]=b;
    if(key.code == 'KeyV') // V
        keyboard[0][0xf7]=b;
    if(key.code == 'Digit5') // 5
        keyboard[0][0xfb]=b;
    if(key.code == 'KeyN') // N
        keyboard[0][0xfd]=b;
    if(key.code == 'Digit7') // 7
        keyboard[0][0xfe]=b;


    if(key.code == 'KeyD')
        keyboard[1][0x7f]=b;
    if(key.code == 'KeyQ')
        keyboard[1][0xbf]=b;
    if(key.code == 'KeyF')
        keyboard[1][0xf7]=b;
    if(key.code == 'KeyR')
        keyboard[1][0xfb]=b;
    if(key.code == 'KeyT')
        keyboard[1][0xfd]=b;
    if(key.code == 'KeyJ')
        keyboard[1][0xfe]=b;


    if(key.code == 'KeyC') // C
        keyboard[2][0x7f]=b;
    if(key.code == 'Digit2') // 2
        keyboard[2][0xbf]=b;
    if(key.code == 'KeyZ') // Z
        keyboard[2][0xdf]=b;
    if(key.code == 'AltLeft' || key.code == 'AltRight') // use alt as control otherwise it trigger browser shortcuts
        keyboard[2][0xef]=b;
    if(key.code == 'Digit4') // 4
        keyboard[2][0xf7]=b;
    if(key.code == 'KeyB') // B
        keyboard[2][0xfb]=b;
    if(key.code == 'Digit6') // 6
        keyboard[2][0xfd]=b;
    if(key.code == 'KeyM') // M
        keyboard[2][0xfe]=b;

        

    if(key.code == 'Quote') // '
        keyboard[3][0x7f]=b;
    if(key.code == 'Backslash') // \
        keyboard[3][0xbf]=b;
    if(key.code == 'ShiftLeft') // 
        keyboard[3][0xef]=b;
    if(key.code == 'Minus') // -
        keyboard[3][0xf7]=b;
    if(key.code == 'Semicolon') // =b;
        keyboard[3][0xfb]=b;
    if(key.code == 'Digit9') // 9
        keyboard[3][0xfd]=b;
    if(key.code == 'KeyK') // K
        keyboard[3][0xfe]=b;


    if(key.code == 'Space') // space
        keyboard[4][0x7f]=b;
    if(key.code == 'ArrowDown') // down
        keyboard[4][0xbf]=b;
    if(key.code == 'ArrowLeft') // left
        keyboard[4][0xdf]=b;
    if(key.code == 'ArrowUp') // up
        keyboard[4][0xf7]=b;
    if(key.code == 'Period') // .
        keyboard[4][0xfb]=b;
    if(key.code == 'Comma') // ][
        keyboard[4][0xfd]=b;

    if(key.code == 'BracketLeft') // [
        keyboard[5][0x7f]=b;
    if(key.code == 'BracketRight') // ]
        keyboard[5][0xbf]=b;
    if(key.code == 'Backspace') // backspace
        keyboard[5][0xdf]=b;
    if(key.code == 'KeyP') // P
        keyboard[5][0xf7]=b;
    if(key.code == 'KeyO') // O
        keyboard[5][0xfb]=b;
    if(key.code == 'KeyI') // I
        keyboard[5][0xfd]=b;
    if(key.code == 'KeyU') // U
        keyboard[5][0xfe]=b;

    if(key.code == 'KeyW') // W
        keyboard[6][0x7f]=b;
    if(key.code == 'KeyS') // S 
        keyboard[6][0xbf]=b;
    if(key.code == 'KeyA') // A
        keyboard[6][0xdf]=b;
    if(key.code == 'KeyE') // E
        keyboard[6][0xf7]=b;
    if(key.code == 'KeyG') // G
        keyboard[6][0xfb]=b;
    if(key.code == 'KeyH') // H
        keyboard[6][0xfd]=b;
    if(key.code == 'KeyY') // Y
        keyboard[6][0xfe]=b;

    if(key.code == 'Equal') // =
        keyboard[7][0x7f]=b;
    if(key.code == 'Enter') // RETURN
        keyboard[7][0xdf]=b;
    if(key.code == 'ShiftRight') // ?
        keyboard[7][0xef]=b;
    if(key.code == 'Slash') // /
        keyboard[7][0xf7]=b;
    if(key.code == 'Digit0') // 0
        keyboard[7][0xfb]=b;
    if(key.code == 'KeyL') // L
        keyboard[7][0xfd]=b;
    if(key.code == 'Digit8') // 8
        keyboard[7][0xfe]=b;
}

var pressedKey = [];
var keyboard=[];
for(var i=0;i<8;i++)
    keyboard[i]=[];

document.onkeyup = function(key) {
    setKeyState(key, false);
}
document.onkeydown = function(key) {
    setKeyState(key, true);
}

module.exports = {
    getKeyState: getKeyState
}

