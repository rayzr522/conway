const _NAME = `Conway's Game of Life`;
const _VERSION = '1.0';

const keys = {
    sigint: 3,
    enter: 13,
    ctrlo: 15,
    special: 27,
    space: 32,
    plus: 43,
    minus: 45,
    zero: 48,
    nine: 57,
    equals: 61,
    question: 63,
    underscore: 95,
    h: 104,
    q: 113,
    // Combined with keys.special:
    left: '[D',
    right: '[C'
};

const modShift = key => `${key[0]}1;2${key.substr(1)}`;

const screen = {
    width: Math.max(process.stdout.columns, 20),
    height: Math.max(process.stdout.rows, 20),
    save: () => ansi('?47h'),
    restore: () => ansi('?47l'),
    cur: (x, y) => ansi(`${y + 1};${x + 1}H`),
    clear: () => {
        for (let y = 0; y < screen.height; y++) {
            screen.cur(0, y);
            screen.clearLine();
        }
        screen.cur(0, 0);
    },
    clearLine: () => ansi('2K')
}

let FPS;
let year;
let grid;
let history;
let lastTimeout;
let manual;

function reset() {
    FPS = 5;
    year = 0;
    grid = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0, 0, 1, 0, 0, 0],
        [0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 1, 1, 1, 0, 0, 1, 0],
        [0, 1, 0, 0, 1, 0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    history = [];
    lastTimeout = 0;
    manual = true;
}

function pushHistory() {
    history.push(grid);
}

function popHistory() {
    if (history.length) {
        grid = history.pop();
        year--;
    }
}

function wrap(text) {
    const maxLength = screen.width;
    const words = text.split(' ');

    let out = [];
    let currentLine = '';

    while (words.length) {
        let nextWord = words.shift();
        let newLine = (currentLine + ' ' + nextWord).trim();
        if (newLine.length > maxLength) {
            out.push(currentLine);
            currentLine = nextWord;
        } else {
            currentLine = newLine;
        }
    }

    if (currentLine) {
        out.push(currentLine);
    }

    return out.join('\n');
}

function ansi(code) {
    process.stdout.write('\033[' + code);
}

function err(text) {
    console.error(`Error: ${text}`);
    process.exit(1);
}

function loadGrid(file) {
    const out = [];

    const { existsSync, readFileSync } = require('fs');

    if (!existsSync(file)) {
        return err(`The file '${file}' does not exist`);
    }

    const lines = readFileSync(file).toString().split('\n').filter(line => line.trim());
    let length = lines[0].length;

    lines.forEach(line => {
        if (line.length !== length) {
            return err(`The file '${file}' does not have a uniform number of columns`);
        }

        out.push(line.split(/\s*/).map(num => parseInt(num)));
    });

    return out;
}

function printCentered(text) {
    let lines = text.split('\n').map(
        line => `${' '.repeat(screen.width / 2 - line.length / 2)}${line}\n`
    );

    process.stdout.write(lines.join(''));
}

let reading = false;
function readline(prompt, cb) {
    reading = true;
    process.stdin.setRawMode(false);

    screen.clear();
    process.stdout.write(prompt);

    process.stdin.once('data', chunk => {
        reading = false;
        process.stdin.setRawMode(true);

        // Remove trailing newline
        const data = chunk.toString().slice(0, -1);
        console.log(`Received: "${data}"`);
        cb(data);
    });
}

function render(end = '') {
    screen.clear();

    let lines = grid.map(
        line => line.map(
            i => i ? '#' : '.'
        ).join(' ')
    ).map(line => `| ${line} |`);

    let padY = (screen.height / 2) - (grid.length / 2) - 1;
    let sep = '-'.repeat(lines[0].length);

    process.stdout.write('\n'.repeat(Math.max(padY, 0)));

    printCentered(sep);
    lines.forEach(printCentered);
    printCentered(sep);

    // -2 for status bar
    let padBottom = padY - 2;
    if (end) {
        // Subtract extra for end message
        padBottom -= end.split('\n').length;
        printCentered(end);
    }

    process.stdout.write('\n'.repeat(Math.max(padBottom, 0)));
    printCentered(`\nYear: ${year} | Remaining: ${remainingCells()} | FPS: ${FPS} | Mode: ${manual ? 'MANUAL' : 'AUTO'}`);
};

function aroundPos(x, y) {
    let total = 0;

    for (let oy = -1; oy <= 1; oy++) {
        let y2 = y + oy;
        if (y2 < 0 || y2 >= grid.length) {
            continue;
        }
        let row = grid[y2];

        for (let ox = -1; ox <= 1; ox++) {
            let x2 = x + ox;
            if (x2 < 0 || x2 >= row.length) {
                continue;
            }

            if (x2 === x && y2 === y) {
                continue;
            }

            total += row[x2];
        }
    }

    return total;
}

function remainingCells() {
    return grid.reduce(
        (gridMem, line) => gridMem + line.reduce(
            (lineMem, next) => lineMem + next, 0
        ), 0
    );
}

