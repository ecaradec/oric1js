# Welcome

This project was a try to see if I could build an emulator for a computer I own when I was young : the Oric 1.
The project was more an aim to explore how to build a VM. Actually I started with a 6502 emulator and it seemed 
like it would be too hard to expand it to a running machine.

The emulator is entirely in javascript. I can run from a webpage.

The keyboard is emulator so you can type a few commands. The keyboard is in qwerty as the emulator emulate for the
scan code of the keyboard. However, the ctrl key is replaced by the LeftAlt key because Ctrl commands will usually
trigger shortcuts on Windows.

# TODO

- [ ] Github release
- [ ] Memory computation or display is broken
- [ ] Try to move the VM in a webworker and post scanline periodicaly
- [ ] Use uint8array for memory

# DONE
- [X] Read the keyboard
- [X] gestion du curseur



