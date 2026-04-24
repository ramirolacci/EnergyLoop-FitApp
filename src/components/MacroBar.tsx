import { PText } from '@porsche-design-system/components-react';
import { formatNumber } from '../lib/calculations';

interface MacroBarItemProps {
  label: string;
  current: number;
  goal?: number;
  unit: string;
  color: string;
  theme: 'light' | 'dark';
}

function MacroBarItem({ label, current, goal, unit, color, theme }: MacroBarItemProps) {
  const pct = goal ? Math.min((current / goal) * 100, 100) : 0;
  const trackColor = theme === 'dark' ? '#2a2a2e' : '#eeeff2';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <PText size="x-small" weight="semi-bold" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
          {label}
        </PText>
        <PText size="x-small" theme={theme}>
          {formatNumber(current, 1)}{unit}{goal ? ` / ${formatNumber(goal, 0)}${unit}` : ''}
        </PText>
      </div>
      <div
        className="rounded-full overflow-hidden"
        style={{ height: 6, background: trackColor }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: color,
            transition: 'width 0.6s cubic-bezier(.25,.1,.25,1)',
          }}
        />
      </div>
    </div>
  );
}

interface Props {
  protein: number;
  carbs: number;
  fat: number;
  proteinGoal?: number;
  theme: 'light' | 'dark';
}

export function MacroBar({ protein, carbs, fat, proteinGoal, theme }: Props) {
  const total = protein * 4 + carbs * 4 + fat * 9;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 justify-between">
        {[
          { label: 'Proteína', value: protein, color: '#ff6b00', kcal: protein * 4 },
          { label: 'Carbos', value: carbs, color: '#0076ff', kcal: carbs * 4 },
          { label: 'Grasa', value: fat, color: '#ffca28', kcal: fat * 9 },
        ].map(({ label, value, color, kcal }) => {
          const pct = total > 0 ? Math.round((kcal / total) * 100) : 0;
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: color }}
              />
              <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                {label}
              </PText>
              <PText size="x-small" weight="semi-bold" theme={theme}>
                {formatNumber(value, 1)}g
              </PText>
              <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                {pct}%
              </PText>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <MacroBarItem
          label="Proteína"
          current={protein}
          goal={proteinGoal}
          unit="g"
          color="#ff6b00"
          theme={theme}
        />
        <MacroBarItem
          label="Carbohidratos"
          current={carbs}
          unit="g"
          color="#0076ff"
          theme={theme}
        />
        <MacroBarItem
          label="Grasa"
          current={fat}
          unit="g"
          color="#ffca28"
          theme={theme}
        />
      </div>
    </div>
  );
}
