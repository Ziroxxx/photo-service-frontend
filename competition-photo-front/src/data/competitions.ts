import type { Competition } from '../types/competition';

export const competitionsMock: Competition[] = [
  {
    id: 1,
    title: 'Grand Prix Desert Track 2026',
    type: 'Мотоспорт',
    place: 'Казань',
    dateRange: '14–16 марта 2026',
    stageOptions: ['День 1', 'День 2', 'Финал'],
    cover:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
    description:
      'Многодневное соревнование с несколькими этапами и большим объёмом фотоматериалов.',
    photosCount: 1284,
  },
  {
    id: 2,
    title: 'City Marathon Open',
    type: 'Марафон',
    place: 'Москва',
    dateRange: '07 марта 2026',
    stageOptions: ['Старт', 'Трасса', 'Финиш'],
    cover:
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
    description: 'Городской марафон с фото по стартовым номерам участников.',
    photosCount: 932,
  },
  {
    id: 3,
    title: 'Forest Bike Challenge',
    type: 'Велогонка',
    place: 'Сочи',
    dateRange: '20–21 февраля 2026',
    stageOptions: ['Квалификация', 'Основная гонка'],
    cover:
      'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80',
    description: 'Серия заездов с фильтрацией по этапам и дням проведения.',
    photosCount: 645,
  },
  {
    id: 4,
    title: 'Triathlon Weekend Cup',
    type: 'Триатлон',
    place: 'Анапа',
    dateRange: '01–02 марта 2026',
    stageOptions: ['Плавание', 'Велозаезд', 'Бег'],
    cover:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
    description: 'Комбинированное соревнование с разделением фото по дисциплинам.',
    photosCount: 508,
  },
];