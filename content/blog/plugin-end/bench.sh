#!/usr/bin/env bash

set -e

# Both paths should be absolute
TREMOR_DIR=/home/mario/Programming/tremor-runtime
OUTPUT_DIR=/home/mario/Programming/nullderef.com/content/blog/plugin-end/results
WARMUP_ROUNDS=6

mkdir -p "$OUTPUT_DIR"

cd "$TREMOR_DIR/tremor-cli/tests/bench/passthrough"
export TREMOR_PATH=../../../../tremor-script/lib:../../lib/

for name in connectors pdk pdk-singlevalue; do
    bin="../../../../target/release/tremor-$name"

    for i in $(seq $WARMUP_ROUNDS); do
        echo ">> Warming up for $name ($i/$WARMUP_ROUNDS)"
        "$bin" test bench . > /dev/null
    done

    echo ">> Benchmarking $name"
    "$bin" test bench . > "$OUTPUT_DIR/${name}.hgrm"

    echo ">> Creating flamegraph for $name"
    flamegraph "$bin" test bench . > "$OUTPUT_DIR/${name}-flamegraph.hgrm"
    mv flamegraph.svg "$OUTPUT_DIR/$name-flamegraph.svg"
    mv perf.data "$OUTPUT_DIR/$name-perf.data"
done
