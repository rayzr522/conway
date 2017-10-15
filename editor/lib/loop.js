const now = () => {
    const hrtime = process.hrtime();
    return hrtime[0] * 1e3 + hrtime[1] / 1e6;
}

class Loop {
    constructor(lps, callback) {
        this._lps = lps;
        this._callback = callback;

        this._next = -1;
        this._running = false;
    }

    tick() {
        const start = now();
        this._callback();
        const end = now();

        const diff = end - start;

        if (this._running) {
            let delay = this.tickTime - diff;
            if (delay < 1) {
                delay = 1;
            }

            this._next = setTimeout(() => this.tick(), delay)
        }
    }

    get isRunning() {
        return this._running;
    }

    get tickTime() {
        return 1000 / this._lps;
    }

    start() {
        this._running = true;
        this.tick();
    }

    stop() {
        this._running = false;

        if (this._next !== -1) {
            clearTimeout(this._next);
        }
    }

    toggle() {
        if (this._running) {
            this.stop();
        } else {
            this.start();
        }
    }
}

module.exports = Loop;