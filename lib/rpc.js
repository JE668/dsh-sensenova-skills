// dsh-sensenova-skills Web RPC（loopback-only）：设置页 ⇄ Host 的配置 + 同步通道
//
// 客户端经 ctx.connection.rpc.call(channel, endpoint, payload) 发起调用，
// 宿主侧用 ctx.connection.rpc.handle(channel, handler) 注册对应处理函数
// （dsh-client-connection 官方通道注册 API，内部复用 /api 同源的
//  浏览器会话 + Host/Origin 信任栅栏）。
//
// handler 契约：(endpoint, payload, signal, peer) => rpcResultSchema

import { SENSENOVA_SKILLS_RPC_CHANNEL, SENSENOVA_SKILLS_ENDPOINTS } from '../client/api.js';

const WRITABLE_KEYS = new Set(['repoURL', 'ref', 'runtimeDir']);

/** 浏览器可见的配置视图。 */
export function viewOf(config, extra = {}) {
  return {
    repoURL: String(config?.repoURL ?? ''),
    ref: String(config?.ref ?? 'main'),
    runtimeDir: String(config?.runtimeDir ?? ''),
    ...extra,
  };
}

function ok(value) { return { ok: true, value }; }

function fail(code, message) {
  if (code === 'cancelled') return { ok: false, error: { code: 'cancelled', message, details: {} } };
  return { ok: false, error: { code: 'bad-request', message, details: { issues: [{ message }] } } };
}

export function buildSkillsRpcHandler({ getLiveConfig, writeLiveConfig, runSync, log }) {
  return async (endpoint, payload = {}, signal) => {
    if (signal?.aborted) return fail('cancelled', 'request aborted');
    const live = getLiveConfig();
    if (endpoint === SENSENOVA_SKILLS_ENDPOINTS.getConfig || endpoint === SENSENOVA_SKILLS_ENDPOINTS.status) {
      return ok(viewOf(live, {
        syncedAt: live.lastSyncedAt ?? null,
        skillsCount: live.lastSkillsCount ?? null,
        via: live.lastVia ?? null,
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
}

/**
 * 注册 /dsh-sensenova-skills RPC 通道。返回 disposer。
 * 依赖宿主侧注入的 connection 服务（plugin inject 需含 'connection'）。
 */
export function installSkillsRpc(ctx, deps) {
  const rpc = ctx.connection?.rpc;
  if (typeof rpc?.handle !== 'function') {
    deps.log?.(`[dsh-sensenova-skills] connection.rpc.handle 不可用，设置页 RPC 未安装`);
    return () => {};
  }
  const handler = buildSkillsRpcHandler(deps);
  deps.log?.(`[dsh-sensenova-skills] 注册 RPC 通道 ${SENSENOVA_SKILLS_RPC_CHANNEL}`);
  const cleanup = rpc.handle(SENSENOVA_SKILLS_RPC_CHANNEL, handler);
  return typeof cleanup === 'function' ? cleanup : () => {};
}
