import { CalculatorAnswers, Interpretation } from '../types';

// Расчет индекса средиземноморской диеты
// Формула основана на стандартных критериях средиземноморской диеты

export const calculateMediterraneanDietIndex = (answers: CalculatorAnswers): number => {
  // Максимальные значения для каждого компонента
  const maxValues = {
    vegetables: 5,      // порций в день
    fruits: 5,          // порций в день
    legumes: 3,         // порций в неделю
    cereals: 5,         // порций в день
    fish: 3,            // порций в неделю
    meat: 2,            // порций в неделю (меньше = лучше)
    dairy: 2,           // порций в день
    alcohol: 2,         // бокалов в день (умеренное потребление)
    oliveOil: 4,        // столовых ложек в день
    nuts: 3,            // порций в неделю
  };

  // Нормализация значений (0-1)
  const normalize = (value: number, max: number, reverse: boolean = false): number => {
    if (reverse) {
      // Для мяса - меньше лучше
      return Math.max(0, Math.min(1, (max - value) / max));
    }
    return Math.max(0, Math.min(1, value / max));
  };

  // Веса компонентов
  const weights = {
    vegetables: 0.15,
    fruits: 0.15,
    legumes: 0.10,
    cereals: 0.10,
    fish: 0.10,
    meat: 0.10,
    dairy: 0.05,
    alcohol: 0.10,
    oliveOil: 0.10,
    nuts: 0.05,
  };

  // Расчет нормализованных значений
  const normalized = {
    vegetables: normalize(answers.vegetables || 0, maxValues.vegetables),
    fruits: normalize(answers.fruits || 0, maxValues.fruits),
    legumes: normalize(answers.legumes || 0, maxValues.legumes),
    cereals: normalize(answers.cereals || 0, maxValues.cereals),
    fish: normalize(answers.fish || 0, maxValues.fish),
    meat: normalize(answers.meat || 0, maxValues.meat, true),
    dairy: normalize(answers.dairy || 0, maxValues.dairy),
    alcohol: normalize(answers.alcohol || 0, maxValues.alcohol),
    oliveOil: normalize(answers.oliveOil || 0, maxValues.oliveOil),
    nuts: normalize(answers.nuts || 0, maxValues.nuts),
  };

  // Расчет общего индекса (0-100)
  let totalScore = 0;
  Object.keys(weights).forEach((key) => {
    const weightKey = key as keyof typeof weights;
    totalScore += normalized[weightKey] * weights[weightKey] * 100;
  });

  return Math.round(totalScore * 10) / 10;
};

export const interpretScore = (score: number): Interpretation => {
  if (score >= 80) {
    return {
      level: 'Отлично',
      description: 'Ваш рацион очень близок к средиземноморской диете. Продолжайте в том же духе!',
      recommendations: [
        'Поддерживайте текущий режим питания',
        'Обратите внимание на разнообразие овощей и фруктов',
        'Продолжайте использовать оливковое масло',
      ],
    };
  } else if (score >= 60) {
    return {
      level: 'Хорошо',
      description: 'Ваш рацион достаточно близок к средиземноморской диете, но есть возможности для улучшения.',
      recommendations: [
        'Увеличьте потребление овощей и фруктов',
        'Добавьте больше рыбы в рацион',
        'Используйте больше оливкового масла',
        'Сократите потребление мяса',
      ],
    };
  } else if (score >= 40) {
    return {
      level: 'Удовлетворительно',
      description: 'Ваш рацион частично соответствует принципам средиземноморской диеты.',
      recommendations: [
        'Значительно увеличьте потребление овощей и фруктов',
        'Добавьте бобовые в рацион',
        'Замените часть мяса на рыбу',
        'Используйте оливковое масло вместо других жиров',
        'Добавьте орехи в рацион',
      ],
    };
  } else {
    return {
      level: 'Требует улучшения',
      description: 'Ваш рацион далек от принципов средиземноморской диеты. Рекомендуется пересмотреть пищевые привычки.',
      recommendations: [
        'Начните с увеличения овощей и фруктов до 5 порций в день',
        'Добавьте рыбу минимум 2 раза в неделю',
        'Сократите потребление мяса',
        'Используйте оливковое масло как основной источник жиров',
        'Добавьте бобовые и орехи в рацион',
        'Рассмотрите возможность консультации с диетологом',
      ],
    };
  }
};
