/**
 * 光影相框 · Cloudflare Worker 单文件版
 *
 * 这个文件由 build-worker.mjs 自动生成，不要手改。
 * 改逻辑请改「光影相框.html」，然后重跑：node build-worker.mjs
 *
 * 用法：Cloudflare 控制台 → Workers & Pages → 创建 Worker
 *      → 编辑代码 → 全选删除 → 粘贴本文件全部内容 → 部署
 */

const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#F7F3EB">
<meta name="description" content="批量给照片加相框，自动读取相机参数。纯前端，零依赖。">
<title>光影相框 · 批量加框工作台</title>
<style>
  :root{
    --paper:#F7F3EB;
    --paper-2:#FFFDF8;
    --ink:#1B1714;
    --ink-2:#4A423A;
    --muted:#8C8378;
    --line:#E4DACA;
    --line-2:#EFE7DA;
    --accent:#B4622D;
    --accent-soft:#F0E0D2;
    --radius:12px;
    --serif:"Songti SC","Noto Serif SC","Source Han Serif SC","SimSun",serif;
    --sans:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei","Helvetica Neue",Arial,sans-serif;
    --mono:"SF Mono","JetBrains Mono",Menlo,Consolas,"Courier New",monospace;
  }
  *{box-sizing:border-box}
  html,body{height:100%}
  body{
    margin:0;background:var(--paper);color:var(--ink);
    font-family:var(--sans);font-size:13px;-webkit-font-smoothing:antialiased;
    display:flex;flex-direction:column;height:100vh;overflow:hidden;
  }
  /* ---------- header ---------- */
  header{
    display:flex;align-items:center;gap:16px;
    padding:0 20px;height:62px;flex:0 0 auto;
    background:var(--paper-2);border-bottom:1px solid var(--line);
    z-index:20;
  }
  .brand{display:flex;align-items:baseline;gap:10px}
  .brand h1{
    font-family:var(--serif);font-size:19px;font-weight:600;margin:0;letter-spacing:.06em;
  }
  .brand span{
    font-size:9.5px;letter-spacing:.22em;color:var(--muted);text-transform:uppercase;
    transform:translateY(-1px);
  }
  .spacer{flex:1}
  .count{
    font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:.04em;
  }
  button{font-family:inherit;font-size:12.5px;cursor:pointer;border-radius:8px;border:1px solid transparent;transition:.16s ease}
  .btn{
    padding:9px 16px;background:var(--ink);color:#FBF7F0;border-color:var(--ink);
  }
  .btn:hover{background:#33291F}
  .btn:disabled{opacity:.35;cursor:not-allowed}
  .btn-ghost{
    padding:9px 14px;background:transparent;color:var(--ink-2);border-color:var(--line);
  }
  .btn-ghost:hover{border-color:var(--ink-2);color:var(--ink)}
  /* ---------- layout ---------- */
  .app{flex:1;display:flex;min-height:0}
  aside{
    width:312px;flex:0 0 312px;background:var(--paper-2);
    border-right:1px solid var(--line);overflow-y:auto;padding:4px 0 40px;
  }
  aside::-webkit-scrollbar{width:8px}
  aside::-webkit-scrollbar-thumb{background:#DED3C1;border-radius:4px}
  .group{padding:16px 18px;border-bottom:1px solid var(--line-2)}
  .group:last-child{border-bottom:none}
  .group h3{
    margin:0 0 12px;font-size:10px;font-weight:600;letter-spacing:.18em;
    text-transform:uppercase;color:var(--muted);
  }
  /* template chips */
  .tpl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .tpl{
    background:transparent;border:1px solid var(--line);border-radius:9px;padding:6px 4px 5px;
    display:flex;flex-direction:column;align-items:center;gap:5px;
  }
  .tpl canvas{width:100%;height:44px;border-radius:4px;display:block}
  .tpl b{font-size:10.5px;font-weight:500;color:var(--ink-2);letter-spacing:.02em}
  .tpl:hover{border-color:#CFC2AC}
  .tpl.on{border-color:var(--accent);background:var(--accent-soft);box-shadow:0 0 0 1px var(--accent) inset}
  .tpl.on b{color:var(--accent)}
  /* controls */
  .row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
  .row:last-child{margin-bottom:0}
  .row label{font-size:12px;color:var(--ink-2);white-space:nowrap}
  .val{font-family:var(--mono);font-size:10.5px;color:var(--muted);min-width:34px;text-align:right}
  input[type=range]{
    -webkit-appearance:none;appearance:none;width:100%;height:2px;background:var(--line);
    border-radius:2px;outline:none;margin:2px 0 12px;
  }
  input[type=range]::-webkit-slider-thumb{
    -webkit-appearance:none;width:13px;height:13px;border-radius:50%;
    background:var(--ink);border:2px solid var(--paper-2);box-shadow:0 1px 3px rgba(0,0,0,.25);cursor:pointer;
  }
  select,input[type=text],textarea{
    font-family:inherit;font-size:12px;color:var(--ink);background:#fff;
    border:1px solid var(--line);border-radius:7px;padding:6px 8px;outline:none;width:100%;
  }
  select:focus,input[type=text]:focus,textarea:focus{border-color:var(--accent)}
  textarea{font-family:var(--mono);font-size:11.5px;line-height:1.6;resize:vertical;min-height:52px}
  .swatches{display:flex;gap:6px;flex-wrap:wrap}
  .sw{width:22px;height:22px;border-radius:50%;border:1px solid rgba(0,0,0,.12);cursor:pointer;padding:0}
  .sw:hover{transform:scale(1.1)}
  .color-input{
    display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:7px;
    padding:3px 8px 3px 4px;background:#fff;
  }
  .color-input input[type=color]{
    width:26px;height:22px;border:none;background:none;padding:0;cursor:pointer;
  }
  .color-input span{font-family:var(--mono);font-size:10.5px;color:var(--muted);text-transform:uppercase}
  .check{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--ink-2);cursor:pointer;user-select:none}
  .check input{accent-color:var(--accent);width:14px;height:14px;cursor:pointer}
  .chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}
  .chip{
    font-family:var(--mono);font-size:10px;padding:3px 6px;border-radius:5px;
    border:1px solid var(--line);background:#fff;color:var(--muted);
  }
  .chip:hover{border-color:var(--accent);color:var(--accent)}
  .hint{font-size:10.5px;color:var(--muted);line-height:1.6;margin-top:7px}
  /* ---------- main ---------- */
  main{flex:1;min-width:0;overflow-y:auto;position:relative;padding:18px 20px 60px}
  main::-webkit-scrollbar{width:10px}
  main::-webkit-scrollbar-thumb{background:#DED3C1;border-radius:5px}
  #empty{
    position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:14px;pointer-events:none;
  }
  #empty .box{
    width:min(340px,100%);border:1.5px dashed #D6C9B4;border-radius:16px;padding:38px 24px;text-align:center;
    background:rgba(255,253,248,.6);
  }
  #empty h2{font-family:var(--serif);font-size:17px;font-weight:500;margin:0 0 8px;letter-spacing:.04em}
  #empty p{margin:0;font-size:12px;color:var(--muted);line-height:1.8}
  #grid{
    display:grid;grid-template-columns:repeat(auto-fill,minmax(296px,1fr));gap:18px;
    align-items:start;
  }
  .card{
    background:#fff;border:1px solid var(--line);border-radius:var(--radius);
    padding:10px;position:relative;transition:.18s ease;
  }
  .card:hover{box-shadow:0 8px 22px rgba(60,44,26,.09);border-color:#DCCFB8}
  .card.off{opacity:.42}
  .thumb{
    border-radius:7px;overflow:hidden;background:
      repeating-conic-gradient(#F3EDE3 0% 25%, #FBF7EF 0% 50%) 50%/14px 14px;
    display:flex;align-items:center;justify-content:center;cursor:zoom-in;
  }
  .thumb canvas{width:100%;height:auto;display:block}
  .thumb.err{background:#FBF4EF;border:1px dashed #D9B9A6;cursor:default;aspect-ratio:4/3}
  .thumb .errmsg{
    font-size:11px;color:#A0522D;text-align:center;line-height:1.7;padding:0 14px;
    word-break:break-all;
  }
  .meta{padding:9px 2px 2px}
  .fname{
    display:flex;align-items:center;gap:6px;
    font-size:11.5px;color:var(--ink);font-weight:500;
  }
  .fname .nm{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .rawtag{
    flex:0 0 auto;font-family:var(--mono);font-size:8.5px;letter-spacing:.08em;
    padding:1.5px 4px;border-radius:3px;background:var(--accent-soft);color:var(--accent);
  }
  .exif{
    font-family:var(--mono);font-size:9.5px;color:var(--muted);margin-top:4px;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.02em;
  }
  .cap{
    margin-top:7px;font-size:11px;padding:4px 7px;border-radius:6px;border:1px solid transparent;
    background:#FAF6EE;color:var(--ink-2);
  }
  .cap::placeholder{color:#B8AE9F}
  .cap:focus{background:#fff;border-color:var(--accent)}
  .pick{
    position:absolute;top:16px;left:16px;width:20px;height:20px;border-radius:50%;
    background:rgba(255,255,255,.92);border:1px solid var(--line);display:flex;
    align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:.15s;
  }
  .card:hover .pick,.card.off .pick{opacity:1}
  .pick input{accent-color:var(--accent);width:13px;height:13px;margin:0;cursor:pointer}
  /* 删除单张 */
  .card .del{
    position:absolute;top:16px;right:16px;width:22px;height:22px;border-radius:50%;padding:0;
    background:rgba(255,255,255,.94);border:1px solid var(--line);color:var(--ink-2);
    font-size:15px;line-height:1;display:flex;align-items:center;justify-content:center;
    opacity:0;transition:.15s;z-index:2;
  }
  .card:hover .del{opacity:1}
  .card .del:hover{background:#C0553A;border-color:#C0553A;color:#fff}
  /* toast */
  #toast{
    position:fixed;bottom:26px;left:50%;transform:translate(-50%,20px);
    background:var(--ink);color:#FBF7F0;padding:10px 20px;border-radius:9px;font-size:12.5px;
    opacity:0;pointer-events:none;transition:.25s;z-index:200;letter-spacing:.02em;
  }
  #toast.on{opacity:1;transform:translate(-50%,0)}
  /* 带「手动保存」链接时，toast 要能接收点击 */
  #toast.has-act{pointer-events:auto}
  #toast .toast-act{
    color:#F2C9A0;text-decoration:underline;text-underline-offset:2px;
    margin-left:10px;cursor:pointer;
  }
  #toast .toast-act:hover{color:#FFFDF8}
  /* lightbox */
  #lb{
    position:fixed;inset:0;background:rgba(26,22,17,.86);z-index:150;
    display:none;align-items:center;justify-content:center;padding:40px 40px 96px;
  }
  #lb.on{display:flex}
  #lb canvas{max-width:100%;max-height:100%;box-shadow:0 24px 60px rgba(0,0,0,.5);border-radius:4px}
  #lbClose{
    position:absolute;top:22px;right:26px;background:none;border:none;color:#EDE6DA;
    font-size:26px;line-height:1;cursor:pointer;
  }
  /* lightbox 工具条 */
  .lb-bar{
    position:absolute;bottom:22px;left:50%;transform:translateX(-50%);
    display:flex;align-items:center;gap:6px;
    background:rgba(20,16,13,.74);border:1px solid rgba(255,255,255,.14);
    border-radius:999px;padding:6px 10px;
  }
  .lb-bar button{
    background:none;border:none;color:#EDE6DA;font-size:13px;padding:5px 11px;
    border-radius:999px;cursor:pointer;transition:.14s;
  }
  .lb-bar button:hover{background:rgba(255,255,255,.13)}
  .lb-bar button:disabled{opacity:.35;cursor:not-allowed}
  .lb-bar #lbInfo{
    font-family:var(--mono);font-size:11px;color:#B9AFA2;min-width:54px;text-align:center;
    letter-spacing:.04em;
  }
  .lb-bar #lbExport{border:1px solid rgba(255,255,255,.22)}
  .lb-bar #lbDel:hover{background:#C0553A}
  .dragover .app{outline:2px dashed var(--accent);outline-offset:-10px}

  /* ================= 响应式 ================= */
  .panel-btn{display:none}
  .panel-head{display:none}
  .scrim{display:none}

  /* 触屏没有 hover：勾选框和删除按钮必须常显，否则手机上根本没法取消勾选 / 删图
     注意用 .card .del 而不是 .del —— 基础规则是 .card .del，权重不够会被压回去 */
  @media (hover:none){
    .pick,.card .del{opacity:1}
  }

  /* 触屏放大可点区域，滑杆细得点不中 */
  @media (pointer:coarse){
    input[type=range]{height:4px;margin:6px 0 16px}
    input[type=range]::-webkit-slider-thumb{width:22px;height:22px}
    .pick{width:28px;height:28px}
    .pick input{width:17px;height:17px}
    .card .del{width:28px;height:28px;font-size:17px}
    .tpl{padding:8px 4px 7px}
    .tpl b{font-size:11px}
    .sw{width:26px;height:26px}
    .chip{padding:5px 8px;font-size:10.5px}
  }

  /* 平板竖屏 / 手机：侧栏变成抽屉 */
  @media (max-width:900px){
    body{height:100vh;height:100dvh}
    header{height:56px;padding:0 12px;gap:8px}
    .brand span{display:none}
    .brand h1{font-size:17px}
    .panel-btn{display:inline-flex;align-items:center;padding:8px 11px}
    #count{font-size:10px}

    aside{
      position:fixed;top:0;left:0;bottom:0;z-index:60;
      width:min(86vw,340px);
      transform:translateX(-100%);
      transition:transform .26s cubic-bezier(.4,0,.2,1);
      box-shadow:0 0 48px rgba(40,28,14,.22);
      padding:0 0 calc(40px + env(safe-area-inset-bottom));
      overscroll-behavior:contain;
    }
    body.panel-open aside{transform:none}

    .panel-head{
      display:flex;align-items:center;gap:10px;
      position:sticky;top:0;z-index:2;
      padding:12px 14px 12px 18px;
      background:var(--paper-2);border-bottom:1px solid var(--line);
    }
    .panel-head span{font-family:var(--serif);font-size:15px;font-weight:600;letter-spacing:.06em}
    .ph-btn{
      margin-left:auto;font-size:11.5px;padding:5px 9px;border-radius:7px;
      background:transparent;border:1px solid var(--line);color:var(--ink-2);
    }
    .ph-btn:disabled{opacity:.35;cursor:not-allowed}
    .ph-close{
      width:28px;height:28px;border-radius:50%;border:1px solid var(--line);
      background:transparent;color:var(--ink-2);font-size:17px;line-height:1;padding:0;
      display:flex;align-items:center;justify-content:center;
    }

    .scrim{
      display:block;position:fixed;inset:0;z-index:55;
      background:rgba(20,16,13,.44);
      opacity:0;pointer-events:none;transition:opacity .26s;
    }
    body.panel-open .scrim{opacity:1;pointer-events:auto}

    main{padding:12px 12px calc(40px + env(safe-area-inset-bottom))}
    #grid{grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
    .card{padding:8px}

    /* 字号低于 16px 时 iOS 一聚焦就会放大整页 */
    select,input[type=text],textarea{font-size:16px}
    textarea{min-height:64px}

    #lb{padding:14px 12px calc(78px + env(safe-area-inset-bottom))}
    #lbClose{top:10px;right:12px;font-size:24px}
    .lb-bar{
      left:12px;right:12px;transform:none;justify-content:center;flex-wrap:wrap;
      border-radius:14px;bottom:calc(14px + env(safe-area-inset-bottom));
    }
    .lb-bar #lbInfo{min-width:46px}
  }

  /* 手机：单列 + 头部精简 */
  @media (max-width:560px){
    .brand h1{font-size:16px}
    #count{display:none}
    #clearBtn{display:none}
    #addBtn{padding:8px 11px}
    #addBtn .lbl{display:none}
    #exportBtn{padding:8px 13px;font-size:12px}
    #grid{grid-template-columns:1fr;gap:10px}
    .lb-bar button{padding:5px 9px;font-size:12px}
    #empty .box{padding:28px 18px}
  }
</style>
</head>
<body>
<header>
  <div class="brand">
    <h1>光影相框</h1>
    <span>batch framing studio</span>
  </div>
  <div class="spacer"></div>
  <button class="btn-ghost panel-btn" id="panelBtn">参数</button>
  <div class="count" id="count">0 张照片</div>
  <button class="btn-ghost" id="addBtn">＋<span class="lbl"> 添加照片</span></button>
  <button class="btn-ghost" id="clearBtn" disabled>清空</button>
  <button class="btn" id="exportBtn" disabled>导出全部</button>
  <input type="file" id="file" accept="image/*,.nef,.nrw,.cr2,.cr3,.arw,.srf,.sr2,.dng,.raf,.orf,.rw2,.raw,.pef,.srw,.3fr,.iiq,.mos,.mrw,.x3f,.erf,.kdc,.dcr,.rwl" multiple hidden>
</header>

<div class="app">
  <aside>
    <div class="panel-head">
      <span>参数</span>
      <button class="ph-btn" id="clearBtn2" disabled>清空照片</button>
      <button class="ph-close" id="panelClose" aria-label="关闭">×</button>
    </div>

    <div class="group">
      <h3>版式</h3>
      <div class="tpl-grid" id="tplGrid"></div>
    </div>

    <div class="group" id="blurGroup" style="display:none">
      <h3>边缘模糊</h3>
      <div class="row"><label>模糊强度</label><span class="val" id="blurVal">7.0%</span></div>
      <input type="range" id="blurAmount" min="1" max="18" step="0.5" value="7">
      <div class="row"><label>背景放大</label><span class="val" id="scaleVal">125%</span></div>
      <input type="range" id="blurScale" min="100" max="180" step="5" value="125">
      <div class="row"><label>背景亮度</label><span class="val" id="dimVal">95%</span></div>
      <input type="range" id="blurDim" min="50" max="115" step="1" value="95">
      <div class="row"><label>主体大小</label><span class="val" id="subjVal">90%</span></div>
      <input type="range" id="subjectScale" min="55" max="96" step="1" value="90">
      <div class="row"><label>边缘羽化</label><span class="val" id="feathVal">0%</span></div>
      <input type="range" id="feather" min="0" max="25" step="1" value="0">
      <div class="row"><label>边缘阴影</label><span class="val" id="eshVal">60%</span></div>
      <input type="range" id="edgeShadow" min="0" max="100" step="5" value="60">
      <div class="hint">原图放大虚化做底，主体居中清晰。羽化默认 0，出来是硬边卡片；调大后边缘逐渐融入背景。阴影调到 0 则主体直接浮在虚化底上。</div>
    </div>

    <div class="group" id="markGroup" style="display:none">
      <h3>底部文字</h3>
      <div class="row" style="margin-bottom:8px"><label>第一行</label></div>
      <input type="text" id="markText" placeholder="{camera}">
      <div class="row" style="margin:12px 0 8px"><label>第二行</label></div>
      <input type="text" id="markSub" placeholder="{params}">
      <div class="chips" id="markChips"></div>
      <div class="hint">默认取照片的机身与拍摄参数；也可直接写死文字，如 HASSELBLAD。留空则不显示该行。</div>
      <div id="markBgRow">
        <div class="row" style="margin-top:12px"><label>底图模糊</label><span class="val" id="markBlurVal">12.0%</span></div>
        <input type="range" id="markBlur" min="2" max="24" step="0.5" value="12">
        <div class="row"><label>底图亮度</label><span class="val" id="markDimVal">100%</span></div>
        <input type="range" id="markDim" min="30" max="115" step="1" value="100">
      </div>
    </div>

    <div class="group">
      <h3>画幅</h3>
      <div class="row">
        <label>比例</label>
        <select id="ratio" style="width:130px">
          <option value="orig">跟随原图</option>
          <option value="1">1 : 1 方形</option>
          <option value="0.8">4 : 5 竖幅</option>
          <option value="1.5">3 : 2 横幅</option>
          <option value="1.7778">16 : 9 宽幅</option>
          <option value="0.75">3 : 4 竖幅</option>
        </select>
      </div>
      <div class="row">
        <label>输出长边</label>
        <select id="outSize" style="width:130px">
          <option value="1080">1080 px</option>
          <option value="1600">1600 px</option>
          <option value="2000" selected>2000 px</option>
          <option value="3000">3000 px</option>
          <option value="4000">4000 px</option>
          <option value="0">原始尺寸（不缩放）</option>
        </select>
      </div>
      <div class="row">
        <label>格式</label>
        <select id="format" style="width:130px">
          <option value="jpg">JPG（体积小）</option>
          <option value="png">PNG（无损）</option>
        </select>
      </div>
      <div class="row">
        <label>JPG 画质</label>
        <select id="jpgQuality" style="width:130px">
          <option value="0.90">标准（体积小）</option>
          <option value="0.95" selected>高</option>
          <option value="0.99">最高</option>
        </select>
      </div>
      <div class="hint">要绝对无损请选 PNG。「原始尺寸」按照片本身的像素导出，不做任何缩放。</div>
    </div>

    <div class="group">
      <h3>版式参数</h3>
      <div class="row"><label>边距</label><span class="val" id="padVal">5.5%</span></div>
      <input type="range" id="padding" min="1" max="14" step="0.5" value="5.5">
      <div class="row"><label>字号</label><span class="val" id="fsVal">2.2%</span></div>
      <input type="range" id="fontScale" min="1" max="4" step="0.1" value="2.2">
      <div class="row"><label>圆角</label><span class="val" id="radVal">0.4%</span></div>
      <input type="range" id="radius" min="0" max="3" step="0.1" value="0.4">
      <div class="row">
        <label class="check"><input type="checkbox" id="shadow" checked>投影</label>
        <label class="check"><input type="checkbox" id="grain">颗粒</label>
      </div>
    </div>

    <div class="group">
      <h3>配色</h3>
      <div class="row">
        <label>底色</label>
        <div class="color-input"><input type="color" id="bg" value="#F3EDE2"><span id="bgTxt">F3EDE2</span></div>
      </div>
      <div class="swatches" id="bgSw" style="margin-bottom:12px"></div>
      <div class="row">
        <label>文字</label>
        <div class="color-input"><input type="color" id="fg" value="#1B1714"><span id="fgTxt">1B1714</span></div>
      </div>
      <div class="swatches" id="fgSw" style="margin-bottom:12px"></div>
      <div class="row">
        <label>点缀色</label>
        <div class="color-input"><input type="color" id="accent" value="#B4622D"><span id="acTxt">B4622D</span></div>
      </div>
    </div>

    <div class="group">
      <h3>文字</h3>
      <div class="row" style="margin-bottom:8px"><label>标题</label></div>
      <input type="text" id="title" placeholder="如：初雪 · 京都（全局，可被单图覆盖）">
      <div class="row" style="margin:12px 0 8px"><label>信息模板</label></div>
      <textarea id="infoTpl" spellcheck="false">{params}|{camera}</textarea>
      <div class="chips" id="tokenChips"></div>
      <div class="hint">每行一条信息，用 <b>|</b> 分隔；空值自动省略。点下方标签插入字段。</div>
      <div class="row" style="margin:12px 0 8px"><label>署名</label></div>
      <input type="text" id="author" placeholder="如：© 你的名字">
      <div class="hint">在「光影」「柔焦」版式下显示为底部第三行；其他版式显示在信息区末尾。</div>
    </div>

    <div class="group">
      <h3>我的预设</h3>
      <div style="display:flex;gap:8px">
        <button class="btn-ghost" id="savePreset" style="flex:1">保存当前样式</button>
        <button class="btn-ghost" id="resetPreset" style="flex:0 0 auto">重置</button>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn-ghost" id="exportPreset" style="flex:1">导出参数</button>
        <button class="btn-ghost" id="importPreset" style="flex:1">导入参数</button>
      </div>
      <input type="file" id="presetFile" accept="application/json,.json" hidden>
      <div class="hint">样式保存在本机浏览器，下次打开自动恢复。「导出参数」得到一个 .json，可以发给别人用「导入参数」还原。</div>
    </div>

    <div class="group">
      <h3>快捷键</h3>
      <div class="hint" style="margin-top:0;line-height:2">
        <b>1</b>–<b>8</b> 切换版式　<b>←</b> <b>→</b> 上一个/下一个版式<br>
        <b>Ctrl/⌘ O</b> 添加照片　<b>Ctrl/⌘ E</b> 导出全部<br>
        <b>Ctrl/⌘ S</b> 保存样式　<b>Esc</b> 关闭大图<br>
        大图内：<b>←</b> <b>→</b> 翻页　<b>Delete</b> 删除这张
      </div>
    </div>
  </aside>

  <main id="main">
    <div id="empty">
      <div class="box">
        <h2>把照片拖进来</h2>
        <p>支持 JPG / PNG / WebP，以及 NEF / CR2 / ARW / DNG 等 RAW<br>RAW 自动抽取相机内嵌的预览图，并读取其中的拍摄参数<br>选好版式后一次导出全部</p>
      </div>
    </div>
    <div id="grid"></div>
  </main>
</div>

<div class="scrim" id="scrim"></div>

<div id="toast"></div>
<div id="lb">
  <button id="lbClose" title="关闭（Esc）">×</button>
  <canvas id="lbCanvas"></canvas>
  <div class="lb-bar">
    <button id="lbPrev" title="上一张（←）">‹</button>
    <span id="lbInfo">1 / 1</span>
    <button id="lbNext" title="下一张（→）">›</button>
    <button id="lbExport" title="只导出这一张">导出这张</button>
    <button id="lbDel" title="移除这张（Delete）">删除</button>
  </div>
</div>

<script>
/* ==================== CORE:START  (pure logic, testable in node) ==================== */

/* ---------- EXIF 解析（JPEG APP1 / RAW 的 TIFF 容器） ---------- */
/** 在字节流里找一段 ASCII，返回起始位置 */
function findAscii(u8, str, from, to){
  const n = str.length;
  const limit = Math.min(to === undefined ? u8.length : to, u8.length) - n;
  for (let i = from || 0; i <= limit; i++){
    let hit = true;
    for (let k = 0; k < n; k++){
      if (u8[i + k] !== str.charCodeAt(k)){ hit = false; break; }
    }
    if (hit) return i;
  }
  return -1;
}

function parseExif(buffer){
  try{
    const view = new DataView(buffer);
    if (view.byteLength < 8) return null;

    // JPEG：SOI 之后找 APP1(Exif)
    if (view.getUint16(0) === 0xFFD8){
      let off = 2;
      while (off < view.byteLength - 4){
        if (view.getUint8(off) !== 0xFF){ off++; continue; }
        const marker = view.getUint8(off + 1);
        if (marker === 0xD8 || marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)){ off += 2; continue; }
        if (marker === 0xDA) break;                       // start of scan
        const size = view.getUint16(off + 2);
        if (size < 2) break;
        if (marker === 0xE1){
          const s = off + 4;
          if (view.getUint32(s) === 0x45786966 && view.getUint16(s + 4) === 0){
            return readTiff(view, s + 6);
          }
        }
        off += 2 + size;
      }
      return null;
    }

    // RAW：NEF / CR2 / ARW / DNG / ORF / PEF / RW2 本身就是 TIFF 容器，IFD 直接在文件头
    const tiff = readTiff(view, 0);
    if (tiff) return tiff;

    // CR3 是 ISO BMFF，元数据藏在 CMT1 / CMT2 box 的 payload 里（内容仍是 TIFF 结构）
    const u8 = new Uint8Array(buffer);
    for (const box of ['CMT1', 'CMT2']){
      const p = findAscii(u8, box, 0);
      if (p < 0) continue;
      const r = readTiff(view, p + 4);
      if (r && (r.model || r.make)) return r;
    }
    return null;
  }catch(e){ /* 损坏文件静默降级 */ }
  return null;
}

function readTiff(view, base){
  const le = view.getUint16(base) === 0x4949;           // II = little endian
  const u16 = o => view.getUint16(o, le);
  const u32 = o => view.getUint32(o, le);
  // 标准 TIFF 是 0x2A；ORF 用 0x4F52 / 0x5352，RW2 用 0x0055
  const magic = u16(base + 2);
  if (magic !== 0x002A && magic !== 0x4F52 && magic !== 0x5352 && magic !== 0x0055) return null;

  const SIZE = {1:1,2:1,3:2,4:4,5:8,6:1,7:1,8:2,9:4,10:8,11:4,12:8};

  function readIFD(offset){
    const out = {};
    if (!offset || base + offset + 2 > view.byteLength) return out;
    const n = u16(base + offset);
    for (let i = 0; i < n; i++){
      const e = base + offset + 2 + i * 12;
      if (e + 12 > view.byteLength) break;
      const tag = u16(e), type = u16(e + 2), count = u32(e + 4);
      const bytes = (SIZE[type] || 1) * count;
      let vo = e + 8;
      if (bytes > 4) vo = base + u32(e + 8);
      if (vo + bytes > view.byteLength) continue;
      try{
        if (type === 2){                                  // ASCII
          let str = '';
          for (let k = 0; k < count; k++){
            const c = view.getUint8(vo + k);
            if (c === 0) break;
            str += String.fromCharCode(c);
          }
          out[tag] = str.trim();
        } else if (type === 5 || type === 10){             // RATIONAL
          const num = type === 5 ? u32(vo) : u32(vo);
          const den = type === 5 ? u32(vo + 4) : u32(vo + 4);
          out[tag] = den ? num / den : 0;
        } else if (count === 1){
          out[tag] = type === 3 ? u16(vo) : type === 4 ? u32(vo) : view.getUint8(vo);
        }
      }catch(e){}
    }
    return out;
  }

  const ifd0 = readIFD(u32(base + 4));
  const exifPtr = ifd0[0x8769];
  const exif = exifPtr ? readIFD(exifPtr) : {};

  const make = (ifd0[0x010F] || '').trim();
  const model = (ifd0[0x0110] || '').trim();
  const lens = (exif[0xA434] || '').trim();
  const fnum = exif[0x829D];
  const expo = exif[0x829A];
  const iso = exif[0x8827];
  const focal = exif[0x920A];
  const dt = exif[0x9003] || ifd0[0x0132] || '';

  const clean = s => s.replace(/\\s+/g, ' ').trim();
  return {
    make: clean(make),
    model: clean(model),
    lens: clean(lens),
    fnum: fnum ? 'f/' + (Math.round(fnum * 10) / 10) : '',
    shutter: fmtShutter(expo),
    iso: iso ? String(iso) : '',
    focal: focal ? Math.round(focal) + 'mm' : '',
    date: fmtDate(dt),
    w: exif[0xA002] || ifd0[0x0100] || 0,
    h: exif[0xA003] || ifd0[0x0101] || 0
  };
}

function fmtShutter(v){
  if (!v || !isFinite(v)) return '';
  if (v >= 1) return (Math.round(v * 10) / 10) + 's';
  const d = Math.round(1 / v);
  return '1/' + d + 's';
}
function fmtDate(s){
  if (!s) return '';
  const m = String(s).match(/(\\d{4})[:\\-](\\d{2})[:\\-](\\d{2})/);
  return m ? m[1] + '.' + m[2] + '.' + m[3] : String(s).slice(0, 10);
}

/* ---------- RAW 容器：抽内嵌 JPEG 预览 ---------- */
/* 浏览器解不了 RAW 的像素数据，但相机在 RAW 里都会存一张 JPEG 预览。
   与其塞几 MB 的 WASM 解码器（破坏「单文件零依赖」），不如把这张预览取出来用。 */
const RAW_EXT = /\\.(nef|nrw|cr2|cr3|arw|srf|sr2|dng|raf|orf|rw2|raw|pef|srw|3fr|iiq|mos|mrw|x3f|erf|kdc|dcr|rwl)$/i;
function isRawFile(name){ return RAW_EXT.test(String(name || '')); }

/** 从 start（指向 FFD8）走到 EOI，返回结束位置（不含）；不是合法 JPEG 返回 -1 */
function jpegEndAt(u8, start){
  const n = u8.length;
  let p = start + 2;
  while (p + 3 < n){
    if (u8[p] !== 0xFF) return -1;
    const m = u8[p + 1];
    if (m === 0xFF){ p++; continue; }                    // 填充字节
    if (m === 0xD8 || m === 0x01 || (m >= 0xD0 && m <= 0xD7)){ p += 2; continue; }
    if (m === 0xD9) return p + 2;
    const len = (u8[p + 2] << 8) | u8[p + 3];
    if (len < 2) return -1;
    if (m === 0xDA){                                     // 进入扫描数据，找 EOI
      let q = p + 2 + len;
      while (q + 1 < n){
        if (u8[q] === 0xFF){
          const k = u8[q + 1];
          if (k === 0xD9) return q + 2;
          if (k === 0x00 || (k >= 0xD0 && k <= 0xD7)){ q += 2; continue; }
          if (k === 0xFF){ q++; continue; }
          break;                                         // 遇到别的 marker，说明结构异常
        }
        q++;
      }
      return -1;
    }
    p += 2 + len;
  }
  return -1;
}

/** 扫整个容器，返回最大的那张内嵌 JPEG（相机的全尺寸/中尺寸预览） */
function extractJpegPreview(buf){
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bestStart = -1, bestLen = 0;
  for (let i = 0; i + 3 < u8.length; i++){
    if (u8[i] !== 0xFF || u8[i + 1] !== 0xD8 || u8[i + 2] !== 0xFF) continue;
    const end = jpegEndAt(u8, i);
    if (end < 0) continue;
    const len = end - i;
    if (len > bestLen){ bestStart = i; bestLen = len; }
    if (len > 64) i = end - 3;                           // 整段跳过，别重复扫
  }
  if (bestStart < 0) return null;
  return u8.subarray(bestStart, bestStart + bestLen);
}

/* ---------- CRC32 + 无压缩 ZIP 打包 ---------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++){
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes){
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function dosTime(d){
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
  };
}

/** entries: [{name, data:Uint8Array}] -> Blob */
function buildZip(entries){
  const enc = new TextEncoder();
  const parts = [], central = [];
  let offset = 0;
  const t = dosTime(new Date());

  for (const e of entries){
    const name = enc.encode(e.name);
    const crc = crc32(e.data);
    const size = e.data.length;

    const lh = new Uint8Array(30 + name.length);
    const lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034B50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);        // UTF-8 文件名
    lv.setUint16(8, 0, true);             // store
    lv.setUint16(10, t.time, true);
    lv.setUint16(12, t.date, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, name.length, true);
    lv.setUint16(28, 0, true);
    lh.set(name, 30);
    parts.push(lh, e.data);

    const ch = new Uint8Array(46 + name.length);
    const cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014B50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, t.time, true);
    cv.setUint16(14, t.date, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, name.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    ch.set(name, 46);
    central.push(ch);

    offset += lh.length + size;
  }

  const cdSize = central.reduce((a, b) => a + b.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054B50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);

  return new Blob([...parts, ...central, eocd], {type: 'application/zip'});
}

