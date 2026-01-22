from typing import Dict
from .. import schemas


def calculate_mediterranean_diet_index(answers: schemas.CalculatorAnswers) -> float:
    """Расчет индекса средиземноморской диеты
    Все значения теперь в неделю"""
    # Максимальные значения для каждого компонента (в неделю)
    max_values = {
        "vegetables": 35,     # 5 порций/день * 7 дней = 35 порций в неделю
        "fruits": 35,         # 5 порций/день * 7 дней = 35 порций в неделю
        "legumes": 3,         # порций в неделю
        "cereals": 35,        # 5 порций/день * 7 дней = 35 порций в неделю
        "fish": 3,            # порций в неделю
        "meat": 2,            # порций в неделю (меньше = лучше)
        "dairy": 14,          # 2 порций/день * 7 дней = 14 порций в неделю
        "alcohol": 14,        # 2 бокала/день * 7 дней = 14 бокалов в неделю
        "oliveOil": 28,       # 4 ст.л./день * 7 дней = 28 ст.л. в неделю
        "nuts": 3,            # порций в неделю
    }

    # Нормализация значений (0-1)
    def normalize(value: float, max_val: float, reverse: bool = False) -> float:
        if reverse:
            # Для мяса - меньше лучше
            return max(0, min(1, (max_val - value) / max_val))
        return max(0, min(1, value / max_val))

    # Веса компонентов
    weights = {
        "vegetables": 0.15,
        "fruits": 0.15,
        "legumes": 0.10,
        "cereals": 0.10,
        "fish": 0.10,
        "meat": 0.10,
        "dairy": 0.05,
        "alcohol": 0.10,
        "oliveOil": 0.10,
        "nuts": 0.05,
    }

    # Расчет нормализованных значений
    normalized = {
        "vegetables": normalize(answers.vegetables or 0, max_values["vegetables"]),
        "fruits": normalize(answers.fruits or 0, max_values["fruits"]),
        "legumes": normalize(answers.legumes or 0, max_values["legumes"]),
        "cereals": normalize(answers.cereals or 0, max_values["cereals"]),
        "fish": normalize(answers.fish or 0, max_values["fish"]),
        "meat": normalize(answers.meat or 0, max_values["meat"], True),
        "dairy": normalize(answers.dairy or 0, max_values["dairy"]),
        "alcohol": normalize(answers.alcohol or 0, max_values["alcohol"]),
        "oliveOil": normalize(answers.oliveOil or 0, max_values["oliveOil"]),
        "nuts": normalize(answers.nuts or 0, max_values["nuts"]),
    }

    # Расчет общего индекса (0-100)
    total_score = 0
    for key, weight in weights.items():
        total_score += normalized[key] * weight * 100

    return round(total_score * 10) / 10


def interpret_score(score: float) -> dict:
    """Интерпретация результата расчета"""
    if score >= 80:
        return {
            "level": "Отлично",
            "description": "Ваш рацион очень близок к средиземноморской диете. Продолжайте в том же духе!",
            "recommendations": [
                "Поддерживайте текущий режим питания",
                "Обратите внимание на разнообразие овощей и фруктов",
                "Продолжайте использовать оливковое масло",
            ],
        }
    elif score >= 60:
        return {
            "level": "Хорошо",
            "description": "Ваш рацион достаточно близок к средиземноморской диете, но есть возможности для улучшения.",
            "recommendations": [
                "Увеличьте потребление овощей и фруктов",
                "Добавьте больше рыбы в рацион",
                "Используйте больше оливкового масла",
                "Сократите потребление мяса",
            ],
        }
    elif score >= 40:
        return {
            "level": "Удовлетворительно",
            "description": "Ваш рацион частично соответствует принципам средиземноморской диеты.",
            "recommendations": [
                "Значительно увеличьте потребление овощей и фруктов",
                "Добавьте бобовые в рацион",
                "Замените часть мяса на рыбу",
                "Используйте оливковое масло вместо других жиров",
                "Добавьте орехи в рацион",
            ],
        }
    else:
        return {
            "level": "Требует улучшения",
            "description": "Ваш рацион далек от принципов средиземноморской диеты. Рекомендуется пересмотреть пищевые привычки.",
            "recommendations": [
                "Начните с увеличения овощей и фруктов до 5 порций в день",
                "Добавьте рыбу минимум 2 раза в неделю",
                "Сократите потребление мяса",
                "Используйте оливковое масло как основной источник жиров",
                "Добавьте бобовые и орехи в рацион",
                "Рассмотрите возможность консультации с диетологом",
            ],
        }
