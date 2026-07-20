'use client';

// src/wave.tsx
import { useAnimationFrame, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { jsx } from "react/jsx-runtime";
var lerp = (a, b, t) => a + (b - a) * t;
var clamp = (min, max, value) => Math.min(max, Math.max(min, value));
var defaultCurveConfig = {
  strokeStyle: "#fff",
  strokeWidth: 0.4,
  fill: "rgba(0,0,0,0.1)",
  configs: [
    {
      right: [0.2, 0.9, -0.8],
      left: [0.7, 0.6, 0.9]
    },
    {
      right: [0.2, 0.9, -0.5],
      left: [0.7, 0.6, 0.6]
    },
    {
      right: [0.2, 0.9, -0.2],
      left: [0.7, 0.6, 0.3]
    }
  ],
  scrollOffset: ["end end", "start start"]
};
function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (-t3 + 2 * t2 - t) * p0 * 0.5 + (3 * t3 - 5 * t2 + 2) * p1 * 0.5 + (-3 * t3 + 4 * t2 + t) * p2 * 0.5 + (t3 - t2) * p3 * 0.5;
}
function extendPoints(points) {
  return [points[0], ...points, points[points.length - 1]];
}
function extractChannels(configs) {
  const channel = (side, component) => extendPoints(configs.map((c) => c[side][component]));
  return {
    left: [channel("left", 0), channel("left", 1), channel("left", 2)],
    right: [channel("right", 0), channel("right", 1), channel("right", 2)]
  };
}
function interpolateExtended(extended, t) {
  const count = extended.length - 2;
  if (count <= 0) return 0;
  if (count === 1) return extended[1];
  t = clamp(0, 1, t);
  if (t === 1) return extended[count];
  const segments = count - 1;
  const segmentT = t * segments;
  const segment = Math.floor(segmentT);
  const localT = segmentT - segment;
  const p0 = extended[segment];
  const p1 = extended[segment + 1];
  const p2 = extended[segment + 2];
  const p3 = extended[Math.min(segment + 3, extended.length - 1)];
  return catmullRom(p0, p1, p2, p3, localT);
}
function interpolateInto(target, channels, t) {
  for (let i = 0; i < 3; i++) {
    target.left[i] = interpolateExtended(channels.left[i], t);
    target.right[i] = interpolateExtended(channels.right[i], t);
  }
}
function lerpInto(target, start, end, t) {
  for (let i = 0; i < 3; i++) {
    target.left[i] = lerp(start.left[i], end.left[i], t);
    target.right[i] = lerp(start.right[i], end.right[i], t);
  }
}
function drawWavePath(ctx, config, curveAmount = 1, lineOffsetLeft = 0, lineOffsetRight = 0, width, height, flip = false) {
  const leftX = 0;
  const leftY = flip ? height - config.left[0] * height : config.left[0] * height;
  const leftXOffset = config.left[1] * width;
  const leftYOffset = config.left[2] * height;
  const rightX = width;
  const rightY = flip ? height - config.right[0] * height : config.right[0] * height;
  const rightXOffset = config.right[1] * width;
  const rightYOffset = config.right[2] * height;
  ctx.beginPath();
  ctx.moveTo(leftX, flip ? height : 0);
  ctx.lineTo(rightX, flip ? height : 0);
  ctx.lineTo(rightX, rightY);
  ctx.bezierCurveTo(
    rightX - rightXOffset,
    rightY + rightYOffset,
    leftX + leftXOffset,
    leftY + leftYOffset,
    leftX,
    leftY
  );
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < curveAmount; i++) {
    const offset = i + 1;
    ctx.beginPath();
    ctx.moveTo(rightX, rightY + lineOffsetRight * offset);
    ctx.bezierCurveTo(
      rightX - rightXOffset,
      rightY + rightYOffset + lineOffsetRight * offset,
      leftX + leftXOffset,
      leftY + leftYOffset + lineOffsetLeft * offset,
      leftX,
      leftY + lineOffsetLeft * offset
    );
    ctx.stroke();
  }
}
function drawDebug(ctx, width, height, scrollProgress) {
  ctx.font = "12px monospace";
  ctx.fillStyle = "#f00";
  ctx.fillText(scrollProgress.toFixed(3), width - 50, clamp(20, height, scrollProgress * height));
}
function Wave({ waveConfig: curveConfig = defaultCurveConfig }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const needsRedrawRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const scratchRef = useRef({ left: [0, 0, 0], right: [0, 0, 0] });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: curveConfig.scrollOffset
  });
  const smoothProgress = useSpring(scrollYProgress, { damping: 80, mass: 0.27, stiffness: 250 });
  const channels = useMemo(() => extractChannels(curveConfig.configs), [curveConfig.configs]);
  useEffect(() => {
    needsRedrawRef.current = true;
  }, [curveConfig, channels]);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotionRef.current = mediaQuery.matches;
      needsRedrawRef.current = true;
    };
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    ctxRef.current = canvas.getContext("2d");
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      sizeRef.current = { width, height, dpr };
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      needsRedrawRef.current = true;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  useMotionValueEvent(smoothProgress, "change", () => {
    if (!reducedMotionRef.current) {
      needsRedrawRef.current = true;
    }
  });
  useAnimationFrame(() => {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!needsRedrawRef.current) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const configs = curveConfig.configs;
    if (!canvas || !ctx || configs.length === 0) return;
    needsRedrawRef.current = false;
    const sp = reducedMotionRef.current ? 0.5 : clamp(0, 1, smoothProgress.get());
    let targetConfig;
    if (configs.length === 1) {
      targetConfig = configs[0];
    } else if (configs.length === 2) {
      lerpInto(scratchRef.current, configs[0], configs[1], sp);
      targetConfig = scratchRef.current;
    } else {
      interpolateInto(scratchRef.current, channels, sp);
      targetConfig = scratchRef.current;
    }
    const { width, height, dpr } = sizeRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = (_a = curveConfig.fill) != null ? _a : defaultCurveConfig.fill;
    ctx.strokeStyle = (_b = curveConfig.strokeStyle) != null ? _b : defaultCurveConfig.strokeStyle;
    ctx.lineWidth = (_c = curveConfig.strokeWidth) != null ? _c : defaultCurveConfig.strokeWidth;
    drawWavePath(
      ctx,
      targetConfig,
      (_d = curveConfig.curveAmount) != null ? _d : 1,
      (_e = curveConfig.offsetLeft) != null ? _e : 0,
      (_f = curveConfig.offsetRight) != null ? _f : 0,
      width,
      height,
      (_g = curveConfig.flip) != null ? _g : false
    );
    if (curveConfig.debug) {
      drawDebug(ctx, width, height, sp);
    }
  });
  return /* @__PURE__ */ jsx("div", { className: "absolute inset-0 overflow-hidden", ref: containerRef, children: /* @__PURE__ */ jsx(
    "div",
    {
      className: "absolute inset-0",
      style: {
        mask: curveConfig.featheredOut === "top" ? "linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 40%)" : curveConfig.featheredOut === "bottom" ? "linear-gradient(rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%)" : curveConfig.featheredOut === "both" ? "linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)" : void 0
      },
      children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "size-full" })
    }
  ) });
}
export {
  Wave
};
//# sourceMappingURL=index.mjs.map