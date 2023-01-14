import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const tz = 'America/Los_Angeles';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ fetch }) {
  const cacheRes = await fetch('/api/cache');
  const result = await cacheRes.json();
  const cache = result && JSON.parse(result);
  const dayjsLocal = dayjs();
  const dayjsLA = dayjsLocal.tz(tz);

  if (cache && !dayjsLA.isAfter(dayjs(cache.createdAt), 'day')) {
    return {
      status: 200,
      body: { selectedWord: cache.selectedWord }
    };
  }

  // sometimes thesaurus api doesn't have an entry for the word
  // so getSynonyms will recursively call itself until it finds a word
  const randomWordRes = await fetch('/api/word/synonyms');
  const randomWord = await randomWordRes.json();

  await fetch('/api/cache', {
    method: 'POST',
    body: JSON.stringify({
      selectedWord: randomWord,
      createdAt: dayjsLA.toISOString(),
    }),
  });

  return {
    status: 200,
    body: { selectedWord: randomWord }
  };
}