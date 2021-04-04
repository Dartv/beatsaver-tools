import { Difficulty, FILTERS_KEY, initialFilters } from '../constants';
import { Beatmap, FiltersFormData } from '../types';

export const getTextFromNode = (node: Node | null): string => node?.textContent?.split(' ')[0] || '';

export const parseIntFromNode = (node: Node | null): number => parseInt(getTextFromNode(node), 10);

export const parseTimeToSeconds = (time = '00:00:00'): number => {
  const [hours = 0, minutes = 0, seconds = 0] = time.split(':').map(Number);
  return hours * 60 * 60 + minutes * 60 + seconds;
};

export const parseTimeFromNode = (node: Node | null): number => {
  const time = getTextFromNode(node);
  return parseTimeToSeconds(time.padStart(8, '00:'));
};

export const getBeatmapIdFromImage = (
  node: Element | null,
): string | null => node?.getAttribute('src')?.match(/\/(\w+)\./)?.[1] || null;

export const parseBeatmapFromNode = (node: Element): Beatmap => {
  const upvotes = parseIntFromNode(node.querySelector(`li[title="Upvotes"]`)) || initialFilters.minUpvotes;
  const downvotes = parseIntFromNode(node.querySelector(`li[title="Downvotes"]`)) || initialFilters.maxDownvotes;
  const downloads = parseIntFromNode(node.querySelector(`li[title="Downloads"]`)) || initialFilters.minDownloads;
  const rating = parseIntFromNode(node.querySelector(`li[title="Beatmap Rating"]`)) || initialFilters.minRating;
  const duration = parseTimeFromNode(node.querySelector(`li[title="Beatmap Duration"]`)) ||
    parseTimeToSeconds(initialFilters.maxDuration);
  const author = getTextFromNode(node.querySelector('.details > h2 > a')) || '';
  const difficulties = Object.values(Difficulty).reduce((acc, difficulty) => {
    if (node.querySelector(`.tag.${difficulty}`)) {
      return [...acc, difficulty];
    }

    return acc;
  }, [] as Difficulty[]);
  const hash = getBeatmapIdFromImage(node.querySelector('.cover img'));
  const id = node.id;

  return {
    id,
    hash,
    upvotes,
    downvotes,
    downloads,
    rating,
    duration,
    author,
    difficulties,
  };
};

export const isValidDate = (date: any): date is Date => !isNaN(date) && date instanceof Date;

export const downloadFile = (name: string, data: BlobPart): void => {
  const blob = new Blob([data], {
    type: 'application/json',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.setAttribute('download', name);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const getInitialFilters = (): FiltersFormData => {
  try {
    const state = localStorage.getItem(FILTERS_KEY) || '';
    return JSON.parse(state);
  } catch (err) {
    return initialFilters;
  }
};

export const getElementByXPath = (selector: string, node: Node): Node | null => document.evaluate(
  selector,
  node,
  null,
  XPathResult.FIRST_ORDERED_NODE_TYPE,
  null,
).singleNodeValue;
