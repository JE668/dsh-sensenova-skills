#!/usr/bin/env node
/**
 * 手动同步上游仓库：node scripts/sync-upstream.js [--force]
 * 等价于调用 sensenova_skills_sync 工具。
 */
import { buildSkillTools } from '../lib/index.js';

const tools = buildSkillTools({});
const sync = tools.find((t) => t.name === 'sensenova_skills_sync');
if (!sync) {
  console.error('未找到 sensenova_skills_sync 工具');
  process.exit(1);
}
const result = await sync.execute({ force: process.argv.includes('--force') }, undefined);
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
