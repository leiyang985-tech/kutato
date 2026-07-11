/* 模块：方程 —— 等式是一架天平 */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;

  /* 实验：天平解方程 */
  function mountBalance(box) {
    // 状态：两边各有若干个 x 砝码和数字砝码  a·x + b = c·x + d
    const state = { l: { x: 2, u: 3 }, r: { x: 0, u: 11 }, steps: 0, msg: "", won: false };
    const canvas = makeCanvas(box, { aspect: 0.52 });
    const readout = el("div", { class: "readout" });
    const eqLine = el("div", { class: "readout", style: "font-size:16px" });

    function eqText() {
      const side = (s) => {
        const parts = [];
        if (s.x) parts.push(s.x === 1 ? "x" : s.x + "x");
        if (s.u || !parts.length) parts.push(String(s.u));
        return parts.join(" + ");
      };
      return `${side(state.l)} = ${side(state.r)}`;
    }
    function newEq() {
      const x = 2 + Math.floor(Math.random() * 4);           // 解
      const a = 2 + Math.floor(Math.random() * 3);           // x 个数
      const b = 1 + Math.floor(Math.random() * 6);
      state.l = { x: a, u: b };
      state.r = { x: 0, u: a * x + b };
      state.steps = 0; state.msg = ""; state.won = false;
      update();
    }
    function apply(op) {
      if (state.won) return;
      const { l, r } = state;
      let ok = true;
      if (op.du) {
        if (l.u + op.du < 0 || r.u + op.du < 0) ok = false;
        else { l.u += op.du; r.u += op.du; }
      } else if (op.dx) {
        if (l.x + op.dx < 0 || r.x + op.dx < 0) ok = false;
        else { l.x += op.dx; r.x += op.dx; }
      } else if (op.div) {
        const d = op.div;
        if (l.x % d || l.u % d || r.x % d || r.u % d) ok = false;
        else { l.x /= d; l.u /= d; r.x /= d; r.u /= d; }
      }
      if (!ok) { state.msg = "⚠️ 这个操作两边做不了（会出现负砝码或除不尽）——换一个试试。"; }
      else {
        state.steps++;
        state.msg = "";
        if (l.x === 1 && l.u === 0 && r.x === 0) { state.won = true; }
        else if (r.x === 1 && r.u === 0 && l.x === 0) { [state.l, state.r] = [r, l]; state.won = true; }
      }
      update();
    }
    function update() {
      eqLine.innerHTML = `当前方程：<b>${eqText()}</b>`;
      readout.innerHTML = state.won
        ? `🎉 <b>解出来了：x = ${state.r.u}</b>（用了 ${state.steps} 步）。注意：你每一步都是"两边同时做同一件事"。`
        : state.msg || `目标：让左边只剩下 <b>1 个 x</b>。已用 ${state.steps} 步。`;
      canvas.redraw();
    }

    box.appendChild(eqLine);
    box.appendChild(ctrlRow(
      button("两边 −1", () => apply({ du: -1 })),
      button("两边 +1", () => apply({ du: +1 })),
      button("两边 −x", () => apply({ dx: -1 })),
      button("两边 ÷2", () => apply({ div: 2 })),
      button("两边 ÷3", () => apply({ div: 3 })),
      button("🔄 换一道题", () => newEq(), true),
    ));
    box.appendChild(readout);

    canvas.onDraw((ctx, W, H, T) => {
      const cy = H * 0.30, bw = W * 0.36;
      const lx = W / 2 - bw, rx = W / 2 + bw;
      const tilt = state.won ? 0 : 0; // 始终平衡（每步都合法）
      // 支架
      ctx.strokeStyle = T.baseline; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(W / 2, cy); ctx.lineTo(W / 2, H * 0.78); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W / 2 - 40, H * 0.78); ctx.lineTo(W / 2 + 40, H * 0.78); ctx.stroke();
      // 横梁
      ctx.strokeStyle = T.sub; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(lx, cy + tilt); ctx.lineTo(rx, cy - tilt); ctx.stroke();
      ctx.fillStyle = T.sub;
      ctx.beginPath(); ctx.arc(W / 2, cy, 6, 0, Math.PI * 2); ctx.fill();
      // 托盘
      const pan = (px, py) => {
        ctx.strokeStyle = T.baseline; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(px - 60, py + 26); ctx.lineTo(px, py); ctx.lineTo(px + 60, py + 26); ctx.stroke();
        ctx.strokeStyle = T.sub; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(px - 70, py + 28); ctx.lineTo(px + 70, py + 28); ctx.stroke();
        return py + 28;
      };
      const drawSide = (side, px, py) => {
        const baseY = pan(px, py);
        const items = [];
        for (let i = 0; i < side.x; i++) items.push("x");
        for (let i = 0; i < side.u; i++) items.push("1");
        const perRow = 6, s = 22;
        // 数字砝码合并显示（>6 个时）
        let drawn = items;
        if (side.u > 6) {
          drawn = [];
          for (let i = 0; i < side.x; i++) drawn.push("x");
          drawn.push("#" + side.u);
        }
        drawn.forEach((it, i) => {
          const row = Math.floor(i / perRow), col = i % perRow;
          const n = Math.min(drawn.length - row * perRow, perRow);
          const x = px + (col - (n - 1) / 2) * (s + 4);
          const y = baseY - 14 - row * (s + 4);
          if (it === "x") {
            ctx.fillStyle = T.mod;
            ctx.beginPath(); ctx.roundRect(x - s / 2, y - s / 2, s, s, 6); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.font = "700 13px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("x", x, y + 1);
          } else if (it[0] === "#") {
            ctx.fillStyle = T.c3;
            ctx.beginPath(); ctx.roundRect(x - s / 2 - 8, y - s / 2, s + 16, s, 6); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.font = "700 12px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(it.slice(1), x, y + 1);
          } else {
            ctx.fillStyle = T.c3;
            ctx.beginPath(); ctx.arc(x, y, s / 2 - 1, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.font = "700 11px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("1", x, y + 1);
          }
        });
      };
      drawSide(state.l, lx, cy + tilt);
      drawSide(state.r, rx, cy - tilt);
      ctx.fillStyle = T.muted; ctx.font = "12px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("左边", lx, H * 0.80);
      ctx.fillText("右边", rx, H * 0.80);
      ctx.fillText(state.won ? "⚖️ 平衡，且 x 已经独自站在一边" : "⚖️ 每一步都必须保持平衡", W / 2, H * 0.88);
    });

    newEq();
  }

  MathLab.register({
    id: "equations",
    title: "方程：天平的语言",
    question: "解方程不是背步骤——是拆一架永远保持平衡的天平。",
    grade: "七年级",
    domain: "数与代数",
    emoji: "⚖️",
    color: "c2",
    hook: `<p>玩个读心术：<b>心里想一个数</b> → 乘 2 → 加 6 → 除以 2 → 减去你最初想的数。</p>
      <p>我知道你的答案：<b>3</b>。不管你想的是 7、100 还是 −2。</p>
      <p>为什么？设你想的数是 x：(2x + 6) ÷ 2 − x = x + 3 − x = 3。x 被抵消了！
      这就是代数的威力——而<b>方程</b>做的是反向工作：已知结果，把未知数"倒推"出来。</p>`,
    sections: [
      {
        kind: "concept", title: "等式的本质：一架平衡的天平",
        html: `<p>等号"="不是"得出答案"的意思，它是一句陈述：<b>左右两边一样重</b>。</p>
        <p>方程 2x + 3 = 11 就是说：左盘放着 2 个未知砝码和 3 个 1 克砝码，右盘放着 11 个 1 克砝码，天平是平的。</p>
        <p><b>解方程 = 在保持平衡的前提下，让 x 独自留在一边。</b>只有一条铁律：</p>
        <div class="formula">对两边做同一件事，平衡就不会被破坏。</div>
        <p>两边同时减 3、同时除以 2、同时加一个 x……都可以。只动一边？天平立刻倾倒——等式就不成立了。</p>`,
      },
      { kind: "lab", title: "亲手拆天平", mount: mountBalance,
        intro: `<p>蓝色方块是未知砝码 x，黄色圆片是 1。用按钮对<b>两边同时</b>操作，把 x 孤立出来。</p>`,
        try_: `解出一道后点"换一道题"。想一想：为什么"两边 ÷2"有时点不动？（提示：砝码能被切成两半吗？）` },
      {
        kind: "concept", title: "“移项变号”其实根本不存在",
        html: `<p>课本说：把 +3 从左边"移"到右边要变成 −3。听起来像个魔法规则，其实它只是天平操作的<b>简写</b>：</p>
        <div class="formula">2x + 3 = 11 &nbsp;⟶&nbsp; 两边同时 −3 &nbsp;⟶&nbsp; 2x = 11 − 3</div>
        <p>左边的 +3 被减掉了，右边"多出"一个 −3。看起来像是 3"搬了家还变了号"，
        本质上是<b>两边同时减 3</b>。理解了这一点，你永远不会记错方向——因为没什么可记的。</p>
        <p>同一架天平还能解释：为什么两边不能同乘 0（所有信息都被抹掉，任何方程都变成 0 = 0），
        为什么除以含 x 的式子要小心（它可能是 0）。<b>原理一个，规则全通。</b></p>`,
      },
    ],
    quiz: [
      { type: "num", q: "解方程：3x − 7 = 8，x = ?", answer: 5,
        explain: "两边同 +7：3x = 15；两边同 ÷3：x = <b>5</b>。每步都是对两边做同一件事。" },
      { type: "mc", q: "“移项要变号”的本质是什么？", options: [
          "一条需要背下来的规定", "对等式两边同时加上（或减去）同一个数的简写",
          "为了让式子更好看", "只有考试里才用得到的技巧"], answer: 1,
        explain: "x + 3 = 8 两边同时 −3，左边的 3 消失、右边出现 −3。“移项变号”只是这个动作的<b>快捷说法</b>。" },
      { type: "mc", q: "下面哪个操作会“毁掉”一个方程？", options: [
          "两边同时加 3", "两边同时乘 0", "两边同时除以 5", "两边同时减 2x"], answer: 1,
        explain: "两边同乘 0 后，任何方程都变成 0 = 0——天平上的东西全被拿空，<b>x 的信息永远丢失</b>。其余操作都可逆、都保平衡。" },
      { type: "num", q: "解方程：5(x − 2) = 3x + 4，x = ?", answer: 7,
        explain: "先展开：5x − 10 = 3x + 4；两边同 −3x：2x − 10 = 4；两边同 +10：2x = 14；两边同 ÷2：x = <b>7</b>。" },
      { type: "mc", q: "小明解 x + 5 = 12 时，只在左边减了 5，得到 x = 12。他错在哪？", options: [
          "计算 12 − 5 算错了", "只动了天平的一边，平衡被破坏，等式不再成立",
          "应该在两边都加 5", "方程本身无解"], answer: 1,
        explain: "只在一边拿走砝码，天平立刻倾斜——新“等式”和原来那句话已经不是一回事了。必须<b>两边同时</b>减 5，得 x = 7。" },
      { type: "num", q: "一根绳子对折、再对折之后，量得长 3 米。绳子原来多长？（米）", answer: 12,
        explain: "设原长 x：对折两次是 x ÷ 4 = 3，两边同乘 4，x = <b>12</b>。列方程 = 把故事翻译成天平语言。" },
    ],
  });
})();
