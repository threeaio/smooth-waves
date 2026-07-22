'use client';

// src/wave.tsx
import { useAnimationFrame, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useEffect, useMemo, useRef } from "react";

// src/core.ts
var lerp = (a, b, t) => a + (b - a) * t;
var clamp = (min, max, value) => Math.min(max, Math.max(min, value));
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
function resolveConfig(configs, channels, scratch, t) {
  if (configs.length === 1) return configs[0];
  if (configs.length === 2) {
    lerpInto(scratch, configs[0], configs[1], t);
    return scratch;
  }
  interpolateInto(scratch, channels, t);
  return scratch;
}
function sampleConfig(configs, t) {
  const scratch = { left: [0, 0, 0], right: [0, 0, 0] };
  const resolved = resolveConfig(configs, extractChannels(configs), scratch, clamp(0, 1, t));
  return { left: [...resolved.left], right: [...resolved.right] };
}
function drawDebug(ctx, width, height, scrollProgress) {
  ctx.font = "12px monospace";
  ctx.fillStyle = "#f00";
  ctx.fillText(scrollProgress.toFixed(3), width - 50, clamp(20, height, scrollProgress * height));
}
function cubicYRange(p0, p1, p2, p3) {
  let min = Math.min(p0, p3);
  let max = Math.max(p0, p3);
  for (let i = 1; i < 24; i++) {
    const t = i / 24;
    const u = 1 - t;
    const y = u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
    if (y < min) min = y;
    if (y > max) max = y;
  }
  return [min, max];
}
function eraseFade(ctx, width, height, from, to) {
  const a = clamp(0, 1, from / height);
  const b = clamp(0, 1, to / height);
  if (a === b) return;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  if (a < b) {
    gradient.addColorStop(0, "rgba(0,0,0,1)");
    gradient.addColorStop(a, "rgba(0,0,0,1)");
    gradient.addColorStop(b, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
  } else {
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(b, "rgba(0,0,0,0)");
    gradient.addColorStop(a, "rgba(0,0,0,1)");
    gradient.addColorStop(1, "rgba(0,0,0,1)");
  }
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}
function featherErase(ctx, width, height, featheredOut, depth, extent) {
  if (depth <= 0 || height <= 0) return;
  if (featheredOut === "top" || featheredOut === "both") {
    eraseFade(ctx, width, height, extent.top, extent.top + depth);
  }
  if (featheredOut === "bottom" || featheredOut === "both") {
    eraseFade(ctx, width, height, extent.bottom, extent.bottom - depth);
  }
}
function featherMask(featheredOut) {
  switch (featheredOut) {
    case "top":
      return "linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 40%)";
    case "bottom":
      return "linear-gradient(rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%)";
    case "both":
      return "linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)";
    default:
      return void 0;
  }
}

// src/wave.tsx
import { jsx } from "react/jsx-runtime";
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    if (!needsRedrawRef.current) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const configs = curveConfig.configs;
    if (!canvas || !ctx || configs.length === 0) return;
    needsRedrawRef.current = false;
    const sp = reducedMotionRef.current ? 0.5 : clamp(0, 1, smoothProgress.get());
    const targetConfig = resolveConfig(configs, channels, scratchRef.current, sp);
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
    if (curveConfig.featheredOut && curveConfig.featherDepth) {
      const flip = (_h = curveConfig.flip) != null ? _h : false;
      const leftY = flip ? height - targetConfig.left[0] * height : targetConfig.left[0] * height;
      const rightY = flip ? height - targetConfig.right[0] * height : targetConfig.right[0] * height;
      const [curveMin, curveMax] = cubicYRange(
        rightY,
        rightY + targetConfig.right[2] * height,
        leftY + targetConfig.left[2] * height,
        leftY
      );
      const fan = (_i = curveConfig.curveAmount) != null ? _i : 1;
      const fanLeft = ((_j = curveConfig.offsetLeft) != null ? _j : 0) * fan;
      const fanRight = ((_k = curveConfig.offsetRight) != null ? _k : 0) * fan;
      featherErase(ctx, width, height, curveConfig.featheredOut, curveConfig.featherDepth, {
        top: flip ? curveMin + Math.min(0, fanLeft, fanRight) : 0,
        bottom: flip ? height : curveMax + Math.max(0, fanLeft, fanRight)
      });
    }
    if (curveConfig.debug) {
      drawDebug(ctx, width, height, sp);
    }
  });
  return /* @__PURE__ */ jsx("div", { className: "absolute inset-0 overflow-hidden", ref: containerRef, children: /* @__PURE__ */ jsx(
    "div",
    {
      className: "absolute inset-0",
      style: { mask: curveConfig.featherDepth ? void 0 : featherMask(curveConfig.featheredOut) },
      children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "size-full" })
    }
  ) });
}

