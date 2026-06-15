(function () {
  var canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  var hero = canvas.closest(".hero");
  if (!hero) return;

  var ctx = canvas.getContext("2d");
  var particles = [];
  var dots = [];
  var w = 0;
  var h = 0;
  var rafId = 0;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = w;
    canvas.height = h;
    buildParticles();
  }

  function buildParticles() {
    particles = [];
    dots = [];

    var count = Math.max(45, Math.floor((w * h) / 6500));

    for (var i = 0; i < count; i += 1) {
      particles.push({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(0.6, 2.2),
        vx: rand(-0.3, 0.3),
        vy: rand(-0.3, 0.3),
        color: Math.random() > 0.45 ? "#00e5ff" : "#9b30ff",
        alpha: rand(0.2, 0.75)
      });
    }

    for (var j = 0; j < 10; j += 1) {
      dots.push({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(1.5, 3),
        pulse: rand(0, Math.PI * 2)
      });
    }
  }

  function drawCurve() {
    ctx.save();
    ctx.strokeStyle = "rgba(155, 48, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 8]);
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.8);
    ctx.bezierCurveTo(w * 0.25, h * 0.4, w * 0.55, h * 0.95, w * 0.92, h * 0.3);
    ctx.stroke();

    ctx.strokeStyle = "rgba(0, 229, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.2);
    ctx.bezierCurveTo(w * 0.4, h * 0.55, w * 0.7, h * 0.1, w * 0.95, h * 0.6);
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    drawCurve();

    for (var i = 0; i < particles.length; i += 1) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    for (var a = 0; a < particles.length; a += 1) {
      for (var b = a + 1; b < particles.length; b += 1) {
        var p1 = particles[a];
        var p2 = particles[b];
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = "rgba(0, 229, 255, " + (0.1 * (1 - dist / 100)) + ")";
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    for (var k = 0; k < dots.length; k += 1) {
      var d = dots[k];
      d.pulse += 0.03;
      var glow = 0.35 + Math.sin(d.pulse) * 0.25;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 229, 255, " + (glow * 0.12) + ")";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, " + glow + ")";
      ctx.fill();
    }

    rafId = requestAnimationFrame(draw);
  }

  function start() {
    cancelAnimationFrame(rafId);
    resize();
    draw();
  }

  window.addEventListener("resize", start);
  start();
})();
