import { Difficulty, DownloadOption } from './constants';

export type DifficultyFormData = { [key in Difficulty]: boolean };

export interface Beatmap {
  id: string;
  hash: string | null;
  upvotes: number;
  downvotes: number;
  downloads: number;
  rating: number;
  duration: number;
  author: string;
  difficulties: Difficulty[];
}

export interface FiltersFormData extends DifficultyFormData {
  minUpvotes: number;
  maxDownvotes: number;
  minDownloads: number;
  minRating: number;
  minDuration: string;
  maxDuration: string;
  excludedMappers: string;
  download: boolean;
  downloadOption: DownloadOption;
}
