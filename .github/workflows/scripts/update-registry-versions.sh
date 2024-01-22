#!/bin/bash -e

UPDATE_YAML="yq eval -i"
FILES="${FILES:-./data/registry/*.yml}"

if [[ -n "$GITHUB_ACTIONS" ]]; then
  # Ensure that we're starting from a clean state
  git reset --hard origin/main
elif [[ "$1" != "-f" ]]; then
  # Do a dry-run when script it executed locally, unless the
  # force flag is specified (-f).
  echo "Doing a dry-run when run locally. Use -f as the first argument to force execution."
  UPDATE_YAML="yq eval"
else
  # Local execution with -f flag (force real vs. dry run)
  shift
fi

for yaml_file in ${FILES}; do
    echo $yaml_file
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
                go list -m --versions "$package_name" | awk '{ if (NF > 1) print $NF ; else print "" }'
                ;;
            go-collector)
                go list -m --versions "$package_name" | awk '{ if (NF > 1) print $NF ; else print "" }'
                ;;
            nuget)
                lower_case_package_name=$(echo "$package_name" | tr '[:upper:]' '[:lower:]')
                curl -s "https://api.nuget.org/v3/registration5-gz-semver2/${lower_case_package_name}/index.json" | gunzip | jq -r '.items[0].upper'
                ;;
            hex)
                curl -s "https://hex.pm/api/packages/$package_name" | jq -r '.releases | max_by(.inserted_at) | .version'
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
        echo "${yaml_file}: Package name and/or registry are missing in the YAML file."
    else
        # Get latest version
        latest_version=$(get_latest_version "$name" "$registry")

        if [ "$latest_version" == "Registry not supported." ]; then
            echo "${yaml_file} ($registry): Registry not supported.";
        elif [ -z "$latest_version" ]; then
            echo "${yaml_file} ($registry): Could not get latest version from registry."
        elif [ -z "$current_version" ]; then
            ${UPDATE_YAML} ".package.version = \"$latest_version\"" $yaml_file
            echo "${yaml_file} ($registry): Version field was missing. Populated with the latest version: $latest_version"
        elif [ "$latest_version" != "$current_version" ]; then
            ${UPDATE_YAML} ".package.version = \"$latest_version\"" "$yaml_file"
            echo "${yaml_file} ($registry): Updated version from $current_version to $latest_version in $yaml_file"
        else
            echo "${yaml_file} ($registry): Version is already up to date."
        fi
    fi
done;