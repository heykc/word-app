import {
  UPSTASH_URL,
  UPSTASH_TOKEN,
  UPSTASH_ENDPOINT,
} from '$env/static/private';
import { error } from '@sveltejs/kit';

export async function GET({ fetch }) {
  const res = await fetch(`${UPSTASH_URL}/get/${UPSTASH_ENDPOINT}`, {
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
    },
  });
  
  if (res.ok) {
    const { result } = await res.json();
    return new Response(JSON.stringify(result));
  }

  if (res.status === 404) {
    return new Response({});
  }

  throw error(500, 'Failed to get cache');
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ fetch, request }) {
  const res = await fetch(`${UPSTASH_URL}/set/${UPSTASH_ENDPOINT}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
    },
    body: await request.text(),
  });

  if (res.ok) {
    return new Response(res.json());
  }

  throw error(500, 'Failed to set cache');
}