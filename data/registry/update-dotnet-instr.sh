#!/bin/bash

# Directory containing the YAML files
DIRECTORY="."

# Function to update the YAML file
update_yaml() {
    local file=$1
    local name=$2

    # Check if "package" key already exists
    if ! grep -q "package:" "$file"; then
        echo "package:" >> "$file"
        echo "  registry: nuget" >> "$file"
        echo "  name: $name" >> "$file"
    fi
}

# Iterate over each YAML file in the specified directory
for file in $DIRECTORY/*.yml; do
    # Extract the 'name' from 'urls.repo' entry if it matches the pattern
    name=$(grep 'repo' "$file" | awk -F '/' '{print $(NF-1)}')

    # If a name is found and the pattern matches the specific repo
    if [[ $name =~ opentelemetry-dotnet-contrib ]]; then
        # Extract the actual name segment
        actual_name=$(echo $name | awk -F '-' '{print $4}')
        # Update the YAML file
        update_yaml "$file" "$actual_name"
    fi
done

echo "Processing complete."

