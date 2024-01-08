#!/bin/bash

# Specify the YML file name
FILE="$1"

# Extract the name from the file
NAME=$(grep -oP 'repo: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/\K[^/]*' $FILE)

# Check if the cSpell ignore line already exists
if ! grep -q "# cSpell:ignore" $FILE; then
    # Add the cSpell ignore line at the top of the file
    echo "Update $FILE";
    sed -i "1s;^;# cSpell:ignore $NAME\n;" $FILE
fi

