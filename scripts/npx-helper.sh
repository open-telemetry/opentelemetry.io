#!/bin/bash
#
# Runs the given command with npx, ensuring that the version of the
# command/package as declared in `package.json` is first installed.

if [ $# -eq 0 ]; then
  echo "Usage: $0 [--no-ignore-scripts] <npm-command-and-package-name> [args...]"
  exit 1
fi

npx_vers_from_pkg_json() {
  local npm_i_flags="--no-save"
  if [[ "$1" == "--no-ignore-scripts" ]]; then
    shift
  else
    npm_i_flags+=" --ignore-scripts"
  fi
  local command=$1; shift;
  # For now we assume that the package name is the same as the command name.
  local package=$command
  if ! [[ $package =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo "ERROR: Invalid package name '$package'"
    exit 1
  fi
  local args=$@

  local version=$(npm pkg get devDependencies.$package | tr -d '^"')
  if [[ $version == "{}" ]]; then
    echo "ERROR: Could not determine version of '$package' from package.json"
    exit 1
  fi
  local pkgAtVers="$package@$version"

  if ! npm ls $pkgAtVers; then
    (set -x; npm install $npm_i_flags $pkgAtVers)
  fi
  set -x && npx $pkgAtVers $args
}

npx_vers_from_pkg_json $@;
