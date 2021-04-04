import { DifficultyFormData } from './types';

export enum Difficulty {
  EASY = 'is-easy',
  NORMAL = 'is-dark',
  HARD = 'is-hard',
  EXPERT = 'is-expert',
  EXPERT_PLUS = 'is-expert-plus',
}

export const initialFilters = {
  minUpvotes: 0,
  maxDownvotes: 9999,
  minDownloads: 0,
  minRating: 0,
  minDuration: '00:00:00',
  maxDuration: '23:59:59',
  excludedMappers: '',
  download: false,
  ...Object.values(Difficulty).reduce((acc, difficulty) => ({
    ...acc,
    [difficulty]: true,
  }), {} as DifficultyFormData),
};

export const FILTERS_KEY = 'bt-filters';
