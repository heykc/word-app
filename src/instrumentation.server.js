import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: 'https://3270071879a84dc997719701d0c4ae5b@o4504475346796544.ingest.us.sentry.io/4504475348303872',

  tracesSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: import.meta.env.DEV,
});