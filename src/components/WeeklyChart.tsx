import type { DayStats } from '../lib/types';
import { formatDateLabel } from '../lib/calculations';

interface Props {
  days: DayStats[];
  goal: number;
  theme?: 'light' | 'dark';
}

export function WeeklyChart({ days, goal }: Props) {
  const chartH = 95;
  const chartW = 100;
  const barW = 7;
  const gap = (chartW - days.length * barW) / (days.length + 1);
  const maxVal = Math.max(goal * 1.25, ...days.map(d => d.calories_consumed), 100);

  const goalLineColor = 'rgba(112, 100, 83, 0.15)';
  const barConsumedColor = '#4eba87';
  const barOverGoalColor = '#f87171'; // Coral pastel suave

  const goalY = chartH - (goal / maxVal) * chartH;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${chartW} ${chartH + 20}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', overflow: 'visible' }}
      >
        {/* Línea de meta */}
        <line
          x1="0"
          y1={goalY}
          x2={chartW}
          y2={goalY}
          stroke={goalLineColor}
          strokeWidth="0.6"
          strokeDasharray="2 2"
        />

        {days.map((day, i) => {
          const x = gap + i * (barW + gap);
          const consumedH = Math.max((day.calories_consumed / maxVal) * chartH, 2);
          const isToday = i === days.length - 1;
          const overGoal = day.calories_consumed > goal;

          return (
            <g key={day.date}>
              {/* Pista de fondo - Beige pastel */}
              <rect
                x={x}
                y={0}
                width={barW}
                height={chartH}
                rx={barW / 2}
                fill="#f7f4ee"
              />

              {/* Barra de consumo - Verde pastel */}
              <rect
                x={x}
                y={chartH - consumedH}
                width={barW}
                height={consumedH}
                rx={barW / 2}
                fill={overGoal ? barOverGoalColor : barConsumedColor}
                opacity={isToday ? 1 : 0.6}
              />

              {/* Etiqueta del día */}
              <text
                x={x + barW / 2}
                y={chartH + 13}
                textAnchor="middle"
                fontSize="3.5"
                fontWeight={isToday ? '800' : '600'}
                fill={isToday ? '#1d5f3f' : '#78716c'}
              >
                {formatDateLabel(day.date).split(' ')[0].toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
