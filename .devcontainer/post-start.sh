#!/bin/bash

nvm install
npm ci --ignore-scripts --omit=optional
npm run prepare:ci
