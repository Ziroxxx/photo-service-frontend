export type CompetitionType = 'Мотоспорт' | 'Марафон' | 'Велогонка' | 'Триатлон';

export type Competition = {
  id: number;
  title: string;
  type: CompetitionType;
  place: string;
  dateRange: string;
  stageOptions: string[];
  cover: string;
  description: string;
  photosCount: number;
};