// src/wave-band.tsx
import { useAnimationFrame as useAnimationFrame2, useMotionValueEvent as useMotionValueEvent2, useScroll as useScroll2, useSpring as useSpring2 } from "motion/react";
import { useEffect as useEffect2, useMemo as useMemo2, useRef as useRef2 } from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
function edgeGeometry(config, width, height) {
  const leftY = config.left[0] * height;
  const rightY = config.right[0] * height;
  return {
    leftY,
    leftCx: config.left[1] * width,
    leftCy: leftY + config.left[2] * height,
    rightY,
    rightCx: width - config.right[1] * width,
    rightCy: rightY + config.right[2] * height
  };
}
function drawBandPath(ctx, top, bottom, width) {
  ctx.beginPath();
  ctx.moveTo(0, top.leftY);
  ctx.bezierCurveTo(top.leftCx, top.leftCy, top.rightCx, top.rightCy, width, top.rightY);
  ctx.lineTo(width, bottom.rightY);
  ctx.bezierCurveTo(bottom.rightCx, bottom.rightCy, bottom.leftCx, bottom.leftCy, 0, bottom.leftY);
  ctx.closePath();
  ctx.fill();
}
function strokeEdgeFan(ctx, geometry, edge, width) {
  var _a, _b, _c, _d, _e;
  const curveAmount = (_a = edge.curveAmount) != null ? _a : 0;
  if (curveAmount <= 0) return;
  ctx.strokeStyle = (_b = edge.strokeStyle) != null ? _b : "#fff";
  ctx.lineWidth = (_c = edge.strokeWidth) != null ? _c : 0.4;
  const offsetLeft = (_d = edge.offsetLeft) != null ? _d : 0;
  const offsetRight = (_e = edge.offsetRight) != null ? _e : 0;
  for (let i = 0; i < curveAmount; i++) {
    const offset = i + 1;
    ctx.beginPath();
    ctx.moveTo(0, geometry.leftY + offsetLeft * offset);
    ctx.bezierCurveTo(
      geometry.leftCx,
      geometry.leftCy + offsetLeft * offset,
      geometry.rightCx,
      geometry.rightCy + offsetRight * offset,
      width,
      geometry.rightY + offsetRight * offset
    );
    ctx.stroke();
  }
}
function WaveBand({ waveConfig }) {
  const containerRef = useRef2(null);
  const canvasRef = useRef2(null);
  const ctxRef = useRef2(null);
  const sizeRef = useRef2({ width: 0, height: 0, dpr: 1 });
  const needsRedrawRef = useRef2(true);
  const reducedMotionRef = useRef2(false);
  const topScratchRef = useRef2({ left: [0, 0, 0], right: [0, 0, 0] });
  const bottomScratchRef = useRef2({ left: [0, 0, 0], right: [0, 0, 0] });
  const { scrollYProgress } = useScroll2({
    target: containerRef,
    offset: waveConfig.scrollOffset
  });
  const smoothProgress = useSpring2(scrollYProgress, { damping: 80, mass: 0.27, stiffness: 250 });
  const topChannels = useMemo2(() => extractChannels(waveConfig.top.configs), [waveConfig.top.configs]);
  const bottomChannels = useMemo2(() => extractChannels(waveConfig.bottom.configs), [waveConfig.bottom.configs]);
  useEffect2(() => {
    needsRedrawRef.current = true;
  }, [waveConfig, topChannels, bottomChannels]);
  useEffect2(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotionRef.current = mediaQuery.matches;
      needsRedrawRef.current = true;
    };
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);
  useEffect2(() => {
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
  useMotionValueEvent2(smoothProgress, "change", () => {
    if (!reducedMotionRef.current) {
      needsRedrawRef.current = true;
    }
  });
  useAnimationFrame2(() => {
    if (!needsRedrawRef.current) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const { top, bottom } = waveConfig;
    if (!canvas || !ctx || top.configs.length === 0 || bottom.configs.length === 0) return;
    needsRedrawRef.current = false;
    const sp = reducedMotionRef.current ? 0.5 : clamp(0, 1, smoothProgress.get());
    const topConfig = resolveConfig(top.configs, topChannels, topScratchRef.current, sp);
    const bottomConfig = resolveConfig(bottom.configs, bottomChannels, bottomScratchRef.current, sp);
    const { width, height, dpr } = sizeRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    const topGeometry = edgeGeometry(topConfig, width, height);
    const bottomGeometry = edgeGeometry(bottomConfig, width, height);
    ctx.fillStyle = waveConfig.fill;
    drawBandPath(ctx, topGeometry, bottomGeometry, width);
    strokeEdgeFan(ctx, topGeometry, top, width);
    strokeEdgeFan(ctx, bottomGeometry, bottom, width);
    if (waveConfig.featheredOut && waveConfig.featherDepth) {
      const fanReach = (edge) => {
        var _a, _b, _c;
        const fan = (_a = edge.curveAmount) != null ? _a : 0;
        return [((_b = edge.offsetLeft) != null ? _b : 0) * fan, ((_c = edge.offsetRight) != null ? _c : 0) * fan];
      };
      const [topMin] = cubicYRange(topGeometry.leftY, topGeometry.leftCy, topGeometry.rightCy, topGeometry.rightY);
      const [, bottomMax] = cubicYRange(
        bottomGeometry.leftY,
        bottomGeometry.leftCy,
        bottomGeometry.rightCy,
        bottomGeometry.rightY
      );
      featherErase(ctx, width, height, waveConfig.featheredOut, waveConfig.featherDepth, {
        top: topMin + Math.min(0, ...fanReach(top)),
        bottom: bottomMax + Math.max(0, ...fanReach(bottom))
      });
    }
    if (waveConfig.debug) {
      drawDebug(ctx, width, height, sp);
    }
  });
  return /* @__PURE__ */ jsx2("div", { className: "absolute inset-0 overflow-hidden", ref: containerRef, children: /* @__PURE__ */ jsx2(
    "div",
    {
      className: "absolute inset-0",
      style: { mask: waveConfig.featherDepth ? void 0 : featherMask(waveConfig.featheredOut) },
      children: /* @__PURE__ */ jsx2("canvas", { ref: canvasRef, className: "size-full" })
    }
  ) });
}
export {
  Wave,
  WaveBand,
  sampleConfig
};
//# sourceMappingURL=index.mjs.map