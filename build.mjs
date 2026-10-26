/**
 * 把单文件应用打包成可部署的 dist/。
 *
 * 用法：node build.mjs
 * 产出：dist/index.html、dist/_headers
 *
 * 只做三件事：复制、校验零外链、打印体积。
 * 任何一项不过就退出码 1，别把坏产物传上去。
 *
 * 注意：_headers 必须和 index.html 一起进 dist/，
 * 否则 Workers 部署后不会带安全响应头（CSP 等），而且是静默失效。
 */
import fs from 'node:fs';
import path from 'node:path';

const SRC = '光影相框.html';
const HEADERS_SRC = '_headers';
const OUT_DIR = 'dist';
const OUT = path.join(OUT_DIR, 'index.html');
const HEADERS_OUT = path.join(OUT_DIR, '_headers');

if (!fs.existsSync(SRC)){
  console.error(`找不到源文件：${SRC}`);
  process.exit(1);
}

const html = fs.readFileSync(SRC, 'utf8');

// 这个项目的卖点之一是「零依赖、断网可用」，所以构建时硬校验一遍
const external = [...html.matchAll(/\b(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)["']/gi)].map(m => m[1]);
if (external.length){
  console.error('发现外部资源引用，会破坏「断网可用」：');
  external.forEach(u => console.error('  ' + u));
  process.exit(1);
}

if (!/<!DOCTYPE html>/i.test(html)){
  console.error('源文件不像完整 HTML');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, html);

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`✓ ${OUT}  ${kb} KB  外链 0 个`);

// 没有 _headers 就退回旧行为：只报警告，不阻断（本地双击打开不受影响）
if (fs.existsSync(HEADERS_SRC)){
  fs.copyFileSync(HEADERS_SRC, HEADERS_OUT);
  console.log(`✓ ${HEADERS_OUT}  已复制`);
} else {
  console.warn(`! 找不到 ${HEADERS_SRC}，部署后不会带安全响应头`);
}
