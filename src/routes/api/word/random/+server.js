import {
  RANDOM_WORD_KEY,
  WORDS_API_URL,
  WORDS_API_HOST,
} from '$env/static/private';
import { error } from '@sveltejs/kit';

export async function GET({ params: { searchWord = '' } }) {
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
    return new Response(word);
  }

  throw error(500, 'Failed to fetch random word');
}