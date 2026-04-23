export interface FoodLibraryItem {
  name: string;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_size_g: number;
  icon: string;
}

export const COMMON_FOODS: FoodLibraryItem[] = [
  { name: 'Huevo (1 unidad)', calories_per_serving: 70, protein_g: 6, carbs_g: 0.5, fat_g: 5, serving_size_g: 50, icon: '🥚' },
  { name: 'Pechuga de Pollo (100g)', calories_per_serving: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, serving_size_g: 100, icon: '🍗' },
  { name: 'Banana (mediana)', calories_per_serving: 105, protein_g: 1.3, carbs_g: 27, fat_g: 0.4, serving_size_g: 120, icon: '🍌' },
  { name: 'Manzana (mediana)', calories_per_serving: 95, protein_g: 0.5, carbs_g: 25, fat_g: 0.3, serving_size_g: 180, icon: '🍎' },
  { name: 'Arroz Blanco (cocido, 100g)', calories_per_serving: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3, serving_size_g: 100, icon: '🍚' },
  { name: 'Pan Integral (feta)', calories_per_serving: 80, protein_g: 4, carbs_g: 15, fat_g: 1, serving_size_g: 30, icon: '🍞' },
  { name: 'Yogur Natural (190g)', calories_per_serving: 110, protein_g: 6, carbs_g: 9, fat_g: 6, serving_size_g: 190, icon: '🍦' },
  { name: 'Avena (40g)', calories_per_serving: 150, protein_g: 5, carbs_g: 27, fat_g: 3, serving_size_g: 40, icon: '🥣' },
  { name: 'Palta (media)', calories_per_serving: 160, protein_g: 2, carbs_g: 8.5, fat_g: 15, serving_size_g: 100, icon: '🥑' },
  { name: 'Carne Vacuna (100g)', calories_per_serving: 250, protein_g: 26, carbs_g: 0, fat_g: 15, serving_size_g: 100, icon: '🥩' },
];
