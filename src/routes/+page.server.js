import {
  RANDOM_WORD_URL,
  RANDOM_WORD_HOST,
  RANDOM_WORD_KEY,
  THESAURUS_KEY,
  THESAURUS_URL,
} from '$env/static/private';
import { error } from '@sveltejs/kit';


/** @type {import('./$types').LayoutServerLoad} */
export async function load({ fetch }) {
 //const randWord = await getRandomWord(fetch);

  // sometimes thesaurus api doesn't have an entry for the word
  // so getSynonyms will recursively call itself until it finds a word
  const selectedWord = {
    word: 'malleable',
    definition: 'capable of being shaped or bent or drawn out',
    synonyms: ['plastic', 'flexible'],
    wordType: 'adjective',
  }; //await getSynonyms(fetch, randWord);

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
    console.log(word)
    return word;
  }

  throw error(500, 'Failed to fetch random word');
}

const parseSynonyms = ({ meta: { id: word, syns }, fl: wordType, shortdef: definitions }) => {
  const index = Math.floor(Math.random() * syns.length);

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