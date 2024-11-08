#!/usr/bin/env bash
# if debug is needed, uncomment the next line
# set -x
# Read from to-build.csv file to array
IFS=, read -r -a tobuild < to-build.csv

# Usage: sudo bash publish-container.sh ghcr.io/khalilsantana/ foo
REPO=$1 # eg ghcr.io/mentoredtestbed/
TAG=$2  # eg 0.0.1
TOBUILD=$3 # eg --all

dependencies=("mentored-base" "generic-botnet")

# If not root, exit
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root"
    exit 1
fi

if [ -z "$REPO" ] || [ -z "$TAG" ]; then
    echo "Usage: $0 ghcr.io/mentoredtestbed/ your-tag"
    exit 1
fi

build_single() {
    FULL_CONTAINER_IMAGE_URL="$REPO$1:$TAG"
    echo "Building $FULL_CONTAINER_IMAGE_URL"
    docker-buildx build                                     \
                      --build-arg BASE_REPO=$REPO           \
                      --build-arg BASE_IMAGE=mentored-base  \
                      --build-arg BASE_IMAGE_TAG=$TAG       \
                      -t $FULL_CONTAINER_IMAGE_URL          \
                      --platform linux/amd64,linux/arm64    \
                      --push $1
    # Exit if previous command failed
    if [ $? -ne 0 ]; then
        exit 1
    fi
    echo "Built $FULL_CONTAINER_IMAGE_URL"
}

# Build and push all directories in the dependencies array
# Build dependencies first
# echo dependencies
echo "Building depedencies: ${dependencies[@]}"
for dir in "${dependencies[@]}"; do
    build_single $dir
done
echo "Finished building dependencies"

build_all() {
    # Collect all buildable directories and call build_only on them
    tobuild=()
    for dir in */; do
        # Strip the trailing slash from the directory name
        D="${dir%/}"
        tobuild+=("$D")
    done
    unset dir
    unset D
    build_only
}
# Why does this not work?
build_only() {
    echo "Building ${tobuild[@]}..."
    for dir in ${tobuild[@]}; do
        # D=$(basename "$dir")
        # skip if dir is a dependency
        if [[ " ${dependencies[@]} " =~ "$dir" ]]; then
            echo "Skipping $dir as it is a dependency"
            continue
        fi
        # if "skip-build" file exists, skip building
        if [ -f "$dir/.skip-image-build" ]; then
            echo "Skipping $dir as it has a .skip-image-build file"
            continue
        fi
        build_single $dir
    done
}

# if --all build all containers, else build only the ones in the to-build.csv file
if [ "$3" == "--all" ]; then
    build_all
else
    build_only
fi