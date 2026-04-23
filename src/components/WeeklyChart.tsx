import { PText } from '@porsche-design-system/components-react';
import type { DayStats } from '../lib/types';
import { formatDateLabel } from '../lib/calculations';

interface Props {
  days: DayStats[];
  goal: number;
  theme: 'light' | 'dark';
}

export function WeeklyChart({ days, goal, theme }: Props) {
  const chartH = 120;
  const chartW = 100;
  const barW = 10;
  const gap = (chartW - days.length * barW) / (days.length + 1);
  const maxVal = Math.max(goal * 1.2, ...days.map(d => d.calories_consumed), 100);

  const textColor = theme === 'dark' ? '#afb0b3' : '#535457';
  const goalLineColor = theme === 'dark' ? '#535457' : '#afb0b3';
  const consumedColor = theme === 'dark' ? '#fbfcff' : '#010205';
  const burnedColor = '#018a16';

  const goalY = chartH - (goal / maxVal) * chartH;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${chartW} ${chartH + 20}`}
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
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />

        {days.map((day, i) => {
          const x = gap + i * (barW + gap);
          const consumedH = Math.max((day.calories_consumed / maxVal) * chartH, 1);
          const burnedH = Math.max((day.calories_burned / maxVal) * chartH, 0.5);
          const isToday = i === days.length - 1;
          const overGoal = day.calories_consumed > goal;

          return (
            <g key={day.date}>
              {/* Consumed bar */}
              <rect
                x={x}
                y={chartH - consumedH}
                width={barW}
                height={consumedH}
                rx="2"
                fill={overGoal ? '#e00000' : consumedColor}
                opacity={isToday ? 1 : 0.5}
              />
              {/* Burned bar (overlay, smaller width) */}
              {day.calories_burned > 0 && (
                <rect
                  x={x + barW / 2 - 2}
                  y={chartH - burnedH}
                  width={4}
                  height={burnedH}
                  rx="1"
                  fill={burnedColor}
                  opacity={isToday ? 0.9 : 0.5}
                />
              )}
              {/* Day label */}
              <text
                x={x + barW / 2}
                y={chartH + 12}
                textAnchor="middle"
                fontSize="5"
                fill={isToday ? (theme === 'dark' ? '#fbfcff' : '#010205') : textColor}
                fontWeight={isToday ? 'bold' : 'normal'}
              >
                {formatDateLabel(day.date).split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1">
          <span className="inline-block rounded" style={{ width: 10, height: 6, background: consumedColor, opacity: 0.7 }} />
          <PText size="xx-small" theme={theme} style={{ color: textColor }}>Consumidas</PText>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block rounded" style={{ width: 10, height: 6, background: burnedColor, opacity: 0.7 }} />
          <PText size="xx-small" theme={theme} style={{ color: textColor }}>Quemadas</PText>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block" style={{ width: 10, height: 1, background: goalLineColor, borderTop: `1px dashed ${goalLineColor}` }} />
          <PText size="xx-small" theme={theme} style={{ color: textColor }}>Objetivo</PText>
        </div>
      </div>
    </div>
  );
}
