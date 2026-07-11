/* 模块：圆与 π —— 完美对称的形状 */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;

  /* 实验一：用多边形逼近 π */
  function mountPi(box) {
    const state = { n: 6 };
    const canvas = makeCanvas(box, { aspect: 0.52 });
    const readout = el("div", { class: "readout" });
    const sn = slider({ label: "多边形边数 n =", min: 3, max: 96, step: 1, value: 6, oninput: v => { state.n = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(sn));
    box.appendChild(readout);
    const peri = (n) => n * Math.sin(Math.PI / n); // 内接正 n 边形周长 / 直径
    function update() {
      const p = peri(state.n);
      readout.innerHTML = `内接正 ${state.n} 边形：周长 ÷ 直径 = <b>${fmt(p, 5)}</b>　真正的 π = 3.14159…　还差 <b>${fmt(Math.PI - p, 5)}</b>` +
        (state.n >= 90 ? "　—— 边越多越接近，但永远差一点点：π 就住在这个逼近的尽头。" : "");
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const R = Math.min(W * 0.28, H * 0.42), cx = W * 0.32, cy = H / 2;
      // 圆
      ctx.strokeStyle = T.baseline; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      // 直径
      ctx.setLineDash([4, 4]); ctx.strokeStyle = T.muted; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = T.muted; ctx.font = "11px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("直径 d", cx, cy + 4);
      // 多边形
      const n = state.n;
      ctx.strokeStyle = T.mod; ctx.lineWidth = 2; ctx.fillStyle = T.mod; ctx.globalAlpha = 1;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = -Math.PI / 2 + i * 2 * Math.PI / n;
        const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      // 收敛条形图
      const bx = W * 0.62, bw = W * 0.33, by = H * 0.30;
      const scale = (v) => bx + bw * (v - 2.9) / (3.25 - 2.9);
      ctx.strokeStyle = T.grid; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx, by + 30); ctx.lineTo(bx + bw, by + 30); ctx.stroke();
      // π 位置
      ctx.strokeStyle = T.c6; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(scale(Math.PI), by + 8); ctx.lineTo(scale(Math.PI), by + 52); ctx.stroke();
      ctx.fillStyle = T.c6; ctx.font = "600 12px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText("π", scale(Math.PI), by + 6);
      // 当前值
      const p = peri(n);
      ctx.fillStyle = T.mod;
      ctx.beginPath(); ctx.arc(scale(p), by + 30, 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = "600 12px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(fmt(p, 4), scale(p), by + 42);
      ctx.fillStyle = T.muted; ctx.font = "11.5px system-ui"; ctx.textAlign = "left";
      ctx.fillText("周长/直径 逼近 π 的过程 →", bx, by - 16);
      ctx.fillText("刻度 2.90 ─ 3.25", bx, by + 64);
    });
  }

  /* 实验二：圆周角定理 */
  function mountAngle(box) {
    const state = { p: 1.9 }; // P 在优弧上的角位置
    const canvas = makeCanvas(box, { aspect: 0.56 });
    const readout = el("div", { class: "readout" });
    const A = -Math.PI / 2 - Math.PI / 6, B = -Math.PI / 2 + Math.PI / 6; // 固定弧 AB（上方，圆心角恰为 60°）
    const sp = slider({ label: "移动圆上的点 P", min: 0.8, max: 5.5 - 0.8, step: 0.02, value: 1.9,
      oninput: v => { state.p = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(sp));
    box.appendChild(readout);
    const central = () => B - A; // 圆心角（弧 AB 对应）
    function inscribed() { return central() / 2; }
    function update() {
      readout.innerHTML = `圆心角 ∠AOB = <b>${fmt(central() * 180 / Math.PI, 0)}°</b>　圆周角 ∠APB = <b>${fmt(inscribed() * 180 / Math.PI, 0)}°</b>` +
        `　—— P 随便跑（只要在同一段弧上），圆周角<b>纹丝不动</b>，永远是圆心角的一半。`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const R = Math.min(W, H) * 0.36, cx = W / 2, cy = H / 2 + 8;
      const pt = (a) => [cx + R * Math.cos(a), cy + R * Math.sin(a)];
      const [ax, ay] = pt(A), [bx, by] = pt(B);
      const pAng = B + state.p; // 从 B 沿逆时针走
      const [px, py] = pt(pAng);
      // 圆
      ctx.strokeStyle = T.baseline; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      // 弧 AB 高亮
      ctx.strokeStyle = T.c8; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(cx, cy, R, A, B); ctx.stroke();
      // 圆心角
      ctx.strokeStyle = T.c8; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ax, ay); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
      ctx.fillStyle = T.c8;
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.font = "600 12px system-ui"; ctx.textAlign = "center";
      ctx.fillText("O", cx + 10, cy + 14);
      ctx.fillText(fmt(central() * 180 / Math.PI, 0) + "°", cx, cy - R * 0.32);
      // 圆周角
      ctx.strokeStyle = T.mod; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ax, ay); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
      // 角度弧
      const a1 = Math.atan2(ay - py, ax - px), a2 = Math.atan2(by - py, bx - px);
      ctx.beginPath(); ctx.arc(px, py, 22, Math.min(a1, a2), Math.max(a1, a2)); ctx.stroke();
      // 点
      const dot = (x, y, c, name, dy = -10) => {
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.font = "700 13px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText(name, x, y + dy);
      };
      dot(ax, ay, T.c8, "A");
      dot(bx, by, T.c8, "B");
      dot(px, py, T.mod, "P", py > cy ? 26 : -10);
      ctx.fillStyle = T.mod; ctx.font = "600 12px system-ui";
      const mid = [(px + (ax + bx) / 2) / 2, (py + (ay + by) / 2) / 2];
      ctx.fillText(fmt(inscribed() * 180 / Math.PI, 0) + "°", px + (cx - px) * 0.22, py + (cy - py) * 0.22 - 6);
    });
  }

  MathLab.register({
    id: "circle",
    title: "圆与 π",
    question: "为什么车轮是圆的？π 到底是个什么数？",
    grade: "九年级",
    domain: "图形与几何",
    emoji: "🎡",
    color: "c1",
    hook: `<p>如果车轮是方的，车会一颠一颠；椭圆的，也颠。只有圆的车轮，车轴永远离地面<b>一样高</b>，坐着才稳。</p>
      <p>这不是巧合，而是圆的<b>定义</b>在起作用：圆是"到一个定点（圆心）距离处处相等的点"组成的图形。
      一句话的定义，决定了它所有的本领。</p>
      <p>而 π——这个 3.14159… 的无限小数——只是圆的另一个身份证：<b>任何</b>圆的周长除以直径，都是同一个数。</p>`,
    sections: [
      {
        kind: "concept", title: "π 为什么对所有圆都一样",
        html: `<p>大到摩天轮，小到硬币，周长 ÷ 直径永远等于同一个数。为什么？</p>
        <p>因为<b>所有的圆都相似</b>！（还记得相似吗？）任何两个圆之间只差一个放大倍数 k：
        周长 ×k，直径也 ×k，一相除，k 消掉了——比值和大小无关。</p>
        <div class="formula">C = πd = 2πr　（这不是定理，这就是 π 的定义）</div>
        <p>古人算 π 的办法朴素而聪明：圆里画一个正多边形，边越多越贴近圆。
        刘徽、祖冲之就是沿这条路，把 π 算到了小数点后七位，领先世界近千年。</p>`,
      },
      { kind: "lab", title: "亲手逼近 π", mount: mountPi,
        intro: `<p>拖动边数 n，看多边形一点点"长成"圆，看比值一步步爬向 π。</p>`,
        try_: `n = 6 时比值恰好是 3（古人说"周三径一"就是这么来的）。要精确到 3.14，n 得多大？你正在重走祖冲之的路。` },
      { kind: "lab", title: "圆周角：一个顽固的角度", mount: mountAngle,
        intro: `<p>橙色是固定的弧 AB 和它的圆心角；蓝色是顶点在圆上的圆周角。拖动滑杆让 P 沿着圆跑。</p>`,
        try_: `P 跑遍大半个圆，∠APB 却一动不动，而且恰好是圆心角的一半。再想想：如果 AB 是直径（圆心角 180°），圆周角是多少度？（这就是著名的"直径所对的圆周角是直角"）` },
      {
        kind: "concept", title: "从定义出发，全部性质免费赠送",
        html: `<p>圆的每一条性质，都能追溯到"到圆心等距"这一句话：</p>
        <ul>
          <li><b>车轮平稳</b>：半径处处相等，轴心高度恒定。</li>
          <li><b>圆是最"省"的形状</b>：同样长的篱笆，围成圆圈住的面积最大——所以肥皂泡是球形。</li>
          <li><b>切线垂直于半径</b>：半径是圆心到直线的最短距离，最短的那条必然垂直。</li>
          <li><b>同弧所对圆周角相等</b>：你刚在实验里亲眼见过。</li>
        </ul>
        <p>记住定义，性质可以现场推出来——这比背十条结论可靠得多。</p>`,
      },
    ],
    quiz: [
      { type: "mc", q: "π 的确切含义是什么？", options: [
          "就是 3.14", "任何圆的周长与直径的比值", "圆的面积", "一个科学家的名字"], answer: 1,
        explain: "π = C ÷ d，对<b>一切</b>圆都相同。3.14 只是它的近似值——π 本尊是个无限不循环小数。" },
      { type: "mc", q: "为什么所有圆的“周长÷直径”都是同一个数？", options: [
          "巧合", "因为所有圆都相似，缩放倍数在相除时消掉了", "因为古人规定的", "只有标准圆才是"], answer: 1,
        explain: "任何两个圆只差一个放大倍数 k：周长和直径同时 ×k，一相除 k 就<b>约掉了</b>。相似的原理又一次登场。" },
      { type: "num", q: "直径 10 厘米的圆，周长约是多少厘米？（保留 1 位小数，π ≈ 3.14）", answer: 31.4, tol: 0.15,
        explain: "C = πd ≈ 3.14 × 10 = <b>31.4 厘米</b>。" },
      { type: "mc", q: "同一段弧所对的圆周角与圆心角的关系是？", options: [
          "相等", "圆周角是圆心角的一半", "圆周角是圆心角的两倍", "没有固定关系"], answer: 1,
        explain: "你在实验里看到的：P 在弧上随便跑，圆周角恒为圆心角的<b>一半</b>。" },
      { type: "num", q: "一段弧的圆心角是 100°，它所对的圆周角是多少度？", answer: 50,
        explain: "圆周角 = 圆心角 ÷ 2 = <b>50°</b>。" },
      { type: "mc", q: "车轮做成圆形，用到了圆的哪个本质属性？", options: [
          "圆最好看", "圆上每点到圆心的距离都相等，所以车轴高度恒定", "圆的面积最大", "圆容易制造"], answer: 1,
        explain: "定义即答案：<b>半径处处相等</b> → 轴心离地始终一个半径高 → 不颠簸。一句定义，答遍天下。" },
    ],
  });
})();
