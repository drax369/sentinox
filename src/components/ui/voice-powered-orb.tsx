"use client";

import React, { useEffect, useRef, type FC } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";
import { cn } from "@/lib/utils";

interface VoicePoweredOrbProps {
  className?: string;
  hue?: number;
  enableVoiceControl?: boolean;
  voiceSensitivity?: number;
  maxRotationSpeed?: number;
  maxHoverIntensity?: number;
  onVoiceDetected?: (detected: boolean) => void;
}

export const VoicePoweredOrb: FC<VoicePoweredOrbProps> = ({
  className,
  hue = 200,
  enableVoiceControl = false,
  voiceSensitivity = 1.5,
  maxRotationSpeed = 1.2,
  maxHoverIntensity = 0.8,
  onVoiceDetected,
}) => {
  const ctnDom = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const frag = /* glsl */ `
    precision highp float;
    uniform float iTime;
    uniform vec3 iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    varying vec2 vUv;

    vec3 rgb2yiq(vec3 c) {
      float y = dot(c, vec3(0.299, 0.587, 0.114));
      float i = dot(c, vec3(0.596, -0.274, -0.322));
      float q = dot(c, vec3(0.211, -0.523, 0.312));
      return vec3(y, i, q);
    }

    vec3 yiq2rgb(vec3 c) {
      float r = c.x + 0.956 * c.y + 0.621 * c.z;
      float g = c.x - 0.272 * c.y - 0.647 * c.z;
      float b = c.x - 1.106 * c.y + 1.703 * c.z;
      return vec3(r, g, b);
    }

    vec3 adjustHue(vec3 color, float hueDeg) {
      float hueRad = hueDeg * 3.14159265 / 180.0;
      vec3 yiq = rgb2yiq(color);
      float cosA = cos(hueRad);
      float sinA = sin(hueRad);
      float i = yiq.y * cosA - yiq.z * sinA;
      float q = yiq.y * sinA + yiq.z * cosA;
      yiq.y = i;
      yiq.z = q;
      return yiq2rgb(yiq);
    }

    vec3 hash33(vec3 p3) {
      p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
      p3 += dot(p3, p3.yxz + 19.19);
      return -1.0 + 2.0 * fract(vec3(
        p3.x + p3.y,
        p3.x + p3.z,
        p3.y + p3.z
      ) * p3.zyx);
    }

    float snoise3(vec3 p) {
      const float K1 = 0.333333333;
      const float K2 = 0.166666667;
      vec3 i = floor(p + (p.x + p.y + p.z) * K1);
      vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
      vec3 e = step(vec3(0.0), d0 - d0.yzx);
      vec3 i1 = e * (1.0 - e.zxy);
      vec3 i2 = 1.0 - e.zxy * (1.0 - e);
      vec3 d1 = d0 - (i1 - K2);
      vec3 d2 = d0 - (i2 - K1);
      vec3 d3 = d0 - 0.5;
      vec4 h = max(0.6 - vec4(
        dot(d0, d0),
        dot(d1, d1),
        dot(d2, d2),
        dot(d3, d3)
      ), 0.0);
      vec4 n = h * h * h * h * vec4(
        dot(d0, hash33(i)),
        dot(d1, hash33(i + i1)),
        dot(d2, hash33(i + i2)),
        dot(d3, hash33(i + 1.0))
      );
      return dot(vec4(31.316), n);
    }

    vec4 extractAlpha(vec3 colorIn) {
      float a = max(max(colorIn.r, colorIn.g), colorIn.b);
      return vec4(colorIn.rgb / (a + 1e-5), a);
    }

    const vec3 baseColor1 = vec3(0.0, 0.96, 1.0);
    const vec3 baseColor2 = vec3(0.23, 0.51, 0.96);
    const vec3 baseColor3 = vec3(0.42, 0.15, 0.65);
    const float innerRadius = 0.6;
    const float noiseScale = 0.65;

    float light1(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * attenuation);
    }

    float light2(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * dist * attenuation);
    }

    vec4 draw(vec2 uv) {
      vec3 color1 = adjustHue(baseColor1, hue);
      vec3 color2 = adjustHue(baseColor2, hue);
      vec3 color3 = adjustHue(baseColor3, hue);
      float ang = atan(uv.y, uv.x);
      float len = length(uv);
      float invLen = len > 0.0 ? 1.0 / len : 0.0;
      float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
      float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
      float d0 = distance(uv, (r0 * invLen) * uv);
      float v0 = light1(1.0, 10.0, d0);
      v0 *= smoothstep(r0 * 1.05, r0, len);
      float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;
      float a = iTime * -1.0;
      vec2 pos = vec2(cos(a), sin(a)) * r0;
      float d = distance(uv, pos);
      float v1 = light2(1.5, 5.0, d);
      v1 *= light1(1.0, 50.0, d0);
      float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
      float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);
      vec3 col = mix(color1, color2, cl);
      col = mix(color3, col, v0);
      col = (col + v1) * v2 * v3;
      col = clamp(col, 0.0, 1.0);
      return extractAlpha(col);
    }

    vec4 mainImage(vec2 fragCoord) {
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      float angle = rot;
      float s = sin(angle);
      float c = cos(angle);
      uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
      uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);
      return draw(uv);
    }

    void main() {
      vec2 fragCoord = vUv * iResolution.xy;
      vec4 col = mainImage(fragCoord);
      gl_FragColor = vec4(col.rgb * col.a, col.a);
    }
  `;

  const stopMicrophone = () => {
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    microphoneRef.current?.disconnect();
    microphoneRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    if (audioContextRef.current?.state !== "closed") {
      void audioContextRef.current?.close();
    }
    audioContextRef.current = null;
    dataArrayRef.current = null;
  };

  const initMicrophone = async () => {
    stopMicrophone();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      mediaStreamRef.current = stream;
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();
      analyserRef.current = ctx.createAnalyser();
      microphoneRef.current = ctx.createMediaStreamSource(stream);
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.3;
      microphoneRef.current.connect(analyserRef.current);
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      return true;
    } catch {
      return false;
    }
  };

  const analyzeAudio = () => {
    if (!analyserRef.current || !dataArrayRef.current) return 0;
    analyserRef.current.getByteFrequencyData(
      dataArrayRef.current as Uint8Array<ArrayBuffer>
    );
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const v = dataArrayRef.current[i] / 255;
      sum += v * v;
    }
    return Math.min(Math.sqrt(sum / dataArrayRef.current.length) * voiceSensitivity * 3, 1);
  };

  useEffect(() => {
    const container = ctnDom.current;
    if (!container) return;

    let renderer: Renderer | null = null;
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    let rafId = 0;
    let program: Program | null = null;
    let micReady = false;

    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
      const ogl = renderer.gl as WebGL2RenderingContext & {
        canvas: HTMLCanvasElement;
      };
      gl = ogl;
      ogl.clearColor(0, 0, 0, 0);
      ogl.enable(ogl.BLEND);
      ogl.blendFunc(ogl.SRC_ALPHA, ogl.ONE_MINUS_SRC_ALPHA);
      while (container.firstChild) container.removeChild(container.firstChild);
      container.appendChild(ogl.canvas);

      const geometry = new Triangle(ogl as never);
      program = new Program(ogl as never, {
        vertex: vert,
        fragment: frag,
        uniforms: {
          iTime: { value: 0 },
          iResolution: {
            value: new Vec3(ogl.canvas.width, ogl.canvas.height, 1),
          },
          hue: { value: hue },
          hover: { value: 0 },
          rot: { value: 0 },
          hoverIntensity: { value: 0 },
        },
      });
      const mesh = new Mesh(ogl as never, { geometry, program });

      const resize = () => {
        if (!container || !renderer || !gl || !program) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w * dpr, h * dpr);
        ogl.canvas.style.width = `${w}px`;
        ogl.canvas.style.height = `${h}px`;
        program.uniforms.iResolution.value.set(
          ogl.canvas.width,
          ogl.canvas.height,
          ogl.canvas.width / ogl.canvas.height
        );
      };
      window.addEventListener("resize", resize);
      resize();

      if (enableVoiceControl) {
        void initMicrophone().then((ok) => {
          micReady = ok;
        });
      }

      let lastTime = 0;
      let rot = 0;
      const baseSpeed = 0.3;

      const update = (t: number) => {
        rafId = requestAnimationFrame(update);
        if (!program || !renderer || !gl) return;
        const dt = (t - lastTime) * 0.001;
        lastTime = t;
        program.uniforms.iTime.value = t * 0.001;
        program.uniforms.hue.value = hue;

        if (enableVoiceControl && micReady) {
          const level = analyzeAudio();
          onVoiceDetected?.(level > 0.08);
          if (level > 0.05) rot += dt * (baseSpeed + level * maxRotationSpeed * 2);
          program.uniforms.hover.value = Math.min(level * 2, 1);
          program.uniforms.hoverIntensity.value = Math.min(
            level * maxHoverIntensity * 0.8,
            maxHoverIntensity
          );
        } else {
          rot += dt * baseSpeed * 0.5;
          program.uniforms.hover.value = 0.2;
          program.uniforms.hoverIntensity.value = 0.15;
          onVoiceDetected?.(false);
        }
        program.uniforms.rot.value = rot;
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderer.render({ scene: mesh });
      };
      rafId = requestAnimationFrame(update);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", resize);
        stopMicrophone();
        if (container.contains(ogl.canvas)) container.removeChild(ogl.canvas);
        ogl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    } catch {
      return () => stopMicrophone();
    }
  }, [
    enableVoiceControl,
    hue,
    maxHoverIntensity,
    maxRotationSpeed,
    onVoiceDetected,
    voiceSensitivity,
  ]);

  useEffect(() => {
    if (enableVoiceControl) void initMicrophone();
    else stopMicrophone();
    return () => stopMicrophone();
  }, [enableVoiceControl]);

  return <div ref={ctnDom} className={cn("relative h-full w-full", className)} />;
};
