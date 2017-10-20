const ansi = code => screen.print('\033[' + code);

const screen = {
    // Size properties
    width: process.stdout.columns,
    height: process.stdout.rows,
    midX: Math.floor(process.stdout.columns / 2),
    midY: Math.floor(process.stdout.rows / 2),
    // Constants
    alignLeft: 0,
    alignCenter: 1,
    alignRight: 2,
    // Printing
    print(text) {
        process.stdout.write(text);
    },
    println(text) {
        screen.print(text + '\n');
    },
    text(text, x, y, align = 0) {
        var rt = text;
        var w = rt.length;

        var rx = x - w * (align / 2)
        var ry = y;

        if (rx < 0) {
            rt = text.slice(0 - rx);
            w = rt.length;
            rx = 0;
        }

        this.cursor(rx, ry);
        this.print(rt);
    },
    // Screen state
    save: () => ansi('?47h'),
    restore: () => ansi('?47l'),
    // Cursor
    cursor: (x, y) => ansi(`${Math.floor(y + 1)};${Math.floor(x + 1)}H`),
    hideCursor: () => ansi('?25l'),
    showCursor: () => ansi('?25h'),
    // Clearing
    clearLine: () => ansi('2K'),
    clear() {
        for (let y = 0; y < screen.height; y++) {
            screen.cursor(0, y);
            screen.clearLine();
        }
        screen.cursor(0, 0);
    }
}

module.exports = screen;