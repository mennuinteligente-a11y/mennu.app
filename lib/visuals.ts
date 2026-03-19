import { MealType } from '@/lib/types';

const visualMap: Array<{ keys: string[]; emoji: string; accent: string; bg: string; label: string }> = [
  { keys: ['arroz', 'risoto'], emoji: '🍚', accent: '#10b981', bg: 'linear-gradient(135deg, rgba(16,185,129,0.28), rgba(16,185,129,0.08))', label: 'Arroz' },
  { keys: ['feijão', 'feijao'], emoji: '🫘', accent: '#8b5cf6', bg: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(139,92,246,0.08))', label: 'Feijão' },
  { keys: ['omelete', 'ovo', 'crepioca'], emoji: '🍳', accent: '#f59e0b', bg: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(245,158,11,0.08))', label: 'Ovos' },
  { keys: ['frango'], emoji: '🍗', accent: '#ef4444', bg: 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.08))', label: 'Frango' },
  { keys: ['macarrão', 'macarrao', 'massa'], emoji: '🍝', accent: '#fb7185', bg: 'linear-gradient(135deg, rgba(251,113,133,0.3), rgba(251,113,133,0.08))', label: 'Massas' },
  { keys: ['sanduíche', 'sanduiche', 'pão', 'pao', 'torrada'], emoji: '🥪', accent: '#22c55e', bg: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(34,197,94,0.08))', label: 'Lanche' },
  { keys: ['panqueca'], emoji: '🥞', accent: '#f97316', bg: 'linear-gradient(135deg, rgba(249,115,22,0.3), rgba(249,115,22,0.08))', label: 'Panqueca' },
  { keys: ['cuscuz'], emoji: '🌽', accent: '#f59e0b', bg: 'linear-gradient(135deg, rgba(245,158,11,0.28), rgba(245,158,11,0.08))', label: 'Cuscuz' },
  { keys: ['sopa', 'creme'], emoji: '🍲', accent: '#f97316', bg: 'linear-gradient(135deg, rgba(249,115,22,0.3), rgba(249,115,22,0.08))', label: 'Sopa' },
  { keys: ['tapioca'], emoji: '🫓', accent: '#eab308', bg: 'linear-gradient(135deg, rgba(234,179,8,0.28), rgba(234,179,8,0.08))', label: 'Tapioca' },
  { keys: ['sardinha'], emoji: '🐟', accent: '#0ea5e9', bg: 'linear-gradient(135deg, rgba(14,165,233,0.28), rgba(14,165,233,0.08))', label: 'Peixes' },
  { keys: ['salada', 'legumes', 'cenoura', 'tomate'], emoji: '🥗', accent: '#14b8a6', bg: 'linear-gradient(135deg, rgba(20,184,166,0.3), rgba(20,184,166,0.08))', label: 'Vegetais' },
  { keys: ['banana', 'laranja', 'fruta'], emoji: '🍌', accent: '#eab308', bg: 'linear-gradient(135deg, rgba(234,179,8,0.28), rgba(234,179,8,0.08))', label: 'Frutas' },
  { keys: ['iogurte', 'queijo'], emoji: '🧀', accent: '#06b6d4', bg: 'linear-gradient(135deg, rgba(6,182,212,0.28), rgba(6,182,212,0.08))', label: 'Laticínios' },
  { keys: ['café', 'cafe'], emoji: '☕', accent: '#a16207', bg: 'linear-gradient(135deg, rgba(161,98,7,0.28), rgba(161,98,7,0.08))', label: 'Café' }
];

export function getRecipeVisual(recipeName: string, mealType: MealType) {
  const normalized = recipeName.toLowerCase();
  const found = visualMap.find((item) => item.keys.some((key) => normalized.includes(key)));

  if (found) return found;

  const fallbackByMeal: Record<MealType, { emoji: string; accent: string; bg: string; label: string }> = {
    cafe: { emoji: '☀️', accent: '#f59e0b', bg: 'linear-gradient(135deg, rgba(245,158,11,0.28), rgba(245,158,11,0.08))', label: 'Café da manhã' },
    almoco: { emoji: '🍽️', accent: '#3b82f6', bg: 'linear-gradient(135deg, rgba(59,130,246,0.28), rgba(59,130,246,0.08))', label: 'Almoço' },
    jantar: { emoji: '🌙', accent: '#8b5cf6', bg: 'linear-gradient(135deg, rgba(139,92,246,0.28), rgba(139,92,246,0.08))', label: 'Jantar' }
  };

  return fallbackByMeal[mealType];
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
