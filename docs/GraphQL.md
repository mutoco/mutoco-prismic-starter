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

## The prismic-ref header

All GraphQL requests need a prismic-ref header. Whenever the content-types in prismic change, the prismic-ref will change.
There are also different refs for preview and live content. More information can be found in the docs: https://prismic.io/docs/technologies/intro-to-the-graphql-api#prismic-api-ref

This setup grabs the current ref in `__layout.svelte` and stores it in `stuff`, so that it's accessible for other routes.
The ref can be loaded from `https://your-repo-name.cdn.prismic.io/api/v2`.
