// dsh-sensenova-skills Web RPC（loopback-only）：设置页 ⇄ Host 的配置 + 同步通道
//
// 兼容两条路径（与 dsh-pocket 的 web-rpc.js 同构）：
//   1. dsh v0.1.5+：直接挂到本插件 inject 的 webServer 上
//   2. 旧版 dsh / headless：回退 ctx.connection.rpc.handle(...)

import { SENSENOVA_SKILLS_RPC_CHANNEL, SENSENOVA_SKILLS_ENDPOINTS } from '../client/api.js';

const WRITABLE_KEYS = new Set(['repoURL', 'ref', 'runtimeDir']);

export function viewOf(config, extra = {}) {
  return {
    repoURL: String(config?.repoURL ?? ''),
    ref: String(config?.ref ?? 'main'),
    runtimeDir: String(config?.runtimeDir ?? ''),
    ...extra,
  };
}

export function buildSkillsRpcHandler({ getLiveConfig, writeLiveConfig, runSync, log }) {
  const handler = async (endpoint, payload = {}, signal) => {
    if (signal?.aborted) return fail('cancelled', 'request aborted');
    if (endpoint === SENSENOVA_SKILLS_ENDPOINTS.getConfig || endpoint === SENSENOVA_SKILLS_ENDPOINTS.status) {
      return ok(viewOf(getLiveConfig(), {
        syncedAt: getLiveConfig().lastSyncedAt ?? null,
        skillsCount: getLiveConfig().lastSkillsCount ?? null,
        via: getLiveConfig().lastVia ?? null,
      }));
    }
    if (endpoint === SENSENOVA_SKILLS_ENDPOINTS.setConfig) {
      const updates = {};
      for (const [key, value] of Object.entries(payload ?? {})) {
        if (!WRITABLE_KEYS.has(key)) continue;
        updates[key] = typeof value === 'string' ? value : '';
      }
      writeLiveConfig(updates);
      log?.(`[dsh-sensenova-skills] config updated via settings page: ${Object.keys(updates).join(', ') || '(none)'}`);
      return ok(viewOf(getLiveConfig()));
    }
    if (endpoint === SENSENOVA_SKILLS_ENDPOINTS.sync) {
      try {
        const result = await runSync();
        log?.(`[dsh-sensenova-skills] sync via settings page: ok=${result.ok}`);
        return ok({ ...result });
      } catch (error) {
        return fail('sync-failed', String(error?.message ?? error));
      }
    }
    return fail('bad-request', `unknown endpoint: ${endpoint}`);
  };
  return handler;
}

function ok(value) { return { ok: true, value }; }
function fail(code, message) { return { ok: false, error: { code, message } }; }

export function installSkillsRpc(ctx, deps) {
  const handler = buildSkillsRpcHandler(deps);
  const webServer = ctx.webServer;
  if (webServer && typeof webServer.register === 'function') {
    const route = makeWebRoute(SENSENOVA_SKILLS_RPC_CHANNEL, handler, deps.log);
    webServer.register(route);
    return () => {};
  }
  if (ctx.connection?.rpc?.handle) {
    return ctx.connection.rpc.handle(SENSENOVA_SKILLS_RPC_CHANNEL, handler, { authority: 'loopback' });
  }
  return () => {};
}

function makeWebRoute(channel, handler, log) {
  return {
    name: `dsh-${channel.replace(/^\//, '')}`,
    fetch: async (request) => {
      const url = new URL(request.url);
      if (request.method !== 'POST') return new Response('not found', { status: 404 });
      if (!url.pathname.startsWith(`${channel}/`)) return new Response('not found', { status: 404 });
      const endpoint = url.pathname.slice(channel.length + 1);
      if (endpoint === '' || endpoint === '.' || endpoint === '..') return new Response('not found', { status: 404 });
      let payload = {};
      try { payload = await request.json(); } catch { /* empty body */ }
      const result = await handler(endpoint, payload, request.signal);
      return Response.json(result, { status: result.ok ? 200 : 400 });
    },
  };
}
