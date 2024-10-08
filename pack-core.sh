#!/usr/bin/env bash

pushd packages/core
npm pack
popd
cp packages/core/examtraining-core-1.0.0.tgz packages/functions
tmp=$(mktemp)
pushd packages/functions
jq '.dependencies."@examtraining/core" = "file:examtraining-core-1.0.0.tgz"' package.json > "$tmp"
mv "$tmp" package.json
popd