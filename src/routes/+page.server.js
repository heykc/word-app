import {
  RANDOM_WORD_URL,
  RANDOM_WORD_HOST,
  RANDOM_WORD_KEY,
  THESAURUS_KEY,
  THESAURUS_URL,
  UPSTASH_URL,
  UPSTASH_TOKEN,
  WORDS_API_URL,
  WORDS_API_HOST,
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
  // const { result } = await getCache(fetch);
  // const cache = result && JSON.parse(result);
  // const dayjsLocal = dayjs();
  // const dayjsNY = dayjsLocal.tz(tz);

  // if (cache && !dayjsNY.isAfter(dayjs(cache.createdAt), 'day')) {
  //   return {
  //     status: 200,
  //     body: { selectedWord: cache.selectedWord }
  //   };
  // }

  // const randWord = await getRandomWord(fetch);

  // const randWord = await getWord(fetch);

  // sometimes thesaurus api doesn't have an entry for the word
  // so getSynonyms will recursively call itself until it finds a word
  // const selectedWord = await getSynonyms(fetch, 'cynical');

  // selectedWord.synonyms = await addFrequencies(fetch, selectedWord.synonyms);

  const selectedWord = {
    word: 'cynical',
    definition: 'believing that people are motivated by self-interest; distrustful of human sincerity or integrity',
    synonyms: [
      { word: 'pesimistic', frequency: '4.9' },
      { word: 'misanthropic', frequency: '1.3' },
      { word: 'cynical', frequency: '3.2' },
    ],
    wordType: 'adjective',
  };

  // await setCache(fetch, {
  //   selectedWord,
  //   createdAt: dayjsNY.toISOString(),
  // });

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
    const { word, frequency = '0' } = await res.json();
    return { word, frequency };
  }

  if (res.status === 404) {
    return { searchWord, frequency: '0' };
  }

  throw error(500, 'Failed to fetch random word');
};

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

const addFrequencies = async (fetch, synonyms) => {
  const synonymsWithFrequencies = await Promise.all(synonyms.map((word) => {
    return getWord(fetch, word);
  }));

  console.log(synonymsWithFrequencies);

  return synonymsWithFrequencies;
};

const parseSynonyms = ({ meta: { id: word, syns }, fl, sls, shortdef: definitions }) => {
  const index = Math.floor(Math.random() * syns.length);
  const definition = definitions[index];
  const synonyms = syns[index].filter((s) => !definition.includes(s));
  let wordType = fl;

  synonyms.push(word);

  if (wordType === 'noun' && sls?.some((s) => s.includes('plural'))) {
    wordType = 'plural noun';
  }

  return {
    word,
    definition,
    synonyms,
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