import {
  THESAURUS_KEY,
  THESAURUS_URL,
} from '$env/static/private';
import wordFreq from 'subtlex-word-frequencies';

export async function GET({ fetch }) {
  const randWordRes = await fetch('/api/word/random');
  const randWord = await randWordRes.text();
  const recursion = async (word) => {
    const encodedWord = encodeURI(word.toLowerCase());
    const res = await fetch(`${THESAURUS_URL}/${encodedWord}?key=${THESAURUS_KEY}`);

    if (res.ok) {
      const data = await res.json();

      /**
       * If the first entry doesn't have a valid meta.id, it might be a phrase or an inflected form.
       */
      if (!data[0].meta?.id) {
        return recursion(data[0]);
      }
      return new Response(JSON.stringify(parseSynResponse(data)));
    }
  };

  return recursion(randWord);
}

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// wordFreq is an array of { word: string (case sensitive), count: number }.
const scoreWords = (words) => {
  const wordCounts = words.map((w) => {
    const freqEntry = wordFreq.find((entry) => entry.word.toLowerCase() === w.toLowerCase());
    return { word: w, count: freqEntry ? freqEntry.count : 0 };
  });

  // Sort by count from most frequent to least frequent
  const sortedByFrequency = wordCounts.sort((a, b) => b.count - a.count);

  // Score words 1-10 where least frequent words get higher scores (closer to 10)
  const maxIndex = sortedByFrequency.length - 1;
  const scoredWords = sortedByFrequency.map(({ word }, index) => {
    const score = maxIndex > 0 ? Math.round(1 + (index / maxIndex) * 9) : 10;
    return { word, score };
  });

  return scoredWords;
};

const parseSynResponse = (res) => {
  const validEntries = res.filter(({ meta }) => meta && /^\w+$/.test(meta.id))
  const randomEntry = getRandom(validEntries);
  /**
   * The structure of the response is quite nested and can vary, but we can extract the relevant information as follows:
   * - The word and its ID are in `meta.id` and `meta.uuid`.
   * - The definition is in `def[0].sseq[0][0][1].dt[0][1]`, but it may contain formatting tags like `{it}` which we can remove.
   * - The example sentence is in `def[0].sseq[0][0][1].dt[1][1][0].t`, which also may contain formatting tags.
   * - Synonyms, similar words, and related words are in `syn_list`, `sim_list`, and `rel_list` respectively, which are arrays of lists of words.
   * - The part of speech can be found in `fl` or inferred from the `sls` array if it contains a phrase like "X of Y".
   */
  const { meta: { id: word, uuid: id }, fl, sls, def } = randomEntry;
  const sense = def[0].sseq[0][0][1];
  const definition = sense.dt[0][1].replace(/\{\/?\w+\}/g, '').trim();
  const regex = new RegExp(`{it}\\w+{/it}`, 'g');
  let example = sense.dt[1]?.[1]?.[0]?.t?.replace(regex, '____') ?? '';
  const synonyms = sense.syn_list?.map((list) => list.map((s) => s.wd)).flat() ?? [];
  const similar = sense.sim_list?.map((list) => list.map((s) => s.wd)).flat() ?? [];
  const related = sense.rel_list?.map((list) => list.map((s) => s.wd)).flat() ?? [];
  const words = [word, ...synonyms, ...similar, ...related]
    /**
     * Filter out any words that are not purely alphanumeric.
     */
    .filter((w) =>
      /^\w+$/.test(w)
      // && !definition.includes(w)
      // && !example.includes(w)
    );
  /**
   * The part of speech can be directly from `fl`, but if the `sls` array contains a phrase like "X of Y", we can extract "X" as the word type and combine it with `fl` for more specificity.
   * For example, if `fl` is "noun" and `sls` contains "type of emotion", we can infer that the word is a "noun | type of emotion".
   */
  const wordTypeMeta = sls?.find((s) => s.includes (' of '))?.split(' of ')[0] ?? '';
  const wordType = wordTypeMeta ? `${wordTypeMeta} | ${fl}` : fl;

  const scoredWords = scoreWords(words);

  return {
    id,
    definition,
    example,
    wordType,
    words,
    scoredWords,
  };
};