/* 模块：统计 —— 平均数说了算吗 */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;

  /* 实验：富翁搬进小区（平均数 vs 中位数） */
  function mountMean(box) {
    // 7 户家庭的月收入（千元），最后一户可调
    const base = [3, 4, 4, 5, 6, 7];
    const state = { rich: 8 };
    const canvas = makeCanvas(box, { aspect: 0.46 });
    const readout = el("div", { class: "readout" });
    const sr = slider({ label: "第 7 户的收入 =", min: 8, max: 100, step: 1, value: 8,
      format: v => v + " 千", oninput: v => { state.rich = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(sr, el("span", { class: "ctl" }, "👆 也可以直接左右拖动黄色的点")));
    box.appendChild(readout);
    const geom = () => {
      const { W } = canvas.size();
      const maxV = Math.max(20, state.rich + 5);
      const mL = 30, mR = 20;
      return { maxV, mL, X: (v) => mL + (W - mL - mR) * v / maxV, span: W - mL - mR };
    };
    canvas.enableDrag({
      hit(x, y) {
        const { X } = geom();
        const { H } = canvas.size();
        return (Math.abs(x - X(state.rich)) < 22 && y > H * 0.52 - 70 && y < H * 0.52 + 12) ? "r" : null;
      },
      move(x) {
        const { maxV, mL, span } = geom();
        sr.set(Math.max(8, Math.min(100, Math.round((x - mL) / span * maxV))));
      },
    });
    const data = () => base.concat([state.rich]);
    const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
    const median = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
    function update() {
      const d = data(), m = mean(d), md = median(d);
      readout.innerHTML = `7 户收入：${base.join("、")}、<b>${state.rich}</b>（千元）　` +
        `平均数 = <b style="color:var(--c6)">${fmt(m, 1)} 千</b>　中位数 = <b style="color:var(--c1)">${md} 千</b>` +
        (m > 12 ? `　—— 平均数已经比 6 户人家的收入都高了，还能“代表”这个小区吗？` : "");
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const d = data(), m = mean(d), md = median(d);
      const maxV = Math.max(20, state.rich + 5);
      const mL = 30, mR = 20, y = H * 0.52;
      const X = (v) => mL + (W - mL - mR) * v / maxV;
      // 数轴
      ctx.strokeStyle = T.baseline; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(mL - 6, y); ctx.lineTo(W - mR + 6, y); ctx.stroke();
      ctx.font = "10.5px system-ui"; ctx.fillStyle = T.muted; ctx.textAlign = "center"; ctx.textBaseline = "top";
      const step = maxV > 40 ? 20 : 5;
      for (let v = 0; v <= maxV; v += step) {
        ctx.strokeStyle = T.baseline;
        ctx.beginPath(); ctx.moveTo(X(v), y - 4); ctx.lineTo(X(v), y + 4); ctx.stroke();
        ctx.fillText(v + "千", X(v), y + 8);
      }
      // 数据点（相同值向上叠放）
      const counts = {};
      for (const v of d) {
        counts[v] = (counts[v] || 0) + 1;
        const cy = y - 14 - (counts[v] - 1) * 16;
        ctx.fillStyle = v === state.rich && state.rich > 7 ? T.c3 : T.c2;
        ctx.beginPath(); ctx.arc(X(v), cy, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = T.surface; ctx.lineWidth = 1.5; ctx.stroke();
      }
      if (state.rich > 20) {
        ctx.fillStyle = T.c3; ctx.font = "12px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText("💰 富翁", X(state.rich), y - 26);
      }
      // 平均数：支点（数据的“重心”）
      ctx.fillStyle = T.c6;
      ctx.beginPath();
      ctx.moveTo(X(m), y + 6); ctx.lineTo(X(m) - 9, y + 24); ctx.lineTo(X(m) + 9, y + 24);
      ctx.closePath(); ctx.fill();
      ctx.font = "600 12px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(`平均数 ${fmt(m, 1)}`, X(m), y + 28);
      // 中位数：中间人
      ctx.strokeStyle = T.c1; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(md), y - 44); ctx.lineTo(X(md), y - 6); ctx.stroke();
      ctx.fillStyle = T.c1; ctx.textBaseline = "bottom";
      ctx.fillText(`中位数 ${md}`, X(md), y - 48);
    });
  }

  /* 实验二：两位神枪手（方差：平均数一样，脾气不同） */
  function mountVar(box) {
    const state = { s: 2 };
    const A = [7, 8, 8, 8, 9];                 // 稳定选手
    const PAT = [-2, 1, 2, -1, 0];             // B 的波动模式（和为 0，平均恒为 8）
    const canvas = makeCanvas(box, { aspect: 0.42 });
    const readout = el("div", { class: "readout" });
    const ss = slider({ label: "B 的发挥波动 =", min: 0, max: 2, step: 0.1, value: 2,
      oninput: v => { state.s = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(ss));
    box.appendChild(readout);
    const B = () => PAT.map(p => 8 + p * state.s);
    const variance = (arr) => {
      const m = arr.reduce((x, y) => x + y, 0) / arr.length;
      return arr.reduce((x, y) => x + (y - m) ** 2, 0) / arr.length;
    };
    function update() {
      const vA = variance(A), vB = variance(B());
      readout.innerHTML = `两人平均都是 <b>8 环</b>。方差：A = <b style="color:var(--c1)">${fmt(vA, 2)}</b>，B = <b style="color:var(--c8)">${fmt(vB, 2)}</b>` +
        `　→ 决赛派谁？${vB > vA ? "求稳选 <b>A</b>（方差小 = 发挥稳）" : "两人一样稳，都可以"}`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const m = 46, u = (W - 2 * m) / 8;
      const X = (v) => m + (v - 4) * u;
      const row = (data, y, color, name) => {
        ctx.strokeStyle = T.grid; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(X(4), y); ctx.lineTo(X(12), y); ctx.stroke();
        // 平均线
        ctx.strokeStyle = T.c6; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(X(8), y - 16); ctx.lineTo(X(8), y + 16); ctx.stroke();
        ctx.setLineDash([]);
        // 偏差须 + 点（相同值纵向错开）
        const seen = {};
        for (const v of data) {
          seen[v] = (seen[v] || 0) + 1;
          const dy = (seen[v] - 1) * 10;
          ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.globalAlpha = 0.45;
          ctx.beginPath(); ctx.moveTo(X(8), y - dy); ctx.lineTo(X(v), y - dy); ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.fillStyle = color;
          ctx.beginPath(); ctx.arc(X(v), y - dy, 6, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = T.surface; ctx.lineWidth = 1.5; ctx.stroke();
        }
        ctx.fillStyle = T.sub; ctx.font = "600 12px system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
        ctx.fillText(name, X(4), y - 20);
      };
      row(A, H * 0.34, T.c1, "选手 A（稳）");
      row(B(), H * 0.78, T.c8, "选手 B");
      ctx.fillStyle = T.muted; ctx.font = "11px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (let v = 4; v <= 12; v += 2) ctx.fillText(v + "环", X(v), H * 0.82 + 12);
      ctx.fillStyle = T.c6; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText("平均 8 环", X(8), H * 0.16);
    });
  }

  MathLab.register({
    id: "stats",
    title: "统计：平均数说了算吗",
    question: "数据不会说谎，但选错“代表”会。",
    grade: "八年级",
    domain: "统计与概率",
    emoji: "📊",
    color: "c7",
    hook: `<p>一个流传很广的段子：马云走进一家小酒馆，酒馆里每个人的“平均身家”立刻上亿。</p>
      <p>可酒馆里的人一分钱也没多。为什么一个数字能“骗人”？新闻里的“人均收入”，为什么很多人觉得自己“被平均”？</p>
      <p>问题不在数据，在于我们派了哪个数字去<b>代表</b>一堆数据。统计学的第一课，就是认识这些“代表”的脾气。</p>`,
    sections: [
      {
        kind: "concept", title: "三个“代表”，三种脾气",
        html: `<p>一堆数据想用一个数来概括，常见的代表有三位，它们回答的问题<b>各不相同</b>：</p>
        <ul>
          <li><b>平均数</b>：把总量在所有人之间<b>摊匀</b>。它是数据的“重心”——每个数都在拉它，谁离得远谁拉力大。</li>
          <li><b>中位数</b>：全体排队，<b>站中间</b>的那个人。它只看位置，不看两端的人多有钱、多贫穷。</li>
          <li><b>众数</b>：出现<b>次数最多</b>的值。鞋店老板最爱它——进货要进卖得最多的码。</li>
        </ul>
        <p>没有哪个代表“最好”，只有<b>哪个更适合当前的问题</b>。选错代表，数据就开始“说谎”。</p>`,
      },
      { kind: "lab", title: "富翁搬进小区", mount: mountMean,
        intro: `<p>小区 7 户人家，前 6 户月收入 3～7 千。拖动滑杆，让第 7 户从普通人变成富翁，盯着两个“代表”的反应。</p>`,
        try_: `把第 7 户拉到 100 千（十万）：红色三角（平均数）被远远拖走，蓝线（中位数）却一动不动。想一想为什么——平均数是"重心"，远处一个重物就能撬动它；中位数只关心"谁站中间"，两端的人再极端也换不了中间人。` },
      { kind: "lab", title: "两位神枪手：平均一样，脾气不同", mount: mountVar,
        intro: `<p>A、B 两位选手各打 5 枪，平均都是 8 环。拖动"波动"滑杆，看 B 的成绩散开——须线越长，离平均越远。</p>`,
        try_: `平均数相同时，还需要一个数来描述"散得开不开"——这就是<b>方差</b>：把每个偏差平方后再平均（平方是为了让正负偏差不互相抵消，还顺便放大了大偏差的存在感）。决赛要求稳，你派谁？` },
      {
        kind: "concept", title: "原理的复用：现实里的选择题",
        html: `<ul>
          <li><b>比赛评分去掉最高最低分</b>：平均数怕极端值，砍掉两端再平均，防止个别评委“一票撬动重心”。</li>
          <li><b>报道居民收入常用中位数</b>：少数高收入会把平均数拉得“好看”，中位数更接近普通人的体感。</li>
          <li><b>班级平均分</b>：没有极端值时，平均数公平又好算——它并不总是坏人。</li>
        </ul>
        <p>下次看到任何“平均××”，先问一句：<b>这堆数据里有没有“马云”？</b>有，就再去找中位数看看。这一问，你已经比很多大人会读数据了。</p>`,
      },
    ],
    quiz: [
      { type: "num", q: "求 3、5、7、9、6 的平均数。", answer: 6,
        explain: "总和 30 摊给 5 个数：30 ÷ 5 = <b>6</b>。平均数 = 把总量摊匀。" },
      { type: "num", q: "求 1、3、5、7、9、11 的中位数。", answer: 6,
        explain: "排好队后中间有<b>两个</b>人（5 和 7），中位数取它们的平均：(5+7) ÷ 2 = <b>6</b>。偶数个数据时“中间人”是两个人的正中间。" },
      { type: "mc", q: "小区 9 户月收入都在 5 千左右，第 10 户月收入 100 万。想描述“普通住户的收入水平”，最该用哪个代表？", options: [
          "平均数", "中位数", "最大值", "总和"], answer: 1,
        explain: "平均数会被 100 万拖到十万级——比 9 户人家都高，谁也代表不了。<b>中位数只看排队站中间的人</b>，极端值动不了它。" },
      { type: "mc", q: "歌唱比赛为什么要去掉一个最高分、一个最低分再算平均？", options: [
          "为了让计算更简单", "平均数对极端值敏感，个别评委的极端打分会拉偏结果，砍掉两端保护代表性",
          "是一种比赛仪式", "防止选手得满分"], answer: 1,
        explain: "平均数是“重心”，一个极端分就能撬动它。去掉两端 = 拆掉撬棍。这和收入统计用中位数，是<b>同一个原理的两种对策</b>。" },
      { type: "mc", q: "鞋店老板想决定哪个尺码进货最多，他最需要哪个统计量？", options: [
          "平均数", "中位数", "众数", "方差"], answer: 2,
        explain: "老板关心的是“<b>哪个码卖得最多</b>”——这正是众数回答的问题。平均码可能是 41.7，可没有 41.7 码的鞋。" },
      { type: "mc", q: "平均数的本质是什么？", options: [
          "最大值和最小值的正中间", "把总量在所有成员之间摊匀，是数据的“重心”",
          "出现次数最多的数", "排序后中间的数"], answer: 1,
        explain: "平均数 = 总量 ÷ 个数，相当于“大家把钱放一起再平分”。作为重心，<b>每个数据都在拉它</b>——这既是它公平的地方，也是它怕极端值的原因。" },
      { type: "mc", q: "两位选手平均环数都是 8，决赛想求稳，应该看哪个指标选人？", options: [
          "谁的最高分更高", "谁的方差更小（发挥更稳定）", "谁的名字好听", "平均数一样就随便选"], answer: 1,
        explain: "平均数只说“整体水平”，<b>方差说“稳不稳”</b>。方差小 = 每次都在平均值附近 = 决赛不容易失手。" },
      { type: "mc", q: "计算方差时，为什么要把每个偏差先“平方”再平均？", options: [
          "让数字变大更好看", "正负偏差直接相加会互相抵消成 0，平方后都变成正数（还放大了大偏差）",
          "传统习惯", "为了开根号方便"], answer: 1,
        explain: "偏差有正有负，直接平均永远得 0——什么也测不出来。<b>平方让所有偏差都“现形”</b>，而且离得越远罚得越重。" },
    ],
  });
})();
