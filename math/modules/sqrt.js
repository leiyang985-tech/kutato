/* 模块：平方根与无理数 —— 数又不够用了 */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;

  /* 实验一：夹逼 √2（拖动猜测值） */
  function mountGuess(box) {
    const state = { g: 1.5 };
    const canvas = makeCanvas(box, { aspect: 0.42 });
    const readout = el("div", { class: "readout" });
    const sg = slider({ label: "猜边长 g =", min: 1, max: 2, step: 0.001, value: 1.5,
      format: v => fmt(v, 3), oninput: v => { state.g = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(sg, el("span", { class: "ctl" }, "👆 也可以直接拖数轴上的点")));
    box.appendChild(readout);
    function update() {
      const g = state.g, g2 = g * g, d = g2 - 2;
      readout.innerHTML = `g² = ${fmt(g2, 4)}` +
        (Math.abs(d) < 0.003 ? `　🎉 <b>非常接近了！</b>但无论多准，g² 永远不会恰好等于 2——√2 的小数没有尽头`
          : d > 0 ? `　比 2 <b style="color:var(--bad)">大</b>，边长猜大了，往左一点` :
            `　比 2 <b style="color:var(--c1)">小</b>，边长猜小了，往右一点`);
    }
    update();
    const geom = () => {
      const { W } = canvas.size();
      const m = 40;
      return { m, span: W - 2 * m, px: (v) => m + (W - 2 * m) * (v - 1) };
    };
    canvas.enableDrag({
      hit(x, y) {
        const { px } = geom();
        const { H } = canvas.size();
        return (Math.abs(x - px(state.g)) < 22 && Math.abs(y - H * 0.66) < 30) ? "g" : null;
      },
      move(x) {
        const { m, span } = geom();
        sg.set(Math.max(1, Math.min(2, 1 + (x - m) / span)));
      },
    });
    canvas.onDraw((ctx, W, H, T) => {
      const { px } = geom();
      const y = H * 0.66;
      // 面积对比方块（左侧示意）
      const s0 = H * 0.30;
      const sq = (x0, side, color, label) => {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.globalAlpha = 0.25; ctx.fillStyle = color;
        ctx.fillRect(x0, y - 34 - side, side, side);
        ctx.globalAlpha = 1;
        ctx.strokeRect(x0, y - 34 - side, side, side);
        ctx.fillStyle = T.sub; ctx.font = "11px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText(label, x0 + side / 2, y - 38 - side);
      };
      const unit = s0 / Math.SQRT2;
      sq(30, unit * state.g, T.mod, `面积 ${fmt(state.g * state.g, 3)}`);
      sq(40 + unit * 2.1, s0, T.c6, "目标面积 2");
      // 数轴 1..2
      ctx.strokeStyle = T.baseline; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px(1) - 8, y); ctx.lineTo(px(2) + 8, y); ctx.stroke();
      ctx.font = "11px system-ui"; ctx.fillStyle = T.muted; ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (let v = 1; v <= 2.001; v += 0.1) {
        ctx.strokeStyle = T.baseline;
        ctx.beginPath(); ctx.moveTo(px(v), y - 4); ctx.lineTo(px(v), y + 4); ctx.stroke();
        ctx.fillText(fmt(v, 1), px(v), y + 8);
      }
      // √2 的真实位置（细红线）
      ctx.strokeStyle = T.c6; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(px(Math.SQRT2), y - 26); ctx.lineTo(px(Math.SQRT2), y + 6); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = T.c6; ctx.font = "600 11.5px system-ui"; ctx.textBaseline = "bottom";
      ctx.fillText("√2 藏在这", px(Math.SQRT2), y - 28);
      // 猜测点
      const close = Math.abs(state.g * state.g - 2) < 0.003;
      ctx.fillStyle = close ? T.good : T.mod;
      ctx.beginPath(); ctx.arc(px(state.g), y, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = T.surface; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = close ? T.good : T.mod; ctx.font = "700 12px system-ui"; ctx.textBaseline = "top";
      ctx.fillText(`g = ${fmt(state.g, 3)}`, px(state.g), y + 18);
    });
  }

  /* 实验二：用圆规把 √2 放上数轴（勾股定理客串） */
  function mountCompass(box) {
    const state = { t: 0 };
    const canvas = makeCanvas(box, { aspect: 0.5 });
    const readout = el("div", { class: "readout" });
    const st = slider({ label: "转动圆规", min: 0, max: 1, step: 0.01, value: 0,
      format: v => v === 0 ? "起" : v === 1 ? "落" : "…", oninput: v => { state.t = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(st));
    box.appendChild(readout);
    function update() {
      readout.innerHTML = state.t >= 1
        ? `对角线落在了数轴的 <b>√2 ≈ 1.414</b> 处——一个"写不尽"的数，却有<b>分毫不差的位置</b>。`
        : `单位正方形（边长 1）的对角线，由勾股定理：√(1² + 1²) = <b>√2</b>。把它转下来……`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const m = 46, u = (W - 2 * m) / 2.6, y = H * 0.78;
      const px = (v) => m + v * u;
      // 数轴 0..2.6
      ctx.strokeStyle = T.baseline; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px(0) - 8, y); ctx.lineTo(px(2.6) + 8, y); ctx.stroke();
      ctx.font = "11px system-ui"; ctx.fillStyle = T.muted; ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (let v = 0; v <= 2.5; v += 0.5) {
        ctx.strokeStyle = T.baseline;
        ctx.beginPath(); ctx.moveTo(px(v), y - 4); ctx.lineTo(px(v), y + 4); ctx.stroke();
        ctx.fillText(fmt(v, 1), px(v), y + 8);
      }
      // 单位正方形
      ctx.strokeStyle = T.c1; ctx.lineWidth = 2;
      ctx.globalAlpha = 0.2; ctx.fillStyle = T.c1;
      ctx.fillRect(px(0), y - u, u, u);
      ctx.globalAlpha = 1;
      ctx.strokeRect(px(0), y - u, u, u);
      ctx.fillStyle = T.sub; ctx.font = "11.5px system-ui";
      ctx.textBaseline = "bottom"; ctx.fillText("1 × 1", px(0.5), y - u - 4);
      // 对角线 + 圆弧（从对角线位置扫到数轴）
      const a0 = -Math.PI / 4, a1 = 0; // 对角线角度 → 数轴
      const a = a0 + (a1 - a0) * state.t;
      const L = Math.SQRT2 * u;
      ctx.strokeStyle = T.c6; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(px(0), y); ctx.lineTo(px(0) + L * Math.cos(a), y + L * Math.sin(a)); ctx.stroke();
      // 弧线轨迹
      ctx.strokeStyle = T.c6; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.arc(px(0), y, L, a0, a); ctx.stroke();
      ctx.setLineDash([]);
      // 落点
      if (state.t >= 1) {
        ctx.fillStyle = T.good;
        ctx.beginPath(); ctx.arc(px(Math.SQRT2), y, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = T.surface; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = T.good; ctx.font = "700 12.5px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText("√2 ≈ 1.414", px(Math.SQRT2), y + 22);
      }
      ctx.fillStyle = T.muted; ctx.font = "11.5px system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText("圆规扎在 0，张开到对角线的长度，一转——", px(0), 14);
    });
  }

  MathLab.register({
    id: "sqrt",
    title: "平方根与无理数",
    question: "面积为 2 的正方形，边长是多少？这个问题逼疯过古希腊人。",
    grade: "七～八年级",
    domain: "数与代数",
    emoji: "🧮",
    color: "c1",
    hook: `<p>画一个面积恰好为 2 的正方形，它的边长是多少？</p>
      <p>1.4² = 1.96，小了；1.5² = 2.25，大了；1.41²…1.414²…<b>永远差一点点</b>。
      古希腊人证明了一件可怕的事：这个数<b>不能写成任何分数</b>。传说泄露这个秘密的希帕索斯被扔进了大海。</p>
      <p>眼熟吗？<b>数又不够用了。</b>和当年发明负数一样，数学家的解法照旧：接纳新的数（无理数），并保持旧规则成立。这一次，数轴终于被填满了。</p>`,
    sections: [
      {
        kind: "concept", title: "平方根：面积问边长",
        html: `<p>平方是"边长问面积"（3 → 9），<b>平方根就是反过来"面积问边长"</b>（9 → 3）。</p>
        <div class="formula">若 x² = a（a ≥ 0），则 x 是 a 的平方根；记号 √a 表示其中<b>非负</b>的那个</div>
        <p>注意：正数的平方根有<b>两个</b>！9 的平方根是 3 和 −3（负负得正，(−3)² 也是 9）。
        而 √9 这个记号约定只取正的 3——一个是"所有答案"，一个是"记号规定"，考试最爱考这个区别。</p>`,
      },
      { kind: "lab", title: "夹逼 √2：一场永远差一点的追捕", mount: mountGuess,
        intro: `<p>拖动猜测值 g，让正方形面积 g² 尽量接近 2。左边的方块实时对比大小。</p>`,
        try_: `你能让 g² 显示 2.0000 吗？试试 1.414、1.4142……每多对一位，就更近一步，但永远到不了终点。√2 = 1.41421356…无限不循环——这就是<b>无理数</b>。` },
      {
        kind: "concept", title: "写不尽的数，却有精确的位置",
        html: `<p>“无限不循环”听起来虚无缥缈，但 √2 在数轴上有<b>一个分毫不差的位置</b>——用勾股定理就能亲手把它放上去：</p>
        <ol>
          <li>画一个边长为 1 的正方形；</li>
          <li>它的对角线 = √(1² + 1²) = √2（勾股定理客串！）；</li>
          <li>圆规扎在 0，张开到对角线长，往数轴上一转——落点就是 √2。</li>
        </ol>
        <p>有理数（分数）看似排得密密麻麻，其实数轴上还有无数"缝隙"，√2、√3、π 都住在缝里。
        <b>有理数 + 无理数 = 实数</b>，数轴这才被真正填满。</p>`,
      },
      { kind: "lab", title: "用圆规捉住 √2", mount: mountCompass,
        intro: `<p>拖动滑杆，把单位正方形的对角线"转"到数轴上。</p>`,
        try_: `落点为什么恰好是 √2？（对角线有多长？谁告诉你的？）再想想：怎么用同样的办法在数轴上作出 √5？（提示：1×2 长方形的对角线）` },
    ],
    quiz: [
      { type: "num", q: "√64 = ?", answer: 8,
        explain: "问：谁的平方是 64？8² = 64，√ 记号取非负的那个：<b>8</b>。" },
      { type: "mc", q: "9 的平方根是？", options: ["只有 3", "只有 −3", "3 和 −3", "81"], answer: 2,
        explain: "3² = 9，(−3)² = 9（负负得正！）——平方根有<b>两个</b>。而记号 √9 约定只取正的 3。“平方根”和“√”不是一回事。" },
      { type: "mc", q: "√2 是一个什么样的数？", options: [
          "分数，只是分母很大", "无限不循环小数（无理数），不能写成分数",
          "等于 1.414", "不存在的数"], answer: 1,
        explain: "古希腊人证明了 √2 若能写成最简分数会自相矛盾。1.414 只是它的<b>近似值</b>——真身是写不尽的无理数。" },
      { type: "num", q: "面积为 25 的正方形，边长是多少？", answer: 5,
        explain: "边长 = √面积 = √25 = <b>5</b>。平方根就是“面积问边长”。" },
      { type: "mc", q: "√2 写不尽小数，为什么却说它在数轴上有精确位置？", options: [
          "其实没有精确位置", "单位正方形的对角线长就是 √2，用圆规一转就落在数轴上",
          "计算器算出来的", "因为它约等于 1.414"], answer: 1,
        explain: "勾股定理给出对角线 = √2，圆规把这个<b>长度</b>原样搬到数轴上——位置精确，只是十进制写不完它而已。" },
      { type: "num", q: "√2 ≈ ?（保留两位小数）", answer: 1.41, tol: 0.005,
        explain: "1.41² = 1.9881，1.42² = 2.0164 → √2 ≈ <b>1.41</b>。夹逼法：两边包抄，步步逼近。" },
      { type: "mc", q: "发明负数和接纳无理数，数学家用的是同一个套路。是哪个？", options: [
          "投票表决", "旧的数不够用了 → 引入新的数，并让旧规则继续成立", "抛硬币决定", "直接忽略这些问题"], answer: 1,
        explain: "减不动了 → 负数；开方开不尽 → 无理数。每次都是<b>“扩军”并保持规则一致</b>。这个套路你已经见过两次了——它还会再来。" },
    ],
  });
})();
