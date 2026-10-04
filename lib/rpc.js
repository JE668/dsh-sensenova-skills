// dsh-sensenova-skills 设置页 endpoint 处理。
import { mountWebRoute, ok, fail } from './web-rpc.js';
import {
  SENSENOVA_SKILLS_RPC_CHANNEL,
  SENSENOVA_SKILLS_ENDPOINTS,
  COMMON_ENV_KEYS,
  redactConfig,
  redactEnv,
} from '../client/api.js';

const WRITABLE_KEYS = new Set(['repoURL', 'ref', 'runtimeDir', 'linkDir', 'enabled', 'autoSync', 'env']);

function pickWritable(updates) {
  const clean = {};
  for (const [key, value] of Object.entries(updates)) {
    if (WRITABLE_KEYS.has(key)) clean[key] = value;
  }
  return clean;
}

export function viewOf(config) {
  return redactConfig(config);
}

export function buildSkillsRpcHandler({ getLiveConfig, writeLiveConfig, persistConfig, runSync }) {
  // defaults 把官方预填的 URL 一并下发：这些值无需用户保存也已生效，
  // 界面据此显示为「已设默认值」，而不是空白输入框。
  // 官方默认值只是「未配置时的兜底」，绝不能盖掉用户真实配置的状态标记：
  // 两个对象形状不同（{configured,secret} vs 字符串），直接展开会被整体覆盖。
  const defaults = Object.fromEntries(
    COMMON_ENV_KEYS.filter(([, , , , fallback]) => fallback).map(([key, , , , fallback]) => [key, fallback]),
  );
  const withEnv = () => {
    const config = getLiveConfig();
    const keys = redactEnv(config.env);
    for (const [key, fallback] of Object.entries(defaults)) {
      keys[key] ??= { configured: true, secret: false, default: fallback };
    }
    return { ...viewOf(config), envKeys: keys, envDefaults: defaults };
  };

  return async (endpoint, payload = {}) => {
    if (endpoint === SENSENOVA_SKILLS_ENDPOINTS.getConfig
      || endpoint === SENSENOVA_SKILLS_ENDPOINTS.status) {
      return ok(withEnv());
    }

    if (endpoint === SENSENOVA_SKILLS_ENDPOINTS.listSkills) {
      const config = getLiveConfig();
      const enabled = config.enabled ?? {};
      return ok({
        skills: (config.skillsIndex ?? []).map((s) => ({
          name: s.name,
          description: s.description ?? '',
          enabled: enabled[s.name] !== false,
        })),
        available: config.skillsIndex?.length ?? 0,
      });
    }

    if (endpoint === SENSENOVA_SKILLS_ENDPOINTS.setSkillEnabled) {
      const name = typeof payload?.name === 'string' ? payload.name : null;
      if (!name) return fail('bad-request', 'name 必须是 skill 名');
      const config = getLiveConfig();
      const next = { ...(config.enabled ?? {}) };
      if (payload?.enabled === false) next[name] = false;
      else delete next[name];
      if (typeof persistConfig === 'function') {
        try { await persistConfig({ enabled: next }); }
        catch (error) { return fail('bad-request', `保存失败：${error?.message ?? String(error)}`); }
      }
      writeLiveConfig({ enabled: next });
      return ok(withEnv());
    }

    if (endpoint === SENSENOVA_SKILLS_ENDPOINTS.setEnv) {
      const values = payload?.values && typeof payload.values === 'object' ? payload.values : null;
      if (!values) return fail('bad-request', 'values 必须是对象');
      const config = getLiveConfig();
      const next = { ...(config.env ?? {}) };
      for (const [key, value] of Object.entries(values)) {
        if (typeof value !== 'string') continue;
        if (value === '') delete next[key];
        else next[key] = value;
      }
      if (typeof persistConfig === 'function') {
        try { await persistConfig({ env: next }); }
        catch (error) { return fail('bad-request', `保存失败：${error?.message ?? String(error)}`); }
      }
      writeLiveConfig({ env: next });
      return ok(withEnv());
    }

    if (endpoint === SENSENOVA_SKILLS_ENDPOINTS.setConfig) {
      const updates = payload && typeof payload === 'object' ? payload.updates : undefined;
      if (!updates || typeof updates !== 'object') return fail('bad-request', 'updates 必须是对象');
      const clean = pickWritable(updates);
      if (Object.keys(clean).length === 0) return fail('bad-request', '没有可写入的字段');
      if (typeof persistConfig === 'function') {
        try { await persistConfig(clean); }
        catch (error) { return fail('bad-request', `保存失败：${error?.message ?? String(error)}`); }
      }
      writeLiveConfig(clean);
      return ok(withEnv());
    }

    if (endpoint === SENSENOVA_SKILLS_ENDPOINTS.sync) {
      try {
        const result = await runSync();
        if (!result || result.ok !== true) return fail('bad-request', result?.message ?? '同步失败');
        return ok({
          ...withEnv(),
          install: result.install ?? null,
          envFile: result.envFile ?? null,
        });
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
