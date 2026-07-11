/* 模块：代数式与乘法公式 —— 用面积看懂字母运算 */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;

  /* 实验一：(a+b)² 的面积拼图 */
  function mountSquare(box) {
    const state = { a: 4, b: 2 };
    const canvas = makeCanvas(box, { aspect: 0.62 });
    const readout = el("div", { class: "readout" });
    const sa = slider({ label: "a =", min: 1, max: 7, step: 1, value: state.a, oninput: v => { state.a = v; canvas.redraw(); update(); } });
    const sb = slider({ label: "b =", min: 1, max: 7, step: 1, value: state.b, oninput: v => { state.b = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(sa, sb));
    box.appendChild(readout);
    function update() {
      const { a, b } = state;
      readout.innerHTML = `整个大正方形：(${a}+${b})² = <b>${(a + b) ** 2}</b>　拼起来的四块：${a}² + ${a}·${b} + ${a}·${b} + ${b}² = ${a * a} + ${a * b} + ${a * b} + ${b * b} = <b>${a * a + 2 * a * b + b * b}</b> ✔ 一样！`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const { a, b } = state, s = a + b;
      const size = Math.min(W - 160, H - 40), u = size / s;
      const x0 = (W - size) / 2 - 30, y0 = (H - size) / 2;
      const cell = (x, y, w, h, color, label, area) => {
        ctx.fillStyle = color; ctx.globalAlpha = 0.28;
        ctx.fillRect(x0 + x * u, y0 + y * u, w * u, h * u);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.strokeRect(x0 + x * u, y0 + y * u, w * u, h * u);
        ctx.fillStyle = T.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = "600 15px system-ui";
        ctx.fillText(label, x0 + (x + w / 2) * u, y0 + (y + h / 2) * u - 8);
        ctx.font = "12px system-ui"; ctx.fillStyle = T.sub;
        ctx.fillText("= " + area, x0 + (x + w / 2) * u, y0 + (y + h / 2) * u + 10);
      };
      cell(0, 0, a, a, T.c1, "a²", a * a);
      cell(a, 0, b, a, T.c3, "a·b", a * b);
      cell(0, a, a, b, T.c3, "a·b", a * b);
      cell(a, a, b, b, T.c2, "b²", b * b);
      // 边标注
      ctx.fillStyle = T.sub; ctx.font = "600 13px system-ui"; ctx.textAlign = "center";
      ctx.fillText(`a = ${a}`, x0 + a * u / 2, y0 - 12);
      ctx.fillText(`b = ${b}`, x0 + (a + b / 2) * u, y0 - 12);
      ctx.save(); ctx.translate(x0 - 14, y0 + a * u / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(`a = ${a}`, 0, 0); ctx.restore();
      ctx.save(); ctx.translate(x0 - 14, y0 + (a + b / 2) * u); ctx.rotate(-Math.PI / 2); ctx.fillText(`b = ${b}`, 0, 0); ctx.restore();
      // 右侧公式
      ctx.textAlign = "left"; ctx.fillStyle = T.ink; ctx.font = "600 15px system-ui";
      const rx = x0 + size + 26;
      ctx.fillText("(a+b)²", rx, y0 + 24);
      ctx.fillStyle = T.sub; ctx.font = "14px system-ui";
      ctx.fillText("= a² + 2ab + b²", rx, y0 + 48);
      ctx.fillText("两块 a·b", rx, y0 + 78);
      ctx.fillText("谁都不能少", rx, y0 + 96);
    });
  }

  /* 实验二：平方差 (a+b)(a−b) = a² − b²，切一刀拼过去 */
  function mountDiff(box) {
    const state = { a: 5, b: 2, t: 0 };
    const canvas = makeCanvas(box, { aspect: 0.55 });
    const readout = el("div", { class: "readout" });
    const sa = slider({ label: "a =", min: 3, max: 8, step: 1, value: state.a, oninput: v => { state.a = v; if (state.b >= v) { state.b = v - 1; sb.set(state.b); } canvas.redraw(); update(); } });
    const sb = slider({ label: "b =", min: 1, max: 7, step: 1, value: state.b, oninput: v => { state.b = Math.min(v, state.a - 1); canvas.redraw(); update(); } });
    const st = slider({ label: "拼图动画", min: 0, max: 1, step: 0.01, value: 0, format: v => v < 0.5 ? "切" : "拼", oninput: v => { state.t = v; canvas.redraw(); } });
    box.appendChild(ctrlRow(sa, sb, st));
    box.appendChild(readout);
    function update() {
      const { a, b } = state;
      readout.innerHTML = `大正方形挖掉小角：a² − b² = ${a * a} − ${b * b} = <b>${a * a - b * b}</b>　拼成的长方形：(a+b)(a−b) = ${a + b} × ${a - b} = <b>${(a + b) * (a - b)}</b> ✔`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const { a, b, t } = state;
      const u = Math.min((W - 80) / (a + b + 2), (H - 60) / a);
      const x0 = 40, y0 = (H - a * u) / 2;
      // L 形 = 大正方形 a² 挖掉右上角 b²
      ctx.strokeStyle = T.c1; ctx.fillStyle = T.c1; ctx.lineWidth = 2;
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(x0 + (a - b) * u, y0); ctx.lineTo(x0 + (a - b) * u, y0 + b * u);
      ctx.lineTo(x0 + a * u, y0 + b * u); ctx.lineTo(x0 + a * u, y0 + a * u); ctx.lineTo(x0, y0 + a * u);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; ctx.stroke();
      // 被挖掉的 b²
      ctx.setLineDash([4, 4]); ctx.strokeStyle = T.muted;
      ctx.strokeRect(x0 + (a - b) * u, y0, b * u, b * u);
      ctx.setLineDash([]);
      ctx.fillStyle = T.muted; ctx.font = "12px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("挖掉 b²", x0 + (a - b / 2) * u, y0 + b * u / 2);
      // 竖切 x=a−b：左块 (a−b)×a（绿），右块 b×(a−b)（橙，在挖角下方）
      // 右块转 90° 接到左块右侧 → (a+b)×(a−b) 的长方形，面积不变
      const p = t;
      // 左块
      ctx.fillStyle = T.c2; ctx.globalAlpha = 0.30;
      ctx.fillRect(x0, y0, (a - b) * u, a * u);
      ctx.globalAlpha = 1; ctx.strokeStyle = T.c2; ctx.strokeRect(x0, y0, (a - b) * u, a * u);
      ctx.fillStyle = T.ink; ctx.font = "600 13px system-ui";
      ctx.fillText("(a−b)×a", x0 + (a - b) * u / 2, y0 + a * u / 2);
      // 右侧目标图：横放的 (a+b)×(a−b) 长方形，随滑杆逐渐显现
      const gx = x0 + (a + 1.2) * u;
      const th = (a - b) * u, tw = (a + b) * u;
      const ty = y0 + (a * u - th) / 2;
      const scaleFit = Math.min(1, (W - gx - 20) / tw);
      ctx.save();
      ctx.translate(gx, 0); ctx.scale(scaleFit, scaleFit);
      ctx.globalAlpha = 0.25 + 0.6 * p;
      ctx.fillStyle = T.c2; ctx.fillRect(0, ty, a * u, th);
      ctx.fillStyle = T.c8; ctx.fillRect(a * u, ty, b * u, th);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = T.c2; ctx.strokeRect(0, ty, a * u, th);
      ctx.strokeStyle = T.c8; ctx.strokeRect(a * u, ty, b * u, th);
      ctx.fillStyle = T.ink; ctx.font = "600 13px system-ui"; ctx.textAlign = "center";
      ctx.fillText("a", a * u / 2, ty - 10);
      ctx.fillText("b", a * u + b * u / 2, ty - 10);
      ctx.save(); ctx.translate(-12, ty + th / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("a−b", 0, 0); ctx.restore();
      ctx.fillStyle = T.sub; ctx.font = "13px system-ui";
      ctx.fillText(`(a+b)(a−b) = ${(state.a + state.b) * (state.a - state.b)}`, tw / 2, ty + th + 22);
      ctx.restore();
      // 原图上被切走的右下块高亮
      ctx.fillStyle = T.c8; ctx.globalAlpha = 0.30 * (1 - p) + 0.05;
      ctx.fillRect(x0 + (a - b) * u, y0 + b * u, b * u, (a - b) * u);
      ctx.globalAlpha = 1; ctx.strokeStyle = T.c8;
      ctx.strokeRect(x0 + (a - b) * u, y0 + b * u, b * u, (a - b) * u);
      ctx.fillStyle = T.ink;
      ctx.fillText("b×(a−b)", x0 + (a - b / 2) * u, y0 + (b + (a - b) / 2) * u);
      ctx.fillStyle = T.sub; ctx.font = "13px system-ui"; ctx.textAlign = "center";
      ctx.fillText(`a² − b² = ${a * a - b * b}`, x0 + a * u / 2, y0 + a * u + 22);
      // 箭头
      if (p > 0.1) {
        ctx.strokeStyle = T.muted; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(x0 + a * u + 6, y0 + a * u / 2); ctx.lineTo(gx - 8, y0 + a * u / 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = T.muted; ctx.font = "12px system-ui";
        ctx.fillText("切下橙块，转个方向拼过去 →", (x0 + a * u + gx) / 2, y0 + a * u / 2 - 10);
      }
    });
  }

  MathLab.register({
    id: "algebra",
    title: "代数式与乘法公式",
    question: "字母不是天书——它是“任何数”的占位符，公式是看得见的面积。",
    grade: "七～八年级",
    domain: "数与代数",
    emoji: "🧩",
    color: "c5",
    hook: `<p>不用竖式，3 秒心算 <b>103 × 97</b>？</p>
      <p>答案是 9991。秘诀：103 × 97 = (100+3)(100−3) = 100² − 3² = 10000 − 9。</p>
      <p>这不是魔术，是一个<b>对所有数都成立的形状规律</b>。要一次说清"对所有数都成立"，就得请出字母——
      这正是代数被发明的原因：<b>字母是"任何数"的占位符</b>，一个公式顶得上无穷多道算术题。</p>`,
    sections: [
      {
        kind: "concept", title: "乘法就是面积",
        html: `<p>3 × 5 是什么？是一个 3 行 5 列的长方形里格子的个数。<b>乘法 = 长方形面积</b>，这是它最原始的样子。</p>
        <p>于是 (a+b)² 就是一个边长为 a+b 的正方形的面积。把这个正方形沿着 a 和 b 的分界线切开，
        会得到<b>四块</b>：一块 a²、一块 b²，还有<b>两块 a·b</b>。</p>
        <div class="formula">(a + b)² = a² + 2ab + b²</div>
        <p>为什么不能等于 a² + b²？因为那样就把两块 ab 的面积弄丢了——在下面的实验里你能亲眼看到丢的是哪两块。</p>`,
      },
      { kind: "lab", title: "切开一个正方形", mount: mountSquare,
        intro: `<p>拖动 a、b，看正方形如何被切成四块，面积如何分毫不差。</p>`,
        try_: `把 a、b 都设成一样大，四块变成了什么？再想想：(a+b)² 和 a² + b² 差的正好是哪两块？` },
      { kind: "lab", title: "平方差：切一刀，拼过去", mount: mountDiff,
        intro: `<p>边长 a 的正方形挖掉一个 b² 的角，剩下 L 形。沿虚线切一刀、把橙色块转个方向拼过去——正好是一个 (a+b)×(a−b) 的长方形！</p>
        <div class="formula">(a + b)(a − b) = a² − b²</div>`,
        try_: `用它解释开头的魔术：103 × 97 = (100+3)(100−3) = ? 再试试心算 49 × 51。` },
      {
        kind: "concept", title: "公式的复用：一次证明，处处可用",
        html: `<p>这就是代数的力量：<b>面积拼图只做一次，结论对一切数永远成立</b>。</p>
        <ul>
          <li>心算 51² = (50+1)² = 2500 + 100 + 1 = 2601</li>
          <li>心算 98 × 102 = (100−2)(100+2) = 10000 − 4 = 9996</li>
          <li>反过来用叫<b>因式分解</b>：x² − 9 = (x+3)(x−3)——把面积"还原"成边长</li>
        </ul>
        <p>以后学到的配方法、勾股定理的证明，都会再次用到"用面积看代数"这一招。原理只有一个，用处却无穷多。</p>`,
      },
    ],
    quiz: [
      { type: "mc", q: "(a + b)² 等于什么？", options: ["a² + b²", "a² + 2ab + b²", "2a + 2b", "a² + ab + b²"], answer: 1,
        explain: "把边长 a+b 的正方形切开：a²、b²，<b>还有两块 a·b</b>。少一块都拼不回去。" },
      { type: "mc", q: "为什么 (a+b)² ≠ a² + b²？", options: [
          "它们其实相等", "因为漏掉了两块 a·b 的面积", "因为字母不能相乘", "因为课本这样规定"], answer: 1,
        explain: "用具体数检验最快：(2+3)² = 25，而 2² + 3² = 13。差的 12 正是 2ab = 2×2×3 那<b>两块长方形</b>。" },
      { type: "num", q: "用乘法公式心算：51² = ?", answer: 2601,
        explain: "(50+1)² = 50² + 2×50×1 + 1² = 2500 + 100 + 1 = <b>2601</b>。" },
      { type: "num", q: "用平方差心算：98 × 102 = ?", answer: 9996,
        explain: "(100−2)(100+2) = 100² − 2² = 10000 − 4 = <b>9996</b>。把难乘法变成好算的平方。" },
      { type: "mc", q: "3x · 2x 等于什么？", options: ["6x", "5x", "6x²", "5x²"], answer: 2,
        explain: "3x·2x = 3·2·x·x = 6x²。想成长方形：边长 3x 和 2x 的长方形面积。x·x 是 x²，不是 2x。" },
      { type: "num", q: "因式分解：x² − 9 = (x − 3)(x + ?)，问号处填几？", answer: 3,
        explain: "平方差反着用：x² − 9 = x² − 3² = (x+3)(x−3)。因式分解就是把\"面积\"还原成\"边长\"。" },
    ],
  });
})();
