import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
    plugins: [sentrySvelteKit({
        org: "personal-630",
        project: "word-app"
    }), sveltekit()],

    test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
};

export default config;
