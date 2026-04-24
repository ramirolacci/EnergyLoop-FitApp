import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { formatNumber } from '../lib/calculations';

interface Props {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function CountUp({ value, duration = 1.5, decimals = 0, className, style }: Props) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef({ val: 0 });

  useEffect(() => {
    if (!elementRef.current) return;

    gsap.to(countRef.current, {
      val: value,
      duration,
      ease: 'power2.out',
      onStart: () => {
        elementRef.current?.classList.add('animate-pulse-subtle');
      },
      onUpdate: () => {
        if (elementRef.current) {
          elementRef.current.innerText = formatNumber(countRef.current.val, decimals);
        }
      },
      onComplete: () => {
        setTimeout(() => {
          elementRef.current?.classList.remove('animate-pulse-subtle');
        }, 300);
      }
    });
  }, [value, duration, decimals]);

  return (
    <span ref={elementRef} className={className} style={style}>
      {formatNumber(0, decimals)}
    </span>
  );
}
