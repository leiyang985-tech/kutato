/* 模块：相似 —— 放大与缩小的科学 */
(function () {
  const { el, fmt, slider, button, ctrlRow, makeCanvas } = MathLab.H;

  /* 实验一：放大一个三角形 */
  function mountScale(box) {
    const state = { k: 2 };
    const canvas = makeCanvas(box, { aspect: 0.52 });
    const readout = el("div", { class: "readout" });
    const sk = slider({ label: "放大倍数 k =", min: 0.5, max: 3, step: 0.25, value: 2, format: v => fmt(v) + "×", oninput: v => { state.k = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(sk));
    box.appendChild(readout);
    // 原三角形（边 3-4-5 直角）
    const base = [[0, 0], [4, 0], [0, 3]];
    const sides = [5, 3, 4]; // 对边（斜边、竖边、横边）
    function update() {
      const k = state.k;
      readout.innerHTML = `边长：3→<b>${fmt(3 * k)}</b>，4→<b>${fmt(4 * k)}</b>，5→<b>${fmt(5 * k)}</b>（全都 ×${fmt(k)}）　` +
        `周长 ×<b>${fmt(k)}</b>　面积：6→<b>${fmt(6 * k * k)}</b>，是 ×<b>${fmt(k * k)}</b>（= k²）！`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const k = state.k;
      const u = Math.min((W - 100) / (4 + 4 * 3), (H - 70) / (3 * 3.2));
      const draw = (ox, oy, s, color, name) => {
        ctx.fillStyle = color; ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.moveTo(ox + base[0][0] * u * s, oy - base[0][1] * u * s);
        ctx.lineTo(ox + base[1][0] * u * s, oy - base[1][1] * u * s);
        ctx.lineTo(ox + base[2][0] * u * s, oy - base[2][1] * u * s);
        ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = T.sub; ctx.font = "600 12px system-ui"; ctx.textAlign = "center";
        ctx.fillText(name, ox + 1.3 * u * s, oy + 18);
        // 边标注
        ctx.font = "11.5px system-ui"; ctx.fillStyle = T.muted;
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        const lab = (x1, y1, x2, y2, t) => {
          ctx.fillText(t, ox + (x1 + x2) / 2 * u * s + (x1 === x2 ? -14 : 0), oy - (y1 + y2) / 2 * u * s + (y1 === y2 ? 4 : -6));
        };
        const mul = name === "原图" ? 1 : k;
        ctx.textBaseline = "alphabetic";
        lab(0, 0, 4, 0, fmt(4 * mul));
        lab(0, 0, 0, 3, fmt(3 * mul));
        lab(4, 0, 0, 3, fmt(5 * mul));
      };
      draw(50, H * 0.72, 1, T.c1, "原图");
      draw(50 + 5.2 * u, H * 0.72, k, T.c8, `放大 ${fmt(k)} 倍`);
      ctx.fillStyle = T.muted; ctx.font = "12px system-ui"; ctx.textAlign = "left";
      ctx.fillText("三个角完全没变——这就是“形状相同”", 50, H * 0.92);
    });
  }

  /* 实验二：用影子量金字塔 */
  function mountShadow(box) {
    const state = { sun: 40, hTower: 15 };
    const canvas = makeCanvas(box, { aspect: 0.5 });
    const readout = el("div", { class: "readout" });
    const ss = slider({ label: "太阳高度 =", min: 25, max: 65, step: 1, value: 40, format: v => v + "°", oninput: v => { state.sun = v; canvas.redraw(); update(); } });
    const sh = slider({ label: "塔高（假装未知）=", min: 8, max: 20, step: 1, value: 15, format: v => v + " m", oninput: v => { state.hTower = v; canvas.redraw(); update(); } });
    box.appendChild(ctrlRow(ss, sh));
    box.appendChild(readout);
    function update() {
      const t = Math.tan(state.sun * Math.PI / 180);
      const s1 = 1 / t, s2 = state.hTower / t;
      readout.innerHTML = `1 米的竹竿影子 <b>${fmt(s1, 2)} m</b>，塔的影子 <b>${fmt(s2, 2)} m</b>。` +
        `比一比：竿高/竿影 = ${fmt(1 / s1, 2)}，塔高/塔影 = ${fmt(state.hTower / s2, 2)} —— <b>永远相等</b>。` +
        `所以塔高 = 塔影 × (竿高/竿影) = ${fmt(s2, 2)} × ${fmt(1 / s1, 2)} = <b>${fmt(state.hTower, 2)} m</b> ✔`;
    }
    update();
    canvas.onDraw((ctx, W, H, T) => {
      const t = Math.tan(state.sun * Math.PI / 180);
      const s1 = 1 / t, s2 = state.hTower / t;
      const total = s2 + 8;
      const u = (W - 80) / Math.max(total, 26);
      const gy = H - 34;
      const X = (v) => 40 + v * u, Y = (v) => gy - v * u;
      // 太阳与光线
      ctx.fillStyle = T.c3;
      ctx.beginPath(); ctx.arc(W - 46, 34, 13, 0, Math.PI * 2); ctx.fill();
      // 地面
      ctx.strokeStyle = T.baseline; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(20, gy); ctx.lineTo(W - 20, gy); ctx.stroke();
      // 塔（金字塔形）
      const tw = 3;
      ctx.fillStyle = T.c8; ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.moveTo(X(0) - tw * u / 2, gy); ctx.lineTo(X(0) + tw * u / 2, gy); ctx.lineTo(X(0), Y(state.hTower)); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      // 塔影
      ctx.strokeStyle = T.c8; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(X(0), gy + 6); ctx.lineTo(X(s2), gy + 6); ctx.stroke();
      // 光线（塔顶→影尖）
      ctx.setLineDash([5, 4]); ctx.strokeStyle = T.c3; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X(0), Y(state.hTower)); ctx.lineTo(X(s2), gy); ctx.stroke();
      // 竹竿（放在塔影右侧）
      const px = s2 + 3;
      ctx.setLineDash([]);
      ctx.strokeStyle = T.c1; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(X(px), gy); ctx.lineTo(X(px), Y(1)); ctx.stroke();
      ctx.strokeStyle = T.c1; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(X(px), gy + 6); ctx.lineTo(X(px + s1), gy + 6); ctx.stroke();
      ctx.setLineDash([5, 4]); ctx.strokeStyle = T.c3; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X(px), Y(1)); ctx.lineTo(X(px + s1), gy); ctx.stroke();
      ctx.setLineDash([]);
      // 标注
      ctx.fillStyle = T.sub; ctx.font = "11.5px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(`塔影 ${fmt(s2, 1)} m`, X(s2 / 2), gy + 12);
      ctx.fillText(`竿影 ${fmt(s1, 2)} m`, X(px + s1 / 2), gy + 12);
      ctx.textBaseline = "bottom";
      ctx.fillText(`? m`, X(0) + 14, Y(state.hTower / 2));
      ctx.fillText(`1 m`, X(px) + 14, Y(0.5));
      ctx.fillStyle = T.muted;
      ctx.fillText("同一时刻，阳光是平行的 → 两个三角形形状相同", W / 2, 30);
    });
  }

  MathLab.register({
    id: "similarity",
    title: "相似：放大缩小的科学",
    question: "两千多年前，泰勒斯没爬金字塔，就量出了它的高度。",
    grade: "九年级",
    domain: "图形与几何",
    emoji: "🗼",
    color: "c2",
    hook: `<p>古希腊人泰勒斯来到埃及，法老问他：你能量出大金字塔的高度吗？</p>
      <p>泰勒斯在沙地上插了一根<b>竹竿</b>，等到某一刻，量了量竿子的影子和金字塔的影子——报出了塔高。全程没有离开地面。</p>
      <p>他靠的是一个深刻的观察：<b>同一时刻，阳光是平行的</b>，所以竿子和它的影子、塔和它的影子，
      组成了两个"形状完全相同、只是大小不同"的三角形。这就是<b>相似</b>。</p>`,
    sections: [
      {
        kind: "concept", title: "相似 = 形状相同，大小随意",
        html: `<p>把一张照片等比放大：所有<b>角度一点不变</b>，所有<b>长度乘同一个倍数 k</b>（相似比）。这两条就是相似的全部定义：</p>
        <ul>
          <li>对应角相等（形状没变的原因）</li>
          <li>对应边成比例（大小变化的方式）</li>
        </ul>
        <p>手机上捏合缩放图片、地图的比例尺、电影放映机、照片冲印……全是相似变换。
        <b>全等</b>只是相似的特例——k = 1，不放也不缩。</p>`,
      },
      { kind: "lab", title: "放大一个三角形", mount: mountScale,
        intro: `<p>拖动放大倍数，观察边长、周长、面积各自怎么变。</p>`,
        try_: `边长 ×2 时面积 ×几？边长 ×3 呢？为什么面积是 ×k² 而不是 ×k？（提示：面积 = 长×宽，两个方向<b>都</b>被放大了）` },
      { kind: "lab", title: "重演泰勒斯的测量", mount: mountShadow,
        intro: `<p>拖"太阳高度"，两个影子一起变；拖"塔高"改变目标。注意读数里的两个比值。</p>`,
        try_: `无论太阳在哪，"高 ÷ 影"两个比值始终相等——这就是泰勒斯敢报答案的底气。用 1 米竿影 1.2 米、塔影 18 米，你能像他一样心算出塔高吗？` },
      {
        kind: "concept", title: "k 和 k²：一个最容易踩的坑",
        html: `<p>相似比是 k 时：</p>
        <div class="formula">长度 × k　　周长 × k　　面积 × k²</div>
        <p>为什么面积不同？因为面积是<b>两个方向</b>的乘积，每个方向都被放大 k 倍，所以面积放大 k×k 倍。</p>
        <p>披萨直径从 6 寸涨到 12 寸，直径 ×2，披萨却是原来的 <b>4 倍</b>——买大的往往更划算，这就是 k² 在生活里的样子。
        （以后学体积，还会遇到 k³。）</p>`,
      },
    ],
    quiz: [
      { type: "mc", q: "两个三角形相似的本质是什么？", options: [
          "大小差不多", "形状相同：对应角相等，对应边成同一比例", "面积相等", "都有直角"], answer: 1,
        explain: "相似 = 同一张照片的不同冲印尺寸。<b>角管形状（不变），比例管大小（统一缩放）</b>。" },
      { type: "num", q: "两个相似三角形的相似比是 1 : 3，小三角形一条边长 4，对应边长多少？", answer: 12,
        explain: "所有对应边都乘同一个倍数：4 × 3 = <b>12</b>。" },
      { type: "num", q: "把一个图形的边长放大 2 倍，面积变成原来的几倍？", answer: 4,
        explain: "面积是两个方向的乘积，每个方向 ×2，所以面积 ×2×2 = <b>4</b> 倍。长度看 k，面积看 k²。" },
      { type: "num", q: "同一时刻，1 米的竹竿影长 1.2 米，塔影长 18 米。塔高多少米？", answer: 15,
        explain: "阳光平行 → 两个三角形相似 → 塔高/18 = 1/1.2 → 塔高 = 18 ÷ 1.2 = <b>15 米</b>。这就是泰勒斯的方法。" },
      { type: "mc", q: "泰勒斯量金字塔，靠的核心原理是？", options: [
          "他有很长的尺子", "同一时刻阳光平行，物体和影子组成相似三角形", "他数了金字塔的砖", "古埃及人告诉了他"], answer: 1,
        explain: "平行的阳光保证两个三角形<b>角相等</b>→ 相似 → 比例一致 → 用小的算大的。用可测的量出不可测的，这是数学最帅的用法之一。" },
      { type: "mc", q: "全等和相似是什么关系？", options: [
          "毫无关系", "全等是相似比恰好为 1 的特例", "相似是全等的特例", "全等只看角度"], answer: 1,
        explain: "全等 = 形状相同且大小相同 = 相似比 k = 1 的相似。<b>一般概念套住特殊概念</b>，学会一个就白送另一个。" },
    ],
  });
})();
