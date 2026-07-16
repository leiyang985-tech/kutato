/* 模块：二次函数 —— 投篮弧线里的抛物线 */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;

  /* 实验一：a, h, k 各管什么 */
  function mountVertex(box) {
    const state = { a: 1, h: 1, k: -2 };
    const canvas = makeCanvas(box, { aspect: 0.58 });
    const readout = el("div", { class: "readout" });
    const upd = () => { canvas.redraw(); update(); };
    const sa = slider({ label: "a =", min: -2, max: 2, step: 0.25, value: 1, oninput: v => { state.a = v || 0.25; upd(); } });
    const sh = slider({ label: "h =", min: -4, max: 4, step: 0.5, value: 1, oninput: v => { state.h = v; upd(); } });
    const sk = slider({ label: "k =", min: -5, max: 5, step: 0.5, value: -2, oninput: v => { state.k = v; upd(); } });
    box.appendChild(ctrlRow(sa, sh, sk, el("span", { class: "ctl" }, "👆 也可以直接拖动橙色顶点")));
    box.appendChild(readout);
    const geom = () => {
      const { W, H } = canvas.size();
      return { x0: W / 2, y0: H / 2, ux: (W - 60) / 16, uy: (H - 40) / 14 };
    };
    canvas.enableDrag({
      hit(x, y) {
        const { x0, y0, ux, uy } = geom();
        return Math.hypot(x - (x0 + state.h * ux), y - (y0 - state.k * uy)) < 24 ? "v" : null;
      },
      move(x, y) {
        const { x0, y0, ux, uy } = geom();
        sh.set(Math.max(-4, Math.min(4, Math.round((x - x0) / ux * 2) / 2)));
        sk.set(Math.max(-5, Math.min(5, Math.round((y0 - y) / uy * 2) / 2)));
      },
    });
    function update() {
      const { a, h, k } = state;
      readout.innerHTML = `y = ${fmt(a)}(x ${h >= 0 ? "− " + fmt(h) : "+ " + fmt(-h)})² ${k >= 0 ? "+ " + fmt(k) : "− " + fmt(-k)}　顶点 <b>(${fmt(h)}, ${fmt(k)})</b>　开口${a > 0 ? "向上（有最小值 " + fmt(k) + "）" : "向下（有最大值 " + fmt(k) + "）"}`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const x0 = W / 2, y0 = H / 2, ux = (W - 60) / 16, uy = (H - 40) / 14;
      const X = (v) => x0 + v * ux, Y = (v) => y0 - v * uy;
      // 网格与坐标轴
      ctx.strokeStyle = T.grid; ctx.lineWidth = 1;
      for (let x = -8; x <= 8; x += 2) { ctx.beginPath(); ctx.moveTo(X(x), Y(-7)); ctx.lineTo(X(x), Y(7)); ctx.stroke(); }
      for (let y = -6; y <= 6; y += 2) { ctx.beginPath(); ctx.moveTo(X(-8), Y(y)); ctx.lineTo(X(8), Y(y)); ctx.stroke(); }
      ctx.strokeStyle = T.baseline; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X(-8), Y(0)); ctx.lineTo(X(8), Y(0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0), Y(-7)); ctx.lineTo(X(0), Y(7)); ctx.stroke();
      const { a, h, k } = state;
      // 对称轴
      ctx.setLineDash([5, 4]); ctx.strokeStyle = T.c2; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X(h), Y(-7)); ctx.lineTo(X(h), Y(7)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = T.c2; ctx.font = "11.5px system-ui"; ctx.textAlign = "left";
      ctx.fillText("对称轴 x = " + fmt(h), X(h) + 5, Y(6.4));
      // 抛物线
      ctx.strokeStyle = T.mod; ctx.lineWidth = 2.5;
      ctx.beginPath();
      let first = true;
      for (let px = -8; px <= 8; px += 0.1) {
        const py = a * (px - h) ** 2 + k;
        if (py < -7.5 || py > 7.5) { first = true; continue; }
        if (first) { ctx.moveTo(X(px), Y(py)); first = false; }
        else ctx.lineTo(X(px), Y(py));
      }
      ctx.stroke();
      // 顶点（可拖拽手柄）
      ctx.fillStyle = T.c8;
      ctx.beginPath(); ctx.arc(X(h), Y(k), 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = T.surface; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(X(h), Y(k), 8, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = T.c8;
      ctx.font = "600 12px system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText(`顶点 (${fmt(h)}, ${fmt(k)})`, X(h) + 11, Y(k) + 6);
      // 与 x 轴交点（方程的解）
      if (a !== 0 && a * k < 0) {
        const r = Math.sqrt(-k / a);
        for (const rx of [h - r, h + r]) {
          ctx.fillStyle = T.c6;
          ctx.beginPath(); ctx.arc(X(rx), Y(0), 4.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = T.c6; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText("与 x 轴的交点 = 方程的解", X(h), Y(0) - 10);
      }
    });
  }

  /* 实验二：投篮小游戏 */
  function mountShoot(box) {
    // 球从 (0,2) 出手，抛物线 y = k − a(x − h)²，篮筐在 (8, 3)
    const state = { a: 0.3, h: 3, fired: false, t: 0 };
    const canvas = makeCanvas(box, { aspect: 0.5, anim: true });
    const readout = el("div", { class: "readout" });
    const f = (x) => peak() - state.a * (x - state.h) ** 2;
    const peak = () => 2 + state.a * state.h ** 2; // 保证经过出手点 (0,2)
    const HOOP = { x: 8, y: 3 };
    const sa = slider({ label: "弧度 a =", min: 0.05, max: 0.8, step: 0.01, value: 0.3, oninput: v => { state.a = v; state.fired = false; state.result = undefined; update(); } });
    const sh = slider({ label: "最高点位置 h =", min: 1, max: 7, step: 0.1, value: 3, oninput: v => { state.h = v; state.fired = false; state.result = undefined; update(); } });
    const shoot = button("🏀 投篮！", () => { state.fired = true; state.t = 0; }, true);
    box.appendChild(ctrlRow(sa, sh, shoot));
    box.appendChild(readout);
    function hit() { return Math.abs(f(HOOP.x) - HOOP.y) < 0.18; }
    function update() {
      readout.innerHTML = `球的轨迹：y = ${fmt(peak(), 2)} − ${fmt(state.a, 2)}(x − ${fmt(state.h, 1)})²　球到篮筐上方时的高度：<b>${fmt(f(HOOP.x), 2)} 米</b>（篮筐高 3 米）` +
        (hit() ? "　🎯 <b>轨迹正好穿筐！点投篮验证</b>" : "");
    }
    update();
    canvas.onDraw((ctx, W, H, T, t) => {
      const x0 = 36, y0 = H - 26, ux = (W - 60) / 10, uy = (H - 50) / 7;
      const X = (v) => x0 + v * ux, Y = (v) => y0 - v * uy;
      // 地面
      ctx.strokeStyle = T.baseline; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X(0) - 10, Y(0)); ctx.lineTo(X(10), Y(0)); ctx.stroke();
      // 篮架
      ctx.strokeStyle = T.sub; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(X(HOOP.x + 0.6), Y(0)); ctx.lineTo(X(HOOP.x + 0.6), Y(HOOP.y + 0.8)); ctx.stroke();
      ctx.strokeStyle = T.c6; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(X(HOOP.x - 0.35), Y(HOOP.y)); ctx.lineTo(X(HOOP.x + 0.35), Y(HOOP.y)); ctx.stroke();
      ctx.fillStyle = T.muted; ctx.font = "11px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("篮筐 (8, 3)", X(HOOP.x), Y(HOOP.y + 1.1));
      // 出手的人
      ctx.fillStyle = T.sub;
      ctx.beginPath(); ctx.arc(X(0), Y(1.6), 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(X(0) - 2.5, Y(1.5), 5, uy * 1.4);
      // 轨迹（虚线预览）
      ctx.setLineDash([4, 4]); ctx.strokeStyle = T.mod; ctx.lineWidth = 1.5;
      ctx.beginPath();
      let first = true;
      for (let px = 0; px <= 10; px += 0.08) {
        const py = f(px);
        if (py < -0.2) break;
        if (first) { ctx.moveTo(X(px), Y(py)); first = false; } else ctx.lineTo(X(px), Y(py));
      }
      ctx.stroke(); ctx.setLineDash([]);
      // 顶点
      ctx.fillStyle = T.c2;
      ctx.beginPath(); ctx.arc(X(state.h), Y(peak()), 4, 0, Math.PI * 2); ctx.fill();
      ctx.font = "11px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillStyle = T.c2;
      ctx.fillText(`最高点 (${fmt(state.h, 1)}, ${fmt(peak(), 1)})`, X(state.h), Y(peak()) - 7);
      // 球动画
      if (state.fired) {
        state.t += 0.045;
        const bx = state.t * 10;
        if (bx <= 10 && f(bx) > -0.2) {
          ctx.fillStyle = T.c8;
          ctx.beginPath(); ctx.arc(X(bx), Y(f(bx)), 7, 0, Math.PI * 2); ctx.fill();
          if (Math.abs(bx - HOOP.x) < 0.12 && hit()) {
            ctx.fillStyle = T.good; ctx.font = "700 18px system-ui"; ctx.textAlign = "center";
            ctx.fillText("🎉 进了！", X(5), Y(6.2));
          }
        } else {
          state.fired = false;
          state.result = hit();
        }
      }
      if (state.result !== undefined && !state.fired) {
        ctx.font = "700 16px system-ui"; ctx.textAlign = "center";
        ctx.fillStyle = state.result ? T.good : T.bad;
        ctx.fillText(state.result ? "🎉 空心入网！轨迹恰好经过 (8, 3)" : "😅 没进——调整 a 或 h，让 y(8) = 3", X(5), Y(6.2));
      }
    });
  }

  MathLab.register({
    id: "quadratic",
    title: "二次函数与抛物线",
    question: "篮球、喷泉、烟花的弧线，全都是同一条曲线。",
    grade: "九年级",
    domain: "数与代数",
    emoji: "🏀",
    color: "c6",
    hook: `<p>投篮时球划出的弧线、喷泉的水柱、扔出去的石子——它们的轨迹<b>惊人地相似</b>。</p>
      <p>这不是巧合：只要一个量的变化跟"另一个量的平方"挂钩（重力让下落距离和时间的平方成正比），
      画出来就是同一种曲线——<b>抛物线</b>。它是自然界最常见的曲线之一。</p>
      <p>一次函数是"匀速的世界"，二次函数是"加速的世界"。</p>`,
    sections: [
      {
        kind: "concept", title: "顶点式：三个旋钮控制一条曲线",
        html: `<p>抛物线看起来千变万化，其实只有三个"旋钮"：</p>
        <div class="formula">y = a(x − h)² + k</div>
        <ul>
          <li><b>a</b>：开口的方向和胖瘦。a &gt; 0 开口向上（碗），a &lt; 0 开口向下（伞）；|a| 越大越瘦。</li>
          <li><b>h</b>：整条曲线<b>左右平移</b>到 x = h。</li>
          <li><b>k</b>：整条曲线<b>上下平移</b>到高度 k。</li>
        </ul>
        <p>为什么顶点恰好在 (h, k)？看式子本身：(x−h)² 是个平方，<b>永远 ≥ 0</b>，且只在 x = h 时等于 0。
        所以 a &gt; 0 时 y 最小就是 k——<b>最值不用求，式子自己写着</b>。这就是"配方法"存在的全部理由：把式子改写成能一眼看出最值的形状。</p>`,
      },
      { kind: "lab", title: "拧动三个旋钮", mount: mountVertex,
        intro: `<p>拖 a、h、k，看抛物线怎么开口、平移；注意红点——曲线与 x 轴的交点。</p>`,
        try_: `调整 k 让抛物线恰好和 x 轴只碰一下（相切）。此时对应的方程 a(x−h)² + k = 0 有几个解？把 k 再往上推呢？` },
      { kind: "lab", title: "投篮挑战", mount: mountShoot,
        intro: `<p>球从手上 (0, 2) 出手，篮筐在 (8, 3)。调整弧度 a 和最高点位置 h，让轨迹恰好穿过篮筐，然后投篮验证！</p>`,
        try_: `进球后，试着用<b>完全不同</b>的 a 和 h 再进一次——通过同一个点的抛物线有无数条。高弧度和平直的投篮哪个更"容错"？` },
      {
        kind: "concept", title: "抛物线与方程：一枚硬币的两面",
        html: `<p>抛物线 y = x² − 4 与 x 轴的交点在哪？交点处 y = 0，也就是解方程 x² − 4 = 0，得 x = ±2。</p>
        <p>所以：<b>一元二次方程的解 = 抛物线与 x 轴交点的横坐标</b>。</p>
        <ul>
          <li>抛物线穿过 x 轴两次 → 方程有 2 个解</li>
          <li>恰好碰一下（顶点在轴上）→ 1 个解</li>
          <li>整条悬在半空 → 没有实数解</li>
        </ul>
        <p>判别式 b² − 4ac 判断的，说到底就是<b>顶点在 x 轴的上边还是下边</b>。图像想通了，公式只是把图翻译成字。</p>`,
      },
    ],
    quiz: [
      { type: "mc", q: "抛物线 y = (x − 2)² + 3 的顶点是？", options: ["(2, 3)", "(−2, 3)", "(2, −3)", "(3, 2)"], answer: 0,
        explain: "(x−2)² ≥ 0，只在 x = 2 时为 0，此时 y 取最小值 3。顶点 <b>(2, 3)</b>——从式子直接读出，不用算。" },
      { type: "mc", q: "a > 0 时，抛物线 y = ax² + bx + c 的开口方向？", options: ["向上", "向下", "向左", "不确定"], answer: 0,
        explain: "x 很大时 ax² 是主导：a &gt; 0 则 y 冲向正无穷，两端翘起——开口<b>向上</b>，像一只碗，有最低点。" },
      { type: "mc", q: "二次函数图像与一元二次方程的关系是？", options: [
          "没有关系", "方程的解 = 图像与 x 轴交点的横坐标", "方程的解 = 顶点坐标", "图像只是装饰"], answer: 1,
        explain: "与 x 轴相交 ⟺ y = 0 ⟺ 方程成立。<b>解方程就是问：曲线在哪儿落地？</b>" },
      { type: "num", q: "抛物线 y = x² − 4 与 x 轴有两个交点，其中横坐标为正的那个是 x = ?", answer: 2,
        explain: "令 y = 0：x² = 4，x = ±2。正的交点是 <b>x = 2</b>。" },
      { type: "mc", q: "“配方法”存在的根本目的是什么？", options: [
          "让式子变得更长", "把式子改写成“平方 + 常数”，一眼看出顶点和最值",
          "应付考试的技巧", "把二次变成一次"], answer: 1,
        explain: "x² + 6x + 5 = (x+3)² − 4。改写后立刻看出：最小值 −4，在 x = −3 取到。<b>配方 = 把信息摆到明面上</b>。" },
      { type: "num", q: "y = −(x − 1)² + 5 的最大值是多少？", answer: 5,
        explain: "−(x−1)² ≤ 0，最好情况是 0（当 x = 1）。所以 y 最大 = <b>5</b>。开口向下的抛物线，顶点就是山顶。" },
    ],
  });
})();
