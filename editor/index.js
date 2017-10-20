const fs = require('fs');

const StateMachine = require('./lib/state');
const Loop = require('./lib/loop');
const screen = require('./lib/screen');
const keys = require('./lib/keys');
const prompter = require('./lib/prompter');
const math = require('./lib/math');

const state = new StateMachine();
const loop = new Loop(60 /*FPS*/, () => {
    tick();
    render();
});

const editor = {
    file: '',
    lines: [],
    name: 'editor',
    load() {
        this.lines = fs.readFileSync(this.file)
            .toString()
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.split(/\s*/).map(c => parseInt(c)));

        this.dirty = false;

        this.statusMessage = `Loaded '${this.file}'`;

        if (!this.lines.length) {
            this.width = 0;
            this.height = 0;
        } else {
            this.width = this.lines[0].length;
            this.height = this.lines.length;
        }

        this.visualWidth = this.width * 2 - 1;
        this.visualHeight = this.height;

        this.halfWidth = Math.floor(this.visualWidth / 2);
        this.halfHeight = Math.floor(this.visualHeight / 2);

        this.cursor = { x: 0, y: 0 };
    },
    save() {
        this.statusMessage = `Saved to '${this.file}'`;
        fs.writeFileSync(this.file, this.lines.map(line => line.join(' ')).join('\n'));
    },
    get(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return -1;
        }

        return this.lines[y][x];
    },
    set(x, y, value) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return -1;
        }

        this.dirty = true;
        return this.lines[y][x] = value;
    },
    moveCursor(dx, dy) {
        this.cursor.x = math.clamp(this.cursor.x + dx, 0, this.width - 1);
        this.cursor.y = math.clamp(this.cursor.y + dy, 0, this.height - 1);
    },
    onKeyDown(key) {
        this.statusMessage = '';

        if (key === keys.upArrow) {
            this.moveCursor(0, -1);
        } else if (key === keys.downArrow) {
            this.moveCursor(0, 1);
        } else if (key === keys.rightArrow) {
            this.moveCursor(1, 0);
        } else if (key === keys.leftArrow) {
            this.moveCursor(-1, 0);
        } else if (key === keys.space) {
            const { x, y } = this.cursor;
            this.set(x, y, 1 - this.get(x, y));
        } else if (key === keys.ctrlS) {
            this.save();
        } else if (key === keys.ctrlR) {
            this.load();
        } else if (key === keys.ctrlW || key === keys.ctrlQ) {
            state.changeView('main');
        }
    },
    onEnter() {
        if (!this.file || !fs.existsSync(this.file)) {
            return state.changeView('main');
        }

        this.load();
    },
    onLeave() {
        this.save();
    },
    render() {
        const { midX, midY } = screen;
        const start = { x: midX - this.halfWidth, y: midY - this.halfHeight };

        let sep = '-'.repeat(this.visualWidth + 4);
        screen.text(sep, start.x - 2, start.y - 1);
        screen.text(sep, start.x - 2, start.y + this.visualHeight);
        for (let y = 0; y < this.lines.length; y++) {
            let row = this.lines[y];
            let text = row.map(num => num ? '#' : '.').join(' ');
            screen.text(`| ${text} |`, start.x - 2, start.y + y);
        }

        if (this.statusMessage) {
            screen.text(this.statusMessage, screen.width, screen.height, screen.alignRight);
        }

        screen.cursor(start.x + this.cursor.x * 2, start.y + this.cursor.y);
    }
}

state.addView(editor);

state.addView({
    name: 'main',
    onEnter() {
        this.buttons = ['New', 'Edit', 'Quit'];
        this.selected = 0;
        screen.hideCursor();
    },
    onLeave: () => screen.showCursor(),
    onKeyDown(key) {
        if (key === keys.downArrow) {
            this.selected = (this.selected + 1) % this.buttons.length;
        } else if (key === keys.upArrow) {
            this.selected = (this.selected - 1 + this.buttons.length) % this.buttons.length;
        } else if (key === keys.enter) {
            if (this.selected === 0) {
                const filePrompt = prompter(
                    state,
                    file => {
                        const sizePrompt = prompter(
                            state,
                            size => {
                                const split = size.split('x');
                                const width = split[0];
                                const height = split[1];

                                fs.writeFileSync(file, `${'0'.repeat(width)}\n`.repeat(height));

                                editor.file = file;
                                state.changeView(editor);
                            },
                            {
                                prompt: 'size (WxH): ',
                                width: 30,
                                defaultValue: '10x8',
                                validator: size => /^[1-9]\d*x[1-9]\d*$/.test(size) || 'Must be in the format of WxH'
                            }
                        );

                        state.addView(sizePrompt);
                        state.changeView(sizePrompt);
                    },
                    {
                        prompt: 'new file: ',
                        width: 40,
                        validator: file => !fs.existsSync(file) || 'That file already exists!'
                    }
                );

                state.addView(filePrompt);
                state.changeView(filePrompt);
            } else if (this.selected === 1) {
                const filePrompt = prompter(
                    state,
                    file => {
                        editor.file = file;
                        state.changeView(editor);
                    },
                    {
                        prompt: 'file: ',
                        width: 30,
                        defaultValue: editor.file,
                        validator: file => fs.existsSync(file) || 'That file does not exist!'
                    }
                );

                state.addView(filePrompt);
                state.changeView(filePrompt);
            } else if (this.selected === 2) {
                quit();
            }
        }
    },
    render() {
        const { midX, midY } = screen;

        screen.text(`CONWAY'S GAME OF LIFE || EDITOR`, midX, midY - 5, screen.alignCenter);

        for (let i = 0; i < this.buttons.length; i++) {
            let label = this.buttons[i];
            if (this.selected === i) {
                label = `> ${label} <`;
            }

            screen.text(label, midX, midY + i * 2, screen.alignCenter);
        }
    }
});

const quit = () => {
    state.quit();
    screen.restore();
    process.exit(0);
}

const tick = () => state.tick();
const render = () => state.render();

const main = args => {
    screen.save();
    screen.clear();

    if (args[0] && fs.existsSync(args[0])) {
        editor.file = args[0];
        state.changeView(editor);
    } else {
        state.changeView('main');
    }

    process.stdin.setRawMode(true);
    process.stdin.on('data', data => {
        const str = data.toString();
        if (str === keys.ctrlC || str === keys.ctrlD) {
            return quit();
        }
        state.input(str);
    });

    loop.start();
}

main(process.argv.slice(2));