/* ---------- 相机名精简 ---------- */
/* EXIF 的 Make 常带公司后缀、Model 常与 Make 重复，直接拼会又长又啰嗦。
   NIKON CORPORATION + NIKON Z5_2  →  NIKON Z5_2
   Canon + Canon EOS R5            →  Canon EOS R5
   SONY + ILCE-7RM5                →  SONY ILCE-7RM5            */
const CAM_NOISE = /^(corporation|corp|incorporated|inc|co|ltd|limited|company|gmbh|ag|imaging|optical|digital|technologies|technology|electronics|precision|industries|international|group|holdings)$/i;

function tidyCamStr(s){
  return String(s == null ? '' : s)
    .replace(/[\\u0000-\\u001f\\u007f]/g, ' ')   // 去掉 EXIF 里常见的填充/控制字符
    .replace(/\\s+/g, ' ')
    .trim();
}

function cleanCamera(make, model){
  const mk = tidyCamStr(make);
  const md = tidyCamStr(model);
  // 厂商名只留主词：NIKON CORPORATION → NIKON，RICOH IMAGING COMPANY, LTD. → RICOH
  const core = mk.split(' ')
    .map(w => w.replace(/[,;.]+$/, ''))
    .filter(w => w && !CAM_NOISE.test(w))
    .join(' ');

  if (!md) return core;
  if (!core) return md;
  // Model 里已经带了厂商名就不重复
  const lowMd = md.toLowerCase();
  if (lowMd.includes(core.toLowerCase())) return md;
  const brand = core.split(' ')[0].toLowerCase();
  if (brand && lowMd.includes(brand)) return md;
  return core + ' ' + md;
}

