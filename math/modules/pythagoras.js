/* 模块：勾股定理 —— 亲手拼出面积证明 */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;

  /* 实验一：三边上的正方形 */
  function mountSquares(box) {
    const state = { a: 3, b: 4 };
    const canvas = makeCanvas(box, { aspect: 0.72 });
    const readout = el("div", { class: "readout" });
    const sa = slider({ label: "直角边 a =", min: 2, max: 6, step: 1, value: 3, oninput: v => { state.a = v; canvas.redraw(); update(); } });
    const sb = slider({ label: "直角边 b =", min: 2, max: 6, step: 1, value: 4, oninput: v => { state.b = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(sa, sb));
    box.appendChild(readout);
    function update() {
      const { a, b } = state, c2 = a * a + b * b, c = Math.sqrt(c2);
      readout.innerHTML = `a² + b² = ${a * a} + ${b * b} = <b>${c2}</b>，所以斜边的正方形面积是 ${c2}，斜边 c = √${c2} ${Number.isInteger(c) ? "= <b>" + c + "</b>" : "≈ <b>" + fmt(c, 2) + "</b>"}`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const { a, b } = state;
      // 外扩范围：左 a（a² 方块）、右 b+a（c² 方块）、上 a+b、下 b
      const u = Math.min((W - 40) / (2 * a + b), (H - 44) / (a + 2 * b));
      const ox = 20 + a * u + (W - 40 - (2 * a + b) * u) / 2;
      const oy = 22 + (a + b) * u + (H - 44 - (a + 2 * b) * u) / 2;
      // 直角顶点在 O，a 竖直向上，b 水平向右
      const A = [ox, oy - a * u], B = [ox + b * u, oy], O = [ox, oy];
      const sq = (p1, p2, out, color, label, area) => {
        // 在线段 p1→p2 的 out 侧作正方形
        const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
        const nx = out * dy, ny = -out * dx;
        const p3 = [p2[0] + nx, p2[1] + ny], p4 = [p1[0] + nx, p1[1] + ny];
        ctx.fillStyle = color; ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.moveTo(...p1); ctx.lineTo(...p2); ctx.lineTo(...p3); ctx.lineTo(...p4); ctx.closePath();
        ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
        const cx = (p1[0] + p3[0]) / 2, cy = (p1[1] + p3[1]) / 2;
        ctx.fillStyle = T.ink; ctx.font = "600 14px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(label, cx, cy - 8);
        ctx.font = "12px system-ui"; ctx.fillStyle = T.sub;
        ctx.fillText("面积 " + fmt(area, 1), cx, cy + 9);
      };
      sq(O, A, 1, T.c1, "a²", a * a);        // 竖直边左侧
      sq(B, O, 1, T.c2, "b²", b * b);        // 水平边下方
      sq(A, B, 1, T.c8, "c²", a * a + b * b); // 斜边外侧（右上）
      // 三角形
      ctx.fillStyle = T.mod; ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.moveTo(...O); ctx.lineTo(...A); ctx.lineTo(...B); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = T.mod; ctx.lineWidth = 2; ctx.stroke();
      // 直角标记
      ctx.strokeStyle = T.ink; ctx.lineWidth = 1.5;
      ctx.strokeRect(ox, oy - 12, 12, 12);
      ctx.fillStyle = T.sub; ctx.font = "600 13px system-ui";
      ctx.textAlign = "right"; ctx.fillText("a = " + a, ox - 6, oy - a * u / 2);
      ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText("b = " + b, ox + b * u / 2, oy + 6);
    });
  }

  /* 实验二：重排证明（4 个三角形，两种摆法） */
  function mountProof(box) {
    const state = { a: 3, b: 4, t: 0 };
    const canvas = makeCanvas(box, { aspect: 0.62 });
    const readout = el("div", { class: "readout" });
    const sa = slider({ label: "a =", min: 2, max: 5, step: 1, value: 3, oninput: v => { state.a = v; canvas.redraw(); } });
    const sb = slider({ label: "b =", min: 2, max: 5, step: 1, value: 4, oninput: v => { state.b = v; canvas.redraw(); } });
    const st = slider({ label: "重新摆放", min: 0, max: 1, step: 0.01, value: 0, format: v => v < 0.05 ? "摆法①" : v > 0.95 ? "摆法②" : "…", oninput: v => { state.t = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(sa, sb, st));
    box.appendChild(readout);
    function update() {
      readout.innerHTML = state.t < 0.5
        ? `摆法①：空白是中间那个斜放的正方形，面积 = <b>c²</b>`
        : `摆法②：空白是两个正方形，面积 = <b>a² + b²</b>。三角形一个没多一个没少 → 空白面积必然相等 → <b>c² = a² + b²</b>`;
    }
    update();
    const lerp = (p, q, t) => p.map((v, i) => v + (q[i] - v) * t);
    canvas.onDraw((ctx, W, H, T) => {
      const { a, b, t } = state, s = a + b;
      const u = (Math.min(W, H) - 50) / s;
      const x0 = (W - s * u) / 2, y0 = (H - s * u) / 2;
      const P = (x, y) => [x0 + x * u, y0 + y * u];
      // 大正方形 (a+b)²
      ctx.strokeStyle = T.baseline; ctx.lineWidth = 2;
      ctx.strokeRect(x0, y0, s * u, s * u);
      // 4 个三角形：摆法① 顶点组 / 摆法② 顶点组（一一对应）
      const cfgA = [
        [[0, 0], [a, 0], [0, b]],
        [[a, 0], [s, 0], [s, a]],
        [[s, a], [s, s], [b, s]],
        [[b, s], [0, s], [0, b]],
      ];
      const cfgB = [
        [[0, 0], [a, 0], [0, b]],
        [[a, 0], [a, b], [0, b]],
        [[a, b], [s, b], [s, s]],
        [[a, b], [s, s], [a, s]],
      ];
      // 空白高亮（端点处显现）
      if (t < 0.15) {
        ctx.fillStyle = T.c8; ctx.globalAlpha = 0.20 * (1 - t / 0.15);
        ctx.beginPath();
        ctx.moveTo(...P(a, 0)); ctx.lineTo(...P(s, a)); ctx.lineTo(...P(b, s)); ctx.lineTo(...P(0, b));
        ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
        ctx.fillStyle = T.c8; ctx.font = "700 16px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("c²", ...P(s / 2, s / 2));
      }
      if (t > 0.85) {
        const al = (t - 0.85) / 0.15;
        ctx.globalAlpha = 0.20 * al;
        ctx.fillStyle = T.c1; ctx.fillRect(...P(0, b), a * u, a * u);
        ctx.fillStyle = T.c2; ctx.fillRect(...P(a, 0), b * u, b * u);
        ctx.globalAlpha = 1;
        ctx.font = "700 15px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = T.c1; ctx.fillText("a²", ...P(a / 2, b + a / 2));
        ctx.fillStyle = T.c2; ctx.fillText("b²", ...P(a + b / 2, b / 2));
      }
      // 三角形（插值移动）
      for (let i = 0; i < 4; i++) {
        const tri = cfgA[i].map((p, j) => lerp(p, cfgB[i][j], t));
        ctx.fillStyle = T.c5; ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.moveTo(...P(...tri[0])); ctx.lineTo(...P(...tri[1])); ctx.lineTo(...P(...tri[2]));
        ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = T.c5; ctx.lineWidth = 1.5; ctx.stroke();
      }
      ctx.fillStyle = T.muted; ctx.font = "12px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(`大正方形边长 a+b = ${s}，里面永远是同样的 4 个直角三角形`, W / 2, y0 + s * u + 8);
    });
  }

  MathLab.register({
    id: "pythagoras",
    title: "勾股定理",
    question: "不爬树，怎么知道树有多高？答案藏在三个正方形里。",
    grade: "八年级",
    domain: "图形与几何",
    emoji: "📐",
    color: "c8",
    hook: `<p>三千年前，古埃及人修金字塔需要精确的直角。他们的工具是一根打了 12 个等距结的绳子——
      拉成边长 <b>3、4、5</b> 的三角形，直角就出现了。</p>
      <p>他们知道"怎么做"，但为什么 3、4、5 行得通？直到古希腊人给出证明。
      注意定理说的不是边长，而是<b>面积</b>：两条直角边上的正方形，恰好能填满斜边上的正方形。</p>`,
    sections: [
      {
        kind: "concept", title: "定理说的是面积",
        html: `<div class="formula">a² + b² = c²（a、b 是直角边，c 是斜边）</div>
        <p>a² 不只是"a 乘 a"——它是<b>一个边长为 a 的正方形的面积</b>。定理的真正内容是：</p>
        <p style="text-align:center"><b>小正方形 + 中正方形 = 大正方形</b>（面积上）</p>
        <p>这也回答了"为什么是平方"：因为直角三角形三边锁定的，是三块正方形土地之间的面积守恒。</p>`,
      },
      { kind: "lab", title: "三边上的三个正方形", mount: mountSquares,
        intro: `<p>拖动两条直角边，盯着三个正方形的面积数字。</p>`,
        try_: `找出所有让 c 是整数的组合（3,4 → 5 只是最有名的一个）。这样的整数组叫"勾股数"。` },
      { kind: "lab", title: "四个三角形的魔术：亲手完成证明", mount: mountProof,
        intro: `<p>同一个大正方形（边长 a+b），同样的 4 个直角三角形，两种摆法。拖动"重新摆放"滑杆：</p>
        <ul><li>摆法①：空白是斜放的 <b>c²</b></li><li>摆法②：空白是 <b>a² 和 b²</b> 两块</li></ul>`,
        try_: `三角形没有增减，大正方形没有变，那两种摆法的空白面积必须相等。你刚刚证明了勾股定理——对<b>一切</b>直角三角形成立，不是碰巧。` },
      {
        kind: "concept", title: "一次证明，永久复用",
        html: `<p>掌握了"面积守恒"这个原理，一大类问题瞬间变成同一道题：</p>
        <ul>
          <li><b>量不可及之物</b>：梯子靠墙、风筝线长、电视机尺寸（对角线！）。</li>
          <li><b>反着用（逆定理）</b>：量出三边，验证 a² + b² 是否等于 c²，就能判断有没有直角——这正是古埃及绳子的原理。</li>
          <li><b>坐标系里量距离</b>：以后学的两点间距离公式，就是勾股定理换了身衣服。</li>
        </ul>`,
      },
    ],
    quiz: [
      { type: "num", q: "直角三角形两条直角边分别是 6 和 8，斜边 c = ?", answer: 10,
        explain: "c² = 6² + 8² = 36 + 64 = 100，c = <b>10</b>。这是 3,4,5 放大两倍的勾股数。" },
      { type: "mc", q: "勾股定理适用于哪种三角形？", options: ["所有三角形", "只有直角三角形", "只有等腰三角形", "只有锐角三角形"], answer: 1,
        explain: "面积拼图证明里，那个直角是拼合严丝合缝的关键。没有直角，a² + b² 就不再等于 c²（会偏大或偏小——这正是以后余弦定理要讲的故事）。" },
      { type: "mc", q: "拼图证明的核心思想是什么？", options: [
          "把很多三角形量一遍取平均", "同一块空白面积，用两种摆法各算一次，结果必须相等",
          "用尺子精确测量", "因为 3² + 4² = 5² 所以都成立"], answer: 1,
        explain: "<b>一块面积、两种算法</b>——这是数学里反复出现的证明套路。量一万个三角形只是检验，一次拼图才是证明。" },
      { type: "num", q: "2.5 米长的梯子靠在墙上，梯脚离墙 0.7 米。梯子顶端离地多高？（米）", answer: 2.4, tol: 0.01,
        explain: "高² = 2.5² − 0.7² = 6.25 − 0.49 = 5.76，高 = <b>2.4 米</b>。斜边是梯子，别搞反。" },
      { type: "mc", q: "三边长为 5、12、13 的三角形是直角三角形吗？", options: [
          "是，因为 5² + 12² = 13²", "不是，13 太长了", "无法判断", "是，因为看起来像"], answer: 0,
        explain: "25 + 144 = 169 = 13² ✔。这是<b>逆定理</b>：面积关系成立 ⟹ 必有直角。古埃及人的结绳就是这么用的。" },
      { type: "mc", q: "为什么定理里是 a²、b²、c²，而不是 a、b、c 直接相加？", options: [
          "为了让计算更难", "因为定理描述的是三边上正方形的面积关系", "历史习惯", "两种写法都对"], answer: 1,
        explain: "3 + 4 ≠ 5，但 9 + 16 = 25。锁住的是<b>面积</b>不是长度——忘掉这一点，定理就退化成一句咒语。" },
    ],
  });
})();
