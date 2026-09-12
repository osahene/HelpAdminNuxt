// server/api/proxy/[...path].ts
//
// Server-side BFF proxy for the Django backend. The browser only ever calls
// this app's own /api/proxy/* — never the real backend host directly, which
// is what used to show up in every request in the Network tab. This runs
// server-side (Nitro), so runtimeConfig.backendBaseURL (server-only, not
// under `public`) never reaches the client bundle.
//
// Built on h3's proxyRequest, the same utility Nuxt's own docs recommend for
// this exact pattern — it forwards method/body/headers and streams the
// response back, and (importantly) already excludes hop-by-hop headers like
// `host` via getProxyRequestHeaders, so the backend sees a sensible request
// rather than one claiming to be for this app's own host.
import { proxyRequest, getRequestURL } from 'h3';

export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const incoming = getRequestURL(event);

  // Preserve the exact path (trailing slash included) rather than
  // rebuilding it from event.context.params.path — Django's APPEND_SLASH
  // means a request that loses its trailing slash here would get 301/308
  // redirected by Django, which silently breaks non-GET requests (a
  // redirect can drop the method/body).
  const targetPath = incoming.pathname.replace(/^\/api\/proxy/, '');
  const target = `${config.backendBaseURL.replace(/\/+$/, '')}${targetPath}${incoming.search}`;

  return proxyRequest(event, target);
});
