import { CountUp } from './CountUp';

interface Props {
  consumed: number;
  burned: number;
  goal: number;
  theme: 'light' | 'dark';
}

export function CalorieRing({ consumed, burned, goal, theme }: Props) {
  // Escala perfecta para mobile (Play Store / App Store standard)
  const size = 168;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Fórmula: Meta - Consumido + Quemado = Restantes
  const remaining = goal - consumed + burned;
  const totalBudget = goal + burned;
  
  // Progreso
  const progressPct = totalBudget > 0 ? Math.min(consumed / totalBudget, 1) : 0;
  const progressOffset = circumference * (1 - progressPct);

  const overGoal = remaining < 0;

  // Track en tono pastel mate sólido
  const trackColor = '#efe9dc';

  // Degradado verde pastel mate sólido
  const startColor = overGoal ? '#f3705a' : '#3ba676';
  const endColor = overGoal ? '#ea7a40' : '#42b883';

  return (
    <div className="relative flex items-center justify-center my-1" style={{ width: size, height: size }}>
      {/* Resplandor radial pastel muy suave */}
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-15 pointer-events-none"
        style={{ 
          background: overGoal ? '#f87171' : '#4eba87',
          transition: 'background 0.5s ease'
        }}
      />

      <svg 
        width={size} 
        height={size} 
        style={{ transform: 'rotate(-90deg)' }} 
        className="filter drop-shadow-xs"
      >
        <defs>
          <linearGradient id="ringPastelEnergy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>

        {/* Pista de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        {/* Arco de progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringPastelEnergy)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          style={{
            strokeLinecap: 'round',
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </svg>

      {/* Contenido central compacto y proporcional */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center">
        <div className="flex flex-col items-center leading-none">
          <div
            className="font-black tracking-tight"
            style={{ 
              fontSize: 34, 
              color: overGoal 
                ? (theme === 'dark' ? '#f87171' : '#dc2626') 
                : (theme === 'dark' ? '#f8fafc' : '#1e293b'),
              transition: 'color 0.3s ease'
            }}
          >
            <CountUp value={Math.abs(remaining)} />
          </div>
          <span
            className="text-[9px] font-extrabold uppercase tracking-wider mt-1 px-2.5 py-0.5 rounded-full"
            style={{
              background: overGoal 
                ? (theme === 'dark' ? 'rgba(248, 113, 113, 0.15)' : '#fff0e6')
                : (theme === 'dark' ? 'rgba(78, 186, 135, 0.15)' : '#e8f5ee'),
              color: overGoal 
                ? (theme === 'dark' ? '#fca5a5' : '#c2410c') 
                : (theme === 'dark' ? '#6ee7b7' : '#1d5f3f'),
            }}
          >
            {overGoal ? 'kcal exceso' : 'kcal restantes'}
          </span>
        </div>
      </div>
    </div>
  );
}
