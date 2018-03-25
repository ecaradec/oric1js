# Welcome

Oric1js project was a learning project to see if I could build an emulator for a computer I own
when I was a kid : the Oric 1.

The main intention was to learn how to build a VM. I started with an emulation of the 6502
emulator, then I added emulation for the 6522 and the 8912 for emulating just enough to get
to the Oric 1 prompt and be able to type commands.

The emulator is entirely in javascript, so you can just clone the project, open
oric1.html in the browser and see it working. 

Rem 1 : The keyboard is emulated so you can type a few commands. However, the ctrl key
is replaced by the *left alt* key because *ctrl* shortcuts will usually trigger
shortcuts on Windows.

Rem 2 : The emulator is a bit slow, so I increased the IRQ frequence by 10 so that typing
on keyboard be snappier.

Rem 3 : The ROM is included in the source for convenience but of course is not
covered by the license.

# TODO

- [ ] Memory computation or display is broken
- [ ] Try to move the VM in a webworker and post scanline periodicaly
- [ ] Use uint8array for memory

# DONE
- [X] Github release
- [X] Read the keyboard
- [X] Prevent the cursor from moving right alone



