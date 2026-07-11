/* 模块：一次函数 —— 输入→输出的规律机器 */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;

  /* 坐标系绘制工具 */
  function drawAxes(ctx, W, H, T, o) {
    const { x0, y0, ux, uy, xmin, xmax, ymin, ymax, xlab, ylab } = o;
    ctx.strokeStyle = T.grid; ctx.lineWidth = 1;
    ctx.font = "10.5px system-ui"; ctx.fillStyle = T.muted;
    for (let x = Math.ceil(xmin); x <= xmax; x += o.xstep || 1) {
      const px = x0 + x * ux;
      ctx.beginPath(); ctx.moveTo(px, y0 - ymax * uy); ctx.lineTo(px, y0 - ymin * uy); ctx.stroke();
      if (x !== 0) { ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(String(x), px, y0 + 4); }
    }
    for (let y = Math.ceil(ymin); y <= ymax; y += o.ystep || 1) {
      const py = y0 - y * uy;
      ctx.beginPath(); ctx.moveTo(x0 + xmin * ux, py); ctx.lineTo(x0 + xmax * ux, py); ctx.stroke();
      if (y !== 0) { ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillText(String(y), x0 - 5, py); }
    }
    ctx.strokeStyle = T.baseline; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x0 + xmin * ux, y0); ctx.lineTo(x0 + xmax * ux, y0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0, y0 - ymin * uy); ctx.lineTo(x0, y0 - ymax * uy); ctx.stroke();
    ctx.fillStyle = T.muted; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
    ctx.fillText(xlab || "x", x0 + xmax * ux - 12, y0 - 5);
    ctx.fillText(ylab || "y", x0 + 5, y0 - ymax * uy + 12);
  }

  /* 实验一：k 和 b 各管什么 */
  function mountLine(box) {
    const state = { k: 1, b: 2, x: 2 };
    const canvas = makeCanvas(box, { aspect: 0.58 });
    const readout = el("div", { class: "readout" });
    const upd = () => { canvas.redraw(); update(); };
    const sk = slider({ label: "k（斜率）=", min: -3, max: 3, step: 0.5, value: 1, oninput: v => { state.k = v; upd(); } });
    const sb = slider({ label: "b（截距）=", min: -5, max: 5, step: 1, value: 2, oninput: v => { state.b = v; upd(); } });
    const sx = slider({ label: "输入 x =", min: -6, max: 6, step: 1, value: 2, oninput: v => { state.x = v; upd(); } });
    box.appendChild(ctrlRow(sk, sb, sx));
    box.appendChild(readout);
    function update() {
      const { k, b, x } = state;
      const y = k * x + b;
      readout.innerHTML = `机器规则：y = ${fmt(k)}x ${b >= 0 ? "+ " + b : "− " + (-b)}　输入 <b>${x}</b> → 输出 <b>${fmt(y)}</b>。` +
        `　k 的含义：x 每 +1，y 就 ${k >= 0 ? "+" : ""}${fmt(k)}（变化的速度）；b 的含义：x = 0 时的起点。`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const x0 = W / 2, y0 = H / 2, ux = (W - 70) / 14, uy = (H - 40) / 14;
      drawAxes(ctx, W, H, T, { x0, y0, ux, uy, xmin: -7, xmax: 7, ymin: -6.6, ymax: 6.6, xstep: 2, ystep: 2 });
      const { k, b, x } = state;
      const X = (v) => x0 + v * ux, Y = (v) => y0 - v * uy;
      // 直线
      ctx.strokeStyle = T.mod; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(X(-7), Y(k * -7 + b)); ctx.lineTo(X(7), Y(k * 7 + b)); ctx.stroke();
      // b：y 轴截距
      ctx.fillStyle = T.c8;
      ctx.beginPath(); ctx.arc(X(0), Y(b), 5, 0, Math.PI * 2); ctx.fill();
      ctx.font = "600 12px system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(`起点 b = ${b}`, X(0) + 9, Y(b));
      // k：斜坡三角形（从 x=1 到 x=2）
      const x1 = 1;
      ctx.strokeStyle = T.c2; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(X(x1), Y(k * x1 + b)); ctx.lineTo(X(x1 + 1), Y(k * x1 + b)); ctx.lineTo(X(x1 + 1), Y(k * (x1 + 1) + b));
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = T.c2; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("横走 1", X(x1 + 0.5), Y(k * x1 + b) + 4);
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(`竖变 ${fmt(k)}`, X(x1 + 1) + 6, Y(k * (x1 + 0.5) + b));
      // 输入输出点
      const y = k * x + b;
      ctx.setLineDash([3, 3]); ctx.strokeStyle = T.muted; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(x), Y(0)); ctx.lineTo(X(x), Y(y)); ctx.lineTo(X(0), Y(y)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = T.ink;
      ctx.beginPath(); ctx.arc(X(x), Y(y), 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = T.surface; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(X(x), Y(y), 5.5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = T.ink; ctx.font = "600 12px system-ui"; ctx.textAlign = "left";
      ctx.fillText(`(${x}, ${fmt(y)})`, X(x) + 9, Y(y) - 10);
    });
  }

  /* 实验二：哪个套餐划算？ */
  function mountPlans(box) {
    const state = { x: 8 };
    const canvas = makeCanvas(box, { aspect: 0.56 });
    const readout = el("div", { class: "readout" });
    const sx = slider({ label: "每月用量 x =", min: 0, max: 30, step: 1, value: 8, format: v => v + " GB", oninput: v => { state.x = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(sx));
    box.appendChild(readout);
    const A = (x) => 30 + 3 * x, B = (x) => 5 * x;
    function update() {
      const { x } = state;
      const a = A(x), b = B(x);
      const verdict = a === b ? "两个一样贵！这就是交点。" : a < b ? "选 <b>A 套餐</b> 便宜" : "选 <b>B 套餐</b> 便宜";
      readout.innerHTML = `A 套餐（月费30 + 每GB 3元）：<b>${a} 元</b>　B 套餐（无月费，每GB 5元）：<b>${b} 元</b> → ${verdict}`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const x0 = 46, y0 = H - 30, ux = (W - 70) / 30, uy = (H - 50) / 150;
      drawAxes(ctx, W, H, T, { x0, y0, ux, uy, xmin: 0, xmax: 30, ymin: 0, ymax: 150, xstep: 5, ystep: 30, xlab: "GB", ylab: "元" });
      const X = (v) => x0 + v * ux, Y = (v) => y0 - v * uy;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = T.c1;
      ctx.beginPath(); ctx.moveTo(X(0), Y(A(0))); ctx.lineTo(X(30), Y(A(30))); ctx.stroke();
      ctx.strokeStyle = T.c8;
      ctx.beginPath(); ctx.moveTo(X(0), Y(B(0))); ctx.lineTo(X(30), Y(B(30))); ctx.stroke();
      ctx.font = "600 12px system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = T.c1; ctx.fillText("A：y = 30 + 3x", X(23.6), Y(A(23.6)) + 18);
      ctx.fillStyle = T.c8; ctx.fillText("B：y = 5x", X(12), Y(B(12)) - 14);
      // 交点 (15, 75)
      ctx.fillStyle = T.c6;
      ctx.beginPath(); ctx.arc(X(15), Y(75), 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = T.c6; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText("交点 (15, 75)：临界点", X(15), Y(75) - 8);
      // 当前用量
      const { x } = state;
      ctx.setLineDash([3, 3]); ctx.strokeStyle = T.muted; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(x), Y(0)); ctx.lineTo(X(x), Y(Math.max(A(x), B(x)))); ctx.stroke();
      ctx.setLineDash([]);
      for (const [f, c] of [[A, T.c1], [B, T.c8]]) {
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(X(x), Y(f(x)), 4.5, 0, Math.PI * 2); ctx.fill();
      }
    });
  }

  MathLab.register({
    id: "functions",
    title: "一次函数：变化的机器",
    question: "世界在变，但很多变化有规律。函数就是把规律写下来的方式。",
    grade: "八年级",
    domain: "数与代数",
    emoji: "⚙️",
    color: "c8",
    hook: `<p>出租车起步价 10 元，之后每公里 2 元。坐 5 公里多少钱？坐 x 公里呢？</p>
      <div class="formula">车费 = 10 + 2 × 公里数，也就是 y = 2x + 10</div>
      <p>手机套餐、打车费、水电费、跑步的路程……这些问题长得完全不同，
      骨架却<b>一模一样</b>：一个量匀速地跟着另一个量变。数学家把这副骨架抽出来，起名叫<b>一次函数</b>。
      学会它一次，就同时学会了所有这些问题。</p>`,
    sections: [
      {
        kind: "concept", title: "函数 = 输入 → 唯一输出的机器",
        html: `<p>函数的本质是一台<b>规则机器</b>：投进一个数（输入 x），按固定规则加工，吐出一个数（输出 y）。
        关键要求只有一个：<b>同样的输入必须得到同样的输出</b>——机器不能有情绪。</p>
        <p>而<b>图像</b>是这台机器的"全景照片"：把每一对（输入, 输出）画成一个点，所有点连成的形状。
        一眼看图，机器的脾气一目了然。</p>
        <p>一次函数 y = kx + b 只有两个零件：</p>
        <ul>
          <li><b>k（斜率）= 变化的速度</b>：x 每增加 1，y 变化多少。k 越大坡越陡；k 是负数就下坡。</li>
          <li><b>b（截距）= 出发点</b>：x = 0 时 y 的值，比如出租车的"起步价"。</li>
        </ul>`,
      },
      { kind: "lab", title: "拧动 k 和 b", mount: mountLine,
        intro: `<p>拖 k、拖 b，看直线怎么动；再拖"输入 x"，看机器怎么把输入变成输出（虚线就是机器的加工路径）。</p>`,
        try_: `把 k 调成 0，直线变成了什么？此时"机器"还在乎输入吗？再把 k 调成负数，故事变成了什么（比如：蜡烛燃烧？水池放水？）` },
      { kind: "lab", title: "哪个套餐划算？", mount: mountPlans,
        intro: `<p>A 套餐：月费 30 元 + 每 GB 3 元；B 套餐：无月费，每 GB 5 元。两条直线，一个交点。</p>`,
        try_: `拖动用量，找到"换答案"的那个点。交点意味着什么？为什么用量小选 B、用量大反而选 A？（提示：谁的 k 小，谁最终会赢）` },
      {
        kind: "concept", title: "交点：两台机器输出相同的时刻",
        html: `<p>两条直线的<b>交点</b>，是同一个输入让两台机器给出<b>相同输出</b>的地方——它正是方程 30 + 3x = 5x 的解！</p>
        <p>这是初中数学里最漂亮的一次合体：<b>解方程（代数）和找交点（几何）是同一件事的两种说法</b>。
        以后你解任何方程组，都可以在脑中画出两条线，答案就站在它们相遇的地方。</p>`,
      },
    ],
    quiz: [
      { type: "mc", q: "函数的本质是什么？", options: [
          "一个要背的公式", "一台“同样输入必得同样输出”的规则机器",
          "一条随便画的线", "一种只在数学课上存在的东西"], answer: 1,
        explain: "函数 = 确定的对应规则。出租车计价器就是台函数机器：投入里程，吐出车费，<b>童叟无欺</b>。" },
      { type: "mc", q: "y = 2x + 3 中，3 的实际含义是？", options: [
          "y 每次增加 3", "x = 0 时 y 的值（出发点/起步价）", "直线的倾斜程度", "没有实际含义"], answer: 1,
        explain: "b 是 x = 0 时的输出——什么都还没开始时的“底价”。出租车的起步价、水池的初始水量，都是 b。" },
      { type: "mc", q: "如果 k < 0，一次函数的图像是什么样？", options: [
          "从左到右上升", "从左到右下降", "水平直线", "垂直直线"], answer: 1,
        explain: "k 是变化速度：x 每 +1，y 变化 k。k 为负 = 每走一步就<b>降</b>一点，比如蜡烛越烧越短。" },
      { type: "num", q: "y = 3x − 1，当输入 x = 4 时，输出 y = ?", answer: 11,
        explain: "把 4 投进机器：3 × 4 − 1 = <b>11</b>。" },
      { type: "mc", q: "两条一次函数图像的交点，代表什么？", options: [
          "两台机器都坏了的地方", "同一个输入让两个规则给出相同输出（对应方程的解）",
          "图像画错了", "k 和 b 相等的地方"], answer: 1,
        explain: "交点 (x, y) 同时在两条线上——同一个 x，两个规则算出同一个 y。<b>解方程 = 找交点</b>。" },
      { type: "num", q: "A 套餐月费 30 元＋每 GB 3 元，B 套餐每 GB 5 元。每月用多少 GB 时两个套餐一样贵？", answer: 15,
        explain: "30 + 3x = 5x → 30 = 2x → x = <b>15</b>。这正是图上两条线的交点横坐标。" },
    ],
  });
})();
