#!/usr/bin/env bash

usage() {
  [ "${1}" ] && echo "error: ${1}"

  cat << EOF

usage: `basename ${0}` [options] [commands]

options:
  -h | --help  : help message

commands:
  master       : master branch release
  feature      : feature branch release

EOF

  exit ${2:-0}
}

fromGradle() {
  echo $(gradle properties | grep $1 | cut -d: -f2)
}

feature() {
  from_version=$(fromGradle swim.version)
  to_version=$(fromGradle swim.version | cut -d\- -f1 | cut -d. -f1-3).`date -u "+%Y%m%d%H%M%S"`-SNAPSHOT

  echo "changing from feature/${from_version} to feature/${to_version}"

  find . -name gradle.properties -type f -not -path "*build*" \
    -exec sed -i '' -e "s/^swim.version=${from_version}$/swim.version=${to_version}/g" {} \; 2>/dev/null
}

master() {
  from_version=$(fromGradle swim.version)
  to_version=$(fromGradle swim.version | cut -d. -f1-3).`date -u "+%Y%m%d%H%M%S"`

  for h in $(ls ./bin/git/hooks); do
    mkdir -p .git/hooks
    cp ./bin/git/hooks/${h} .git/hooks
    chmod 755 .git/hooks/${h}
  done

  git flow release start -F ${to_version}

  echo "releasing from develop/${from_version} to master/${to_version}"

  git flow release finish -m "milestone: ${to_version}" -p -D ${to_version}
}

optspec=":h-:"

while getopts "${optspec}" opt; do
  case "${opt}" in
    -)
      case "${OPTARG}" in
        help) usage;;
        *) [ "${OPTERR}" = 1 ] && [ "${optspec:0:1}" != ":" ] && echo "unknown option --${OPTARG}";;
      esac;;
    h) usage;;
    :) usage "option -${OPTARG} requires an argument" 1;;
    \?) [ "${OPTERR}" != 1 ] || [ "${optspec:0:1}" = ":" ] && usage "unknown option -${OPTARG}" 1;;
  esac
done

[[ $# -eq 0 ]] && usage "no command specified"

for command in ${@:$OPTIND}; do
  case "${command}" in
    "feature") feature;;
    "master") master;;
    "") usage "unknown command: ${command}" 1;;
    *) usage "unknown command: ${command}" 1;;
  esac
done
