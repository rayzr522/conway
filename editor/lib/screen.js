const { make2DArray, clone2D, equals } = require('./array');

const ansi = code => process.stdout.write('\033[' + code);

let buffer = [[]];
let lastBuffer;
let cursor = { x: 0, y: 0 };
let dirty = false;

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
    set(x, y, char) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }

        if (typeof char !== 'string' || char.length !== 1) {
            throw new TypeError('char must be a single character string');
        }

        buffer[y][x] = char;
        dirty = true;
    },
    print(text) {
        text.split('').forEach(char => {
            this.set(cursor.x, cursor.y, char);
            cursor.x++;
            if (cursor.x >= this.width) {
                cursor.x = 0;
                cursor.y++;
            }
        });
    },
    println(text) {
        this.print(text + '\n');
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
    cursor: (x, y) => cursor = { x: Math.floor(x), y: Math.floor(y) },
    termCursor: (x, y) => ansi(`${Math.floor(y + 1)};${Math.floor(x + 1)}H`),
    hideCursor: () => ansi('?25l'),
    showCursor: () => ansi('?25h'),
    // Clearing
    clearLine: () => ansi('2K'),
    clear() {
        for (let y = 0; y < screen.height; y++) {
            screen.termCursor(0, y);
            screen.clearLine();
        }
        screen.termCursor(0, 0);
    },
    reset() {
        lastBuffer = clone2D(buffer);
        buffer = make2DArray(this.width, this.height, ' ');
        cursor = { x: 0, y: 0 };
        dirty = false;
    },
    draw() {
        if (dirty && !equals(buffer, lastBuffer)) {
            this.clear();
            process.stdout.write(buffer.map(line => line.join('')).join('\n'));
            this.reset();
        }
    }
}

screen.reset();

module.exports = screen;