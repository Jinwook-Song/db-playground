import { createClient } from 'redis';

const client = createClient().on('error', (err) =>
  console.log('Redis Client Error', err),
);

await client.connect();

await client.flushAll();

await client.set('hello', 'redis');

const r1 = await client.get('hello');
console.log(r1);

await client.hSet('users:1', {
  username: 'jw',
  password: 123,
});

const r2 = await client.hGetAll('users:1');
console.log(r2);

await client.disconnect();
