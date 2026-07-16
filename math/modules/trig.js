/* 模块：锐角三角函数 —— 把角度变成数 */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;
  const D2R = Math.PI / 180;

  /* 实验一：角度定，比值就定（拖斜边端点改角度，滑杆改大小） */
  function mountRatio(box) {
    const state = { deg: 35, k: 1 };
    const canvas = makeCanvas(box, { aspect: 0.52 });
    const readout = el("div", { class: "readout" });
    const sd = slider({ label: "角度 θ =", min: 10, max: 75, step: 1, value: 35,
      format: v => v + "°", oninput: v => { state.deg = v; canvas.redraw(); update(); } });
    const sk = slider({ label: "三角形大小 =", min: 0.5, max: 1.6, step: 0.05, value: 1,
      format: v => "×" + fmt(v, 2), oninput: v => { state.k = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(sd, sk, el("span", { class: "ctl" }, "👆 也可以直接拖斜边顶端")));
    box.appendChild(readout);
    const geom = () => {
      const { W, H } = canvas.size();
      const base = Math.min(W * 0.42, H * 0.62);
      return { ox: W * 0.12, oy: H * 0.82, base };
    };
    function sides() {
      const t = state.deg * D2R;
      const adj = 10 * state.k, opp = adj * Math.tan(t), hyp = adj / Math.cos(t);
      return { adj, opp, hyp };
    }
    function update() {
      const { adj, opp, hyp } = sides();
      readout.innerHTML = `对边 ${fmt(opp, 2)}　邻边 ${fmt(adj, 2)}　斜边 ${fmt(hyp, 2)}　→　` +
        `tan θ = 对/邻 = <b>${fmt(Math.tan(state.deg * D2R), 3)}</b>　` +
        `sin θ = 对/斜 = <b>${fmt(Math.sin(state.deg * D2R), 3)}</b>　` +
        `cos θ = 邻/斜 = <b>${fmt(Math.cos(state.deg * D2R), 3)}</b>` +
        `　—— 拖“大小”滑杆：边全变，<b>比值纹丝不动</b>`;
    }
    update();
    canvas.enableDrag({
      hit(x, y) {
        const { ox, oy, base } = geom();
        const t = state.deg * D2R, w = base * state.k;
        const tx = ox + w, ty = oy - w * Math.tan(t);
        return Math.hypot(x - tx, y - ty) < 28 ? "tip" : null;
      },
      move(x, y) {
        const { ox, oy } = geom();
        const deg = Math.atan2(oy - y, Math.max(20, x - ox)) / D2R;
        sd.set(Math.max(10, Math.min(75, Math.round(deg))));
      },
    });
    canvas.onDraw((ctx, W, H, T) => {
      const { ox, oy, base } = geom();
      const t = state.deg * D2R;
      // 参考大三角形（虚线，大小 ×1.6 表示"放大也一样"）
      const drawTri = (w, color, alpha, lw, dash) => {
        const h = w * Math.tan(t);
        ctx.strokeStyle = color; ctx.lineWidth = lw;
        if (dash) ctx.setLineDash([5, 4]);
        ctx.globalAlpha = alpha;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + w, oy); ctx.lineTo(ox + w, oy - h); ctx.closePath(); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
        return h;
      };
      drawTri(base * 1.6, T.muted, 0.5, 1, true);
      const w = base * state.k, h = w * Math.tan(t);
      // 当前三角形
      ctx.fillStyle = T.mod; ctx.globalAlpha = 0.12;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + w, oy); ctx.lineTo(ox + w, oy - h); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      drawTri(w, T.mod, 1, 2.5, false);
      // 边标注
      ctx.font = "600 12px system-ui"; ctx.textAlign = "center";
      ctx.fillStyle = T.c8; ctx.textBaseline = "top"; ctx.fillText("邻边", ox + w / 2, oy + 8);
      ctx.fillStyle = T.c2; ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.fillText("对边", ox + w + 8, oy - h / 2);
      ctx.fillStyle = T.c6; ctx.textAlign = "right"; ctx.fillText("斜边", ox + w / 2 - 10, oy - h / 2 - 10);
      // 角度弧
      ctx.strokeStyle = T.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(ox, oy, 30, -t, 0); ctx.stroke();
      ctx.fillStyle = T.ink; ctx.font = "700 13px system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(`θ = ${state.deg}°`, ox + 38, oy - 14);
      // 直角标记 + 拖拽手柄
      ctx.strokeStyle = T.muted; ctx.lineWidth = 1.5;
      ctx.strokeRect(ox + w - 12, oy - 12, 12, 12);
      ctx.fillStyle = T.mod;
      ctx.beginPath(); ctx.arc(ox + w, oy - h, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = T.surface; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(ox + w, oy - h, 8, 0, Math.PI * 2); ctx.stroke();
    });
  }

  /* 实验二：不爬楼测楼高 */
  function mountTower(box) {
    const state = { deg: 40 };
    const DIST = 20, EYE = 1.5;
    const canvas = makeCanvas(box, { aspect: 0.46 });
    const readout = el("div", { class: "readout" });
    const sd = slider({ label: "仰角 =", min: 15, max: 70, step: 1, value: 40,
      format: v => v + "°", oninput: v => { state.deg = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(sd));
    box.appendChild(readout);
    const height = () => DIST * Math.tan(state.deg * D2R) + EYE;
    function update() {
      readout.innerHTML = `楼高 = 距离 × tan(仰角) + 眼高 = 20 × tan ${state.deg}° + 1.5 = 20 × ${fmt(Math.tan(state.deg * D2R), 3)} + 1.5 = <b>${fmt(height(), 1)} 米</b>` +
        `　—— 一个量角器 + 一把卷尺，就能"量"到摸不着的高度。`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const t = state.deg * D2R;
      const hTower = height();
      const u = Math.min((W - 120) / (DIST + 4), (H - 50) / (hTower + 2));
      const gy = H - 26, x0 = 50;
      const X = (v) => x0 + v * u, Y = (v) => gy - v * u;
      // 地面
      ctx.strokeStyle = T.baseline; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(20, gy); ctx.lineTo(W - 16, gy); ctx.stroke();
      // 楼
      ctx.fillStyle = T.c8; ctx.globalAlpha = 0.45;
      ctx.fillRect(X(DIST), Y(hTower), 3 * u, hTower * u);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = T.c8; ctx.lineWidth = 2;
      ctx.strokeRect(X(DIST), Y(hTower), 3 * u, hTower * u);
      // 人
      ctx.fillStyle = T.sub;
      ctx.beginPath(); ctx.arc(X(0), Y(EYE), 5, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = T.sub;
      ctx.beginPath(); ctx.moveTo(X(0), Y(EYE) + 5); ctx.lineTo(X(0), gy); ctx.stroke();
      // 视线
      ctx.setLineDash([5, 4]); ctx.strokeStyle = T.c6; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X(0), Y(EYE)); ctx.lineTo(X(DIST), Y(hTower)); ctx.stroke();
      // 水平参考线
      ctx.strokeStyle = T.muted;
      ctx.beginPath(); ctx.moveTo(X(0), Y(EYE)); ctx.lineTo(X(DIST), Y(EYE)); ctx.stroke();
      ctx.setLineDash([]);
      // 仰角弧
      ctx.strokeStyle = T.c6;
      ctx.beginPath(); ctx.arc(X(0), Y(EYE), 34, -t, 0); ctx.stroke();
      ctx.fillStyle = T.c6; ctx.font = "600 12px system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(`仰角 ${state.deg}°`, X(0) + 40, Y(EYE) - 12);
      // 标注
      ctx.fillStyle = T.sub; ctx.font = "11.5px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("距离 20 米", X(DIST / 2), gy + 6);
      ctx.textBaseline = "bottom";
      ctx.fillText(`? 米`, X(DIST) + 1.5 * u, Y(hTower) - 6);
    });
  }

  MathLab.register({
    id: "trig",
    title: "锐角三角函数",
    question: "怎么用一个数描述“陡不陡”？相似的故事还有续集。",
    grade: "九年级",
    domain: "图形与几何",
    emoji: "⛰️",
    color: "c5",
    hook: `<p>30° 的滑梯和 60° 的滑梯，哪个刺激？当然是陡的。但"陡"怎么用<b>数</b>来说？</p>
      <p>工程师的答案：<b>每往前走 1 米，升高多少米</b>——这个比值就是坡度。国家标准规定无障碍坡道不得陡于 1:12，
      说的正是这个比值。</p>
      <p>而"角度 → 比值"的对应关系，就是三角函数。它是<b>相似</b>的直接续集：角度一定，形状就定，比值就定。</p>`,
    sections: [
      {
        kind: "concept", title: "角度定了，比值就被锁死",
        html: `<p>在直角三角形里，只要一个锐角 θ 定了，三个角就全定了（内角和！），于是<b>形状</b>定了——
        所有这样的三角形彼此<b>相似</b>，边的<b>比值</b>完全一样，跟三角形画多大毫无关系。</p>
        <p>于是每个比值都成了只关于角度的"函数"（输入角度 → 输出比值，又是规则机器！）：</p>
        <div class="formula">tan θ = 对边/邻边（坡度）　　sin θ = 对边/斜边　　cos θ = 邻边/斜边</div>
        <p>先认识 tan 就够了：它就是"陡的程度"。tan 45° = 1（每走 1 升 1，四十五度坡）；角度越大 tan 越大。</p>`,
      },
      { kind: "lab", title: "边在变，比值不动", mount: mountRatio,
        intro: `<p>拖<b>斜边顶端</b>改变角度，拖"大小"滑杆缩放三角形（虚线是放大 1.6 倍的参考）。盯着三个比值。</p>`,
        try_: `把角度固定在 35°，来回拉"大小"：三条边的长度全在变，三个比值却一位小数都不动——这就是"三角函数只认角度"的意思，也是查表/按计算器有意义的原因。再看看：sin 和 cos 为什么永远小于 1？（哪条边最长？）` },
      { kind: "lab", title: "不爬楼，量楼高", mount: mountTower,
        intro: `<p>站在离楼 20 米处，用量角器测得楼顶仰角 θ，眼睛离地 1.5 米。楼高 = 20·tan θ + 1.5。</p>`,
        try_: `泰勒斯量金字塔靠影子（要等太阳），现在你用角度——任何时刻都能量。仰角 45° 时楼高多少？为什么这个角最好算？（tan 45° = 1）` },
      {
        kind: "concept", title: "一张“角度→比值”对照表，用了两千年",
        html: `<p>既然比值只由角度决定，就可以<b>一次算好，永远查用</b>：古希腊人造了最早的三角函数表，
        今天它装进了每台计算器。三个特殊角建议当朋友记住（都能用一个三角形推出来，不用死背）：</p>
        <div class="formula">sin 30° = 1/2　　tan 45° = 1　　cos 60° = 1/2</div>
        <p>用它能做的事：测山高、测河宽、导航定位、游戏里的角色移动、屋顶斜度设计……
        <b>凡是"角度"和"长度"要互相换算的地方，三角函数就是那座桥。</b></p>`,
      },
    ],
    quiz: [
      { type: "mc", q: "tan θ 的本质含义是？", options: [
          "一个要背的符号", "对边与邻边的比值——“每前进 1 升高多少”，即坡度", "三角形的面积", "角度的一半"], answer: 1,
        explain: "tan = 对/邻 = 走 1 升多少，就是<b>陡的程度</b>。无障碍坡道 1:12 的标准，说的就是 tan ≤ 1/12。" },
      { type: "mc", q: "为什么 sin 30° 对所有大小的直角三角形都是同一个值？", options: [
          "巧合", "角度定 → 三角形彼此相似 → 对应边比值锁定，与大小无关", "只对小三角形成立", "因为计算器这么显示"], answer: 1,
        explain: "30° 锁定形状（相似！），放大缩小时分子分母同乘 k，一约就没了。<b>三角函数是相似原理的续集</b>。" },
      { type: "num", q: "tan 45° = ?", answer: 1,
        explain: "45° 的直角三角形两条直角边相等（等腰），对/邻 = <b>1</b>——每走 1 升 1。" },
      { type: "num", q: "sin 30° = ?（可输入分数）", answer: 0.5, tol: 0.001,
        explain: "把等边三角形对半剪开：30° 对着的边恰是斜边的一半 → sin 30° = <b>1/2</b>。特殊角的值都能这样亲手推出来。" },
      { type: "num", q: "离楼 20 米，测得楼顶仰角 45°，眼睛离地 1.5 米。楼高多少米？", answer: 21.5, tol: 0.1,
        explain: "升高 = 20 × tan 45° = 20，再加眼高 1.5 → <b>21.5 米</b>。一个角度 + 一段距离 = 摸不着的高度。" },
      { type: "mc", q: "sin 和 cos 的值为什么永远不超过 1？", options: [
          "规定不许超过", "它们的分母是斜边——直角三角形里最长的边，分子不可能超过分母",
          "计算器显示不了", "只是碰巧"], answer: 1,
        explain: "sin = 对/<b>斜</b>，cos = 邻/<b>斜</b>，斜边最长（它对着最大的角——直角），所以比值 ≤ 1。而 tan 的分母是邻边，所以 tan 可以要多大有多大。" },
    ],
  });
})();
