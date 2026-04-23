export function calcCaloriesFromServings(caloriesPerServing: number, servings: number): number {
  return Math.round(caloriesPerServing * servings);
}

export function calcCaloriesForFullPackage(caloriesPerServing: number, servingsPerPackage: number): number {
  return Math.round(caloriesPerServing * servingsPerPackage);
}

export function calcCaloriesBurned(metValue: number, weightKg: number, durationMinutes: number): number {
  return Math.round(metValue * weightKg * (durationMinutes / 60));
}

export function calcNetCalories(consumed: number, burned: number): number {
  return consumed - burned;
}

export function calcProgressPercent(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min((current / goal) * 100, 100);
}

export function formatCalories(cal: number): string {
  return Math.round(cal).toLocaleString();
}

export function formatMacro(grams: number): string {
  return Math.round(grams * 10) / 10 + 'g';
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
}

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return getDateString(d);
  });
}

export function recalcFoodEntry(
  caloriesPerServing: number,
  servingsConsumed: number,
  proteinPerServing: number,
  carbsPerServing: number,
  fatPerServing: number,
  sodiumPerServing: number,
) {
  return {
    calories: Math.round(caloriesPerServing * servingsConsumed),
    protein_g: Math.round(proteinPerServing * servingsConsumed * 10) / 10,
    carbs_g: Math.round(carbsPerServing * servingsConsumed * 10) / 10,
    fat_g: Math.round(fatPerServing * servingsConsumed * 10) / 10,
    sodium_mg: Math.round(sodiumPerServing * servingsConsumed),
  };
}
