// src/components/StatItem.tsx
import React, { useEffect, useRef, useState } from "react";

interface StatItemProps {
  number: string;
  label: string;
  delay?: number;
  style?: React.CSSProperties;
  numberClassName?: string;
  labelClassName?: string;
}

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) {
      setCount(0); // Reset when not visible
      return;
    }
    
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      setCount(Math.floor(progressRatio * target));

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration, start]);

  return count;
}

const DigitSegment: React.FC<{ digits: string; start: boolean; duration?: number }> = ({ 
  digits, 
  start, 
  duration = 1200 
}) => {
  const numericTarget = parseInt(digits.replace(/,/g, ""), 10) || 0;
  const count = useCountUp(numericTarget, duration, start);
  return <span>{count.toLocaleString()}</span>;
};

const StatItem: React.FC<StatItemProps> = ({ 
  number, 
  label, 
  delay = 0,
  style,
  numberClassName,
  labelClassName 
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Clear any existing timeout
            if (timeoutRef.current !== null) {
              clearTimeout(timeoutRef.current);
            }
            // Set visible after delay
            timeoutRef.current = setTimeout(() => setVisible(true), delay);
          } else {
            // Reset when out of view
            if (timeoutRef.current !== null) {
              clearTimeout(timeoutRef.current);
            }
            setVisible(false);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (ref.current) obs.observe(ref.current);
    
    return () => {
      obs.disconnect();
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);

  const parts = number.split(/(\d[\d,]*)/);

  return (
    <div ref={ref} className="stat-item" style={style}>
      <div className={`stat-number ${numberClassName || ''}`}>
        {parts.map((part, i) => {
          if (/^\d[\d,]*$/.test(part)) {
            return <DigitSegment key={i} digits={part} start={visible} />;
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
      <div className={`stat-label ${labelClassName || ''}`}>{label}</div>
    </div>
  );
};

export default StatItem;