/**
 * 生成「可以直接粘贴进 Cloudflare Workers 控制台」的单文件 Worker。
 *
 * 用法：node build-worker.mjs
 * 产出：worker.js
 *
 * 和 build.mjs 的区别：
 *   build.mjs       → dist/ 静态资源目录，用 wrangler 部署（多文件）
 *   build-worker.mjs → worker.js 单个脚本，控制台粘贴即用（零命令行）
 *
 * 两者产物互不依赖，改完源 HTML 重跑一次对应脚本即可。
 */
import fs from 'node:fs';

const SRC = '光影相框.html';
const OUT = 'worker.js';

if (!fs.existsSync(SRC)){
  console.error(`找不到源文件：${SRC}`);
  process.exit(1);
}

const html = fs.readFileSync(SRC, 'utf8');

// 同样的零外链校验，粘贴版也不该偷偷联网
const external = [...html.matchAll(/\b(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)["']/gi)].map(m => m[1]);
if (external.length){
  console.error('发现外部资源引用，会破坏「断网可用」：');
  external.forEach(u => console.error('  ' + u));
  process.exit(1);
}

/**
 * 转成 JS 模板字符串字面量。
 * 顺序不能反：先转义反斜杠，再处理反引号和 ${，
 * 否则后补进去的反斜杠会被二次转义。
 * 当前源码里反引号和 ${ 都是 0 个，留着是为了以后改动不出事。
 */
const literal = html
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

const file = `/**
 * 光影相框 · Cloudflare Worker 单文件版
 *
 * 这个文件由 build-worker.mjs 自动生成，不要手改。
 * 改逻辑请改「光影相框.html」，然后重跑：node build-worker.mjs
 *
 * 用法：Cloudflare 控制台 → Workers & Pages → 创建 Worker
 *      → 编辑代码 → 全选删除 → 粘贴本文件全部内容 → 部署
 */

const HTML = \`${literal}\`;

/** 原 _headers 里的安全头，Worker 版必须写在响应里才生效 */
const HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'public, max-age=0, must-revalidate',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'x-frame-options': 'SAMEORIGIN',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy': "default-src 'self' blob:; img-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'",
};

export default {
  async fetch(request){
    const { pathname } = new URL(request.url);

    // 单文件应用只有这一个入口，其余路径老实返回 404
    if (pathname !== '/' && pathname !== '/index.html'){
      return new Response('404 Not Found', {
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }

    // HEAD 只要头不要体，省流量
    return new Response(request.method === 'HEAD' ? null : HTML, { headers: HEADERS });
  },
};
`;

fs.writeFileSync(OUT, file);

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
const srcKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(0);
console.log(`✓ ${OUT}  ${kb} KB（源 HTML ${srcKb} KB，已内联）`);
