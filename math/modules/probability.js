/* 模块：概率 —— 不确定中的确定 */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;

  /* 实验一：抛硬币与大数定律 */
  function mountCoin(box) {
    const state = { heads: 0, total: 0, hist: [] }; // hist: [总次数, 频率]
    const canvas = makeCanvas(box, { aspect: 0.48 });
    const readout = el("div", { class: "readout" });
    function flip(n) {
      for (let i = 0; i < n; i++) {
        state.total++;
        if (Math.random() < 0.5) state.heads++;
        if (state.total <= 100 || state.total % Math.ceil(state.total / 400) === 0)
          state.hist.push([state.total, state.heads / state.total]);
      }
      state.hist.push([state.total, state.heads / state.total]);
      canvas.redraw(); update();
    }
    function reset() { state.heads = 0; state.total = 0; state.hist = []; canvas.redraw(); update(); }
    box.appendChild(ctrlRow(
      button("抛 1 次", () => flip(1)),
      button("抛 100 次", () => flip(100)),
      button("抛 10000 次", () => flip(10000), true),
      button("清零", reset),
    ));
    box.appendChild(readout);
    function update() {
      readout.innerHTML = state.total === 0
        ? "还没开始抛。先抛几次，看看频率有多“任性”。"
        : `已抛 <b>${state.total}</b> 次，正面 <b>${state.heads}</b> 次，频率 = <b>${fmt(state.heads / state.total, 4)}</b>（理论概率 0.5）`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const mL = 46, mR = 16, mT = 18, mB = 30;
      const pw = W - mL - mR, ph = H - mT - mB;
      // 轴
      ctx.strokeStyle = T.grid; ctx.lineWidth = 1;
      for (const fy of [0, 0.25, 0.5, 0.75, 1]) {
        const y = mT + ph * (1 - fy);
        ctx.beginPath(); ctx.moveTo(mL, y); ctx.lineTo(W - mR, y); ctx.stroke();
        ctx.fillStyle = T.muted; ctx.font = "10.5px system-ui"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
        ctx.fillText(fmt(fy, 2), mL - 6, y);
      }
      // 0.5 参考线
      ctx.strokeStyle = T.c6; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
      const y05 = mT + ph * 0.5;
      ctx.beginPath(); ctx.moveTo(mL, y05); ctx.lineTo(W - mR, y05); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = T.c6; ctx.font = "600 11px system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
      ctx.fillText("理论概率 0.5", mL + 4, y05 - 3);
      ctx.fillStyle = T.muted; ctx.font = "11px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("抛掷次数（对数刻度）→", W / 2, H - 16);
      if (!state.hist.length) return;
      // 频率曲线（x 对数刻度）
      const maxN = Math.max(10, state.total);
      const X = (n) => mL + pw * Math.log(n) / Math.log(maxN <= 10 ? 10 : maxN);
      ctx.strokeStyle = T.mod; ctx.lineWidth = 2;
      ctx.beginPath();
      state.hist.forEach(([n, f], i) => {
        const x = X(n), y = mT + ph * (1 - f);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke();
      const [ln, lf] = state.hist[state.hist.length - 1];
      ctx.fillStyle = T.mod;
      ctx.beginPath(); ctx.arc(X(ln), mT + ph * (1 - lf), 4.5, 0, Math.PI * 2); ctx.fill();
    });
  }

  /* 实验二：两个骰子的和 */
  function mountDice(box) {
    const state = { counts: new Array(13).fill(0), total: 0 };
    const canvas = makeCanvas(box, { aspect: 0.5 });
    const readout = el("div", { class: "readout" });
    const WAYS = [0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]; // 和为 s 的组合数（/36）
    function roll(n) {
      for (let i = 0; i < n; i++) {
        const s = 1 + Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6);
        state.counts[s]++; state.total++;
      }
      canvas.redraw(); update();
    }
    function reset() { state.counts.fill(0); state.total = 0; canvas.redraw(); update(); }
    box.appendChild(ctrlRow(
      button("掷 10 次", () => roll(10)),
      button("掷 1000 次", () => roll(1000), true),
      button("清零", reset),
    ));
    box.appendChild(readout);
    function update() {
      readout.innerHTML = state.total
        ? `已掷 <b>${state.total}</b> 次。空心方块 ▢ 是理论预言（比如“7”有 6/36 ≈ 16.7%）。掷得越多，实际越贴近预言。`
        : `“7”能由 1+6, 2+5, 3+4, 4+3, 5+2, 6+1 共 <b>6 种</b>方式组成，而“2”只有 1+1 一种——先猜猜柱子会长成什么形状？`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const mL = 30, mB = 34, mT = 16;
      const pw = W - mL - 16, ph = H - mT - mB;
      const bw = pw / 11;
      const maxF = 0.22;
      for (let s = 2; s <= 12; s++) {
        const x = mL + (s - 2) * bw;
        const f = state.total ? state.counts[s] / state.total : 0;
        const h = ph * Math.min(1, f / maxF);
        // 实际频率柱
        ctx.fillStyle = T.mod; ctx.globalAlpha = 0.75;
        const bx = x + bw * 0.18, bwid = bw * 0.64;
        ctx.beginPath(); ctx.roundRect(bx, mT + ph - h, bwid, h, [4, 4, 0, 0]); ctx.fill();
        ctx.globalAlpha = 1;
        // 理论值（空心框）
        const tf = WAYS[s] / 36;
        const th = ph * (tf / maxF);
        ctx.strokeStyle = T.c6; ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(bx - 2, mT + ph - th, bwid + 4, th);
        ctx.setLineDash([]);
        // 标签
        ctx.fillStyle = T.muted; ctx.font = "11px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText(String(s), x + bw / 2, mT + ph + 6);
        if (state.total) {
          ctx.fillStyle = T.sub; ctx.textBaseline = "bottom"; ctx.font = "10px system-ui";
          ctx.fillText(fmt(100 * f, 1) + "%", x + bw / 2, mT + ph - h - 2);
        }
      }
      ctx.strokeStyle = T.baseline; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(mL - 4, mT + ph); ctx.lineTo(W - 12, mT + ph); ctx.stroke();
      ctx.fillStyle = T.muted; ctx.font = "11px system-ui"; ctx.textAlign = "center";
      ctx.fillText("两个骰子的点数和", W / 2, H - 8);
    });
  }

  MathLab.register({
    id: "probability",
    title: "概率：不确定中的确定",
    question: "单次结果无法预测，一万次的整体却惊人地守规矩。",
    grade: "八～九年级",
    domain: "统计与概率",
    emoji: "🎲",
    color: "c5",
    hook: `<p>抛一枚硬币，下一次是正是反？<b>没人知道</b>——神仙也不知道。</p>
      <p>但如果抛一万次，正面大约几次？<b>五千次上下</b>——这几乎可以打包票。</p>
      <p>这就是概率论最迷人的地方：<b>单次混沌，长期有序</b>。赌场、保险公司、天气预报都靠这条原理吃饭：
      它们从不预测"某一次"，只预测"长期"。</p>`,
    sections: [
      {
        kind: "concept", title: "概率是什么：长期频率的“归宿”",
        html: `<p>说"正面的概率是 1/2"，<b>不是</b>说"每两次必有一次正面"。它的真正含义是：</p>
        <div class="formula">抛的次数越多，正面的频率就越稳定地贴近 1/2</div>
        <p>前 10 次可能 7 正 3 反（频率 0.7，很任性），但抛到一万次，频率几乎粘在 0.5 上。
        这条规律叫<b>大数定律</b>——它不是感觉，是可以亲眼看见的（下面就去看）。</p>
        <p>还有一个重要推论：硬币<b>没有记忆</b>。连出 5 次正面后，下一次正面的概率还是 1/2。
        觉得"该出反面了"是人类大脑的错觉，赌徒因此破产，所以它有个名字叫"赌徒谬误"。</p>`,
      },
      { kind: "lab", title: "亲眼看见大数定律", mount: mountCoin,
        intro: `<p>先抛 1 次、再抛几个 100 次，最后来一发 10000 次。盯着频率曲线的“脾气”。</p>`,
        try_: `前几十次曲线上蹿下跳，之后越来越平静地靠近 0.5。清零重来一遍——路径完全不同，归宿一模一样。这就是"不确定中的确定"。` },
      {
        kind: "concept", title: "怎么算概率：数清所有可能",
        html: `<p>当每种基本结果<b>等可能</b>时（骰子的六个面、硬币的两面），概率就是数数：</p>
        <div class="formula">概率 = 想要的结果数 ÷ 所有可能的结果数</div>
        <p>两个骰子的和一共有 6 × 6 = 36 种等可能组合。和为 7 的组合有 6 种（1+6 … 6+1），
        所以 P(和=7) = 6/36 = 1/6；而和为 2 只有 1+1 一种，P = 1/36。</p>
        <p><b>7 比 2 常见 6 倍，不是运气，是组合数。</b>骰子公平，但"和"不公平——因为通往它们的道路条数不同。</p>`,
      },
      { kind: "lab", title: "骰子的秘密形状", mount: mountDice,
        intro: `<p>掷两个骰子上千次，把每种"和"出现的频率画成柱子，再和理论预言（虚线框）比一比。</p>`,
        try_: `柱子长成了一座对称的小山，7 是山顶。玩大富翁该抢哪些格子，现在你有数学依据了。` },
    ],
    quiz: [
      { type: "mc", q: "“下雨概率 50%”的正确理解是？", options: [
          "半天下雨半天晴", "在大量相同的气象条件下，约一半的情况会下雨", "肯定下一半的雨", "气象台不确定，随便说的"], answer: 1,
        explain: "概率描述的是<b>长期频率</b>：同样的天气条件重复很多次，约一半会下雨。它不对“今天这一次”打包票。" },
      { type: "mc", q: "连续抛出 5 次正面之后，下一次抛出正面的概率是？", options: [
          "小于 1/2，该出反面了", "还是 1/2", "大于 1/2，正面手感来了", "无法确定"], answer: 1,
        explain: "硬币<b>没有记忆</b>，每次抛掷都是全新开始。“该出反面了”是赌徒谬误——大数定律靠未来的大量次数稀释波动，而不是靠“找补”。" },
      { type: "num", q: "掷两个骰子，和为 7 的概率是多少？（可输入分数如 1/6）", answer: 1 / 6, tol: 0.01,
        explain: "36 种等可能组合中有 6 种和为 7：P = 6/36 = <b>1/6</b>。数清所有可能，是等可能概率的全部秘密。" },
      { type: "mc", q: "为什么两个骰子的和是 7 最常见？", options: [
          "7 是幸运数字", "掷出 7 的组合方式最多（6 种）", "骰子被做了手脚", "纯属巧合"], answer: 1,
        explain: "1+6, 2+5, 3+4, 4+3, 5+2, 6+1——<b>6 条路</b>通向 7，而只有 1 条路（1+1）通向 2。路多者常至。" },
      { type: "num", q: "袋子里有 3 个红球、2 个白球，随机摸一个，摸到红球的概率是多少？（小数或分数）", answer: 0.6, tol: 0.01,
        explain: "5 个球等可能，红球占 3 个：P = 3/5 = <b>0.6</b>。" },
      { type: "mc", q: "某抽奖中奖率 1%。买 100 次，一定能中奖吗？", options: [
          "一定能中", "不一定——概率是长期频率，不是次数保证", "一定不能中", "买 100 次概率变成 100%"], answer: 1,
        explain: "每次都是独立的 1%。100 次全不中的概率是 0.99¹⁰⁰ ≈ 37%——比想象的大得多！概率给的是<b>期望</b>，不是承诺。" },
    ],
  });
})();
