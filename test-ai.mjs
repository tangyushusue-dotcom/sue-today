import { build } from 'esbuild';
const result = await build({
  entryPoints: ['lib/ai.ts'],
  bundle: true, format: 'esm', write: false, platform: 'browser',
  define: { 'process.env.AI_API_KEY': 'undefined', 'process.env.AI_BASE_URL': 'undefined', 'process.env.AI_MODEL': 'undefined' },
});
const code = result.outputFiles[0].text;
// 验证编译后代码中不包含裸 process.env 引用（浏览器安全）
console.log("编译后代码是否含 'process.env' 裸引用:", /process\.env/.test(code) ? "含（需检查）" : "不含（安全）");

// 模拟浏览器：不定义 process
const moduleObj = { exports: {} };
const fn = new Function('module', 'exports', code);
fn(moduleObj, moduleObj.exports);
const { generate } = moduleObj.exports;

const look = await generate('look', '上班');
console.log("look mock 正常:", !!look.outfit);
const planner = await generate('planner', '- 写报告（截止 15:00）：季度总结\n开会');
console.log("planner 含 Todo:", JSON.stringify(planner.schedule.some(s => s.title.includes('写报告'))));
