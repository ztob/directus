import { defineEndpoint } from '@directus/extension-sdk';

export default defineEndpoint((router) => {
	router.get('/', (req, res) => res.send('Hello, World!'));
});
