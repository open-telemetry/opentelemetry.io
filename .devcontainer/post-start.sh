#!/bin/bash

nvm install
# install:safe rather than ci:min: unlike CI, keep optional deps, which carry
# local tools such as netlify-cli.
npm run install:safe
