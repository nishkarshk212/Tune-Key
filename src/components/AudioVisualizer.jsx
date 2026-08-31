import React, { useEffect, useRef } from 'react';

export default function AudioVisualizer({ isPlaying = true, barCount = 28, height = 36, color = '#ef4444' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let bars = Array.from({ length: barCount }, () => ({
      height: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.04 + 0.02,
      direction: Math.random() > 0.5 ? 1 : -1
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / barCount - 2;

      bars.forEach((bar, i) => {
        if (isPlaying) {
          bar.height += bar.speed * bar.direction;
          if (bar.height > 1) {
            bar.height = 1;
            bar.direction = -1;
          } else if (bar.height < 0.15) {
            bar.height = 0.15;
            bar.direction = 1;
          }
        }

        const currentHeight = bar.height * canvas.height;
        const x = i * (barWidth + 2);
        const y = (canvas.height - currentHeight) / 2;

        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, y, 0, y + currentHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, '#229ed9');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, currentHeight, [3, 3, 3, 3]);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, barCount, height, color]);

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 8}
      height={height}
      className="inline-block opacity-90 transition-opacity hover:opacity-100"
    />
  );
}
