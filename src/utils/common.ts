export const getTextFromNode = (node: Node | null): string => node?.textContent?.split(' ')[0] || '';

export const parseIntFromNode = (node: Node | null): number => parseInt(getTextFromNode(node), 10);

export const parseTimeToSeconds = (time = '00:00:00'): number => {
  const [hours = 0, minutes = 0, seconds = 0] = time.split(':').map(Number);
  return hours * 60 * 60 + minutes * 60 + seconds;
};

export const parseTimeFromNode = (node: Node | null): number => {
  const time = getTextFromNode(node);
  return parseTimeToSeconds(`00:` + time);
};

export const getBeatmapIdFromImage = (
  node: Element | null,
): string | null => node?.getAttribute('src')?.match(/\/(\w+)\./)?.[1] || null;

export const isValidDate = (date: any): date is Date => !isNaN(date) && date instanceof Date;