function tick() {
    let newGrid = [];
    let dirty = false;
    for (let y = 0; y < grid.length; y++) {
        let row = grid[y];
        let newRow = newGrid[y] = new Array(row.length);
        for (let x = 0; x < row.length; x++) {
            let around = aroundPos(x, y);
            if (around > 0) {
            }
            if (row[x]) {
                if (around < 2 || around > 3) {
                    newRow[x] = 0;
                    dirty = true;
                } else {
                    newRow[x] = 1;
                }
            } else {
                if (around === 3) {
                    newRow[x] = 1;
                    dirty = true;
                } else {
                    newRow[x] = 0;
                }
            }
        }
    }

    if (dirty) {
        pushHistory();
    }
    grid = newGrid;
    return dirty;
}

function loop(renderScreen = true) {
    if (tick()) {
        year++;
        if (!manual) {
            queueNextLoop();
        }

        if (renderScreen) {
            render();
        }
    } else {
        manual = true;

        if (renderScreen) {
            const leftAlive = remainingCells();
            render(`\nYour civilization lived ${year} years ${leftAlive === 0 ? 'before dying out' : `before stabilizing out at ${leftAlive} cells`}.`);
        }
    }
}

function queueNextLoop() {
    lastTimeout = setTimeout(loop, 1000 / FPS);
}

function toggleManual() {
    manual = !manual;

    if (manual && lastTimeout) {
        clearTimeout(lastTimeout);
        lastTimeout = 0;
        // To show proper auto/manual information
        render();
    } else {
        loop();
    }
}

function stop() {
    screen.restore();
    process.exit(0);
}

function showHelp() {
    console.log(`${_NAME} v${_VERSION}\n`.toUpperCase());
    console.log(wrap(`${_NAME} is a mathematical simulation of civilizations and populations. This version of ${_NAME} is written in pure Node.JS with zero external dependencies. It features an interactive interface, custom rendering, support for easily creating your own scenarios, and high performance.`));
    console.log(`
H/?             Shows this help screen
SPACE           Toggles modes between Auto and Manual
+               Increases FPS by 1, hold shift to increase by 5
-               Decreases FPS by 1, hold shift to decrease by 5
CTRL+O          Opens a different data file
CTRL+C or Q     Quits ${_NAME}
ENTER           Goes forward 1 year
<-              Goes back 1 year, hold shift to go back 5 years
->              Goes forward 1 year, hold shift to go forward 5 years
0               Goes back to year 0
9               Goes to the final year
`);
}

function main(args) {
    // Initialize variables
    reset();

    if (args[0]) {
        grid = loadGrid(args[0]);
    }

    // Save screen
    screen.save();
    screen.clear();

    // Single-char input
    process.stdin.setRawMode(true);

    let justRenderNextInput = false;
    process.stdin.on('data', data => {
        if (!data) {
            return;
        }

        if (reading) {
            // Reading user input
            return;
        }

        if (justRenderNextInput) {
            justRenderNextInput = false;
            render();
            return;
        }

        const char = data[0];
        const code = data.toString().substr(1);

        switch (char) {
            case keys.sigint:
            case keys.q:
                stop();
                break;
            case keys.space:
                toggleManual();
                break;
            case keys.enter:
                if (manual) {
                    loop();
                }
                break;
            // plus = shift + equals
            case keys.plus:
                // +4 and then +1 more
                FPS += 4;
            case keys.equals:
                FPS++;
                break;
            // underscore = shift + minus
            case keys.underscore:
                // -4 and then -1 more
                FPS -= 4;
            case keys.minus:
                FPS--;
                if (FPS < 1) {
                    FPS = 1;
                }
                break;
            case keys.zero:
                while (history.length) {
                    popHistory();
                }
                break;
            case keys.nine:
                let lastYear;
                let loops = 0; // Make sure not to get stuck in an infinite loop
                while (lastYear !== year && loops < 1000) {
                    lastYear = year;
                    loop(false);
                    loops++;
                }
                loop();
                return;
            case keys.special:
                if (manual) {
                    if (code === keys.left) {
                        // Left arrow
                        popHistory();
                    } else if (code === modShift(keys.left)) {
                        for (let i = 0; i < 5; i++) {
                            popHistory();
                        }
                    } else if (code === keys.right) {
                        // Right arrow
                        loop();
                        return;
                    } else if (code === modShift(keys.right)) {
                        // Why bother with a for-loop?
                        loop();
                        loop();
                        loop();
                        loop();
                        loop();
                        return;
                    }
                }
                break;
            case keys.ctrlo:
                // Pause execution if running
                if (!manual) {
                    toggleManual();
                }

                readline('Enter a file to read: ', filename => {
                    reset();
                    grid = loadGrid(filename);
                    render();
                });
                // Don't re-render
                return;
            case keys.h:
            case keys.question:
                screen.clear();
                showHelp();
                justRenderNextInput = true;
                return;
        }

        render();
    });

    // Initial render
    render();
}

// Run the program
main(process.argv.slice(2));