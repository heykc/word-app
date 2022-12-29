import {
  RANDOM_WORD_URL,
  RANDOM_WORD_HOST,
  RANDOM_WORD_KEY,
  THESAURUS_KEY,
  THESAURUS_URL,
  UPSTASH_URL,
  UPSTASH_TOKEN,
} from '$env/static/private';
import { error } from '@sveltejs/kit';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const tz = 'America/New_York';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ fetch }) {
  const { result } = await getCache(fetch);
  const cache = result && JSON.parse(result);
  const dayjsLocal = dayjs();
  const dayjsNY = dayjsLocal.tz(tz);

  if (cache && !dayjsNY.isAfter(dayjs(cache.createdAt), 'day')) {
    return {
      status: 200,
      body: { selectedWord: cache.selectedWord }
    };
  }

  const randWord = await getRandomWord(fetch);

  // sometimes thesaurus api doesn't have an entry for the word
  // so getSynonyms will recursively call itself until it finds a word
  const selectedWord = await getSynonyms(fetch, randWord);

  await setCache(fetch, {
    selectedWord,
    createdAt: dayjsNY.toISOString(),
  });

  return {
    status: 200,
    body: { selectedWord }
  };
}

const getRandomWord = async (fetch) => {
  const res = await fetch(RANDOM_WORD_URL, {
    headers: {
      'X-RapidAPI-Key': RANDOM_WORD_KEY,
      'X-RapidAPI-Host': RANDOM_WORD_HOST
    },
  });

  if (res.ok) {
    const word = await res.text();
    return word;
  }

  throw error(500, 'Failed to fetch random word');
}

const parseSynonyms = ({ meta: { id: word, syns }, fl, sls, shortdef: definitions }) => {
  const index = Math.floor(Math.random() * syns.length);
  let wordType = fl;

  if (!wordType.includes('plural') && sls.some((s) => s.includes('plural'))) {
    wordType = `plural ${wordType}`;
  }

  return {
    word,
    definition: definitions[index],
    synonyms: syns[index],
    wordType,
  }
};

const getSynonyms = async (fetch, word) => {
  const encodedWord = encodeURI(word.toLowerCase());
  const res = await fetch(`${THESAURUS_URL}/${encodedWord}?key=${THESAURUS_KEY}`);

  if (res.ok) {
    const data = await res.json();

    if (!data[0].meta) {
      return getSynonyms(fetch, data[0]);
    }

    return parseSynonyms(data[0]);
  }
};

const getCache = async (fetch) => {
  const res = await fetch(`${UPSTASH_URL}/get/cache`, {
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
    },
  });

  if (res.ok) {
    return res.json();
  }

  if (res.status === 404) {
    return null;
  }

  throw error(500, 'Failed to get cache');
};

const setCache = async (fetch, cache) => {
  const res = await fetch(`${UPSTASH_URL}/set/cache`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
    },
    body: JSON.stringify(cache),
  });

  if (res.ok) {
    return res.json();
  }
  throw error(500, 'Failed to set cache');
}