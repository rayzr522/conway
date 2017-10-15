const keys = {
    ctrl: letter => String.fromCharCode(letter.charCodeAt(0) - 96),
    upArrow: '\033[A',
    downArrow: '\033[B',
    rightArrow: '\033[C',
    leftArrow: '\033[D',
    ctrlSpace: '\u0000',
    tab: '\u0009',
    enter: '\u000d',
    space: '\u0020',
    altDelete: '\u0017',
    delete: '\u007f',
    altSpace: '\u00a0',
    shiftTab: '\033[Z',
    backspace: '\033[3~'
}

let lowerCase = 'abcdefghijklmnopqrstuvwxyz';
let upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let letters = lowerCase + upperCase;

lowerCase.split('').forEach(letter => {
    keys[`ctrl${letter.toUpperCase()}`] = keys.ctrl(letter);
});

letters.split('').forEach(letter => {
    keys[letter] = letter;
});

module.exports = keys;