/* ---------- 信息行渲染 ---------- */
function buildTokens(photo){
  const e = photo.exif || {};
  const p = [];
  if (e.focal) p.push(e.focal);
  if (e.fnum) p.push(e.fnum);
  if (e.shutter) p.push(e.shutter);
  if (e.iso) p.push('ISO ' + e.iso);
  return {
    params: p.join('  '),
    camera: cleanCamera(e.make, e.model),
    lens: e.lens || '',
    date: e.date || '',
    iso: e.iso ? 'ISO ' + e.iso : '',
    focal: e.focal || '',
    aperture: e.fnum || '',
    shutter: e.shutter || '',
    size: e.w && e.h ? e.w + '×' + e.h : '',
    filename: photo.name || ''
  };
}

function expandTokens(str, photo){
  const t = buildTokens(photo);
  return String(str || '')
    .replace(/\\{(\\w+)\\}/g, (m, k) => (t[k] !== undefined ? t[k] : m))
    .replace(/\\s+/g, ' ').trim();
}

function infoLines(photo, s){
  const t = buildTokens(photo);
  const tpl = (s.infoTpl || '').split('|');
  const out = [];
  for (const raw of tpl){
    const line = raw.replace(/\\{(\\w+)\\}/g, (m, k) => (t[k] !== undefined ? t[k] : m))
                    .replace(/\\s+/g, ' ').trim();
    if (line) out.push(line);
  }
  return out;
}
/* ==================== CORE:END ==================== */


/* ==================== 渲染引擎 ==================== */
const FONTS = {
  serif:'"Songti SC","Noto Serif SC","Source Han Serif SC","SimSun",serif',
  sans:'-apple-system,"PingFang SC","Microsoft YaHei","Helvetica Neue",Arial,sans-serif',
  mono:'"SF Mono","JetBrains Mono",Menlo,Consolas,"Courier New",monospace'
};

