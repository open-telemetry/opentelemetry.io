#!/bin/bash

nvm install
# Unlike CI, keep optional deps: they carry local tools such as netlify-cli.
npm ci --ignore-scripts
npm run prepare:ci
