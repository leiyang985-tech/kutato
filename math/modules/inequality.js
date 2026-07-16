/* 模块：不等式 —— 会翻转的天平 */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;

  /* 实验一：数轴上的解集（拖边界点和检验点） */
  function mountSet(box) {
    const state = { a: 2, t: 4, rel: ">=" };
    const canvas = makeCanvas(box, { aspect: 0.34 });
    const readout = el("div", { class: "readout" });
    const RELS = [["<", "x < a"], ["<=", "x ≤ a"], [">", "x > a"], [">=", "x ≥ a"]];
    const btns = {};
    const setRel = (r) => {
      state.rel = r;
      for (const [k, b] of Object.entries(btns)) b.className = "btn" + (k === r ? " primary" : "");
      canvas.redraw(); update();
    };
    RELS.forEach(([r, lab]) => { btns[r] = button(lab, () => setRel(r)); });
    box.appendChild(ctrlRow(...Object.values(btns), el("span", { class: "ctl" }, "👆 拖动橙色边界点和蓝色检验点")));
    box.appendChild(readout);
    const ok = (t) => state.rel === "<" ? t < state.a : state.rel === "<=" ? t <= state.a
      : state.rel === ">" ? t > state.a : t >= state.a;
    function update() {
      const relTxt = { "<": "小于", "<=": "小于等于", ">": "大于", ">=": "大于等于" }[state.rel];
      readout.innerHTML = `解集：所有${relTxt} <b>${state.a}</b> 的数（一整段，不是一个点！）　` +
        `检验：x = ${state.t} ${ok(state.t) ? '<b style="color:var(--good)">✓ 是解</b>' : '<b style="color:var(--bad)">✗ 不是解</b>'}` +
        `　边界圈：${state.rel.includes("=") ? "实心（含 a 本身）" : "空心（不含 a 本身）"}`;
    }
    update();
    const geom = () => {
      const { W } = canvas.size();
      const m = 36, u = (W - 2 * m) / 16;
      return { m, u, px: (x) => m + (x + 8) * u, inv: (p) => (p - m) / u - 8 };
    };
    canvas.enableDrag({
      hit(x, y) {
        const { px } = geom();
        const { H } = canvas.size();
        const yy = H * 0.58;
        if (Math.hypot(x - px(state.t), y - (yy - 30)) < 22) return "t";
        if (Math.hypot(x - px(state.a), y - yy) < 22) return "a";
        return null;
      },
      move(x, _, h) {
        const { inv } = geom();
        const v = Math.max(-8, Math.min(8, Math.round(inv(x))));
        if (h === "a") state.a = v; else state.t = v;
        update();
      },
    });
    canvas.onDraw((ctx, W, H, T) => {
      const { u, px } = geom();
      const y = H * 0.58;
      // 数轴
      ctx.strokeStyle = T.baseline; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px(-8) - 8, y); ctx.lineTo(px(8) + 10, y); ctx.stroke();
      ctx.font = "11px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (let x = -8; x <= 8; x++) {
        ctx.strokeStyle = T.baseline;
        ctx.beginPath(); ctx.moveTo(px(x), y - 4); ctx.lineTo(px(x), y + 4); ctx.stroke();
        if (x % 2 === 0) { ctx.fillStyle = T.muted; ctx.fillText(String(x), px(x), y + 8); }
      }
      // 解集射线
      const right = state.rel.includes(">");
      ctx.strokeStyle = T.mod; ctx.lineWidth = 6; ctx.lineCap = "round";
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.moveTo(px(state.a) + (right ? 10 : -10), y - 14);
      ctx.lineTo(right ? px(8) + 6 : px(-8) - 6, y - 14);
      ctx.stroke(); ctx.globalAlpha = 1;
      // 箭头
      const ex = right ? px(8) + 6 : px(-8) - 6, dir = right ? 1 : -1;
      ctx.fillStyle = T.mod;
      ctx.beginPath(); ctx.moveTo(ex + 8 * dir, y - 14); ctx.lineTo(ex, y - 19); ctx.lineTo(ex, y - 9); ctx.closePath(); ctx.fill();
      // 边界点（空心/实心）
      ctx.lineWidth = 3;
      ctx.strokeStyle = T.c8; ctx.fillStyle = state.rel.includes("=") ? T.c8 : T.surface;
      ctx.beginPath(); ctx.arc(px(state.a), y - 14, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = T.c8; ctx.font = "600 12px system-ui"; ctx.textBaseline = "bottom";
      ctx.fillText(`a = ${state.a}`, px(state.a), y - 28);
      // 检验点
      const good = ok(state.t);
      ctx.fillStyle = good ? T.good : T.bad;
      ctx.beginPath(); ctx.arc(px(state.t), y - 30 - 14, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = T.surface; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = good ? T.good : T.bad; ctx.textBaseline = "bottom"; ctx.font = "700 12px system-ui";
      ctx.fillText(`${state.t} ${good ? "✓" : "✗"}`, px(state.t), y - 56);
    });
  }

  /* 实验二：乘负数 = 数轴镜像翻转 */
  function mountFlip(box) {
    const state = { m: 2 };
    const canvas = makeCanvas(box, { aspect: 0.40 });
    const readout = el("div", { class: "readout" });
    const A = 1, B = 3; // 固定 1 < 3
    const sm = slider({ label: "两边同乘 m =", min: -2, max: 2, step: 0.1, value: 2,
      oninput: v => { state.m = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(sm));
    box.appendChild(readout);
    function update() {
      const m = state.m, a = A * m, b = B * m;
      const cmp = a < b ? "<" : a > b ? ">" : "=";
      readout.innerHTML = `原来：1 <b>&lt;</b> 3。两边同乘 ${fmt(m, 1)}：${fmt(a, 1)} <b>${cmp === "<" ? "&lt;" : cmp === ">" ? "&gt;" : "="}</b> ${fmt(b, 1)}` +
        (m < 0 ? `　<b style="color:var(--bad)">顺序翻转了！</b>乘负数 = 关于 0 镜像，左右互换` :
          m === 0 ? "　⚠️ 全被压到 0，大小关系直接消失——所以不等式两边不能乘 0" :
          "　顺序没变（乘正数只是拉伸）");
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const m2 = 36, u = (W - 2 * m2) / 14, y1 = H * 0.32, y2 = H * 0.72;
      const px = (x) => m2 + (x + 7) * u;
      for (const [y, label] of [[y1, "原来"], [y2, `同乘 ${fmt(state.m, 1)}`]]) {
        ctx.strokeStyle = T.baseline; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(px(-7), y); ctx.lineTo(px(7), y); ctx.stroke();
        ctx.fillStyle = T.muted; ctx.font = "11px system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
        ctx.fillText(label, px(-7), y - 8);
        // 0 刻度
        ctx.strokeStyle = T.muted;
        ctx.beginPath(); ctx.moveTo(px(0), y - 5); ctx.lineTo(px(0), y + 5); ctx.stroke();
        ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText("0", px(0), y + 7);
      }
      const dot = (x, y, c, lab) => {
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(px(x), y, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = T.surface; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = c; ctx.font = "600 12px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText(lab, px(x), y - 10);
      };
      dot(A, y1, T.c1, "1"); dot(B, y1, T.c8, "3");
      const a = A * state.m, b = B * state.m;
      // 映射连线
      ctx.setLineDash([4, 4]); ctx.strokeStyle = T.grid; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px(A), y1 + 8); ctx.lineTo(px(a), y2 - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px(B), y1 + 8); ctx.lineTo(px(b), y2 - 8); ctx.stroke();
      ctx.setLineDash([]);
      dot(a, y2, T.c1, fmt(a, 1)); dot(b, y2, T.c8, fmt(b, 1));
      if (state.m < 0) {
        ctx.fillStyle = T.bad; ctx.font = "700 13px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText("蓝橙互换了位置 —— 顺序翻转！", W / 2, y2 + 16);
      }
    });
  }

  MathLab.register({
    id: "inequality",
    title: "不等式：会翻转的天平",
    question: "生活里“不等”比“相等”多得多——身高限制、限速、预算。",
    grade: "七年级",
    domain: "数与代数",
    emoji: "🎢",
    color: "c3",
    hook: `<p>游乐园过山车门口立着牌子：<b>身高 ≥ 120cm 才能乘坐</b>。</p>
      <p>它没说你必须多高，只圈出了一个<b>范围</b>。限速 ≤ 60、电量 ≥ 20%、预算 &lt; 100 元……
      生活里到处是"不等"。方程回答"恰好是多少"，<b>不等式回答"哪些都可以"</b>。</p>
      <p>它的解不是一个数，而是<b>一整群数</b>——这是它和方程最大的不同。</p>`,
    sections: [
      {
        kind: "concept", title: "解集：数轴上的一段光",
        html: `<p>x ≥ 2 的解有多少个？2、2.5、3、100、一万……<b>无穷多个</b>。要一次画出全部解，只能用数轴：</p>
        <ul>
          <li>从边界 2 出发，向右的整条<b>射线</b>都是解；</li>
          <li>边界点画<b>实心</b>（≥ 含等号，2 自己也算）或<b>空心</b>（&gt; 不含，2 自己不算）。</li>
        </ul>
        <p>大部分规则和方程共用：两边同加减一个数、同乘除一个<b>正数</b>，不等号方向都不变——天平的老规矩。</p>`,
      },
      { kind: "lab", title: "圈出所有可以的数", mount: mountSet,
        intro: `<p>选一种不等号，拖动<b>橙色边界点</b>改变 a，再拖<b>检验点</b>去试探——落在"光带"里就是解。</p>`,
        try_: `把检验点正好拖到边界 a 上，再切换 &gt; 和 ≥：一个 ✗ 一个 ✓。空心还是实心，差的就是这一个点。` },
      {
        kind: "concept", title: "唯一的新规矩：乘负数要翻转",
        html: `<p>方程的规则里只有一条在不等式里"变了脸"：</p>
        <div class="formula">两边同乘（或除以）一个<b>负数</b>，不等号方向要翻转</div>
        <p>为什么？因为<b>乘负数 = 关于 0 做镜像</b>。照镜子后左右互换：本来在左边（较小）的，镜子里跑到了右边（较大）。</p>
        <p>例：1 &lt; 3，两边乘 −1，得 −1 和 −3。数轴上 −1 在 −3 的<b>右边</b>，所以 −1 &gt; −3——方向翻了。
        这不是新规定，是镜像的必然结果。下面亲眼看。</p>`,
      },
      { kind: "lab", title: "镜子里的大小关系", mount: mountFlip,
        intro: `<p>1 &lt; 3 是铁的事实。拖动乘数 m 从 2 一路滑到 −2，盯着两个点的位置关系。</p>`,
        try_: `m 划过 0 的瞬间发生了什么？两个点先"挤"到一起（0 处），再交换左右——这就是翻转的全过程。顺便想想：为什么 m = 0 时不等式会被"毁掉"？` },
    ],
    quiz: [
      { type: "num", q: "解不等式：x + 3 < 8，解集是 x < ▢", answer: 5,
        explain: "两边同减 3（天平老规矩，方向不变）：x < <b>5</b>。解是 5 左边的<b>所有</b>数。" },
      { type: "mc", q: "为什么不等式两边乘以负数要把不等号翻转？", options: [
          "课本规定的，记住就行", "乘负数相当于关于 0 做镜像，左右互换，大小关系自然反过来",
          "为了和方程区分开", "只有特殊的不等式才需要翻转"], answer: 1,
        explain: "1 &lt; 3 两边乘 −1 → −1 和 −3：镜像后原来靠左的到了右边。<b>翻转不是规定，是镜子的物理属性</b>。" },
      { type: "mc", q: "x ≥ 2 在数轴上应该画成？", options: [
          "2 处实心点，向右的射线", "2 处空心点，向右的射线",
          "2 处实心点，向左的射线", "只画一个点 2"], answer: 0,
        explain: "≥ 含等号 → 边界 2 本身是解 → <b>实心</b>；比 2 大的都在右边 → 射线向<b>右</b>。解集是一整段，不是一个点。" },
      { type: "num", q: "解不等式：−2x > 6，解集是 x < ▢", answer: -3,
        explain: "两边同除以 −2——除的是<b>负数</b>，不等号翻转：x < <b>−3</b>。忘了翻转，答案正好错成反面。" },
      { type: "mc", q: "“身高 h 至少 120cm 才能乘坐”，用不等式表示是？", options: [
          "h > 120", "h ≥ 120", "h < 120", "h = 120"], answer: 1,
        explain: "“至少 120”= 120 也行、比 120 高也行 → h <b>≥</b> 120。恰好 120cm 的孩子能不能玩，就看这个等号。" },
      { type: "mc", q: "不等式的解和方程的解，最大的不同是？", options: [
          "不等式的解更难算", "方程的解通常是个别的数，不等式的解通常是一整段范围",
          "不等式没有解", "没有区别"], answer: 1,
        explain: "方程问“恰好”，答案常是一两个点；不等式问“哪些都行”，答案是数轴上<b>一整段光</b>。所以不等式的答案要用范围（x < 5）来写。" },
    ],
  });
})();