const TEMPLATES = {
  film:      {name:'胶片', bg:'#F3EDE2', fg:'#1B1714', accent:'#B4622D', pad:0.055, align:'left',   family:'sans',  caps:true},
  polaroid:  {name:'拍立得', bg:'#FCFBF7', fg:'#2A2622', accent:'#B4622D', pad:0.072, align:'center', family:'serif', caps:false},
  white:     {name:'留白', bg:'#FFFFFF', fg:'#3A3631', accent:'#8C8378', pad:0.075, align:'center', family:'sans',  caps:true},
  cinema:    {name:'银幕', bg:'#0C0C0D', fg:'#E9E5DD', accent:'#C7703A', pad:0.038, align:'left',   family:'sans',  caps:true},
  editorial: {name:'杂志', bg:'#E9E3D8', fg:'#1B1714', accent:'#B4622D', pad:0.068, align:'left',   family:'serif', caps:true},
  infobar:   {name:'悬浮条', bg:'#151311', fg:'#F7F3EB', accent:'#E0A87A', pad:0.045, align:'left',   family:'sans',  caps:false},
  soft:      {name:'柔焦', bg:'#141210', fg:'#FFFFFF', accent:'#E8C39A', pad:0.05,  align:'left',   family:'sans',  caps:true},
  watermark: {name:'光影', bg:'#14100D', fg:'#EDE7DE', accent:'#F3924E', pad:0.026, align:'center', family:'sans',  caps:true,
              radius:0.017, blurAmount:0.12, blurDim:1.0, blurSat:0.95}
};

