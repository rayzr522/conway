const keys = require('./keys');
const screen = require('./screen');

function prompter(stateMachine, callback, options = {}) {
    let input = options.defaultValue || '';
    let prompt = options.prompt || '> ';
    let width = options.width || 25;
    let errorMessage = '';

    return {
        name: `__PROMPT__${prompt}`,
        onLeave: function () {
            stateMachine.removeView(this)
        },
        onKeyDown: function (key) {
            errorMessage = '';
            if (key === keys.delete) {
                input = input.slice(0, -1);
            } else if (key === keys.altDelete) {
                input = input.slice(0, Math.max(input.lastIndexOf(' '), 0));
            } else if (key === keys.enter) {
                if (typeof options.validator === 'function') {
                    const response = options.validator(input);
                    if (!response) {
                        return;
                    }

                    if (typeof response === 'string') {
                        errorMessage = response;
                        return;
                    }
                }

                callback(input);
            } else if (key.length === 1) {
                input += key;
            }
        },
        render: function () {
            const { midX, midY } = screen;

            let combined = prompt + input.slice(prompt.length - width + 1).replace(/\s/g, '_' /* preserve underline */);
            combined += '_'.repeat(width - combined.length);
            combined = `| ${combined} |`;
            let sep = '-'.repeat(combined.length);

            screen.text(sep, midX, midY - 1, screen.alignCenter);
            screen.text(combined, midX, midY, screen.alignCenter);
            screen.text(sep, midX, midY + 1, screen.alignCenter);

            if (errorMessage) {
                screen.text(errorMessage, midX, midY + 3, screen.alignCenter);
            }

            const cursorX = midX - combined.length / 2 + 2 + prompt.length + input.length;
            screen.cursor(Math.min(cursorX, midX + combined.length / 2 - 3), midY);
        }
    }
}

module.exports = prompter;