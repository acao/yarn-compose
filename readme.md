# yarn-compose

A simple utility to orchestrate node projects using git and yarn link.

Handy for multi-repo projects that require development with dispirate branches.

For orchestrating npm/yarn moneorepos, see lerna.

Many more features coming soon. This takes care of the annoying parts for me.

This was created to make it easier for me to iterate on language features for the graphql ecosystem.

# Requirements

- git (windows git bash will probably work)
- yarn
- node 11 (maybe works with 10? try it!)

# Setup

`yarn global add yarn-compose`

# Usage

1. create a projects.yml file
1. run `yarn-compose` in the same directory
1. or, run `yarn-compose path/to/config.yml`

# Config

```yml
baseDir: './lab' # path relative to cwd

typedefs: # handy for forked DefinatelyTyped repos
  graphql:
    remote: git@github.com:acao/DefinitelyTyped.git
    branch: graphql-inputUnion
    typeName: graphql

projects: 
# the order of these is always honored
# so that downstream dependencies can be
# built before they are linked

  - package: graphql-js # required
    remote: https://github.com/tgriesser/graphql-js # required
    branch: inputUnion # required
    linkFrom: dist # optional: for when you need to link a project from its subdirectory

  - package: graphql-import
    remote: https://github.com/acao/graphql-import
    branch: inputUnion
    types: # optional: ensures that @types/{name} will symlink to the matching entry above
      - graphql
    links: # optional: maintain links to these repositories
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
    lerna: true # optional
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
