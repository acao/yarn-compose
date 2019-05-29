[![npm version](https://badge.fury.io/js/yarn-compose.svg)](https://badge.fury.io/js/yarn-compose)
[![Build Status](https://travis-ci.com/acao/yarn-compose.svg?branch=master)](https://travis-ci.com/acao/yarn-compose?branch=master)
[![Coverage Status](https://codecov.io/gh/acao/yarn-compose/branch/master/graph/badge.svg)](https://codecov.io/gh/acao/yarn-compose)

# 🦑 polyrepo development for the rest of us 🦑

A simple utility to orchestrate node projects using git and yarn link.

Handy for multi-repo projects that require development with disparate branches.

For orchestrating npm/yarn monorepos, see lerna or yarn workspaces.

Many more features coming soon. This takes care of the annoying parts for me.

This was primarily created to make it easier for me to iterate on language features for the graphql ecosystem. I hope it serves you well. Be sure to create a github issue if you need anything!

# System Requirements

- git (windows git bash will probably work, create an issue if it doesnt please!)
- yarn (eventually will support a mix of npm/yarn projects)
- node 11 (maybe works with <11? try it!)

# Setup

`yarn global add yarn-compose`

# Usage

1. create a projects.yml file
1. run `yarn-compose setup` in the same directory
1. or, run `yarn-compose setup -c path/to/config.yml`
1. also, you can override `baseDir` with `--target` or `-t`
1. other commands are `rebuild` and `relink` with the same arguments (see below)
1. `--help` works for each command

# Config File
You'll want to provide a yml file with at least some basic configuration for linking your projects.

- `baseDir`: (optional, string) this can be provided via CLI or in the config file. you must provide it one way or the other.

- `typeDefs`: (optional) is an object with string keys that are used by the `types` array for each project. used for DefinatelyTyped but could also be used for flow-typed. if you have a one off repo with types, that might be easier to use below.
  - `remote`: (required, string) git or https url to the remote that contains typings
  - `branch`: (required, string) the branch or ref of the repo you want
  - `typesPath`: (required, string) path to the types you want. `types/<typename>` for DefinatelyTyped, for example
  - `depth`: (optional, integer) - default: `1` - the clone depth you want. because DefinatelyTyped is YUGE

- `projects` (required) is an array of:
  - `package`: (required, string) the name of the npm package
  - `remote`: (required, string) the git or https url to the remote (https://github.com/acao/graphql-import)
  - `branch`: (required, string) the name of the branch (or other ref, `tag/v0.x`, commit hashes etc should work here too)
  - `types`: (optional, string[]) - matches the typeDef keys, for creating symlinks
  - `links`: (optional, string[]) - an array of packages that this project should be linked to. you will probably need this for most projects
  - `lerna`: (optional, boolean) - default: false - whether this is a lerna project. if so, `lerna build` will be run instead of `yarn build`, and linkages will be handled for all subprojects using `lerna exec -- yarn link <projects>`
  - `buildScript`: (optional, string) - default: `build` custom value for the script used before linking.
  - `linkFrom:`: (optional, string) - path to link from, if not the project root. this was needed for graphql-js

NOTE: the order of the projects array determines execution for building/linkages/etc. 

The example below demonstrates the descending order of dependencies. The lowest level dependents should go first, with their dependees following.

Eventually these will work like docker-compose services, where the order of operations will be determined by the `links` array. Until then, this CLI is intended to be really unintelligent on purpose.

# Commands

## Global Options

These are available to all commands

`--config-path`, `-c`

the explicit path to the config file

`--base-dir`, `-b`

the path to the base directory

## `setup`
sets up project workspace, clones and installs projects, type definitions, builds and links dependencies

### Usage

expects projects.yml by default

```$ yarn-compose setup```

or, specify a path to a config file

```$ yarn-compose setup -c path/to/config.yml```

### Options
`--force`, `-f`

force install

## `rebuild`
re-builds all projects in order

### Usage
```$ yarn-compose rebuild -c path/to/config.yml```

## `relink`
re-links all projects in order, assuming symlinks have already been built

### Usage
```$ yarn-compose relink -c path/to/config.yml```

# Config Example

```yml
baseDir: './lab'

typedefs:
  graphql:
    remote: git@github.com:acao/DefinitelyTyped.git
    branch: graphql-inputUnion
    typesPath: types/graphql

projects:
  - package: graphql
    remote: https://github.com/tgriesser/graphql-js
    branch: inputUnion

  - package: graphql-import
    remote: https://github.com/acao/graphql-import
    branch: inputUnion
    buildScript: build
    types:
      - graphql
    links:
      - graphql

  - package: graphql-config
    remote: https://github.com/prisma/graphql-config
    branch: master
    types:
      - graphql
    links:
      - graphql
      - graphql-import

  - package: graphql-language-service
    lerna: true
    remote: https://github.com/acao/graphql-language-service
    branch: inputUnion
    links:
      - graphql
      - graphql-config
      - graphql-import
      - graphql-language-service-parser
      - graphql-language-service-interface
      - graphql-language-service-types
      - graphql-language-service-utils

  - package: codemirror-graphql
    branch: inputUnion
    remote: https://github.com/acao/codemirror-graphql
    links:
      - graphql
      - graphql-language-service-parser
      - graphql-language-service-interface
      - graphql-language-service-types
      - graphql-language-service-utils
      - graphql-config
      - graphql-import

  - package: graphiql
    branch: inputUnion
    remote: https://github.com/acao/graphiql
    links:
      - graphql
      - codemirror-graphql
      - graphql-language-service-parser
      - graphql-language-service-interface
      - graphql-language-service-types
      - graphql-language-service-utils
      - graphql-config
      - graphql-import
```

# FAQ

### Why not use lerna or yarn workspaces?

This is more for orchestrating development environments than anything. Not for building permanent ecosystems like a monorepo would be. That said, lerna could still be used for ephemeral demos, etc, however using npm or yarn for managing fully working git repositories is almost impossible! This takes care of setting up a development environment with the assumption that you might need to work from git forks and feature branches across an entire ecosystem of projects.

### Some of the errors look messy

Yes, currently I'm just throwing/logging out the formatted stderr from `execa`. Thinking maybe a --verbose flag could provide more detail if needed.

### Should this be used in production?

No! Symlinking in production environments can be very insecure with node. This should be used for local development only. It could also be used in CI to, say, build a series of complex feature branches before the dist is deployed. This is not designed for setting up a production environment.

### Is this project related to `docker-compose`?

Yes, the config file format is inspired by docker compose, as well as the obsession with linkages. It's not nearly as smart as docker compose though.

# TODO
- [ ] more examples! (please contribute in gh issues if you can!)
- [ ] support npm, cnpm, etc? 
- [ ] meteor, bower even? if folks want?
- [ ] allow a `--projects` flag to target specific project(s) for each command
- [ ] support configuring multiple remotes per project
- [ ] support changing remotes, branches, etc more readily/passively
- [ ] other features users ask for?
- [ ] "discover" lerna, npmClient, etc
- [ ] support other config formats
