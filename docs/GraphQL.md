# Using GraphQL

Prismic offers a [GraphQL API](https://prismic.io/docs/technologies/basics-on-querying-the-graphql-api) to access content. This document aims to describe the most important parts about the API
and how we can consume content for SvelteKit.

⚠️ **Attention**: Prismic uses non-standard GraphQL by requiring all requests to be `GET` instead of `POST` requests.
This helps improve caching, but might break some IDE-Tools that don't allow configuration of the HTTP-method.

## Pulling the Schema for code-completion

This package contains helpers to pull the GraphQL Schema from Prismic. Use the following command in the terminal to
pull the current Schema:

```shell
npm run graphql:pullSchema
```

## The prismic-ref header

All GraphQL requests need a prismic-ref header. Whenever the content-types in prismic change, the prismic-ref will change.
There are also different refs for preview and live content. More information can be found in the docs: https://prismic.io/docs/technologies/intro-to-the-graphql-api#prismic-api-ref

This setup grabs the current ref in `__layout.svelte` and stores it in `stuff`, so that it's accessible for other routes.
The ref can be loaded from `https://your-repo-name.cdn.prismic.io/api/v2`.

## Building and testing queries directly at Prismic

To write GraphQL Queries interactively, you can also use the tool over at:
https://mutoco-starter.prismic.io/graphql

(make sure to replace `mutoco-starter` with your repository name)

In the Prismic GraphQL playground you don't have to worry about setting the `Prismic-Ref` yourself, as it's being set automatically. 

## Helpers and data-transforms

This starter-repo comes with some helpers to make it easier to access the GraphQL Endpoint and normalize the incoming data.
All the prismic related code can be found in `./src/lib/util/prismic.js`.

### Data-transforms

To normalize the data, we can use suffixes on [GraphQL aliases](https://graphql.org/learn/queries/#aliases). These are the currently implemented suffixes:

- `_txt` converts the structured text from Prismic to plain-text.
- `_html` converts the structured text from Prismic to HTML.
- `_e` flattens `edges` or `node`.
- `_blocks` not really a suffix, as the alias needs to be named `_blocks` exactly. This is preparing the data for content-blocks (named Slices in Prismic).
- `_img` flatten image metadata and add a blurred thumbnail as base64 encoded string.

#### `_txt` and `_html`

Rich-Text content in Prismic is always returned as structured JSON format. So in order to render it as HTML or plain-text, you first need to convert it using the
Prismic helpers. With the suffixes `_txt` and `_html`, this will be done right after the data is loaded from the API.

Take this query that loads the title and lead from one Homepage.

```graphql
query {
    allHomes(first:1) {
        pages_e:edges {
            node {
                title_txt:title
                lead_html:lead
            }
        }
    }
}
```

Querying the API with this returns the following Data:

```json
{
    "data": {
        "allHomes": {
            "pages_e": [
                {
                    "node": {
                        "title_txt": [
                            {
                                "type": "heading1",
                                "text": "Mutoco Prismic Starter",
                                "spans": []
                            }
                        ],
                        "lead_html": [
                            {
                                "type": "paragraph",
                                "text": "Welcome to the Prismic starter project.",
                                "spans": []
                            },
                            {
                                "type": "paragraph",
                                "text": "This is the Home-Page. It also contains some \"global\" fields, such as the Main Menu Links",
                                "spans": [
                                    {
                                        "start": 12,
                                        "end": 21,
                                        "type": "hyperlink",
                                        "data": {
                                            "id": "Yf2ATBEAACwATWL9",
                                            "type": "home",
                                            "tags": [],
                                            "slug": "home",
                                            "lang": "de-ch",
                                            "first_publication_date": "2022-02-04T19:36:48+0000",
                                            "last_publication_date": "2022-02-07T08:38:18+0000",
                                            "link_type": "Document",
                                            "isBroken": false
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    }
}
```

After transforming the data, we get the following data, which is what we then pass on to our route as props:

```json
{
    "allHomes": {
        "pages": [
            {
                "title": "Mutoco Prismic Starter",
                "lead": "<p>Welcome to the Prismic starter project.</p><p>This is the <a href=\"/\">Home-Page</a>. It also contains some &quot;global&quot; fields, such as the Main Menu Links</p>"
            }
        ]
    }
}
```

#### Flattening edges/node with `_e` suffix

The `edges` and `node` structuring is in may cases redundant. You can use the `_e` suffix on the edge to collapse these into a simple array.
See the query example above, where:

```json
{
    "allHomes": {
        "pages_e": [
            {
                "node": {
                    …
                }
            }
        ]
    }
}
```

Gets transformed to:

```json
{
    "allHomes": {
        "pages": [
            {
                …
            }
        ]
    }
}
```

#### Transforming prismic slices with `_blocks`

`_blocks` is only meant for Prismic slices (usually the `body` property) and needs additional JS code to map types and props.

Take this query as an example:

```graphql
query getPage($uid:String!) {
    page(uid:$uid, lang:"de-ch") {
        title_txt:title
        lead_html:lead
        description_txt:lead
        _blocks:body {
            ... on PageBodyText_image {
                type
                primary {
                    title_txt:title1
                    content_html:content
                    image_img:image
                }
            }
        }
    }
}
```

By setting the alias of `body` to `_blocks`, the block will undergo a special transform so that it can be directly consumed
by the `ElementSwitch.svelte` component.

In order to return properly configured content-blocks, these conditions need to be met:

1. In GraphQL you need to query each slice-type with the `... on SliceName` construct. Also make sure to always include `type` in your query
2. In the `componentFromType` function inside `prismic.js`, map all types to the actual Svelte Components (see code example further below).
3. In the `propsFromType` function inside `prismic.js`, change the props for each type, so that they fit the Svelte Components.


Let's say we have a new slice in Prismic called `video` and we built a component called `Video.svelte`. In order to 
successfully use it, we need to update the `componentFromType` function to create a mapping from the type to the component:

```javascript
const componentFromType = async type => {
    switch (type) {
        case "text_image":
            return await import("$lib/components/modules/TextImage/TextImage.svelte");
        case "video":
            return await import("$lib/components/modules/Video/Video.svelte");
    }

    if (dev) {
        return await import("$lib/components/modules/Debug/Debug.svelte");
    }

    return null;
}
```

Same applies to the props. It's usually a good idea to build components that are agnostic to the API that's being used. 
If Prismic returns the props inside a `primary` datastructure, it's a good idea to remove that so that the component receives
only the needed properties. For example:

```javascript
const propsFromType = props => {
    switch (props.type) {
        case "text_image":
            return props.primary;
        case "video":
            return { 
                videoUrl: props.primary?.media?.embed_url 
            };
    }

    return {type: props.type};
}
```

#### Flatten image props with `_img`

The `_img` suffix can be applied to images and will reduce the data and also create a blurred image data-string.

This query in GraphQL `image_img:image` would return something like:

```json
    "image_img": {
        "dimensions": {
            "width": 2048,
            "height": 1536
        },
        "alt": null,
        "copyright": null,
        "url": "https://images.prismic.io/slicemachine-blank/26d81419-4d65-46b8-853e-8ea902e160c1_groovy.png?auto=compress,format"
    }
```

Which in turn gets transformed to:

```json
"image": {
    "url": "https://images.prismic.io/slicemachine-blank/26d81419-4d65-46b8-853e-8ea902e160c1_groovy.png?auto=compress,format",
    "width": 2048,
    "height": 1536,
    "alt": null,
    "blurred": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAFCAMAAAC+RAbqAAAAAXNSR0IArs4c6QAAAFFQTFRFR3BMAAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQCAgAAAAMwAAIAAgAAAADQcHjS9DEwYGAAAAAAAAGgoKAAAAURwmAAAAUx4ngiw+8l+i3QAAABt0Uk5TAAoEJC0JISQPARgIEgUIIyZBKBwIMTvCDFa+nzFxrwAAAC5JREFUCFtj4OOQFBfgYGYQkhCUEuXhZmAS4Rdj52VgYGAU5mJnZWDgBDLZWBgAJNgBb7DR8TgAAAAASUVORK5CYII="
}
```

