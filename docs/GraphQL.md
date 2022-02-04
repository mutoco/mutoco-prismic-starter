# Using GraphQL

Prismic offers a GraphQL API to access content. This document aims to describe the most important parts about the API
and how we can consume content for SvelteKit.

## Pulling the Schema for code-completion

This package contains helpers to pull the GraphQL Schema from Prismic. Use the following command in the terminal to
pull the current Schema:

```shell
npm run grapqhl:pullSchema
```

## Testing queries directly at Prismic

To write GraphQL Queries interactively, you can also use the tool over at:
https://mutoco-starter.prismic.io/graphql

(make sure to replace `mutoco-starter` with your repository name)
