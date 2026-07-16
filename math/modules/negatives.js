/* 模块：负数与数轴 —— 数是位置，运算是移动 */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;

  function mountNumberLine(box) {
    const state = { a: 3, b: -5, mode: "add" };
    const canvas = makeCanvas(box, { aspect: 0.40 });

    const readout = el("div", { class: "readout" });
    const modeBtns = {};
    const setMode = (m) => {
      state.mode = m;
      for (const [k, b] of Object.entries(modeBtns)) b.className = "btn" + (k === m ? " primary" : "");
      canvas.redraw(); update();
    };
    modeBtns.add = button("a + b（先走 a，再走 b）", () => setMode("add"));
    modeBtns.sub = button("a − b（走 a，再反着走 b）", () => setMode("sub"));
    modeBtns.abs = button("|a|（离家多远）", () => setMode("abs"));

    const sa = slider({ label: "a =", min: -6, max: 6, step: 1, value: state.a, oninput: v => { state.a = v; canvas.redraw(); update(); } });
    const sb = slider({ label: "b =", min: -6, max: 6, step: 1, value: state.b, oninput: v => { state.b = v; canvas.redraw(); update(); } });

    box.appendChild(ctrlRow(modeBtns.add, modeBtns.sub, modeBtns.abs));
    box.appendChild(ctrlRow(sa, sb));
    box.appendChild(readout);

    function update() {
      const { a, b, mode } = state;
      if (mode === "add") readout.innerHTML = `从 0 出发走 <b>${a}</b>，再走 <b>${b}</b>：${a} + (${b}) = <b>${a + b}</b> —— 加正数向右，加负数向左。`;
      else if (mode === "sub") readout.innerHTML = `${a} − (${b}) = ${a} + (${-b}) = <b>${a - b}</b> —— 减去 b 就是"把 b 的移动反过来做"。`;
      else readout.innerHTML = `|${a}| = <b>${Math.abs(a)}</b> —— 绝对值不问方向，只问"离 0 有多远"。所以 |−7| = |7|。`;
    }
    update();

    function arrow(ctx, x1, x2, y, color, label) {
      if (Math.abs(x2 - x1) < 1) return;
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
      const dir = Math.sign(x2 - x1);
      ctx.beginPath();
      ctx.moveTo(x2, y); ctx.lineTo(x2 - 8 * dir, y - 4.5); ctx.lineTo(x2 - 8 * dir, y + 4.5);
      ctx.closePath(); ctx.fill();
      if (label) {
        ctx.font = "600 12px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText(label, (x1 + x2) / 2, y - 6);
      }
    }

    canvas.onDraw((ctx, W, H, T) => {
      const m = 34, u = (W - 2 * m) / 24, y = H * 0.62;
      const px = (x) => m + (x + 12) * u;
      // 数轴
      ctx.strokeStyle = T.baseline; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(m - 10, y); ctx.lineTo(W - m + 10, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W - m + 10, y); ctx.lineTo(W - m + 2, y - 4); ctx.moveTo(W - m + 10, y); ctx.lineTo(W - m + 2, y + 4); ctx.stroke();
      ctx.font = "11px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (let x = -12; x <= 12; x++) {
        ctx.strokeStyle = T.baseline;
        ctx.beginPath(); ctx.moveTo(px(x), y - (x === 0 ? 7 : 4)); ctx.lineTo(px(x), y + (x === 0 ? 7 : 4)); ctx.stroke();
        if (x % 2 === 0) { ctx.fillStyle = x === 0 ? T.ink : T.muted; ctx.fillText(String(x), px(x), y + 10); }
      }
      const { a, b, mode } = state;
      if (mode === "abs") {
        ctx.strokeStyle = T.c2; ctx.lineWidth = 6; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(px(0), y - 22); ctx.lineTo(px(a), y - 22); ctx.stroke();
        ctx.fillStyle = T.c2; ctx.font = "600 13px system-ui"; ctx.textBaseline = "bottom";
        ctx.fillText(`距离 = ${Math.abs(a)}`, px(a / 2), y - 30);
      } else {
        const b2 = mode === "sub" ? -b : b;
        arrow(ctx, px(0), px(a), y - 26, T.c1, `走 ${a}`);
        arrow(ctx, px(a), px(a + b2), y - 52, T.c8, mode === "sub" ? `反向走 ${b}（即 ${b2 >= 0 ? "+" : ""}${b2}）` : `再走 ${b}`);
        // 落点
        ctx.setLineDash([3, 3]); ctx.strokeStyle = T.muted; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px(a + b2), y - 52); ctx.lineTo(px(a + b2), y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = T.ink;
        ctx.beginPath(); ctx.arc(px(a + b2), y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.font = "700 13px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText(`结果 ${a + b2}`, px(a + b2), y + 24);
      }
      // 原点
      ctx.fillStyle = T.mod;
      ctx.beginPath(); ctx.arc(px(0), y, 3.5, 0, Math.PI * 2); ctx.fill();
    });
  }

  MathLab.register({
    id: "negatives",
    title: "负数与数轴",
    question: "数不够用了怎么办？数学家的答案是：发明新的数。",
    grade: "七年级",
    domain: "数与代数",
    emoji: "🌡️",
    color: "c1",
    hook: `<p>电梯里有 <b>−1 层</b>，天气预报说 <b>−5℃</b>，游戏里你可能"欠"金币。可是数数只能数出 1、2、3……</p>
      <p>几千年里人类只用正数。直到有一天，人们发现"<b>比 0 还少</b>"的情况到处都是：欠债、地下室、零下的温度。
      于是数学家做了一件大胆的事——<b>发明新的数</b>，并规定它们的运算规则要让原来的规则继续成立。</p>
      <p>这一招（旧数不够用 → 造新数 → 保持旧规则）以后还会反复出现：分数、无理数，甚至更远的地方。</p>`,
    sections: [
      {
        kind: "concept", title: "数是位置，运算是移动",
        html: `<p>把所有数排在一条直线上，这就是<b>数轴</b>。它一举解决了三个问题：</p>
        <ul>
          <li><b>每个数是一个位置</b>：0 是家，正数在右边，负数在左边。</li>
          <li><b>加法是移动</b>：加 3 就是向右走 3 步，加 −3 就是向左走 3 步。</li>
          <li><b>减法是反向移动</b>：减去一个数 = 加上它的相反数。所以 3 − (−5) = 3 + 5。</li>
        </ul>
        <div class="formula">a − b = a + (−b) &nbsp;&nbsp;（减法只是"反着走"的加法）</div>
        <p><b>相反数</b>就是关于 0 的镜像：5 和 −5。照两次镜子回到自己，所以 −(−a) = a。</p>
        <p><b>绝对值</b> |a| 只回答一个问题："离家（0）多远？"——它不关心方向，所以永远不会是负数。</p>`,
      },
      { kind: "lab", title: "数轴上的移动游戏", mount: mountNumberLine,
        intro: `<p>拖动 a、b，切换三种模式，看着箭头在数轴上"走"。</p>`,
        try_: `设 a = 3、b = −5，用"a − b"模式算 3 − (−5)。为什么答案比 3 还大？再想想：−7 和 −2 谁更大？（提示：看谁在右边）` },
      {
        kind: "concept", title: "为什么“负负得正”不是硬性规定",
        html: `<p>很多人以为"负负得正"是背下来的口诀。其实它是<b>被逼出来的</b>——为了让旧规则继续成立。</p>
        <p>看这个规律（每行答案比上一行多 3）：</p>
        <div class="formula">3 × (−3) = −9，&nbsp; 2 × (−3) = −6，&nbsp; 1 × (−3) = −3，&nbsp; 0 × (−3) = 0，&nbsp; (−1) × (−3) = <b>?</b></div>
        <p>如果规律要继续（这正是分配律的要求），下一个只能是 <b>+3</b>。所以"负负得正"不是有人拍脑袋规定的，
        而是<b>唯一能让乘法规则保持一致的选择</b>。数学里几乎所有"规定"背后都有这样的理由。</p>`,
      },
    ],
    quiz: [
      { type: "num", q: "早上气温 3℃，一股冷空气让气温下降了 8℃，现在是多少℃？", answer: -5,
        explain: "在数轴上从 3 向<b>左</b>走 8 步：3 − 8 = −5。温度计就是一根竖着的数轴。" },
      { type: "mc", q: "−7 和 −2，哪个更大？", options: ["−7", "−2", "一样大", "负数不能比大小"], answer: 1,
        explain: "数轴上<b>越靠右越大</b>。−2 在 −7 的右边，所以 −2 &gt; −7。欠 2 块钱总比欠 7 块钱\"富有\"。" },
      { type: "num", q: "计算：(−4) + 9 = ?", answer: 5,
        explain: "从 −4 出发向右走 9 步，经过 0，落在 <b>5</b>。加正数 = 向右移动。" },
      { type: "num", q: "计算：3 − (−5) = ?", answer: 8,
        explain: "减去 −5 = 加上它的相反数 +5：3 + 5 = <b>8</b>。\"反向的反向\"就是原方向。" },
      { type: "mc", q: "|x| = 6，那么 x 是多少？", options: ["只能是 6", "只能是 −6", "6 或 −6", "无解"], answer: 2,
        explain: "绝对值问的是\"离 0 多远\"。离 0 距离为 6 的位置有<b>两个</b>：右边的 6 和左边的 −6。" },
      { type: "mc", q: "为什么数学上规定\"负负得正\"？", options: [
          "数学家投票表决的结果", "为了让乘法的旧规律（如分配律）继续成立，这是唯一自洽的选择",
          "因为考试需要一个统一答案", "没有原因，纯粹是约定俗成"], answer: 1,
        explain: "看序列 3×(−3)=−9, 2×(−3)=−6, 1×(−3)=−3, 0×(−3)=0……每次多 3，下一个 (−1)×(−3) 只能是 <b>+3</b>。规则是被一致性\"逼\"出来的。" },
      { type: "mc", q: "−(−a) 等于什么？", options: ["−a", "a", "0", "不确定"], answer: 1,
        explain: "取相反数 = 照镜子。照<b>两次</b>镜子，回到自己：−(−a) = a。" },
    ],
  });
})();
