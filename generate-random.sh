#!/bin/bash

fail() {
    echo "$*" 1>&2
    exit 1
}

PROG="$(basename "$0")"
if [[ $# -lt 2 ]]; then
    fail "Usage: $PROG <width> <height>"
fi

WIDTH="$1"
HEIGHT="$2"
[[ "$WIDTH" -lt 1 ]] && fail "width must be >= 1"
[[ "$HEIGHT" -lt 1 ]] && fail "height must be >= 1"

OUT=""

for y in $(seq 1 "$HEIGHT"); do
    for x in $(seq 1 "$WIDTH"); do
        OUT+="$(((x + y + RANDOM) % 2))"
    done
    OUT+="\n"
done

echo -en "$OUT"

