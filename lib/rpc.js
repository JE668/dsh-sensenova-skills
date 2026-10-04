// dsh-sensenova-skills 设置页 endpoint 处理。
import { mountWebRoute, ok, fail } from './web-rpc.js';
import { SENSENOVA_SKILLS_RPC_CHANNEL, SENSENOVA_SKILLS_ENDPOINTS, redactConfig } from '../client/api.js';

const WRITABLE_KEYS = new Set(['repoURL', 'ref', 'runtimeDir', 'linkDir']);

export function viewOf(config) {
  return redactConfig(config);
}

export function buildSkillsRpcHandler({ getLiveConfig, writeLiveConfig, runSync }) {
  return async (endpoint, payload = {}) => {
    if (endpoint === SENSENOVA_SKILLS_ENDPOINTS.getConfig || endpoint === SENSENOVA_SKILLS_ENDPOINTS.status) {
      return ok(viewOf(getLiveConfig()));
    }
    if (endpoint === SENSENOVA_SKILLS_ENDPOINTS.setConfig) {
      const updates = payload && typeof payload === 'object' ? payload.updates : undefined;
      if (!updates || typeof updates !== 'object') return fail('bad-request', 'updates 必须是对象');
      const clean = {};
      for (const [key, value] of Object.entries(updates)) {
        if (WRITABLE_KEYS.has(key)) clean[key] = value;
      }
      if (Object.keys(clean).length === 0) return fail('bad-request', '没有可写入的字段');
      writeLiveConfig(clean);
      return ok(viewOf(getLiveConfig()));
    }
    if (endpoint === SENSENOVA_SKILLS_ENDPOINTS.sync) {
      try {
        const result = await runSync();
        if (!result || result.ok !== true) {
          return fail('bad-request', result?.message ?? '同步失败');
        }
        return ok(viewOf(getLiveConfig()));
      } catch (error) {
        return fail('bad-request', error?.message ?? String(error));
      }
    }
    return fail('bad-request', `未知 endpoint: ${endpoint}`);
  };
}

export function installSkillsRpc(ctx, deps) {
  return mountWebRoute(ctx, {
    channel: SENSENOVA_SKILLS_RPC_CHANNEL,
    handler: buildSkillsRpcHandler(deps),
    log: deps.log,
  });
}
