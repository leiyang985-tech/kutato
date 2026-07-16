/* 模块：二元一次方程组 —— 鸡兔同笼 */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;

  /* 实验：鸡兔同笼（拖动鸡的数量，凑出 94 只脚） */
  function mountCage(box) {
    const state = { j: 20 }; // 鸡数，兔 = 35 - j
    const HEADS = 35, FEET = 94;
    const canvas = makeCanvas(box, { aspect: 0.40 });
    const readout = el("div", { class: "readout" });
    const sj = slider({ label: "假设鸡有", min: 0, max: 35, step: 1, value: 20,
      format: v => v + " 只", oninput: v => { state.j = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(sj, el("span", { class: "ctl" }, "👆 也可以直接拖动图中的分界线")));
    box.appendChild(readout);
    const feet = () => 2 * state.j + 4 * (HEADS - state.j);
    function update() {
      const f = feet(), d = f - FEET;
      readout.innerHTML = `鸡 <b>${state.j}</b> 只 + 兔 <b>${HEADS - state.j}</b> 只 = 35 个头 ✓　脚：2×${state.j} + 4×${HEADS - state.j} = <b>${f}</b> 只` +
        (d === 0 ? `　🎉 <b>正好 94 只脚！鸡 23、兔 12，就是答案</b>`
          : d > 0 ? `　比 94 <b style="color:var(--bad)">多 ${d}</b> —— 兔太多了，把分界线往右拖（换成鸡）`
          : `　比 94 <b style="color:var(--c1)">少 ${-d}</b> —— 鸡太多了，把分界线往左拖（换成兔）`);
    }
    update();
    const geom = () => {
      const { W } = canvas.size();
      const mL = 30, mR = 30;
      return { mL, span: W - mL - mR, X: (v) => mL + (W - mL - mR) * v / HEADS };
    };
    canvas.enableDrag({
      hit(x) {
        const { X } = geom();
        return Math.abs(x - X(state.j)) < 24 ? "j" : null;
      },
      move(x) {
        const { mL, span } = geom();
        sj.set(Math.max(0, Math.min(HEADS, Math.round((x - mL) / span * HEADS))));
      },
    });
    canvas.onDraw((ctx, W, H, T) => {
      const { X } = geom();
      const y0 = H * 0.24, bh = H * 0.24;
      // 头的条（鸡 | 兔）
      ctx.fillStyle = T.c3; ctx.globalAlpha = 0.55;
      ctx.beginPath(); ctx.roundRect(X(0), y0, X(state.j) - X(0), bh, [8, 0, 0, 8]); ctx.fill();
      ctx.fillStyle = T.c5;
      ctx.beginPath(); ctx.roundRect(X(state.j), y0, X(35) - X(state.j), bh, [0, 8, 8, 0]); ctx.fill();
      ctx.globalAlpha = 1;
      // 分界线手柄
      ctx.strokeStyle = T.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(X(state.j), y0 - 10); ctx.lineTo(X(state.j), y0 + bh + 10); ctx.stroke();
      ctx.fillStyle = T.ink;
      ctx.beginPath(); ctx.arc(X(state.j), y0 - 14, 7, 0, Math.PI * 2); ctx.fill();
      ctx.font = "600 12.5px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = T.ink;
      if (state.j > 3) ctx.fillText(`🐔 × ${state.j}`, (X(0) + X(state.j)) / 2, y0 + bh / 2);
      if (state.j < 32) ctx.fillText(`🐰 × ${35 - state.j}`, (X(state.j) + X(35)) / 2, y0 + bh / 2);
      ctx.fillStyle = T.muted; ctx.font = "11.5px system-ui"; ctx.textBaseline = "bottom";
      ctx.fillText("35 个头（拖黑线换鸡兔）", W / 2, y0 - 18);
      // 脚数条：目标 94 与当前
      const y1 = H * 0.68, maxF = 140;
      const FX = (v) => X(0) + (X(35) - X(0)) * v / maxF;
      ctx.fillStyle = T.grid;
      ctx.beginPath(); ctx.roundRect(FX(0), y1, FX(maxF) - FX(0), 14, 7); ctx.fill();
      const f = feet();
      ctx.fillStyle = f === 94 ? T.good : T.mod;
      ctx.beginPath(); ctx.roundRect(FX(0), y1, Math.max(8, FX(f) - FX(0)), 14, 7); ctx.fill();
      // 目标线
      ctx.strokeStyle = T.c6; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(FX(94), y1 - 8); ctx.lineTo(FX(94), y1 + 22); ctx.stroke();
      ctx.fillStyle = T.c6; ctx.font = "600 12px system-ui"; ctx.textBaseline = "bottom"; ctx.textAlign = "center";
      ctx.fillText("目标 94 只脚", FX(94), y1 - 10);
      ctx.fillStyle = T.sub; ctx.textBaseline = "top";
      ctx.fillText(`当前 ${f} 只脚`, FX(Math.min(f, maxF)), y1 + 24);
    });
  }

  MathLab.register({
    id: "systems",
    title: "方程组：鸡兔同笼",
    question: "一个未知数不够用的时候，两个条件如何“锁定”答案？",
    grade: "七年级",
    domain: "数与代数",
    emoji: "🐰",
    color: "c2",
    hook: `<p>一千五百年前，《孙子算经》出了道题：<b>鸡兔同笼，上有 35 个头，下有 94 只脚，问鸡兔各几只？</b></p>
      <p>笨办法是一只只试。古人的妙招是"抬脚法"：让每只动物都<b>抬起两只脚</b>——
      地上还剩 94 − 70 = 24 只脚。鸡已经全部"悬空"了，剩下的脚全是兔子的，每只兔还站着 2 只，所以兔 = 24 ÷ 2 = <b>12 只</b>！</p>
      <p>这个漂亮的小把戏，正是"方程组"和"消元"的雏形。</p>`,
    sections: [
      {
        kind: "concept", title: "为什么需要两个方程",
        html: `<p>设鸡 x 只、兔 y 只。只知道"35 个头"（x + y = 35）够吗？不够——
        鸡 1 兔 34、鸡 2 兔 33……有<b>无穷多组</b>都满足它。一个方程只能画出一条线，锁不住答案。</p>
        <p>再加上"94 只脚"（2x + 4y = 94），两个条件同时成立的组合就只剩<b>一个</b>了。</p>
        <div class="formula">一个未知数 ⟶ 一个方程；两个未知数 ⟶ 两个方程才能锁定</div>
        <p>这个道理很深：<b>几个未知量，就需要几条独立的信息</b>。以后你解一切"多个未知数"的问题，都从数条件开始。</p>`,
      },
      { kind: "lab", title: "亲手关一笼鸡兔", mount: mountCage,
        intro: `<p>35 个头固定不变（第一个条件自动满足）。拖动分界线调整鸡兔比例，让脚数正好落在 94（第二个条件）。</p>`,
        try_: `找到答案后想一想：每把一只鸡换成兔，脚数增加几只？（4 − 2 = 2）从"全是鸡"（70 只脚）出发，需要换几只才到 94？（24 ÷ 2 = 12）——你自己推出了"抬脚法"！` },
      {
        kind: "concept", title: "消元：把两个条件合成一个",
        html: `<p>“抬脚法”翻译成代数，就是<b>消元</b>——想办法消掉一个未知数，回到熟悉的一元方程：</p>
        <div class="formula">x + y = 35 两边同乘 2 → 2x + 2y = 70；用 2x + 4y = 94 减去它 → 2y = 24 → y = 12</div>
        <p>“相减”合法的原因还是天平：两边减去的是<b>相等的量</b>（70 和 2x+2y 一样重）。</p>
        <p>另一条路叫<b>代入</b>：由 x + y = 35 得 x = 35 − y，把它塞进第二个方程——同样消掉了 x。
        殊途同归：<b>方程组的全部解法，都是想办法回到一个未知数</b>。</p>
        <p>图像视角（呼应一次函数）：两个方程是两条直线，方程组的解就是它们的<b>交点</b> (23, 12)。</p>`,
      },
    ],
    quiz: [
      { type: "num", q: "鸡兔同笼：35 个头，94 只脚，兔子有几只？", answer: 12,
        explain: "抬脚法：全体抬两脚，地上剩 94 − 70 = 24 只脚，全是兔子的（每只还站 2 只）→ 兔 = <b>12</b>。这就是消元。" },
      { type: "mc", q: "两个未知数为什么需要两个方程？", options: [
          "题目喜欢凑对", "一个方程有无穷多组解（一条线），第二个条件才能把它锁定到一点",
          "两个方程算起来快", "其实一个方程就够"], answer: 1,
        explain: "x + y = 35 自己有无穷多组解。每个独立条件划掉一批可能，<b>几个未知量就需要几条独立信息</b>。" },
      { type: "mc", q: "“抬脚法”的数学本质是什么？", options: [
          "让动物休息", "消元——组合两个条件，消去其中一个未知数", "列表枚举", "画图猜测"], answer: 1,
        explain: "“每只抬两脚”= 从总脚数里减去 2×(头数)，鸡的贡献被<b>整体消掉</b>，剩下的全关于兔——一元方程立刻可解。" },
      { type: "num", q: "解方程组：x + y = 10，x − y = 2。x = ?", answer: 6,
        explain: "两式<b>相加</b>：2x = 12 → x = <b>6</b>（y 被消掉了）。相加合法：两边加的都是相等的量。" },
      { type: "mc", q: "在图像上，二元一次方程组的解对应什么？", options: [
          "两条直线的交点", "直线和 x 轴的交点", "图像最高点", "任何一点"], answer: 0,
        explain: "每个方程是一条直线（一堆解），同时满足两个方程 = 同时在两条线上 = <b>交点</b>。代数与几何又一次会师。" },
      { type: "num", q: "方程组：3x + 2y = 12，y = 3。代入后 x = ?", answer: 2,
        explain: "把 y = 3 <b>代入</b>：3x + 6 = 12 → x = <b>2</b>。代入 = 用相等的东西替换，天平依然平衡。" },
    ],
  });
})();
