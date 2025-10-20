#!/usr/bin/env bash
set -x

# Cài SWC nếu Render không tự nhận ra
npm install -g @swc/cli @swc/core

# Build project
npm run build
