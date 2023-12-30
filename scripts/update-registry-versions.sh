#!/bin/bash

# Check if a file is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <yaml_file>"
    exit 1
fi

yaml_file=$1

# Check if yq is installed
if ! command -v yq &> /dev/null; then
    echo "yq could not be found, please install yq."
    exit 1
fi

# Function to get latest version based on registry
get_latest_version() {
    package_name=$1
    registry=$2

    case $registry in
        npm)
            curl -s "https://registry.npmjs.org/${package_name}/latest" | jq -r '.version'
            ;;
        packagist)
            curl -s "https://repo.packagist.org/p2/${package_name}.json" | jq -r ".packages.\"${package_name}\"[0].version"
            ;;
        gems)
            curl -s "https://rubygems.org/api/v1/versions/${package_name}/latest.json" | jq -r '.version'
            ;;
        go)
             go list -m --versions "$package_name" | awk '{print $NF}'
            ;;
        go-collector)
             go list -m --versions "$package_name" | awk '{print $NF}'
            ;;
        nuget)
            lower_case_package_name=$(echo "$package_name" | tr '[:upper:]' '[:lower:]')
            curl -s "https://api.nuget.org/v3/registration5-gz-semver2/${lower_case_package_name}/index.json" | gunzip | jq -r '.items[0].upper'
            ;;
        *)
            echo "Registry not supported."
            ;;
    esac
}

# Read package details
name=$(yq eval '.package.name' "$yaml_file")
registry=$(yq eval '.package.registry' "$yaml_file")
current_version=$(yq eval '.package.version' "$yaml_file")

if [ -z "$name" ] || [ -z "$registry" ]; then
    echo "Package name and/or registry are missing in the YAML file."
    exit 1
fi

# Get latest version
latest_version=$(get_latest_version "$name" "$registry")

# If version field is missing, populate it with the latest version
if [ -z "$current_version" ]; then
    yq eval -i ".package.version = \"$latest_version\"" $yaml_file
    echo "Version field was missing. Populated with the latest version: $latest_version"
    exit 0
fi

# Compare and update if necessary
if [ "$latest_version" != "$current_version" ]; then
    yq eval -i ".package.version = \"$latest_version\"" "$yaml_file"
    echo "Updated version from $current_version to $latest_version in $yaml_file"
else
    echo "Version is already up to date."
fi