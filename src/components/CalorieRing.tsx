import { CountUp } from './CountUp';

interface Props {
  consumed: number;
  burned: number;
  goal: number;
  theme: 'light' | 'dark';
}

export function CalorieRing({ consumed, burned, goal, theme }: Props) {
  // Mobile-optimized dimensions
  const size = 230;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Formula: Goal - Consumed + Burned = Remaining
  const remaining = goal - consumed + burned;
  const totalBudget = goal + burned;
  
  // Progress: ratio of food consumed
  const progressPct = totalBudget > 0 ? Math.min(consumed / totalBudget, 1) : 0;
  const progressOffset = circumference * (1 - progressPct);

  const overGoal = remaining < 0;

  // Clean pastel palettes
  const trackColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#eef2f0';

  // Primary pastel gradient stops
  const startColor = overGoal
    ? '#f87171' // Pastel coral/red
    : theme === 'dark'
    ? '#34d399' // Pastel mint
    : '#10b981'; // Fresh pastel emerald

  const endColor = overGoal
    ? '#fb7185'
    : theme === 'dark'
    ? '#6ee7b7'
    : '#34d399';

  return (
    <div className="relative flex items-center justify-center my-2" style={{ width: size, height: size }}>
      {/* Background Soft Radial Glow */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ 
          background: overGoal ? '#f87171' : (theme === 'dark' ? '#34d399' : '#10b981'),
          transition: 'background 0.5s ease'
        }}
      />

      <svg 
        width={size} 
        height={size} 
        style={{ transform: 'rotate(-90deg)' }} 
        className="filter drop-shadow-sm"
      >
        <defs>
          <linearGradient id="ringPastelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>

        {/* Outer Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringPastelGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          style={{
            strokeLinecap: 'round',
            transition: 'stroke-dashoffset 1.3s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.4s ease',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <div className="flex flex-col items-center leading-none">
          <div
            className="font-black tracking-tight"
            style={{ 
              fontSize: 54, 
              color: overGoal 
                ? (theme === 'dark' ? '#f87171' : '#dc2626') 
                : (theme === 'dark' ? '#f8fafc' : '#1e293b'),
              transition: 'color 0.3s ease'
            }}
          >
            <CountUp value={Math.abs(remaining)} />
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5 px-3 py-0.5 rounded-full"
            style={{
              background: overGoal 
                ? (theme === 'dark' ? 'rgba(248, 113, 113, 0.15)' : '#fee2e2')
                : (theme === 'dark' ? 'rgba(52, 211, 153, 0.12)' : '#ecfdf5'),
              color: overGoal 
                ? (theme === 'dark' ? '#fca5a5' : '#b91c1c') 
                : (theme === 'dark' ? '#6ee7b7' : '#047857'),
            }}
          >
            {overGoal ? 'Calorías de Exceso' : 'Calorías Restantes'}
          </span>
        </div>
      </div>
    </div>
  );
}
