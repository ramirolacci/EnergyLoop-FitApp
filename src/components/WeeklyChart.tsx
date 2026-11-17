import type { DayStats } from '../lib/types';
import { formatDateLabel } from '../lib/calculations';

interface Props {
  days: DayStats[];
  goal: number;
  theme: 'light' | 'dark';
}

export function WeeklyChart({ days, goal, theme }: Props) {
  const chartH = 110;
  const chartW = 100;
  const barW = 8;
  const gap = (chartW - days.length * barW) / (days.length + 1);
  const maxVal = Math.max(goal * 1.25, ...days.map(d => d.calories_consumed), 100);

  const goalLineColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
  const barConsumedColor = theme === 'dark' ? '#34d399' : '#10b981';
  const barOverGoalColor = '#f87171'; // Pastel Red

  const goalY = chartH - (goal / maxVal) * chartH;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${chartW} ${chartH + 24}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', overflow: 'visible' }}
      >
        {/* Goal line */}
        <line
          x1="0"
          y1={goalY}
          x2={chartW}
          y2={goalY}
          stroke={goalLineColor}
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />

        {days.map((day, i) => {
          const x = gap + i * (barW + gap);
          const consumedH = Math.max((day.calories_consumed / maxVal) * chartH, 2);
          const isToday = i === days.length - 1;
          const overGoal = day.calories_consumed > goal;

          return (
            <g key={day.date}>
              {/* Background Track Bar */}
              <rect
                x={x}
                y={0}
                width={barW}
                height={chartH}
                rx={barW / 2}
                fill={theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f1f5f3'}
              />

              {/* Consumed Bar */}
              <rect
                x={x}
                y={chartH - consumedH}
                width={barW}
                height={consumedH}
                rx={barW / 2}
                fill={overGoal ? barOverGoalColor : barConsumedColor}
                opacity={isToday ? 1 : 0.65}
              />

              {/* Day Label */}
              <text
                x={x + barW / 2}
                y={chartH + 16}
                textAnchor="middle"
                fontSize="4"
                fontWeight={isToday ? '800' : '500'}
                fill={isToday 
                  ? (theme === 'dark' ? '#34d399' : '#047857') 
                  : (theme === 'dark' ? '#94a3b8' : '#64748b')}
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