function addRoundPath(ctx, x, y, w, h, r){
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  if (r <= 0.01){ ctx.rect(x, y, w, h); return; }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function roundPath(ctx, x, y, w, h, r){
  ctx.beginPath();
  addRoundPath(ctx, x, y, w, h, r);
}

function drawCover(ctx, img, x, y, w, h){
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const ir = iw / ih, br = w / h;
  let sw, sh, sx, sy;
  if (ir > br){ sh = ih; sw = ih * br; sx = (iw - sw) / 2; sy = 0; }
  else { sw = iw; sh = iw / br; sx = 0; sy = (ih - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

let _noise = null;
function noisePattern(ctx, grainPx){
  if (!_noise){
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d');
    const d = x.createImageData(128, 128);
    for (let i = 0; i < d.data.length; i += 4){
      const v = 128 + (Math.random() - 0.5) * 200;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    x.putImageData(d, 0, 0);
    _noise = c;
  }
  const pat = ctx.createPattern(_noise, 'repeat');
  // 噪点按画布尺寸放大，否则 2000px 输出时颗粒只有 1px，缩略图上直接被插值抹平
  const k = Math.max(1, grainPx || 1);
  if (k > 1 && pat.setTransform){
    try{ pat.setTransform(new DOMMatrix([k, 0, 0, k, 0, 0])); }catch(e){}
  }
  return pat;
}

/** 颗粒开关：只有「关 / 主体」两态。旧预设里的 all / edge 统一收敛到主体颗粒 */
function grainModeOf(s){
  if (s.grainMode === 'subject' || s.grainMode === 'all' || s.grainMode === 'edge') return 'subject';
  if (s.grainMode === 'off') return 'off';
  return s.grain ? 'subject' : 'off';        // 更早的布尔字段
}

/** 柔焦专用：颗粒跟着羽化边缘走，避免在主体边界切出硬边 */
function paintGrainFeathered(ctx, W, H, short, img, dw, dh, featherPx, radius, dx, dy){
  const pad = Math.ceil(Math.min(short * 0.05, 140));
  const mask = makeFeathered(img, dw, dh, featherPx, radius, pad);

  const layer = document.createElement('canvas');
  layer.width = W; layer.height = H;
  const lc = layer.getContext('2d');
  lc.fillStyle = noisePattern(lc, Math.max(1, short * 0.0013));
  lc.fillRect(0, 0, W, H);

  // 噪点只留主体那一块，边界跟着羽化一起渐变
  lc.globalCompositeOperation = 'destination-in';
  lc.drawImage(mask.canvas, dx - pad, dy - pad, dw + pad * 2, dh + pad * 2);

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.42;
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
}

/**
 * 颗粒绘制：只加在照片主体上。
 * 早期还有「全图 / 主体以外」两种模式，实际观感都接近「整张照片糊一层噪点」
 * （柔焦的底图本身就是虚化的原图），已移除。
 * @param rect 主体区域 {x,y,w,h,r}
 */
function paintGrain(ctx, W, H, short, rect){
  if (!rect) return;

  ctx.save();
  ctx.beginPath();
  addRoundPath(ctx, rect.x, rect.y, rect.w, rect.h, rect.r || 0);
  ctx.clip();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = noisePattern(ctx, Math.max(1, short * 0.0013));
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function setFont(ctx, size, family, weight){
  ctx.font = (weight || 400) + ' ' + size.toFixed(1) + 'px ' + family;
}
function tracked(ctx, px){ try{ ctx.letterSpacing = px + 'px'; }catch(e){} }
function fitSize(ctx, text, maxW, size, family, weight){
  setFont(ctx, size, family, weight);
  let s = size;
  while (s > size * 0.55 && ctx.measureText(text).width > maxW){
    s -= Math.max(0.5, size * 0.03);
    setFont(ctx, s, family, weight);
  }
  return s;
}

/** 带字距的文本宽度 */
function measureTracked(ctx, text, size, trackPx, family, weight){
  setFont(ctx, size, family, weight);
  tracked(ctx, trackPx);
  const w = ctx.measureText(text).width - trackPx;
  tracked(ctx, 0);
  return w;
}

/** 带字距的自适应字号：返回 {size, width} */
function fitTracked(ctx, text, maxW, size, family, weight, trackRatio){
  let sz = size;
  let w = measureTracked(ctx, text, sz, sz * trackRatio, family, weight);
  let guard = 0;
  while (w > maxW && sz > size * 0.45 && guard++ < 60){
    sz -= Math.max(0.5, sz * 0.02);
    w = measureTracked(ctx, text, sz, sz * trackRatio, family, weight);
  }
  return {size: sz, width: w};
}

/** 主渲染：返回 canvas */
function renderFrame(photo, s, longEdge){
  const img = photo.img;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const aspect = s.ratio === 'orig' ? iw / ih : parseFloat(s.ratio);

  let W, H;
  if (aspect >= 1){ W = longEdge; H = Math.round(longEdge / aspect); }
  else { H = longEdge; W = Math.round(longEdge * aspect); }

  if (s.template === 'soft') return renderSoft(photo, s, W, H);
  if (s.template === 'watermark') return renderWatermark(photo, s, W, H);

  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d', {alpha: false});

  const short = Math.min(W, H);
  const pad = short * s.padding;
  const radius = short * s.radius;
  const tplName = s.template;
  const tpl = TEMPLATES[tplName];
  const bg = s.bg, fg = s.fg, accent = s.accent;
  let lines = infoLines(photo, s);
  const title = (photo.caption || s.title || '').trim();
  const author = (s.author || '').trim();
  const family = tpl.family === 'serif' ? FONTS.serif : FONTS.sans;

  // 背景
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  /* ---- 几何：照片区 / 文字区 ---- */
  // 文字块总高与字号严格成正比：先按目标字号算一遍，放不下就整体缩字，
  // 缩到下限还放不下再从末尾砍信息行——避免长标题 + 多行信息把文字画出画布。
  const blockOf = f => (title ? f * (tplName === 'editorial' ? 1.9 : 1.65) * 1.3 : 0)
                        + lines.length * f * 1.7
                        + (author ? (tpl.align === 'center' ? f * 1.5 : f * 0.95) : 0);
  let fs = Math.max(8, short * s.fontScale);
  const maxBlockH = Math.max(short * 0.1, H - pad * 2 - short * 0.18);
  if (blockOf(fs) > maxBlockH){
    const floor = Math.max(6, short * 0.006);
    fs = Math.max(floor, fs * maxBlockH / blockOf(fs));
    let guard = 0;
    while (blockOf(fs) > maxBlockH && lines.length > 1 && guard++ < 40) lines = lines.slice(0, -1);
  }
  const gap = fs * 1.2;                                   // 照片与文字的呼吸间距
  const titleSize = fs * (tplName === 'editorial' ? 1.9 : 1.65);
  const lineH = fs * 1.7;
  const blockH = blockOf(fs);

  let px = pad, py = pad, pw = W - pad * 2, ph = H - pad * 2;
  let capX = pad, capTop = 0, capW = W - pad * 2, capAlign = tpl.align;
  let overlay = false;

  if (tplName === 'polaroid'){
    let bottom = short * 0.15;
    if (bottom < blockH + fs * 1.4) bottom = blockH + fs * 1.4;
    ph = H - pad - bottom;
    capTop = py + ph + Math.max(fs * 0.7, (bottom - blockH) / 2 - fs * 0.3);
    capAlign = 'center';
  } else if (tplName === 'infobar'){
    px = 0; py = 0; pw = W; ph = H;
    overlay = true;
    capTop = H - pad * 1.75 - blockH + fs * 0.3;
  } else if (tplName === 'editorial'){
    const top = short * 0.10;
    py = top;
    ph = H - top - pad - (gap + blockH);
    capTop = py + ph + gap;
  } else if (tplName === 'cinema'){
    ph = H - pad * 2 - (gap + blockH);
    capTop = py + ph + gap;
    capX = pad + fs * 0.95;
    capW = W - pad * 2 - fs * 0.95;
  } else {
    ph = H - pad * 2 - (gap + blockH);
    capTop = py + ph + gap;
  }

  // 兜底：文字块整体不得越过下边距（极端字号 + 超多行时才会触发）
  if (capTop + blockH > H - pad * 0.3){
    capTop = Math.max(pad * 0.3, H - pad * 0.3 - blockH);
  }

  ph = Math.max(ph, short * 0.25);
  pw = Math.max(pw, 1);

  /* ---- 照片 ---- */
  if (s.shadow && !overlay){
    ctx.save();
    ctx.shadowColor = 'rgba(40,28,14,0.22)';
    ctx.shadowBlur = short * 0.022;
    ctx.shadowOffsetY = short * 0.007;
    ctx.fillStyle = 'rgba(0,0,0,1)';
    roundPath(ctx, px, py, pw, ph, radius);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  roundPath(ctx, px, py, pw, ph, radius);
  ctx.clip();
  drawCover(ctx, img, px, py, pw, ph);
  if (tplName === 'film'){
    // 极细内描边，增加"冲印"质感
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = Math.max(1, short * 0.0012);
    ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
  }
  ctx.restore();

  /* ---- 文字 ---- */
  const textColor = overlay ? '#F7F3EB' : fg;
  ctx.textBaseline = 'alphabetic';

  if (overlay){
    const gh = Math.min(H * 0.55, blockH + pad * 3.2);
    const g = ctx.createLinearGradient(0, H - gh, 0, H);
    g.addColorStop(0, 'rgba(12,10,8,0)');
    g.addColorStop(0.55, 'rgba(12,10,8,0.55)');
    g.addColorStop(1, 'rgba(12,10,8,0.94)');
    ctx.save();
    roundPath(ctx, px, py, pw, ph, radius);
    ctx.clip();
    ctx.fillStyle = g;
    ctx.fillRect(0, H - gh, W, gh);
    ctx.restore();
  }

  if (tplName === 'editorial'){
    ctx.strokeStyle = fg; ctx.globalAlpha = 0.32;
    ctx.lineWidth = Math.max(1, short * 0.0012);
    ctx.beginPath();
    ctx.moveTo(pad, capTop - gap * 0.7);
    ctx.lineTo(W - pad, capTop - gap * 0.7);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  const isCenter = capAlign === 'center';
  const tx = isCenter ? capX + capW / 2 : capX;
  let y = capTop;
  let titleBase = 0, lastBase = 0;

  if (title){
    const ts = fitSize(ctx, title, capW, titleSize, family, 500);
    tracked(ctx, fs * 0.02);
    ctx.fillStyle = textColor;
    ctx.textAlign = isCenter ? 'center' : 'left';
    titleBase = y + ts * 0.94;
    ctx.fillText(title, tx, titleBase);
    tracked(ctx, 0);
    y += titleSize * 1.3;
  }

  ctx.fillStyle = textColor;
  ctx.globalAlpha = overlay ? 0.9 : 0.7;
  lines.forEach((line, i) => {
    const sz = fitSize(ctx, line, capW, fs * 1.0, FONTS.mono, 400);
    tracked(ctx, tpl.caps ? fs * 0.03 : 0);
    setFont(ctx, sz, FONTS.mono, 400);
    ctx.textAlign = isCenter ? 'center' : 'left';
    lastBase = y + sz * 0.92 + i * lineH;
    ctx.fillText(line, tx, lastBase);
    tracked(ctx, 0);
  });
  ctx.globalAlpha = 1;

  // 署名：另起一行，居中版式居中、左对齐版式右对齐（不压信息行）
  if (author){
    ctx.globalAlpha = 0.68;
    const sz = fitSize(ctx, author, capW * 0.7, fs * 0.86, FONTS.sans, 400);
    tracked(ctx, fs * 0.03);
    ctx.fillStyle = textColor;
    ctx.textAlign = isCenter ? 'center' : 'right';
    ctx.fillText(author, isCenter ? tx : capX + capW, y + lines.length * lineH + sz * 0.95);
    tracked(ctx, 0);
    ctx.globalAlpha = 1;
  }

  // 版式细节
  if (tplName === 'cinema'){
    const barH = Math.max(fs * 1.1, blockH - fs * 0.35);
    ctx.fillStyle = accent;
    ctx.fillRect(capX - fs * 0.85, capTop + fs * 0.18, Math.max(2, fs * 0.15), barH);
  }

  if (grainModeOf(s) !== 'off') paintGrain(ctx, W, H, short, {x: px, y: py, w: pw, h: ph, r: radius});

  return cv;
}

/* ==================== 柔焦 · 边缘模糊版式 ==================== */
const SUPPORTS_FILTER = (() => {
  try{
    const c = document.createElement('canvas').getContext('2d');
    c.filter = 'blur(2px)';
    return c.filter === 'blur(2px)';
  }catch(e){ return false; }
})();

/** 铺满画布的虚化底图：放大 overscan，避免模糊后四周露底 */
function paintBgLayer(ctx, img, W, H, s, blurPx, blurMul){
  const k = s.blurScale || 1.25;
  const m = blurPx * 2.4;
  const dw = W * k + m * 2, dh = H * k + m * 2;
  const dx = (W - dw) / 2, dy = (H - dh) / 2;
  const dim = s.blurDim === undefined ? 0.85 : s.blurDim;
  const sat = s.blurSat || 1.12;
  const b = blurPx * (blurMul || 1);

  ctx.save();
  if (SUPPORTS_FILTER){
    ctx.filter = 'blur(' + b.toFixed(1) + 'px) brightness(' + dim.toFixed(2) + ') saturate(' + sat.toFixed(2) + ')';
    drawCover(ctx, img, dx, dy, dw, dh);
    ctx.filter = 'none';
  } else {
    // 兜底：缩到极小再插值放大，模拟高斯模糊
    const kk = Math.max(0.05, 8 / Math.max(dw, dh));
    const tw = Math.max(8, Math.round(dw * kk)), th = Math.max(8, Math.round(dh * kk));
    const tmp = document.createElement('canvas');
    tmp.width = tw; tmp.height = th;
    drawCover(tmp.getContext('2d'), img, 0, 0, tw, th);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tmp, dx, dy, dw, dh);
    if (dim < 1){
      ctx.fillStyle = 'rgba(0,0,0,' + (1 - dim).toFixed(3) + ')';
      ctx.fillRect(dx, dy, dw, dh);
    }
  }
  ctx.restore();
}

/** 生成带羽化的主体图层（pad 用于给模糊留出溢出空间） */
function makeFeathered(img, w, h, featherPx, radius, pad){
  const cw = Math.max(2, Math.round(w)), ch = Math.max(2, Math.round(h));
  const p = Math.max(0, Math.round(pad || 0));
  const tmp = document.createElement('canvas');
  tmp.width = cw + p * 2; tmp.height = ch + p * 2;
  const t = tmp.getContext('2d');

  t.save();
  t.translate(p, p);
  if (radius > 0.5){ roundPath(t, 0, 0, cw, ch, radius); t.clip(); }
  drawCover(t, img, 0, 0, cw, ch);
  t.restore();

  const f = Math.min(featherPx, Math.min(cw, ch) * 0.45);
  if (f > 0.5){
    t.globalCompositeOperation = 'destination-in';
    const edges = [
      [p, p, p + f, p],
      [p + cw, p, p + cw - f, p],
      [p, p, p, p + f],
      [p, p + ch, p, p + ch - f]
    ];
    for (const e of edges){
      const g = t.createLinearGradient(e[0], e[1], e[2], e[3]);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.35, 'rgba(0,0,0,0.22)');
      g.addColorStop(0.7, 'rgba(0,0,0,0.72)');
      g.addColorStop(1, 'rgba(0,0,0,1)');
      t.fillStyle = g;
      t.fillRect(0, 0, tmp.width, tmp.height);
    }
  }
  return {canvas: tmp, pad: p};
}

/**
 * 渐进模糊主体：清晰层 + 同亮度的虚化过渡层，
 * 让边缘不是"淡出成背景"，而是"逐渐失焦"。
 */
function drawSubject(ctx, img, x, y, w, h, featherPx, radius){
  if (featherPx > 1){
    const blurPx = featherPx * 0.35;
    const pad = Math.ceil(blurPx * 2.5);
    const halo = makeFeathered(img, w, h, featherPx * 1.25, radius, pad);
    ctx.save();
    if (SUPPORTS_FILTER) ctx.filter = 'blur(' + blurPx.toFixed(1) + 'px)';
    ctx.drawImage(halo.canvas, x - halo.pad, y - halo.pad, w + halo.pad * 2, h + halo.pad * 2);
    ctx.filter = 'none';
    ctx.restore();
  }
  const main = makeFeathered(img, w, h, featherPx, radius, 0);
  ctx.drawImage(main.canvas, x, y, w, h);
}

function renderSoft(photo, s, W, H){
  const img = photo.img;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d', {alpha: false});

  const short = Math.min(W, H);
  const fs = Math.max(8, short * s.fontScale);
  const pad = short * s.padding;
  const radius = short * s.radius;            // 只作用于照片圆角
  const title = (photo.caption || s.title || '').trim();
  const blurPx = Math.max(0, short * (s.blurAmount === undefined ? 0.07 : s.blurAmount));

  ctx.fillStyle = s.bg || '#141210';
  ctx.fillRect(0, 0, W, H);
  paintBgLayer(ctx, img, W, H, s, blurPx, 1);

  /* ---- 底部文字块：与「光影」版式同一套排版 ---- */
  const m = captionMetrics(photo, s, short);
  const titleSize = m.brandSize * 1.15;
  const titleH = title ? titleSize * 1.85 : 0;
  const blockH = titleH + m.blockH;

  const innerW = W - pad * 2;

  let availH = H - pad * 2 - (blockH + pad * 0.9);
  availH = Math.max(availH, short * 0.3);

  // 主体：居中、留出文字区空间
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  let dw = short * (s.subjectScale || 0.9);
  let dh = dw * ih / iw;
  const maxW = innerW;
  if (dh > availH){ dh = availH; dw = dh * iw / ih; }
  if (dw > maxW){ dw = maxW; dh = dw * ih / iw; }
  const dx = (W - dw) / 2;
  const dy = pad + (availH - dh) / 2;
  const featherPx = short * (s.feather === undefined ? 0 : s.feather);

  // 边缘阴影：用羽化剪影做投影，避免露出硬边矩形
  const shadowAmt = s.edgeShadow === undefined ? 0.6 : s.edgeShadow;
  if (shadowAmt > 0.01){
    const spad = Math.ceil(short * 0.03);
    const sil = makeFeathered(img, dw, dh, featherPx, radius, spad);
    const sc = sil.canvas.getContext('2d');
    sc.globalCompositeOperation = 'source-in';
    sc.fillStyle = '#000';
    sc.fillRect(0, 0, sil.canvas.width, sil.canvas.height);
    sc.globalCompositeOperation = 'source-over';

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,' + (0.8 * shadowAmt).toFixed(3) + ')';
    ctx.shadowBlur = short * (0.012 + 0.05 * shadowAmt);
    ctx.shadowOffsetY = short * 0.018 * shadowAmt;
    ctx.drawImage(sil.canvas, dx - spad, dy - spad, dw + spad * 2, dh + spad * 2);
    ctx.restore();
  }
  drawSubject(ctx, img, dx, dy, dw, dh, featherPx, radius);

  // 轻微暗角，四周更沉
  const vg = ctx.createRadialGradient(W / 2, H / 2, short * 0.3, W / 2, H / 2, short * 0.92);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.26)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // 文字直接压在虚化底上，靠投影保证可读性（柔焦不加框）
  const textColor = s.fg || '#FFFFFF';
  const textTop = H - pad - blockH;
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = Math.max(fs * 1.1, short * 0.018);

  if (title){
    const ts = fitSize(ctx, title, innerW, titleSize, FONTS.sans, 500);
    tracked(ctx, ts * 0.02);
    ctx.fillStyle = textColor; ctx.globalAlpha = 0.97;
    ctx.textAlign = 'center';
    ctx.fillText(title, W / 2, textTop + ts * 0.94);
    tracked(ctx, 0);
    ctx.globalAlpha = 1;
  }

  drawCaption(ctx, m, s, W, textTop + titleH, innerW);
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  if (grainModeOf(s) !== 'off') paintGrainFeathered(ctx, W, H, short, img, dw, dh, featherPx, radius, dx, dy);

  return cv;
}

/* ==================== 底部文字块（光影 / 柔焦共用） ==================== */
/** 计算底部文字块的行内容与几何，不改画布 */
function captionMetrics(photo, s, short){
  const wm1 = expandTokens(s.markText === undefined ? '{camera}' : s.markText, photo);
  const wm2 = expandTokens(s.markSub === undefined ? '{params}' : s.markSub, photo);
  const line1 = wm1 || wm2;                // 第一行为空时把第二行提上来
  const line2 = wm1 ? wm2 : '';
  const line3 = (s.author || '').trim();   // 署名

  // 字号跟随「版式参数 · 字号」：默认 2.2% 等于参考图规格，拖动按比例缩放
  const fk = Math.max(0.55, Math.min(2.0, (s.fontScale || 0.022) / 0.022));
  const brandSize = short * 0.0195 * fk;
  const subSize = short * 0.0165 * fk;

  const authAlone = !line1 && !line2 && !!line3;
  const capB = brandSize * 0.72;           // 品牌行基线上方高度
  const subGap = brandSize * 1.95;         // 副标基线相对品牌行
  const authGap = brandSize * 1.75;        // 署名基线相对副标
  const headH = line1 ? capB : (authAlone ? brandSize * 0.72 : 0);
  const blockH = headH
    + (line2 ? subGap : 0)
    + (line3 ? (line2 ? authGap : (line1 ? subGap : 0)) : 0);

  return {line1, line2, line3, brandSize, subSize, authAlone, headH, subGap, authGap, blockH};
}

/** 在 blockTop 处绘制文字块（整体水平居中），返回块高 */
function drawCaption(ctx, m, s, W, blockTop, maxW){
  const {line1, line2, line3, brandSize, subSize, authAlone, headH, subGap, authGap} = m;
  const textColor = s.fg || '#EDE7DE';
  const dotD = brandSize * 0.7;
  const gap = brandSize * 1.0;
  const TRACK = 0.6;
  const cx = W / 2;
  const brandBase = blockTop + headH;
  ctx.textBaseline = 'alphabetic';
  let cursorY = brandBase;

  if (line1){
    const l1 = fitTracked(ctx, line1, maxW - dotD - gap, brandSize, FONTS.sans, 300, TRACK);
    const groupW = dotD + gap + l1.width;
    const gx = cx - groupW / 2;

    ctx.fillStyle = s.accent || '#F3924E';
    ctx.beginPath();
    ctx.arc(gx + dotD / 2, brandBase - brandSize * 0.35, dotD / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.96;
    ctx.textAlign = 'left';
    setFont(ctx, l1.size, FONTS.sans, 300);
    tracked(ctx, l1.size * TRACK);
    ctx.fillText(line1, gx + dotD + gap, brandBase);
    tracked(ctx, 0);
    ctx.globalAlpha = 1;
  }

  if (line2){
    cursorY += subGap;
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.78;
    ctx.textAlign = 'center';
    const sz = fitSize(ctx, line2, maxW, subSize, FONTS.sans, 300);
    tracked(ctx, sz * 0.14);
    ctx.fillText(line2, cx, cursorY);
    tracked(ctx, 0);
    ctx.globalAlpha = 1;
  }

  if (line3){
    cursorY += (line2 ? authGap : (line1 ? subGap : 0));
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.8;
    ctx.textAlign = 'center';
    // 署名不再压到 0.92 倍副标——那个尺寸在缩略图里只有几个像素，等于看不见
    const sz3 = authAlone ? brandSize : subSize;
    const s3 = fitSize(ctx, line3, maxW, sz3, FONTS.sans, 400);
    tracked(ctx, s3 * 0.16);
    ctx.fillText(line3, cx, cursorY);
    tracked(ctx, 0);
    ctx.globalAlpha = 1;
  }

  return m.blockH;
}

/* ==================== 光影版式（底部文字） ==================== */
function renderWatermark(photo, s, W, H){
  const img = photo.img;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d', {alpha: false});

  const short = Math.min(W, H);
  const pad = Math.round(short * s.padding);
  const radius = short * (s.radius === undefined ? 0.017 : s.radius);

  const m = captionMetrics(photo, s, short);
  let band = short * 0.128;
  const need = (m.line1 || m.line2 ? m.brandSize * 1.8 + m.subSize * 3.0 : 0)
             + (m.line3 ? m.subSize * 2.8 : 0)
             + pad * 1.2;
  band = Math.max(band, need);

  const px = pad, py = pad;
  const pw = W - pad * 2;
  const ph = Math.max(short * 0.3, H - pad - band);

  // 底：虚化照片
  ctx.fillStyle = s.bg || '#14100D';
  ctx.fillRect(0, 0, W, H);
  paintBgLayer(ctx, img, W, H, s, short * (s.blurAmount === undefined ? 0.14 : s.blurAmount), 1);

  const vg = ctx.createRadialGradient(W / 2, H / 2, short * 0.2, W / 2, H / 2, short * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // 照片
  if (s.shadow){
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = short * 0.03;
    ctx.shadowOffsetY = short * 0.006;
    ctx.fillStyle = '#000';
    roundPath(ctx, px, py, pw, ph, radius);
    ctx.fill();
    ctx.restore();
  }
  ctx.save();
  roundPath(ctx, px, py, pw, ph, radius);
  ctx.clip();
  drawCover(ctx, img, px, py, pw, ph);
  ctx.restore();

  // 底部文字：整块在底栏内垂直居中
  const photoBottom = py + ph;
  const blockTop = photoBottom + (band - m.blockH) / 2 - band * 0.02;
  drawCaption(ctx, m, s, W, blockTop, W - pad * 2);

  if (grainModeOf(s) !== 'off') paintGrain(ctx, W, H, short, {x: px, y: py, w: pw, h: ph, r: radius});

  return cv;
}
</script>

<script>
/* ==================== 应用层 ==================== */
const $ = id => document.getElementById(id);

const state = {
  photos: [],
  settings: {
    template: 'film',
    ratio: 'orig',
    outSize: 2000,
    jpgQuality: 0.95,
    format: 'jpg',
    padding: 0.055,
    fontScale: 0.022,
    radius: 0.004,
    shadow: true,
    grainMode: 'off',
    bg: '#F3EDE2',
    fg: '#1B1714',
    accent: '#B4622D',
    title: '',
    author: '',
    infoTpl: '{params}|{camera}',
    /* 柔焦 · 边缘模糊 */
    blurAmount: 0.07,
    blurScale: 1.25,
    blurDim: 0.95,
    blurSat: 1.12,
    subjectScale: 0.90,
    feather: 0,
    edgeShadow: 0.6,
    /* 底部文字（光影 / 柔焦） */
    markText: '{camera}',
    markSub: '{params}'
  }
};

let uid = 0;

/* ---------- 版式小样 ---------- */
function paintChip(cv, key){
  const t = TEMPLATES[key];
  const w = cv.width = 120, h = cv.height = 88;
  const c = cv.getContext('2d');
  c.fillStyle = t.bg; c.fillRect(0, 0, w, h);

  if (key === 'watermark'){
    const g = c.createRadialGradient(w * 0.5, h * 0.32, 4, w * 0.5, h * 0.55, w * 0.9);
    g.addColorStop(0, '#6B4A33'); g.addColorStop(1, '#181110');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#B0805A';
    c.fillRect(6, 5, w - 12, h - 27);
    c.fillStyle = '#F08A45';
    c.beginPath(); c.arc(w / 2 - 21, h - 12, 2.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(230,223,213,0.85)';
    c.fillRect(w / 2 - 15, h - 13.2, 36, 2.4);
    return;
  }

  if (key === 'soft'){
    const g = c.createRadialGradient(w * 0.45, h * 0.34, 4, w * 0.5, h * 0.5, w * 0.85);
    g.addColorStop(0, '#9C8568'); g.addColorStop(1, '#241D16');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.9)';
    c.fillRect(w * 0.23, 9, w * 0.54, h * 0.56);
    c.fillStyle = 'rgba(255,255,255,0.16)';
    c.fillRect(6, h - 24, w - 12, 16);
    c.strokeStyle = 'rgba(255,255,255,0.32)'; c.lineWidth = 1;
    c.strokeRect(6.5, h - 23.5, w - 13, 15);
    c.fillStyle = 'rgba(255,255,255,0.88)';
    c.fillRect(11, h - 19, 26, 2);
    c.fillStyle = 'rgba(255,255,255,0.5)';
    c.fillRect(11, h - 14, 16, 1.5);
    return;
  }
  const p = 9;
  const bottom = key === 'polaroid' ? 26 : (key === 'infobar' ? 0 : 0);
  const ph = h - p * 2 - (key === 'polaroid' ? 16 : 0);
  c.fillStyle = key === 'cinema' ? '#3A3A3C' : (key === 'infobar' ? '#6B6357' : '#CBBFAB');
  if (key === 'infobar'){
    const g = c.createLinearGradient(0, h * 0.5, 0, h);
    g.addColorStop(0, '#8E8271'); g.addColorStop(1, '#3B352C');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  } else {
    c.fillRect(p, p, w - p * 2, ph);
  }
  if (key === 'editorial'){
    c.fillStyle = t.fg; c.globalAlpha = .8; c.fillRect(p, h - 20, 34, 2.5); c.globalAlpha = 1;
  }
  c.fillStyle = key === 'cinema' || key === 'infobar' ? '#EDE7DB' : t.fg;
  c.globalAlpha = .55;
  if (key === 'polaroid'){ c.fillRect(w / 2 - 16, h - 13, 32, 2); }
  else if (key === 'white'){ c.fillRect(w / 2 - 14, h - 15, 28, 2); }
  else { c.fillRect(p, h - 14, 42, 2); c.fillRect(p, h - 9, 24, 2); }
  c.globalAlpha = 1;
}

/* 切换版式：套用该版式的默认配色/边距，并重置会串味的参数 */
function applyTemplate(k){
  const t = TEMPLATES[k];
  if (!t) return;
  const FB = {radius: 0.004, blurAmount: 0.07, blurDim: 0.95, blurSat: 1.12};
  const next = {template: k, bg: t.bg, fg: t.fg, accent: t.accent, padding: t.pad};
  ['radius', 'blurAmount', 'blurDim', 'blurSat'].forEach(key => {
    next[key] = t[key] !== undefined ? t[key] : FB[key];
  });
  Object.assign(state.settings, next);
  syncUI();
  buildChips();
  scheduleRender();
}

function buildChips(){
  const wrap = $('tplGrid');
  wrap.innerHTML = '';
  Object.keys(TEMPLATES).forEach(k => {
    const b = document.createElement('button');
    b.className = 'tpl' + (state.settings.template === k ? ' on' : '');
    b.dataset.tpl = k;
    const cv = document.createElement('canvas');
    paintChip(cv, k);
    const label = document.createElement('b');
    label.textContent = TEMPLATES[k].name;
    b.appendChild(cv); b.appendChild(label);
    b.onclick = () => applyTemplate(k);
    wrap.appendChild(b);
  });
}

/* ---------- UI 同步 ---------- */
function syncUI(){
  const s = state.settings;
  $('ratio').value = s.ratio;
  $('outSize').value = String(s.outSize);
  $('jpgQuality').value = String(s.jpgQuality === undefined ? 0.95 : s.jpgQuality);
  $('format').value = s.format;
  $('padding').value = (s.padding * 100).toFixed(1);
  $('padVal').textContent = (s.padding * 100).toFixed(1) + '%';
  $('fontScale').value = (s.fontScale * 100).toFixed(1);
  $('fsVal').textContent = (s.fontScale * 100).toFixed(1) + '%';
  $('radius').value = (s.radius * 100).toFixed(1);
  $('radVal').textContent = (s.radius * 100).toFixed(1) + '%';
  $('shadow').checked = s.shadow;
  $('grain').checked = grainModeOf(s) !== 'off';
  $('bg').value = s.bg; $('bgTxt').textContent = s.bg.slice(1).toUpperCase();
  $('fg').value = s.fg; $('fgTxt').textContent = s.fg.slice(1).toUpperCase();
  $('accent').value = s.accent; $('acTxt').textContent = s.accent.slice(1).toUpperCase();
  $('title').value = s.title;
  $('author').value = s.author;
  $('infoTpl').value = s.infoTpl;

  $('blurAmount').value = (s.blurAmount * 100).toFixed(1);
  $('blurVal').textContent = (s.blurAmount * 100).toFixed(1) + '%';
  $('blurScale').value = Math.round(s.blurScale * 100);
  $('scaleVal').textContent = Math.round(s.blurScale * 100) + '%';
  $('blurDim').value = Math.round(s.blurDim * 100);
  $('dimVal').textContent = Math.round(s.blurDim * 100) + '%';
  $('subjectScale').value = Math.round(s.subjectScale * 100);
  $('subjVal').textContent = Math.round(s.subjectScale * 100) + '%';
  $('feather').value = Math.round(s.feather * 100);
  $('feathVal').textContent = Math.round(s.feather * 100) + '%';
  $('edgeShadow').value = Math.round((s.edgeShadow === undefined ? 0.6 : s.edgeShadow) * 100);
  $('eshVal').textContent = Math.round((s.edgeShadow === undefined ? 0.6 : s.edgeShadow) * 100) + '%';

  $('markText').value = s.markText;
  $('markSub').value = s.markSub;
  $('markBlur').value = (s.blurAmount * 100).toFixed(1);
  $('markBlurVal').textContent = (s.blurAmount * 100).toFixed(1) + '%';
  $('markDim').value = Math.round(s.blurDim * 100);
  $('markDimVal').textContent = Math.round(s.blurDim * 100) + '%';
  updateBlurGroup();
}

/* 只有「柔焦」版式才需要这组参数 */
function updateBlurGroup(){
  const t = state.settings.template;
  const bg = $('blurGroup');
  if (bg) bg.style.display = t === 'soft' ? '' : 'none';
  const mg = $('markGroup');
  if (mg) mg.style.display = (t === 'watermark' || t === 'soft') ? '' : 'none';
  // 底图模糊/亮度已在「边缘模糊」组里，柔焦下不重复展示
  const mbr = $('markBgRow');
  if (mbr) mbr.style.display = t === 'watermark' ? '' : 'none';
}

/* ---------- 导入 ---------- */
/* EXIF 的 APP1 段紧跟在 SOI 之后、最大 64KB，读前 256KB 足够定位。
   不再把整张图读进内存（20MB 的图只为 2KB 元数据）。 */
const EXIF_HEAD_BYTES = 256 * 1024;

function readExifFromFile(file){
  return new Promise(resolve => {
    const fr = new FileReader();
    fr.onload = () => resolve(parseExif(fr.result));
    fr.onerror = () => resolve(null);
    fr.readAsArrayBuffer(file.slice(0, Math.min(file.size, EXIF_HEAD_BYTES)));
  });
}

function loadImageEl(url){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('无法解码'));
    img.src = url;
  });
}

/** RAW：读全文件 → 解析 TIFF 里的 EXIF + 抽出内嵌 JPEG 预览 */
async function readRawFile(file){
  const buf = await file.arrayBuffer();
  let exif = null;
  try{ exif = parseExif(buf); }catch(e){}
  const jpeg = extractJpegPreview(buf);
  return {exif, jpeg};
}

async function loadPhoto(photo, file){
  if (isRawFile(file.name)){
    photo.raw = true;
    const r = await readRawFile(file);
    photo.exif = r.exif;
    if (!r.jpeg) throw new Error('RAW 无内嵌预览');
    const url = URL.createObjectURL(new Blob([r.jpeg], {type: 'image/jpeg'}));
    try{ photo.img = await loadImageEl(url); }
    finally{ URL.revokeObjectURL(url); }
    return;
  }
  photo.exif = await readExifFromFile(file);
  const url = URL.createObjectURL(file);
  try{ photo.img = await loadImageEl(url); }
  finally{ URL.revokeObjectURL(url); }
}

/* RAW 单张 30–60MB，十张并行读能把内存吃穿，所以串行排队 */
const rawQueue = {tail: Promise.resolve()};
function queueRaw(task){
  const p = rawQueue.tail.then(task, task);
  rawQueue.tail = p.then(() => {}, () => {});
  return p;
}

function addFiles(files){
  const list = [...files].filter(f => /^image\\//.test(f.type) || isRawFile(f.name));
  if (!list.length){ toast('没有可用的图片或 RAW 文件'); return; }
  let pending = list.length, bad = 0;
  const finish = () => {
    if (--pending > 0) return;
    renderGrid();
    if (bad) toast(bad + ' 张无法处理，已自动跳过');
  };

  list.forEach(file => {
    const id = ++uid;
    const photo = {id, file, name: file.name, exif: null, img: null, caption: '',
                   include: true, ready: false, error: null, raw: false};
    state.photos.push(photo);

    const job = isRawFile(file.name)
      ? queueRaw(() => loadPhoto(photo, file))
      : loadPhoto(photo, file);

    job.then(() => { photo.ready = true; finish(); })
      .catch(err => {
        // 失败：标红并自动取消勾选，避免「显示 5 张、只导出 4 张」
        const msg = (err && err.message) || '';
        const ext = (file.name.split('.').pop() || '').toUpperCase();
        photo.error = msg === 'RAW 无内嵌预览'
          ? 'RAW 无内嵌预览'
          : '无法解码 · ' + (ext || '未知格式');
        photo.include = false;
        bad++;
        finish();
      });
  });
  renderGrid();
}

/* ---------- 卡片 ---------- */
function renderGrid(){
  const grid = $('grid');
  const empty = $('empty');
  empty.style.display = state.photos.length ? 'none' : 'flex';
  $('count').textContent = state.photos.length + ' 张照片';
  $('clearBtn').disabled = state.photos.length === 0;
  $('clearBtn2').disabled = state.photos.length === 0;
  refreshExportBtn();

  grid.innerHTML = '';
  state.photos.forEach(photo => {
    const card = document.createElement('div');
    card.className = 'card' + (photo.include ? '' : ' off');
    card.dataset.id = photo.id;

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    const cv = document.createElement('canvas');
    if (photo.error){
      thumb.classList.add('err');
      const msg = document.createElement('div');
      msg.className = 'errmsg';
      msg.textContent = photo.error;
      thumb.appendChild(msg);
    } else {
      thumb.appendChild(cv);
    }

    const pick = document.createElement('label');
    pick.className = 'pick';
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = photo.include;
    cb.onchange = () => {
      photo.include = cb.checked;
      card.classList.toggle('off', !cb.checked);
      refreshExportBtn();
    };
    pick.appendChild(cb);

    const meta = document.createElement('div');
    meta.className = 'meta';
    const fn = document.createElement('div');
    fn.className = 'fname';
    const nm = document.createElement('span');
    nm.className = 'nm'; nm.textContent = photo.name;
    fn.appendChild(nm);
    if (photo.raw){
      const tag = document.createElement('span');
      tag.className = 'rawtag';
      tag.textContent = 'RAW';
      fn.appendChild(tag);
    }
    const ex = document.createElement('div');
    ex.className = 'exif';
    ex.textContent = exifSummary(photo);
    const cap = document.createElement('input');
    cap.className = 'cap'; cap.type = 'text';
    cap.placeholder = '此图标题（留空用全局标题）';
    cap.value = photo.caption;
    cap.oninput = () => { photo.caption = cap.value; scheduleRender(); };

    meta.appendChild(fn); meta.appendChild(ex); meta.appendChild(cap);
    const del = document.createElement('button');
    del.className = 'del';
    del.textContent = '×';
    del.title = '移除这张';
    del.onclick = e => { e.stopPropagation(); removePhoto(photo.id); };
    card.appendChild(thumb); card.appendChild(pick); card.appendChild(del); card.appendChild(meta);
    grid.appendChild(card);

    photo._canvas = cv;
    photo._card = card;
    if (photo.ready) drawThumb(photo, previewSize());
  });
}

/* ---------- 删除 ---------- */
function removePhoto(id){
  const i = state.photos.findIndex(p => p.id === id);
  if (i < 0) return false;
  state.photos.splice(i, 1);
  renderGrid();
  return true;
}

function clearAll(){
  const n = state.photos.length;
  if (!n) return;
  if (!confirm('清空全部 ' + n + ' 张照片？\\n样式参数会保留。')) return;
  state.photos.length = 0;
  renderGrid();
  closeLightbox();
  toast('已清空 ' + n + ' 张');
}

function exifSummary(p){
  if (p.error) return p.error;
  const e = p.exif;
  const bits = [];
  // 机身和预览尺寸排在最前：EXIF 行会省略号截断，这两项最不能丢
  if (e && (e.make || e.model)) bits.push(cleanCamera(e.make, e.model));
  if (p.raw && p.img) bits.push('预览 ' + p.img.naturalWidth + '×' + p.img.naturalHeight);
  if (e){
    if (e.focal) bits.push(e.focal);
    if (e.fnum) bits.push(e.fnum);
    if (e.shutter) bits.push(e.shutter);
    if (e.iso) bits.push('ISO' + e.iso);
    if (e.date) bits.push(e.date);
  }
  if (bits.length) return bits.join(' · ');
  return p.raw ? 'RAW · 无 EXIF' : '无 EXIF 信息';
}

function drawThumb(photo, size){
  if (!photo.img || !photo._canvas) return;
  const cv = renderFrame(photo, state.settings, size || previewSize());
  const target = photo._canvas;
  // 用真实比例锁死 CSS 盒子，避免画布尺寸变化引起整页重排（拖动时"抖动"）
  const iw = photo.img.naturalWidth || photo.img.width;
  const ih = photo.img.naturalHeight || photo.img.height;
  const ar = state.settings.ratio === 'orig' ? iw / ih : parseFloat(state.settings.ratio);
  const arStr = String(Math.round(ar * 10000) / 10000);
  if (target.style.aspectRatio !== arStr) target.style.aspectRatio = arStr;
  target.width = cv.width;
  target.height = cv.height;
  target.getContext('2d').drawImage(cv, 0, 0);
}

/* 预览按屏幕实际像素渲染，拖动与停手用同一尺寸，避免"先糊后清"的跳变 */
function previewSize(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const card = document.querySelector('.card .thumb');
  const w = card ? card.clientWidth : 300;
  return Math.max(360, Math.min(1100, Math.round(w * dpr)));
}

function nearViewport(el){
  if (!el) return true;
  const main = $('main');
  const top = main.scrollTop - 400;
  const bottom = main.scrollTop + main.clientHeight + 400;
  return el.offsetTop < bottom && el.offsetTop + el.offsetHeight > top;
}

function renderPass(onlyVisible){
  const size = previewSize();
  state.photos.forEach(p => {
    if (!p.ready) return;
    if (onlyVisible && !nearViewport(p._card)) return;
    drawThumb(p, size);
  });
}

let renderRaf = null, hiTimer = null;
function scheduleRender(){
  if (renderRaf) cancelAnimationFrame(renderRaf);
  renderRaf = requestAnimationFrame(() => {
    renderRaf = null;
    renderPass(true);              // 拖动时只重绘可视区域
  });
  clearTimeout(hiTimer);
  hiTimer = setTimeout(() => renderPass(false), 240);   // 停手后补齐其余
}

/* ---------- 导出 ---------- */

/**
 * 触发浏览器下载，返回 blob URL（由调用方负责 revoke）。
 *
 * 关键：a 必须挂进 DOM 再 click。游离节点上点 click() 在 Safari、部分内嵌
 * webview、以及沙箱 iframe 里不会下载，而且不抛异常——表现就是「提示导出
 * 成功，但哪儿都找不到文件」。挂进 DOM 是成本最低、覆盖面最广的修法。
 */
function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return url;
}

function canvasToBytes(cv, format, quality){
  return new Promise((resolve, reject) => {
    try{
      cv.toBlob(blob => {
        if (!blob){ reject(new Error('画布过大，浏览器无法编码')); return; }
        blob.arrayBuffer().then(b => resolve(new Uint8Array(b))).catch(reject);
      }, format === 'png' ? 'image/png' : 'image/jpeg', quality);
    }catch(e){ reject(e); }
  });
}

/** 按钮文字按当前勾选数复原，异常中断也不会卡在「处理中」 */
function refreshExportBtn(){
  const btn = $('exportBtn');
  const n = state.photos.filter(p => p.include).length;
  btn.disabled = n === 0;
  btn.textContent = n ? '导出 ' + n + ' 张' : '导出全部';
}

async function exportAll(){
  const list = state.photos.filter(p => p.include && p.ready);
  if (!list.length) return;
  const btn = $('exportBtn');
  btn.disabled = true;
  const s = state.settings;
  const entries = [];
  const failed = [];
  const used = new Map();
  const ext = s.format === 'png' ? 'png' : 'jpg';

  try{
    for (let i = 0; i < list.length; i++){
      btn.textContent = '处理中 ' + (i + 1) + '/' + list.length;
      await new Promise(r => setTimeout(r, 0));          // 让出主线程，按钮文字能刷新
      let cv = null;
      try{
        const srcLong = Math.max(list[i].img.naturalWidth || 0, list[i].img.naturalHeight || 0);
        const edge = s.outSize > 0 ? s.outSize : Math.min(srcLong || 2000, 12000);
        cv = renderFrame(list[i], s, edge);
        const data = await canvasToBytes(cv, s.format, s.jpgQuality === undefined ? 0.95 : s.jpgQuality);
        const base = list[i].name.replace(/\\.[^.]+$/, '');
        const k = base + '.' + ext;
        const n = (used.get(k) || 0) + 1;
        used.set(k, n);
        const fname = (n === 1 ? base + '_framed.' : base + '_framed_' + n + '.') + ext;
        entries.push({name: fname, data});
      }catch(err){
        failed.push(list[i].name);
      }finally{
        // 及时释放大画布，几十张原始尺寸导出时能显著降低内存峰值
        if (cv){ cv.width = 0; cv.height = 0; }
      }
    }

    if (!entries.length){
      toast('导出失败：' + (failed[0] || '没有可处理的照片'));
      return;
    }

    const blob = buildZip(entries);
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fname = '光影相框_' + stamp + '.zip';
    // URL 交给 toast 持有，提示消失时才释放，中途可以手动点
    const url = downloadBlob(blob, fname);

    toast('已导出 ' + entries.length + ' 张 · ' + (blob.size / 1048576).toFixed(1) + ' MB'
          + (failed.length ? ' · ' + failed.length + ' 张失败' : ''),
          { action: { url, filename: fname } });
  }catch(err){
    toast('导出中断：' + ((err && err.message) || '未知错误'));
  }finally{
    refreshExportBtn();
  }
}

/* ---------- 大图预览 ---------- */
let lbIndex = -1;

function lbList(){ return state.photos.filter(p => p.ready); }

function openLightbox(photo){
  const i = lbList().findIndex(p => p.id === photo.id);
  if (i < 0) return;
  lbIndex = i;
  drawLightbox();
  $('lb').classList.add('on');
}

function drawLightbox(){
  const list = lbList();
  if (!list.length){ closeLightbox(); return; }
  lbIndex = (lbIndex + list.length) % list.length;
  const cv = renderFrame(list[lbIndex], state.settings, 1400);
  const lb = $('lbCanvas');
  lb.width = cv.width; lb.height = cv.height;
  lb.getContext('2d').drawImage(cv, 0, 0);
  $('lbInfo').textContent = (lbIndex + 1) + ' / ' + list.length;
  $('lbPrev').disabled = $('lbNext').disabled = list.length < 2;
}

function stepLightbox(d){
  if (lbIndex < 0) return;
  lbIndex += d;
  drawLightbox();
}

function closeLightbox(){
  lbIndex = -1;
  $('lb').classList.remove('on');
}

function deleteInLightbox(){
  const p = lbList()[lbIndex];
  if (!p) return;
  removePhoto(p.id);
  if (!lbList().length) closeLightbox();
  else drawLightbox();
}

/** 只导出当前大图这一张，不进 zip */
async function exportOne(photo){
  const btn = $('lbExport');
  const label = btn.textContent;
  btn.disabled = true; btn.textContent = '处理中…';
  let cv = null;
  try{
    const s = state.settings;
    const srcLong = Math.max(photo.img.naturalWidth || 0, photo.img.naturalHeight || 0);
    const edge = s.outSize > 0 ? s.outSize : Math.min(srcLong || 2000, 12000);
    cv = renderFrame(photo, s, edge);
    const data = await canvasToBytes(cv, s.format, s.jpgQuality === undefined ? 0.95 : s.jpgQuality);
    const ext = s.format === 'png' ? 'png' : 'jpg';
    const name = photo.name.replace(/\\.[^.]+$/, '') + '_framed.' + ext;
    const blob = new Blob([data], {type: s.format === 'png' ? 'image/png' : 'image/jpeg'});
    const url = downloadBlob(blob, name);
    toast('已导出 ' + name + ' · ' + (blob.size / 1048576).toFixed(1) + ' MB',
          { action: { url, filename: name } });
  }catch(err){
    toast('导出失败：' + ((err && err.message) || '未知错误'));
  }finally{
    if (cv){ cv.width = 0; cv.height = 0; }
    btn.disabled = false; btn.textContent = label;
  }
}

/* ---------- 参数导入 / 导出 ---------- */
const SETTING_RANGES = {
  padding:[0.01,0.14], fontScale:[0.01,0.04], radius:[0,0.03],
  blurAmount:[0.01,0.24], blurScale:[1,1.8], blurDim:[0.3,1.15], blurSat:[0.5,2],
  subjectScale:[0.55,0.96], feather:[0,0.25], edgeShadow:[0,1]
};
const SETTING_ENUMS = {
  template:Object.keys(TEMPLATES),
  ratio:['orig','1','0.8','1.5','1.7778','0.75'],
  format:['jpg','png'],
  grainMode:['off','subject'],
  outSize:[0,1080,1600,2000,3000,4000],
  jpgQuality:[0.9,0.95,0.99]
};

/** 只接受已知 key、类型一致、枚举合法、数值在范围内的项 */
function sanitizeSettings(obj){
  // 旧的「全图 / 主体以外」颗粒模式已移除，旧预设和旧 JSON 统一收敛到主体颗粒
  if (obj.grainMode === 'all' || obj.grainMode === 'edge') obj.grainMode = 'subject';
  if (obj.grainMode === undefined && typeof obj.grain === 'boolean'){
    obj.grainMode = obj.grain ? 'subject' : 'off';
  }

  const s = state.settings;
  let n = 0;
  for (const k of Object.keys(s)){
    if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
    const v = obj[k];
    if (typeof v !== typeof s[k]) continue;
    if (SETTING_ENUMS[k] && SETTING_ENUMS[k].indexOf(v) < 0) continue;
    if (SETTING_RANGES[k]){
      if (typeof v !== 'number' || !isFinite(v)) continue;
      s[k] = Math.min(SETTING_RANGES[k][1], Math.max(SETTING_RANGES[k][0], v));
    } else {
      s[k] = v;
    }
    n++;
  }
  return n;
}

function applySettings(obj){
  const n = sanitizeSettings(obj);
  syncUI();
  buildChips();
  scheduleRender();
  return n;
}

function exportSettings(){
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const blob = new Blob([JSON.stringify(state.settings, null, 2)], {type: 'application/json'});
  const fname = '光影相框_样式_' + stamp + '.json';
  const url = downloadBlob(blob, fname);
  toast('参数已导出', { action: { url, filename: fname } });
}

function importSettings(file){
  const fr = new FileReader();
  fr.onload = () => {
    let obj;
    try{ obj = JSON.parse(fr.result); }
    catch(e){ toast('导入失败：不是有效的 JSON'); return; }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)){ toast('导入失败：文件内容不对'); return; }
    const n = applySettings(obj);
    toast(n ? '已导入 ' + n + ' 项参数' : '导入失败：没有可识别的参数');
  };
  fr.onerror = () => toast('读取文件失败');
  fr.readAsText(file);
}

/* ---------- 侧栏抽屉（平板 / 手机） ---------- */
function setPanel(open){
  document.body.classList.toggle('panel-open', !!open);
}
function panelOpen(){
  return document.body.classList.contains('panel-open');
}

/* ---------- 交互绑定 ---------- */
function bind(){
  $('addBtn').onclick = () => $('file').click();
  $('file').onchange = e => { addFiles(e.target.files); e.target.value = ''; };

  // 全窗口接收拖放：拖到左侧参数栏、顶部栏也不会丢文件
  let dragDepth = 0;
  const hasFiles = e => !!(e.dataTransfer && e.dataTransfer.types && [...e.dataTransfer.types].includes('Files'));
  window.addEventListener('dragenter', e => {
    e.preventDefault();
    if (!hasFiles(e)) return;
    dragDepth++;
    document.body.classList.add('dragover');
  });
  window.addEventListener('dragover', e => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = hasFiles(e) ? 'copy' : 'none';
  });
  window.addEventListener('dragleave', e => {
    e.preventDefault();
    if (!dragDepth) return;
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) document.body.classList.remove('dragover');
  });
  window.addEventListener('drop', e => {
    e.preventDefault();
    dragDepth = 0;
    document.body.classList.remove('dragover');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length){
      addFiles(e.dataTransfer.files);
    }
  });

  $('ratio').onchange = e => { state.settings.ratio = e.target.value; scheduleRender(); };
  $('outSize').onchange = e => { state.settings.outSize = +e.target.value; };
  $('jpgQuality').onchange = e => { state.settings.jpgQuality = +e.target.value; };
  $('format').onchange = e => { state.settings.format = e.target.value; };

  const slider = (id, key, scale, suffix, valId, dec) => {
    const el = $(id);
    if (!el) return;
    const digits = dec === undefined ? 1 : dec;
    el.oninput = e => {
      state.settings[key] = +e.target.value / scale;
      const lbl = $(valId);
      if (lbl) lbl.textContent = (+e.target.value).toFixed(digits) + suffix;
      scheduleRender();
    };
  };
  slider('padding', 'padding', 100, '%', 'padVal');
  slider('fontScale', 'fontScale', 100, '%', 'fsVal');
  slider('radius', 'radius', 100, '%', 'radVal');
  /* 柔焦参数 */
  slider('blurAmount', 'blurAmount', 100, '%', 'blurVal', 1);
  slider('blurScale', 'blurScale', 100, '%', 'scaleVal', 0);
  slider('blurDim', 'blurDim', 100, '%', 'dimVal', 0);
  slider('subjectScale', 'subjectScale', 100, '%', 'subjVal', 0);
  slider('feather', 'feather', 100, '%', 'feathVal', 0);
  slider('edgeShadow', 'edgeShadow', 100, '%', 'eshVal', 0);
  /* 底部文字参数 */
  slider('markBlur', 'blurAmount', 100, '%', 'markBlurVal', 1);
  slider('markDim', 'blurDim', 100, '%', 'markDimVal', 0);
  const markChips = $('markChips');
  if (markChips){
    let markTarget = $('markText');
    ['markText', 'markSub'].forEach(id => {
      const el = $(id);
      if (el) el.addEventListener('focus', () => { markTarget = el; });
    });
    ['{camera}', '{params}', '{lens}', '{date}', '{iso}', '{filename}'].forEach(tk => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.textContent = tk;
      b.onclick = () => {
        const el = markTarget || $('markText');
        const pos = el.selectionStart === null || el.selectionStart === undefined ? el.value.length : el.selectionStart;
        el.value = el.value.slice(0, pos) + tk + el.value.slice(pos);
        el.focus();
        el.selectionStart = el.selectionEnd = pos + tk.length;
        state.settings[el.id] = el.value;
        scheduleRender();
      };
      markChips.appendChild(b);
    });
  }

  $('markText').oninput = e => { state.settings.markText = e.target.value; scheduleRender(); };
  $('markSub').oninput = e => { state.settings.markSub = e.target.value; scheduleRender(); };


  $('shadow').onchange = e => { state.settings.shadow = e.target.checked; scheduleRender(); };
  $('grain').onchange = e => { state.settings.grainMode = e.target.checked ? 'subject' : 'off'; scheduleRender(); };

  const colorBind = (id, txt, key) => {
    $(id).oninput = e => {
      state.settings[key] = e.target.value;
      $(txt).textContent = e.target.value.slice(1).toUpperCase();
      scheduleRender();
    };
  };
  colorBind('bg', 'bgTxt', 'bg');
  colorBind('fg', 'fgTxt', 'fg');
  colorBind('accent', 'acTxt', 'accent');

  const bgPresets = ['#F3EDE2','#FFFFFF','#F7F3EB','#E9E3D8','#0C0C0D','#1F2A24','#2B2B33','#D9C7B0'];
  const fgPresets = ['#1B1714','#3A3631','#6B6257','#B4622D','#E9E5DD','#F7F3EB'];
  const mkSw = (wrapId, list, key, txt) => {
    const w = $(wrapId); w.innerHTML = '';
    list.forEach(col => {
      const b = document.createElement('button');
      b.className = 'sw'; b.style.background = col; b.title = col;
      b.onclick = () => {
        state.settings[key] = col;
        $(key === 'bg' ? 'bg' : key === 'fg' ? 'fg' : 'accent').value = col;
        $(txt).textContent = col.slice(1).toUpperCase();
        scheduleRender();
      };
      w.appendChild(b);
    });
  };
  mkSw('bgSw', bgPresets, 'bg', 'bgTxt');
  mkSw('fgSw', fgPresets, 'fg', 'fgTxt');

  $('title').oninput = e => { state.settings.title = e.target.value; scheduleRender(); };
  $('author').oninput = e => { state.settings.author = e.target.value; scheduleRender(); };
  $('infoTpl').oninput = e => { state.settings.infoTpl = e.target.value; scheduleRender(); };

  const tokens = ['{params}','{camera}','{lens}','{date}','{iso}','{focal}','{aperture}','{shutter}','{size}','{filename}'];
  const cw = $('tokenChips');
  tokens.forEach(t => {
    const b = document.createElement('button');
    b.className = 'chip'; b.textContent = t;
    b.onclick = () => {
      const ta = $('infoTpl');
      const pos = ta.selectionStart ?? ta.value.length;
      ta.value = ta.value.slice(0, pos) + t + ta.value.slice(pos);
      ta.focus(); ta.selectionStart = ta.selectionEnd = pos + t.length;
      state.settings.infoTpl = ta.value;
      scheduleRender();
    };
    cw.appendChild(b);
  });

  $('exportBtn').onclick = exportAll;
  $('clearBtn').onclick = clearAll;
  $('clearBtn2').onclick = clearAll;
  $('panelBtn').onclick = () => setPanel(!panelOpen());
  $('panelClose').onclick = () => setPanel(false);
  $('scrim').onclick = () => setPanel(false);
  $('savePreset').onclick = savePreset;
  $('resetPreset').onclick = () => {
    localStorage.removeItem(PRESET_KEY);
    location.reload();
  };
  $('exportPreset').onclick = exportSettings;
  $('importPreset').onclick = () => $('presetFile').click();
  $('presetFile').onchange = e => {
    const f = e.target.files && e.target.files[0];
    if (f) importSettings(f);
    e.target.value = '';
  };

  // 大图预览
  $('grid').addEventListener('click', e => {
    const thumb = e.target.closest('.thumb');
    if (!thumb) return;
    const id = +thumb.closest('.card').dataset.id;
    const p = state.photos.find(x => x.id === id);
    if (p) openLightbox(p);
  });
  $('lb').onclick = e => { if (e.target.id === 'lb' || e.target.id === 'lbClose') closeLightbox(); };
  $('lbPrev').onclick = () => stepLightbox(-1);
  $('lbNext').onclick = () => stepLightbox(1);
  $('lbDel').onclick = deleteInLightbox;
  $('lbExport').onclick = () => {
    const p = lbList()[lbIndex];
    if (p) exportOne(p);
  };

  document.addEventListener('keydown', onKeyDown);
}

