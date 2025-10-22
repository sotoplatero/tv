import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// Inline CSS for better compatibility with Anthias digital signage
		cssCodeSplit: false,
		assetsInlineLimit: 100000 // Inline assets smaller than 100KB
	}
});
