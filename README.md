# Welcome

Oric1js project was a try to see if I could build an emulator for a computer I own
when I was a kid : the Oric 1.

The main intention was to learn how to build a VM. It started as a 6502
emulator and as it seemed like it wouldn't be too hard to expand it to a running
machine.

The emulator is entirely in javascript, so you can just clone the project, open
oric1.html in the browser and see it working. 

The keyboard is emulated so you can type a few commands. However, the ctrl key
is replaced by the *left alt* key because *ctrl* shortcuts will usually trigger
shortcuts on Windows.

The ROM is included in the source but of course not covered by the license.

# TODO

- [ ] Memory computation or display is broken
- [ ] Try to move the VM in a webworker and post scanline periodicaly
- [ ] Use uint8array for memory

# DONE
- [X] Github release
- [X] Read the keyboard
- [X] gestion du curseur



