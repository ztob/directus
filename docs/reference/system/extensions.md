---
description: REST and GraphQL API documentation on the Extensions collection in Directus.
readTime: 1 min read
pageClass: page-reference
---

# Extensions

> The extensions endpoints are used by the Admin App to retrieve what extensions to install.
> [Learn more about Extensions](/user-guide/overview/glossary#extensions).

## List Extensions

List the available extensions in the project. The types of extensions that you can list are `interfaces`, `displays`,
`layouts`, and `modules`.

### Request

<SnippetToggler :choices="['REST', 'GraphQL', 'SDK']" label="API">
<template #rest>

`GET /extensions/:type`

</template>
<template #graphql>

`POST /graphql/system`

```graphql
type Query {
	extensions: extensions
}
```

</template>
<template #sdk>

```js
import { createDirectus, rest, readExtensions } from '@directus/sdk';

const client = createDirectus('directus_project_url').with(rest());

const result = await client.request(readExtensions(extension_type));
```

</template>
</SnippetToggler>

#### Query Parameters

This endpoint doesn't currently support any query parameters.

### Response

An array of interface extension keys.

### Example

<SnippetToggler :choices="['REST', 'GraphQL', 'SDK']" label="API">
<template #rest>

`GET /extensions/interfaces`

</template>
<template #graphql>

`POST /graphql/system`

```graphql
query {
	extensions {
		interfaces
	}
}
```

</template>
<template #sdk>

```js
import { createDirectus, rest, readExtensions } from '@directus/sdk';

const client = createDirectus('https://directus.example.com').with(rest());

const result = await client.request(readExtensions('interfaces'));
```

</template>
</SnippetToggler>
