import { CountUp } from './CountUp';

interface Props {
  consumed: number;
  burned: number;
  goal: number;
  theme: 'light' | 'dark';
}

export function CalorieRing({ consumed, burned, goal, theme }: Props) {
  const size = 220;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const innerRadius = radius - strokeWidth - 6;
  const innerCircumference = 2 * Math.PI * innerRadius;

  const consumedPct = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const burnedPct = goal > 0 ? Math.min(burned / goal, 1) : 0;

  const consumedOffset = circumference * (1 - consumedPct);
  const burnedOffset = innerCircumference * (1 - burnedPct);

  const net = consumed - burned;
  const overGoal = consumed > goal;

  const trackColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const consumedColor = overGoal ? '#e00000' : (theme === 'dark' ? '#fbfcff' : '#010205');
  const burnedColor = '#018a16';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track Main */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Consumed ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={consumedColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={consumedOffset}
          style={{
            strokeLinecap: 'round',
            transition: 'stroke-dashoffset 1s cubic-bezier(.34, 1.56, 0.64, 1), stroke 0.3s ease',
          }}
        />

        {/* Track Inner */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerRadius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth - 4}
        />
        {/* Burned ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerRadius}
          fill="none"
          stroke={burnedColor}
          strokeWidth={strokeWidth - 4}
          strokeDasharray={innerCircumference}
          strokeDashoffset={burnedOffset}
          style={{
            strokeLinecap: 'round',
            transition: 'stroke-dashoffset 1s cubic-bezier(.34, 1.56, 0.64, 1)',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
        <div
          className="font-black tracking-tighter"
          style={{ fontSize: 48, color: theme === 'dark' ? '#fbfcff' : '#010205', lineHeight: 1 }}
        >
          <CountUp value={net} />
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1"
          style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}
        >
          kcal netas
        </span>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold opacity-50" style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>CONS.</span>
            <div className="text-xs font-bold" style={{ color: consumedColor }}>
              <CountUp value={consumed} />
            </div>
          </div>
          <div className="h-4 w-px bg-current opacity-10" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold opacity-50" style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>QUEM.</span>
            <div className="text-xs font-bold" style={{ color: burnedColor }}>
              <CountUp value={burned} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