function onKeyDown(e){
  const el = e.target;
  const tag = (el.tagName || '').toLowerCase();
  const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
  const mod = e.metaKey || e.ctrlKey;
  const key = String(e.key || '').toLowerCase();

  if (e.key === 'Escape'){
    if (lbIndex >= 0){ e.preventDefault(); closeLightbox(); }
    else if (panelOpen()){ e.preventDefault(); setPanel(false); }
    return;
  }
  if (mod && key === 'o'){ e.preventDefault(); $('file').click(); return; }
  if (mod && key === 'e'){ e.preventDefault(); if (!$('exportBtn').disabled) exportAll(); return; }
  if (mod && key === 's'){ e.preventDefault(); savePreset(); return; }
  if (typing || mod || e.altKey) return;

  // 大图打开时：翻页 / 删除
  if (lbIndex >= 0){
    if (e.key === 'ArrowLeft'){ e.preventDefault(); stepLightbox(-1); }
    else if (e.key === 'ArrowRight'){ e.preventDefault(); stepLightbox(1); }
    else if (e.key === 'Delete' || e.key === 'Backspace'){ e.preventDefault(); deleteInLightbox(); }
    return;
  }

  const keys = Object.keys(TEMPLATES);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
    e.preventDefault();
    const i = keys.indexOf(state.settings.template);
    const d = e.key === 'ArrowRight' ? 1 : -1;
    applyTemplate(keys[(i + d + keys.length) % keys.length]);
    return;
  }
  if (/^[1-8]$/.test(e.key)){
    const k = keys[+e.key - 1];
    if (k){ e.preventDefault(); applyTemplate(k); }
  }
}

