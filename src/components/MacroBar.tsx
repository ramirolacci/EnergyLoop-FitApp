import { formatNumber } from '../lib/calculations';

interface MacroBarItemProps {
  label: string;
  current: number;
  goal?: number;
  unit: string;
  barColor: string;
  bgColor: string;
  textColor: string;
  icon: string;
  theme: 'light' | 'dark';
}

function MacroBarItem({ label, current, goal, unit, barColor, bgColor, textColor, icon, theme }: MacroBarItemProps) {
  const pct = goal ? Math.min((current / goal) * 100, 100) : 0;
  const trackColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  return (
    <div 
      className="flex-1 p-3 rounded-2xl flex flex-col gap-2 transition-all"
      style={{ 
        background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : bgColor,
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'transparent'}`
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{icon}</span>
          <span className="text-[11px] font-bold" style={{ color: theme === 'dark' ? '#94a3b8' : textColor }}>
            {label}
          </span>
        </div>
        <span className="text-[11px] font-black" style={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}>
          {formatNumber(current, 0)}{unit}
        </span>
      </div>

      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 6, background: trackColor }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: barColor,
            transition: 'width 0.8s cubic-bezier(.34, 1.56, 0.64, 1)',
          }}
        />
      </div>

      {goal && (
        <span className="text-[9px] font-medium text-right opacity-60" style={{ color: theme === 'dark' ? '#94a3b8' : textColor }}>
          de {goal}{unit}
        </span>
      )}
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
  return (
    <div className="flex gap-2 w-full">
      {/* Proteína - Pastel Coral */}
      <MacroBarItem
        label="Proteína"
        current={protein}
        goal={proteinGoal ?? 150}
        unit="g"
        icon="🥩"
        barColor="#ff8596"
        bgColor="#fff1f2"
        textColor="#be123c"
        theme={theme}
      />

      {/* Carbos - Pastel Trigo / Miel */}
      <MacroBarItem
        label="Carbos"
        current={carbs}
        goal={250}
        unit="g"
        icon="🥖"
        barColor="#fbbf24"
        bgColor="#fefce8"
        textColor="#b45309"
        theme={theme}
      />

      {/* Grasas - Pastel Lavanda / Cielo */}
      <MacroBarItem
        label="Grasas"
        current={fat}
        goal={65}
        unit="g"
        icon="🥑"
        barColor="#818cf8"
        bgColor="#eff6ff"
        textColor="#1d4ed8"
        theme={theme}
      />
    </div>
  );
}
