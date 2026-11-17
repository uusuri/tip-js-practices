import assert from 'node:assert/strict';
import { createApiServer } from '../api/server.mjs';
import { ApiError, createApiClient } from '../src/api-client.js';
import { createTaskApi } from '../src/task-api.js';
import { variantFilters } from '../src/variant.js';

const server = createApiServer();
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const baseUrl = `http://127.0.0.1:${server.address().port}/api`;
const client = createApiClient({ baseUrl });
const api = createTaskApi(client);
try {
  const combined = await api.getTasks({ completed: true, categoryId: 2, q: 'ПРОВЕР' });
  assert.deepEqual(combined.tasks.map(task => task.id), [16]);
  console.log('OK: собственная комбинация completed=true, categoryId=2 и q=ПРОВЕР → [16]');
  await assert.rejects(() => client.requestJson('/categories/999'), error =>
    error instanceof ApiError && error.kind === 'http' && error.status === 404 && error.code === 'CATEGORY_NOT_FOUND');
  console.log('OK: отсутствующая категория → HTTP 404 CATEGORY_NOT_FOUND');
  let calls = 0;
  const cancelled = new AbortController();
  cancelled.abort();
  const offline = createApiClient({ baseUrl, fetchFn: async () => { calls++; throw new Error('Не должен вызываться'); } });
  await assert.rejects(() => offline.requestJson('/tasks', { signal: cancelled.signal }), error => error.kind === 'aborted');
  assert.equal(calls, 0);
  console.log('OK: заранее отменённый сигнал → aborted без вызова fetch');
  assert.deepEqual((await api.getTasks(variantFilters)).tasks.map(task => task.id), [4, 34]);
  console.log('OK: индивидуальный вариант 8 → [4, 34]');
  console.log('Собственные проверки: 4/4.');
} finally { await new Promise(resolve => server.close(resolve)); }