let toastTimer = null;
let toastUrl = null;

/**
 * 显示提示。opts.action = {url, filename} 时会在提示里挂一个真实可点的下载链接。
 *
 * 为什么要留这个链接：程序化 a.click() 被浏览器拦掉时不会抛异常，只会静默失败，
 * 用户看到「已导出」却找不到文件。挂一个能点的兜底，任何环境下都有退路。
 */
function toast(msg, opts){
  const t = $('toast');
  const act = opts && opts.action;

  clearTimeout(toastTimer);
  if (toastUrl){ URL.revokeObjectURL(toastUrl); toastUrl = null; }

  t.textContent = msg;
  t.classList.remove('has-act');

  if (act && act.url){
    toastUrl = act.url;
    const a = document.createElement('a');
    a.className = 'toast-act';
    a.href = act.url;
    a.download = act.filename || '';
    a.textContent = '手动保存';
    t.appendChild(document.createTextNode(' '));
    t.appendChild(a);
    t.classList.add('has-act');
  }

  t.classList.add('on');
  toastTimer = setTimeout(() => {
    t.classList.remove('on');
    t.classList.remove('has-act');
    // 等淡出动画走完再释放，否则用户正好在点会失效
    setTimeout(() => {
      if (toastUrl){ URL.revokeObjectURL(toastUrl); toastUrl = null; }
    }, 320);
  }, act ? 12000 : 2400);
}

/* ---------- 预设 ---------- */
const PRESET_KEY = 'guangying_frame_preset_v1';
function savePreset(){
  try{
    localStorage.setItem(PRESET_KEY, JSON.stringify(state.settings));
    toast('当前样式已保存');
  }catch(e){ toast('保存失败：浏览器禁用了本地存储'); }
}
function loadPreset(){
  try{
    const raw = localStorage.getItem(PRESET_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw);
    sanitizeSettings(obj);
  }catch(e){}
}

/* ---------- 启动 ---------- */
loadPreset();
buildChips();
syncUI();
bind();
</script>
</body>
</html>
`;

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
