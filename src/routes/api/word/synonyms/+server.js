import {
  THESAURUS_KEY,
  THESAURUS_URL,
} from '$env/static/private';

export async function GET({ fetch }) {
  const randWordRes = await fetch('/api/word/random');
  const randWord = await randWordRes.text();
  const recursion = async (word) => {
    const encodedWord = encodeURI(word.toLowerCase());
    const res = await fetch(`${THESAURUS_URL}/${encodedWord}?key=${THESAURUS_KEY}`);

    if (res.ok) {
      const data = await res.json();

      if (!data[0].meta?.id) {
        return recursion(data[0]);
      }

      return new Response(JSON.stringify(parseSynResponse(data)));
    }
  };

  return recursion(randWord);
}

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const parseSynResponse = (res) => {
  const validEntries = res.filter(({ meta }) => meta && /^\w+$/.test(meta.id))
  const randomEntry = getRandom(validEntries);
  const { meta: { id: word, uuid: id }, fl, sls, def } = randomEntry;
  const sense = def[0].sseq[0][0][1];
  const definition = sense.dt[0][1].replace(/\{\/?\w+\}/g, '').trim();
  const regex = new RegExp(`{it}\\w+{/it}`, 'g');
  let example = sense.dt[1]?.[1]?.[0]?.t?.replace(regex, '____') ?? '';
  const synonyms = sense.syn_list?.map((list) => list.map((s) => s.wd)).flat() ?? [];
  const similar = sense.sim_list?.map((list) => list.map((s) => s.wd)).flat() ?? [];
  const related = sense.rel_list?.map((list) => list.map((s) => s.wd)).flat() ?? [];
  const words = [word, ...synonyms, ...similar, ...related]
    .filter((w) =>
      /^\w+$/.test(w)
      && !definition.includes(w)
      && !example.includes(w)
    );
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