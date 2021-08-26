# JavaScript SDK

> The JS SDK provides an intuitive interface for the Directus API from within a JavaScript-powered project (browsers and
> node.js). The default implementation uses [Axios](https://npmjs.com/axios) for transport and `localStorage` for
> storing state.

[[toc]]

## Installation

```bash
npm install @directus/sdk
```

## Usage

```js
import { Directus } from '@directus/sdk';

const directus = new Directus('https://api.example.com/');
```

**NOTE** _All_ methods return promises. Make sure to await methods, for example:

```js
import { Directus } from '@directus/sdk';

const directus = new Directus('https://api.example.com/');

// Wait for login to be done...
await directus.auth.login({
	email: 'admin@example.com',
	password: 'password',
});

// ... before fetching items
const articles = await directus.items('articles').readMany();

console.log({
	items: articles.data,
	total: articles.meta.total_count,
});
```

## Global

### Initialize

```js
import { Directus } from '@directus/sdk';

const directus = new Directus('https://api.example.com/');
```

#### `url`

The constructor accepts the URL as the first parameter.

#### `options.auth`

The authentication implementation. See [Auth](#auth) for more information.

Defaults to an instance `Auth`.

#### `options.storage`

The storage implementation. See [Storage](#storage) for more information.

Defaults to an instance of `MemoryStorage` when in node.js, and `LocalStorage` when in browsers.

**NOTE:**

If you plan to use multiple SDK instances at once, keep in mind that they will share the Storage across them, leading to
unpredictable behaviors. This scenario might be a case while writing tests.

For example, the SDK instance that executed last the `login()` method writes the resulting `access_token` into the
Storage and **overwrites** any prior fetched `access_token` from any other SDK instance. That might mix up your test
scenario by granting false access rights to your previous logged-in users.

Adding prefixes to your Storage instances would solve this error:

```js
import { Directus, MemoryStorage } from '@directus/sdk';
import { randomBytes } from 'crypto';

// ...

const prefix = randomBytes(8).toString('hex');
const storage = new MemoryStorage(prefix);
const url = `http://${host}:${port}`;
const directus = new Directus(url, { storage });
```

#### `options.transport`

The transport implementation. See [Transport](#transport) for more information.

Defaults to an instance of `AxiosTransport`.

### Example

```js
const directus = new Directus('http://api.example.com/');
```

### Get / Set API URL

```js
// Get the API base URL
console.log(directus.transport.url); // => https://api.example.com/

// Set the API base URL
directus.transport.url = 'https://api2.example.com';
```

### Access to transport/Axios

You can tap into the transport through `directus.transport`. If you are using the (default) `AxiosTransport`, you can
access axios through `directus.transport.axios`.

#### Intercepting requests and responses

Axios transport offers a wrapper around Axios interceptors to make it easy for you to inject/eject interceptors.

```ts
const requestInterceptor = directus.transport.requests.intercept((config) => {
	config.headers['My-Custom-Header'] = 'Header value';
	return config;
});

// If you don't want the interceptor anymore, remove it
requestInterceptor.eject();
```

```ts
const responseInterceptor = directus.transport.responses.intercept((response) => {
	console.log('Response received', { response });
	return response;
});

// If you don't want the interceptor anymore, remove it
responseInterceptor.eject();
```

## Items

You can get an instance of the item handler by providing the collection (and type, in the case of TypeScript) to the
`items` function. The following examples will use the `Article` type.

> JavaScript

```js
// import { Directus, ID } from '@directus/sdk';
const { Directus } = require('@directus/sdk');

const directus = new Directus('https://api.example.com');

const articles = directus.items('articles');
```

> TypeScript

```ts
import { Directus, ID } from '@directus/sdk';

// Map your collection structure based on its fields.
type Article = {
	id: ID;
	title: string;
	body: string;
	published: boolean;
};

// Map your collections to its respective types. The SDK will
// infer its types based on usage later.
type MyBlog = {
	// [collection_name]: typescript_type
	articles: Article;

	// You can also extend Directus collection. The naming has
	// to match a Directus system collection and it will be merged
	// into the system spec.
	directus_users: {
		bio: string;
	};
};

// Let the SDK know about your collection types.
const directus = new Directus<MyBlog>('https://directus.myblog.com');

// typeof(article) is a partial "Article"
const article = await directus.items('articles').readOne(10);

// Error TS2322: "hello" is not assignable to type "boolean".
// post.published = 'hello';
```

### Create Single Item

```js
await articles.createOne({
	title: 'My New Article',
});
```

### Create Multiple Items

```js
await articles.createMany([
	{
		title: 'My First Article',
	},
	{
		title: 'My Second Article',
	},
]);
```

### Read All

```js
await articles.readMany();
```

### Read By Query

```js
await articles.readMany({
	search: 'Directus',
	filter: {
		date_published: {
			_gte: '$NOW',
		},
	},
});
```

### Read By Primary Key(s)

```js
await articles.readOne(15);
```

Supports optional query:

```js
await articles.readOne(15, { fields: ['title'] });
```

### Update Multiple Items

```js
await articles.updateMany([15, 42], {
	title: 'Both articles now have the same title',
});
```

Supports optional query:

```js
await articles.updateMany(
	[15, 42],
	{
		title: 'Both articles now have the same title',
	},
	{
		fields: ['title'],
	}
);
```

### Delete

```js
// One
await articles.deleteOne(15);

// Multiple
await articles.deleteMany([15, 42]);
```

## Activity

### Read All Activity

```js
await directus.activity.readMany();
```

### Read Activity By Query

```js
await directus.activity.readMany({
	filter: {
		action: {
			_eq: 'create',
		},
	},
});
```

### Read Activity By Primary Key(s)

```js
await directus.activity.readOne(15);
```

Supports optional query:

```js
await directus.activity.readOne(15, { fields: ['action'] });
```

### Create a Comment

```js
await directus.activity.comments.create({
	collection: 'articles',
	item: 15,
	comment: 'Hello, world!',
});
```

### Update a comment

```js
await directus.activity.comments.update(31, {
	comment: 'Howdy, world!',
});
```

Note: The passed key is the primary key of the comment

### Delete a comment

```js
await directus.activity.comments.delete(31);
```

Note: The passed key is the primary key of the comment

## Auth

### Configuration

Directus will accept custom implementations of the `IAuth` interface. The default implementation `Auth` can be imported
from `@directus/sdk`. The default implementation will require you to pass the transport and storage implementations. All
options are optional.

```js
import { Auth } from '@directus/sdk';

// ...

const sdk = new Directus('url', {
	auth: new Auth(transport, storage, options);
	// ...
});
```

#### transport

The transport responsible for communicating with Directus backend.

Defaults to an instance of `AxiosTransport` when not creating `Auth` youself.

#### storage

The storage responsible for storing authentication and sdk state.

When not creating `Auth` youself, defaults to `MemoryStorage` in node.js, and `LocalStorage` in browsers.

#### options

##### options.mode

Accepts `cookie` or `json`.

When in `cookie` mode, the API will set the refresh token in an `httpOnly` secure cookie that can't be accessed from
client side JavaScript. This is the most secure way to connect to the API from a public front-end website.

When you can't rely on cookies, or need more control over handling the storage of the cookie (like in node.js), use
`json` mode. This will return the refresh token in the "normal" payload. The storage of these tokens are handled by the
`storage` implementation.

Defaults to `cookie` in browsers, `json` in node.js.

##### options.refresh

See [Refresh auth token](#refresh-auth-token).

### Get current token

```ts
const token = directus.auth.token;
```

### Login

#### With credentials

```js
await directus.auth.login({
	email: 'admin@example.com',
	password: 'd1r3ctu5',
});
```

#### With static tokens

```js
await directus.auth.static('static_token');
```

#### Refresh auth token

You can set authentication to auto-refresh the token once it's close to expire.

```js
await directus.auth.login(
	{
		email: 'admin@example.com',
		password: 'd1r3ctu5',
	},
	{
		refresh: {
			auto: true,
		},
	}
);
```

You can also set how much time before the expiration you want to auto-refresh the token. When not specified, 30 sec is
the default time.

```js
await directus.auth.login(
	{
		email: 'admin@example.com',
		password: 'd1r3ctu5',
	},
	{
		refresh: {
			auto: true,
			time: 30000, // refesh the token 30 secs before the expiration
		},
	}
);
```

### Refresh Auth Token

You can manually refresh the authentication token. This won't try to refresh the token if it's still valid in the eyes
of the SDK.

Also worth mentioning that any concurrent refreshes (trying to refresh while a there's an existing refresh running),
will result in only a single refresh hitting the server, and promises resolving/rejecting with the result from the first
call. This depends on the implementation of IAuth you're using.

```js
await directus.auth.refresh();
```

You can force the refresh by passing true in the first parameter.

An optional parameter will accept auto-refresh information.

```js
await directus.auth.refresh(true);
```

This function can either return the `AuthResult` in case a refresh was made, `false` in case SDK thinks it's not needed,
or throw an error in case refresh fails.

### Logout

```js
await directus.auth.logout();
```

### Request a Password Reset

```js
await directus.auth.password.request('admin@example.com');
```

### Reset a Password

```js
await directus.auth.password.reset('abc.def.ghi', 'n3w-p455w0rd');
```

Note: The token passed in the first parameter is sent in an email to the user when using `request()`

## Transport

The transport object abstracts how you communicate with Directus. Transports can be customized to use different HTTP
libraries for example.

### Interface

```ts
// Simplified version, `import { ITransport } from '@directus/sdk';`
interface ITransport {
	url;
	get(path);
	head(path);
	options(path);
	delete(path, data = undefined);
	post(path, data);
	put(path, data);
	patch(path, data);
}
```

### AxiosTransport

The default transport used in both browser and node deployments. It supports auto refresh on request.

#### Options

AxiosTransport requires a base URL and a storage implementation to work.

```ts
const transport = new AxiosTransport('http://example.com', new MemoryStorage(), async () => {
	await sdk.auth.refresh();
});
await transport.get('/server/info');
```

## Storage

The storage is used to load and save SDK data.

### LocalStorage

The storage used in environments where Local Storage is supported.

#### Options

The `LocalStorage` implementation accepts a _transparent_ prefix. Use this when you need multiple SDK instances with
independent authentication for example.

### MemoryStorage

The storage used when SDK data is ephemeral. For example: only during the lifecycle of the process.

#### Options

The `MemoryStorage` implementation accepts a _transparent_ prefix so you can have multiple instances of the SDK without
having clashing keys.

## Collections

```js
directus.collections;
```

Same methods as `directus.items("directus_collections")`.

## Fields

```js
directus.fields;
```

Same methods as `directus.items("directus_fields")`.

## Files

```js
directus.files;
```

Same methods as `directus.items("directus_files")`.

## Folders

```js
directus.folders;
```

Same methods as `directus.items("directus_folders")`.

## Permissions

```js
directus.permissions;
```

Same methods as `directus.items("directus_permissions")`.

## Presets

```js
directus.presets;
```

Same methods as `directus.items("directus_presets")`.

## Relations

```js
directus.relations;
```

Same methods as `directus.items("directus_relations")`.

## Revisions

```js
directus.revisions;
```

Same methods as `directus.items("directus_revisions")`.

## Roles

```js
directus.roles;
```

Same methods as `directus.items("directus_roles")`.

## Settings

```js
directus.settings;
```

Same methods as `directus.items("directus_settings")`.

## Server

### Ping the Server

```js
await directus.server.ping();
```

### Get Server/Project Info

```js
await directus.server.info();
```

## Users

```js
directus.users;
```

Same methods as `directus.items("directus_users")`, and:

### Invite a New User

```js
await directus.users.invites.send('admin@example.com', 'fe38136e-52f7-4622-8498-112b8a32a1e2');
```

The second parameter is the role of the user

### Accept a User Invite

```js
await directus.users.invites.accept('<accept-token>', 'n3w-p455w0rd');
```

The provided token is sent to the user's email

### Enable Two-Factor Authentication

```js
await directus.users.tfa.enable('my-password');
```

### Disable Two-Factor Authentication

```js
await directus.users.tfa.disable('691402');
```

### Get the Current User

```js
await directus.users.me.read();
```

Supports optional query:

```js
await directus.users.me.read({
	fields: ['last_access'],
});
```

### Update the Current Users

```js
await directus.users.me.update({ first_name: 'Admin' });
```

Supports optional query:

```js
await directus.users.me.update({ first_name: 'Admin' }, { fields: ['last_access'] });
```

## Utils

### Get a Random String

```js
await directus.utils.random.string();
```

Supports an optional `length` (defaults to 32):

```js
await directus.utils.random.string(50);
```

### Generate a Hash for a Given Value

```js
await directus.utils.hash.generate('My String');
```

### Verify if a Hash is Valid

```js
await directus.utils.hash.verify('My String', '$argon2i$v=19$m=4096,t=3,p=1$A5uogJh');
```

### Sort Items in a Collection

```js
await directus.utils.sort('articles', 15, 42);
```

This will move item `15` to the position of item `42`, and move everything in between one "slot" up.

### Revert to a Previous Revision

```js
await directus.utils.revert(451);
```

Note: The key passed is the primary key of the revision you'd like to apply.

---

## TypeScript

If you are using TypeScript, the JS-SDK requires TypeScript 3.8 or newer. TypeScript will also improve the development
experience by providing relevant information when manipulating your data. For example, `directus.items` knows about your
collection types if you feed the SDK with enough information in the construction of the SDK instance. This allows for a
more detailed IDE suggestions for return types, sorting, and filtering.

```ts
type BlogPost = {
	id: ID;
	title: string;
};

type BlogSettings = {
	display_promotions: boolean;
};

type MyCollections = {
	posts: BlogPost;
	settings: BlogSettings;
};

// This is how you feed custom type information to Directus.
const directus = new Directus<MyCollections>('http://url');

// ...

const post = await directus.items('posts').readOne(1);
// typeof(post) is a partial BlogPost object

const settings = await posts.singleton('settings').read();
// typeof(settings) is a partial BlogSettings object
```

You can also extend the Directus system type information by providing type information for system collections as well.

```ts
import { Directus } from '@directus/sdk';

// Custom fields added to Directus user collection.
type UserType = {
	level: number;
	experience: number;
};

type CustomTypes = {
	/*
	This type will be merged with Directus user type.
	It's important that the naming matches a directus
	collection name exactly. Typos won't get caught here
	since SDK will assume it's a custom user collection.
	*/
	directus_users: UserType;
};

const directus = new Directus<CustomTypes>('https://api.example.com');

await directus.auth.login({
	email: 'admin@example.com',
	password: 'password',
});

const me = await directus.users.me.read();
// typeof me = partial DirectusUser & UserType;

// OK
me.level = 42;

// Error TS2322: Type "string" is not assignable to type "number".
me.experience = 'high';
```
