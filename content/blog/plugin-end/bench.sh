#!/usr/bin/env bash

set -e

# Both paths must be absolute, and not use `~` or similars. Otherwise it won't
# work when ran as root.
TREMOR_DIR=/home/mario/Programming/tremor-runtime
OUTPUT_DIR=/home/mario/Programming/nullderef.com/content/blog/plugin-end/results
WARMUP_ROUNDS=6
BINARIES="tremor-connectors tremor-pdk tremor-pdk-singlevalue"
BENCHMARKS="passthrough"

# Working with paths easily
get_dir() {
    dir="$TREMOR_DIR/tremor-cli/tests/bench/$1"
}
get_bin() {
    bin="../../../../target/release/$1"
}

# Validation step to avoid waiting for the benchmarks only for one of them to be
# incorrectly configured.
for bin in flamegraph; do
    if ! command -v "$bin" > /dev/null; then
        echo "ERROR: Binary $bin not available"
        exit 1
    fi
done
for name in $VALUES; do
    get_bin "$name"

    if ! [ -f "$bin" ] || ! [ -x "$bin" ]; then
        echo "ERROR: Binary $bin doesn't exist"
        exit 1
    fi
done
for name in $BENCHMARKS; do
    get_dir "$name"

    if ! [ -d "$dir" ]; then
        echo "ERROR: Benchmark $dir doesn't exist"
        exit 1
    fi
done
echo ">> Verification step passed"

# Setup
mkdir -p "$OUTPUT_DIR"
export TREMOR_PATH=../../../../tremor-script/lib:../../lib/

# Finally running the benchmarks
for bench in $BENCHMARKS; do
    # Benchmarks only work if you're in the same directory, and then always use
    # relative paths.
    get_dir "$name"
    cd "$dir"

    # Warmup round, ran alternately for accuracy
    for i in $(seq $WARMUP_ROUNDS); do
        for name in $BINARIES; do
            get_bin "$name"

            echo ">> Warming up with $name ($i/$WARMUP_ROUNDS)"
            "$bin" test bench . > /dev/null
        done
    done

    for name in $BINARIES; do
        get_bin "$name"

        echo ">> Benchmarking $name"
        "$bin" test bench . > "$OUTPUT_DIR/${name}.hgrm"

        echo ">> Creating flamegraph for $name"
        flamegraph "$bin" test bench . > "$OUTPUT_DIR/${name}-flamegraph.hgrm"
        mv flamegraph.svg "$OUTPUT_DIR/$name-flamegraph.svg"
        mv perf.data "$OUTPUT_DIR/$name-perf.data"
    done
done
