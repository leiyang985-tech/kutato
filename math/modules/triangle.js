/* 模块：三角形与平行线 —— 内角和为什么恰好是 180° */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;

  /* 角度工具：P 点处从方向 a1 到 a2 的扇形 */
  function wedge(ctx, x, y, a1, a2, r, color, alpha = 0.35) {
    let d = a2 - a1;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    ctx.fillStyle = color; ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.arc(x, y, r, a1, a1 + d, d < 0);
    ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  }

  /* 实验一：拖顶点看内角和 + 平行线证明 */
  function mountSum(box) {
    const state = { ax: 0.6, ay: 3, proof: false };
    const canvas = makeCanvas(box, { aspect: 0.56 });
    const readout = el("div", { class: "readout" });
    const bp = button("显示平行线证明", () => {
      state.proof = !state.proof;
      bp.className = "btn" + (state.proof ? " primary" : "");
      bp.textContent = state.proof ? "隐藏平行线证明" : "显示平行线证明";
      upd();
    });
    const upd = () => { canvas.redraw(); update(); };
    box.appendChild(ctrlRow(bp, el("span", { class: "ctl" }, "👆 直接用手拖动红色顶点 A")));
    box.appendChild(readout);
    // 画布变换（draw 与拖拽共用）
    const geom = () => {
      const { W, H } = canvas.size();
      const u = Math.min((W - 60) / 8.5, (H - 70) / 5.6);
      return { u, ox: W / 2, oy: H - 40 };
    };
    canvas.enableDrag({
      hit(x, y) {
        const { u, ox, oy } = geom();
        return Math.hypot(x - (ox + state.ax * u), y - (oy - state.ay * u)) < 26 ? "A" : null;
      },
      move(x, y) {
        const { u, ox, oy } = geom();
        state.ax = Math.max(-3.8, Math.min(3.8, (x - ox) / u));
        state.ay = Math.max(1.0, Math.min(4.6, (oy - y) / u));
        update();
      },
    });

    const B = [-3.2, 0], C = [3.2, 0];
    function angles() {
      const A = [state.ax, state.ay];
      const ang = (P, Q, R) => { // ∠QPR
        const a1 = Math.atan2(Q[1] - P[1], Q[0] - P[0]);
        const a2 = Math.atan2(R[1] - P[1], R[0] - P[0]);
        let d = Math.abs(a1 - a2);
        if (d > Math.PI) d = 2 * Math.PI - d;
        return d * 180 / Math.PI;
      };
      const aB = ang(B, A, C), aC = ang(C, A, B);
      return { A, aA: 180 - aB - aC, aB, aC };
    }
    function update() {
      const { aA, aB, aC } = angles();
      const r = (x) => Math.round(x);
      readout.innerHTML = `∠A = <b style="color:var(--c6)">${r(aA)}°</b>　∠B = <b style="color:var(--c1)">${r(aB)}°</b>　∠C = <b style="color:var(--c8)">${r(180 - aA - aB)}°</b>` +
        `　三个角加起来 = <b>180°</b>——怎么拖都是 180°` +
        (state.proof ? "。看顶部：蓝角和橙角被平行线“搬”到了 A 点两侧，和红角拼成一条<b>平角（180°）</b>！" : "");
    }
    update();

    canvas.onDraw((ctx, W, H, T) => {
      const u = Math.min((W - 60) / 8.5, (H - 70) / 5.6);
      const ox = W / 2, oy = H - 40;
      const P = (p) => [ox + p[0] * u, oy - p[1] * u];
      const { A } = angles();
      const [axp, ayp] = P(A), [bxp, byp] = P(B), [cxp, cyp] = P(C);
      // 三角形
      ctx.fillStyle = T.mod; ctx.globalAlpha = 0.10;
      ctx.beginPath(); ctx.moveTo(axp, ayp); ctx.lineTo(bxp, byp); ctx.lineTo(cxp, cyp); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = T.mod; ctx.lineWidth = 2; ctx.stroke();
      // 角度扇形
      const dir = (p, q) => Math.atan2(q[1] - p[1], q[0] - p[0]);
      wedge(ctx, bxp, byp, dir([bxp, byp], [axp, ayp]), dir([bxp, byp], [cxp, cyp]), 26, T.c1);
      wedge(ctx, cxp, cyp, dir([cxp, cyp], [axp, ayp]), dir([cxp, cyp], [bxp, byp]), 26, T.c8);
      wedge(ctx, axp, ayp, dir([axp, ayp], [bxp, byp]), dir([axp, ayp], [cxp, cyp]), 24, T.c6);
      // 平行线证明
      if (state.proof) {
        ctx.setLineDash([6, 4]); ctx.strokeStyle = T.sub; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(axp - 3.4 * u, ayp); ctx.lineTo(axp + 3.4 * u, ayp); ctx.stroke();
        ctx.setLineDash([]);
        // 内错角：A 点左侧 = ∠B（蓝），右侧 = ∠C（橙）
        wedge(ctx, axp, ayp, Math.PI, dir([axp, ayp], [bxp, byp]), 30, T.c1);
        wedge(ctx, axp, ayp, dir([axp, ayp], [cxp, cyp]), 0, 30, T.c8);
        ctx.fillStyle = T.sub; ctx.font = "11.5px system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
        ctx.fillText("过 A 作 BC 的平行线", axp + 1.6 * u, ayp - 8);
        ctx.fillStyle = T.muted;
        ctx.fillText("蓝 + 红 + 橙 = 一个平角", axp + 1.6 * u, ayp + 16);
      }
      // 可拖拽的顶点手柄
      ctx.fillStyle = T.c6;
      ctx.beginPath(); ctx.arc(axp, ayp, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = T.surface; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(axp, ayp, 9, 0, Math.PI * 2); ctx.stroke();
      // 顶点标签
      ctx.font = "700 13px system-ui"; ctx.textAlign = "center";
      ctx.fillStyle = T.c6; ctx.textBaseline = "bottom"; ctx.fillText("A", axp, ayp - (state.proof ? 34 : 12));
      ctx.fillStyle = T.c1; ctx.textBaseline = "top"; ctx.fillText("B", bxp - 12, byp + 4);
      ctx.fillStyle = T.c8; ctx.fillText("C", cxp + 12, cyp + 4);
    });
  }

  /* 实验二：多边形 = 三角形拼的 */
  function mountPolygon(box) {
    const state = { n: 5 };
    const canvas = makeCanvas(box, { aspect: 0.5 });
    const readout = el("div", { class: "readout" });
    const sn = slider({ label: "多边形边数 n =", min: 3, max: 10, step: 1, value: 5, oninput: v => { state.n = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(sn));
    box.appendChild(readout);
    function update() {
      const n = state.n, sum = (n - 2) * 180;
      readout.innerHTML = `从一个顶点出发切开：${n} 边形被分成 <b>${n - 2}</b> 个三角形 → 内角和 = ${n - 2} × 180° = <b>${sum}°</b>` +
        `（正 ${n} 边形每个内角 = ${fmt(sum / n, 1)}°）`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const n = state.n, R = Math.min(W, H) * 0.38, cx = W / 2, cy = H / 2 + 6;
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + i * 2 * Math.PI / n;
        pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
      }
      // 三角形扇区（交替着色）
      const cols = [T.c1, T.c2, T.c3, T.c5, T.c8, T.c7, T.c6, T.c4];
      for (let i = 1; i < n - 1; i++) {
        ctx.fillStyle = cols[(i - 1) % cols.length]; ctx.globalAlpha = 0.22;
        ctx.beginPath(); ctx.moveTo(...pts[0]); ctx.lineTo(...pts[i]); ctx.lineTo(...pts[i + 1]); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1;
      }
      // 对角线
      ctx.strokeStyle = T.muted; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
      for (let i = 2; i < n - 1; i++) {
        ctx.beginPath(); ctx.moveTo(...pts[0]); ctx.lineTo(...pts[i]); ctx.stroke();
      }
      ctx.setLineDash([]);
      // 外框
      ctx.strokeStyle = T.mod; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(...pts[0]);
      for (let i = 1; i <= n; i++) ctx.lineTo(...pts[i % n]);
      ctx.stroke();
      // 起点
      ctx.fillStyle = T.c6;
      ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], 5, 0, Math.PI * 2); ctx.fill();
      ctx.font = "600 12px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillStyle = T.c6;
      ctx.fillText("从这个顶点切", pts[0][0], pts[0][1] - 9);
    });
  }

  MathLab.register({
    id: "triangle",
    title: "三角形与平行线",
    question: "任何三角形，三个角加起来都恰好 180°——“恰好”从哪来？",
    grade: "七年级",
    domain: "图形与几何",
    emoji: "🔺",
    color: "c4",
    hook: `<p>撕下一个纸三角形的三个角，把它们拼在一起——不多不少，正好排成<b>一条直线</b>。</p>
      <p>换一个歪的、扁的、瘦长的三角形再撕，还是一条直线。这也太巧了吧？</p>
      <p>数学上没有"巧"。每一个"恰好"背后都藏着一个原因，而这个原因，出在两条<b>平行线</b>身上。</p>`,
    sections: [
      {
        kind: "concept", title: "先看平行线：方向相同的两条路",
        html: `<p>两条平行线，就是<b>方向完全相同</b>、永不相交的直线。用第三条直线去截它们，会切出一批角，其中最有用的是<b>内错角</b>（“Z”字的两个拐角）。</p>
        <div class="formula">两直线平行 ⟺ 内错角相等</div>
        <p>为什么相等？因为两条线方向相同，斜线穿过它们时的“转弯量”自然也相同——把其中一条沿斜线滑到另一条上，两个角会完全重合。</p>
        <p>这条看似平淡的性质，是一台"<b>角度搬运机</b>"：它能把一个角原封不动地搬到别的位置。马上就用它干一票大的。</p>`,
      },
      { kind: "lab", title: "怎么拖都是 180°", mount: mountSum,
        intro: `<p>拖动顶点 A，看三个角的度数此消彼长、总和纹丝不动。然后点开<b>平行线证明</b>。</p>`,
        try_: `开着证明拖动 A：蓝角、橙角被平行线搬到 A 点两侧，和红角拼成一个平角。180° 不是巧合，是"平角"这个事实借平行线现的身。撕角拼直线的小魔术，你现在知道后台了。` },
      {
        kind: "concept", title: "证明只有三步",
        html: `<ol>
          <li>过顶点 A 作一条<b>平行于 BC</b> 的直线；</li>
          <li>内错角相等：∠B 被搬到 A 的左侧，∠C 被搬到 A 的右侧；</li>
          <li>A 点处三个角拼成一条直线 = 平角 = 180°。完毕。</li>
        </ol>
        <p>注意这个证明<b>没有量任何一个角</b>——所以它对一切三角形成立，量一万个三角形也替代不了它。</p>
        <p>顺手赚一个<b>外角定理</b>：三角形的一个外角 = 与它不相邻的两个内角之和（因为外角 + 相邻内角 = 180° = 三内角之和，两边消去相邻角）。原理一次，结论成串。</p>`,
      },
      { kind: "lab", title: "多边形？也是三角形拼的", mount: mountPolygon,
        intro: `<p>任何多边形都能从一个顶点切成若干三角形。内角和 = 三角形个数 × 180°。</p>`,
        try_: `n 边形能切出几个三角形？找出规律（n − 2），你就自己推出了多边形内角和公式——不需要背。` },
    ],
    quiz: [
      { type: "mc", q: "三角形内角和恰好是 180°，根本原因是？", options: [
          "量了很多三角形，平均下来是 180°", "过顶点作平行线，内错角把三个角搬成一个平角",
          "这是数学家的规定", "只有规则三角形才是 180°"], answer: 1,
        explain: "平行线是“角度搬运机”：把 ∠B、∠C 原样搬到顶点 A 两侧，三个角拼出一条直线。<b>180° 就是平角的度数</b>，不是测量出来的巧合。" },
      { type: "num", q: "三角形两个内角分别是 55° 和 48°，第三个角是多少度？", answer: 77,
        explain: "180 − 55 − 48 = <b>77°</b>。知道两个角，第三个角没有选择的余地。" },
      { type: "mc", q: "平行线被第三条直线所截，内错角为什么相等？", options: [
          "纯属巧合", "两条线方向相同，斜线穿过时的“转弯量”一样",
          "所有内错角都相等，跟平行无关", "因为度数是规定好的"], answer: 1,
        explain: "平行 = 方向相同。沿斜线把一条线滑到另一条上，两个“Z 字拐角”完全重合。<b>不平行时内错角立刻不等</b>——所以这还能反过来当平行的判定用。" },
      { type: "num", q: "五边形的内角和是多少度？", answer: 540,
        explain: "从一个顶点切开：五边形分成 3 个三角形，内角和 = 3 × 180° = <b>540°</b>。公式 (n−2)×180° 就是“数三角形”。" },
      { type: "num", q: "等边三角形的每个内角是多少度？", answer: 60,
        explain: "三个角相等，总和 180°：每个 180 ÷ 3 = <b>60°</b>。" },
      { type: "mc", q: "三角形的一个外角等于？", options: [
          "与它相邻的内角", "与它不相邻的两个内角之和", "任意一个内角", "永远是 90°"], answer: 1,
        explain: "外角 + 相邻内角 = 平角 180° = 三个内角之和。两边同时消去相邻内角，剩下：<b>外角 = 不相邻两内角之和</b>。这是内角和定理的免费赠品。" },
    ],
  });
})();
