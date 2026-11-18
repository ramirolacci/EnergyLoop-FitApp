import { formatNumber } from '../lib/calculations';

interface MacroBarItemProps {
  label: string;
  current: number;
  goal?: number;
  unit: string;
  barColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
  theme: 'light' | 'dark';
}

function MacroBarItem({ label, current, goal, unit, barColor, bgColor, borderColor, textColor, icon }: MacroBarItemProps) {
  const pct = goal ? Math.min((current / goal) * 100, 100) : 0;
  const trackColor = 'rgba(0, 0, 0, 0.05)';

  return (
    <div 
      className="flex-1 p-2.5 rounded-2xl flex flex-col gap-1.5 transition-all"
      style={{ 
        background: bgColor,
        border: `1px solid ${borderColor}`
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xs">{icon}</span>
          <span className="text-[10px] font-bold" style={{ color: textColor }}>
            {label}
          </span>
        </div>
        <span className="text-[10px] font-black" style={{ color: '#1e293b' }}>
          {formatNumber(current, 0)}{unit}
        </span>
      </div>

      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 5, background: trackColor }}
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
        <span className="text-[9px] font-medium text-right opacity-60" style={{ color: textColor }}>
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
      {/* Proteínas - Naranja Pastel Suave */}
      <MacroBarItem
        label="Proteínas"
        current={protein}
        goal={proteinGoal ?? 150}
        unit="g"
        icon="🥩"
        barColor="#fba471"
        bgColor="#fff0e6"
        borderColor="#fed7aa"
        textColor="#c2410c"
        theme={theme}
      />

      {/* Carbohidratos - Beige Pastel Cálido */}
      <MacroBarItem
        label="Carbos"
        current={carbs}
        goal={250}
        unit="g"
        icon="🥖"
        barColor="#e0cfb8"
        bgColor="#f7f4ee"
        borderColor="#e9e4d8"
        textColor="#706453"
        theme={theme}
      />

      {/* Grasas - Celeste Pastel Suave */}
      <MacroBarItem
        label="Grasas"
        current={fat}
        goal={65}
        unit="g"
        icon="🥑"
        barColor="#7ec8e3"
        bgColor="#e1f5fe"
        borderColor="#b3e5fc"
        textColor="#0277bd"
        theme={theme}
      />
    </div>
  );
}
