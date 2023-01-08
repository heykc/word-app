import {
  RANDOM_WORD_KEY,
  THESAURUS_KEY,
  THESAURUS_URL,
  UPSTASH_URL,
  UPSTASH_TOKEN,
  WORDS_API_URL,
  WORDS_API_HOST,
  UPSTASH_ENDPOINT,
} from '$env/static/private';
import { error } from '@sveltejs/kit';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const tz = 'America/New_York';

// const formatString = (str) => str.replace(/\W/g, '').toLowerCase().trim();

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

  const randWord = await getWord(fetch);

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

const getWord = async (fetch, searchWord = '') => {
  const encodedLetterPattern = encodeURI('^\\w{3,15}$');
  const searchParams = searchWord ? searchWord : `?random=true&letterPattern=${encodedLetterPattern}`;
  const res = await fetch(`${WORDS_API_URL}/${searchParams}`, {
    headers: {
      'X-RapidAPI-Key': RANDOM_WORD_KEY,
      'X-RapidAPI-Host': WORDS_API_HOST
    },
  });

  if (res.ok) {
    const { word } = await res.json();
    return word;
  }

  throw error(500, 'Failed to fetch random word');
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const parseSynResponse = (res) => {
  const validEntries = res.filter(({ meta }) => meta && /^\w+$/.test(meta.id))
  const randomEntry = getRandom(validEntries);
  const { meta: { id: word, uuid: id, fl, sls }, def } = randomEntry;
  const sense = def[0].sseq[0][0][1];
  const definition = sense.dt[0][1];
  const example = sense.dt[1]?.[1]?.t?.replace(/\{it}\w+{\/it}/, '_____') ?? '';
  const synonyms = sense.syn_list?.map((list) => list.map((s) => s.wd)).flat() ?? [];
  const related = sense.rel_list?.map((list) => list.map((s) => s.wd)).flat() ?? [];
  const near = sense.near_list?.map((list) => list.map((s) => s.wd)).flat() ?? [];
  const words = [...synonyms, ...related, ...near, word].filter((w) => /^\w+$/.test(w));
  const wordTypeMeta = sls?.find((s) => s.includes (' of '))?.split(' of ')[0] ?? '';
  const wordType = wordTypeMeta ? `${wordTypeMeta} | ${fl}` : fl;

  return {
    id,
    definition,
    example,
    wordType,
    words,
  };
};

const getSynonyms = async (fetch, word) => {
  const encodedWord = encodeURI(word.toLowerCase());
  const res = await fetch(`${THESAURUS_URL}/${encodedWord}?key=${THESAURUS_KEY}`);

  if (res.ok) {
    const data = await res.json();

    if (!data[0].meta) {
      return getSynonyms(fetch, data[0]);
    }

    return parseSynResponse(data);
  }
};

const getCache = async (fetch) => {
  const res = await fetch(`${UPSTASH_URL}/get/${UPSTASH_ENDPOINT}`, {
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
  const res = await fetch(`${UPSTASH_URL}/set/${UPSTASH_ENDPOINT}`, {
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