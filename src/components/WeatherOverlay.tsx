import React, { useEffect, useRef } from 'react';
import { WeatherData } from '../types';

interface WeatherOverlayProps {
  weather?: WeatherData | null;
  isDay: boolean;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ weather, isDay }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const condition = weather?.condition || (isDay ? 'sunny' : 'clear-night');
  const temp = weather?.temperature ?? 20;
  const uv = weather?.uvIndex ?? 4;

  // 1. Calculate dynamic radial gradient intensity for Sunny day
  // High temp (>30C) or high UV (>7) yields stronger golden-amber glow
  const warmthRatio = Math.min(Math.max((temp - 10) / 25, 0.2), 1.0);
  const uvRatio = Math.min(Math.max(uv / 10, 0.2), 1.0);
  const combinedWarmth = (warmthRatio * 0.6 + uvRatio * 0.4);

  // 2. Particle simulation for Snow & Rain
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (condition !== 'snow' && condition !== 'rain' && condition !== 'storm') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface SnowParticle {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
    }

    interface RainParticle {
      x: number;
      y: number;
      length: number;
      speedY: number;
      speedX: number;
      opacity: number;
    }

    let snowParticles: SnowParticle[] = [];
    let rainParticles: RainParticle[] = [];

    if (condition === 'snow') {
      snowParticles = Array.from({ length: 50 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1,
        speedY: Math.random() * 1.2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.7 + 0.3,
      }));
    } else {
      rainParticles = Array.from({ length: 80 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 15 + 10,
        speedY: Math.random() * 8 + 12,
        speedX: -1.5,
        opacity: Math.random() * 0.4 + 0.2,
      }));
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (condition === 'snow') {
        ctx.fillStyle = '#ffffff';
        for (const p of snowParticles) {
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > height) {
            p.y = -5;
            p.x = Math.random() * width;
          }
          if (p.x > width) p.x = 0;
          if (p.x < 0) p.x = width;
        }
      } else {
        // Rain
        ctx.strokeStyle = isDay ? '#38bdf8' : '#60a5fa';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        for (const p of rainParticles) {
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 1.5, p.y + p.length);
          ctx.stroke();
          ctx.restore();

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > height) {
            p.y = -p.length;
            p.x = Math.random() * width;
          }
          if (p.x < 0) p.x = width;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [condition, isDay]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden transition-all duration-700">
      {/* 1. Dynamic Radial Gradients based on weather */}
      {condition === 'sunny' && isDay && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: `radial-gradient(circle at 80% 12%, rgba(251, 191, 36, ${0.28 * combinedWarmth}) 0%, rgba(249, 115, 22, ${0.18 * combinedWarmth}) 35%, transparent 68%)`,
          }}
        />
      )}

      {condition === 'clear-night' && !isDay && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: `radial-gradient(circle at 80% 15%, rgba(147, 197, 253, 0.12) 0%, rgba(30, 58, 138, 0.08) 40%, transparent 70%)`,
          }}
        />
      )}

      {(condition === 'rain' || condition === 'storm') && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: isDay
              ? 'linear-gradient(180deg, rgba(203, 213, 225, 0.35) 0%, rgba(148, 163, 184, 0.2) 100%)'
              : 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(2, 6, 23, 0.7) 100%)',
          }}
        />
      )}

      {condition === 'snow' && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: isDay
              ? 'linear-gradient(180deg, rgba(241, 245, 249, 0.4) 0%, rgba(226, 232, 240, 0.25) 100%)'
              : 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.6) 100%)',
          }}
        />
      )}

      {condition === 'cloudy' && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: isDay
              ? 'radial-gradient(circle at 50% 10%, rgba(226, 232, 240, 0.6) 0%, transparent 75%)'
              : 'radial-gradient(circle at 50% 10%, rgba(39, 39, 42, 0.5) 0%, transparent 75%)',
          }}
        />
      )}

      {/* 2. Interactive Canvas Particle Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
