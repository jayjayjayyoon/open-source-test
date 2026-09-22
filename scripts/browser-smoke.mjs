import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:4173';
const site = `${origin}/open-source-test/`;
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = '';
server.stdout.on('data', (chunk) => { serverLog += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverLog += chunk.toString(); });
let browser;
async function awaitPreview() {
  for (let attempt = 0; attempt < 75; attempt += 1) {
    try { const response = await fetch(site); if (response.ok) return; } catch { /* starting */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Preview did not start: ${serverLog}`);
}
try {
  await awaitPreview();
  try { browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox'] }); }
  catch { browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] }); }
  const page = await browser.newPage({ viewport: { width: 1365, height: 850 } });
  page.setDefaultTimeout(8000);
  const errors = [];
  const failedResponses = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto(site, { waitUntil: 'networkidle' });
  const sidebar = page.locator('nav.ct-accordion');
  if (await sidebar.count() !== 1) {
    throw new Error(`App root/navigation missing: ${JSON.stringify({ url: page.url(), status: response?.status(), title: await page.title(), root: (await page.locator('#root').innerHTML()).slice(0, 600), errors, failedResponses, serverLog: serverLog.slice(-400) })}`);
  }
  const project = sidebar.locator('.ct-accordion-trigger').first();
  assert.equal(await project.getAttribute('aria-expanded'), 'true');
  await project.click(); assert.equal(await project.getAttribute('aria-expanded'), 'false');
  await project.click(); assert.equal(await project.getAttribute('aria-expanded'), 'true');
  console.log('Smoke step 1: accordion');

  await sidebar.getByRole('button', { name: '프로젝트 맵', exact: true }).click();
  await page.getByRole('heading', { name: '흩어진 프로젝트를, 하나의 지도로.' }).waitFor();
  await page.getByRole('button', { name: '검증 시작' }).click();
  assert.equal(await sidebar.getByRole('button', { name: '검증 보드', exact: true }).getAttribute('aria-current'), 'page');
  await page.locator('.check-toggle').first().click();
  assert.equal(await page.locator('.check-toggle').first().getAttribute('aria-pressed'), 'true');
  console.log('Smoke step 2: graph to board and shared menu');

  await sidebar.getByRole('button', { name: '오늘 요약', exact: true }).click();
  await sidebar.getByRole('button', { name: '검증 보드', exact: true }).click();
  assert.equal(await page.locator('.check-toggle').first().getAttribute('aria-pressed'), 'true');
  await sidebar.getByRole('button', { name: 'Data', exact: true }).click();
  await sidebar.getByRole('button', { name: '대화 수집', exact: true }).click();
  await page.getByRole('heading', { name: '현재 연결 상태' }).waitFor();
  assert.equal(await page.locator('.ct-data-panel dd').first().textContent(), '미연결');
  await sidebar.getByRole('button', { name: '검증 보드', exact: true }).click();
  assert.equal(await page.locator('.check-toggle').first().getAttribute('aria-pressed'), 'true');
  console.log('Smoke step 3: retained board state and honest Data view');

  await sidebar.getByRole('button', { name: '오늘 요약', exact: true }).click();
  assert.equal(await page.locator('.ct-home-task').count(), 3);
  await page.getByRole('button', { name: '모바일 보기' }).click();
  assert.equal(await page.locator('.ct-preview-mobile').count(), 1);
  await page.getByRole('button', { name: '메뉴 펼치기' }).click();
  assert.equal(await project.isVisible(), true);
  await page.getByRole('button', { name: '메뉴 접기' }).click();
  console.log('Smoke step 4: preview and mobile menu');

  await page.getByRole('checkbox', { name: /프로젝트 맵에서 노드를 선택해 보기/ }).check();
  assert.equal(await page.locator('.ct-home-task').count(), 2);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('.ct-home-task').count(), 2);
  await page.getByRole('checkbox', { name: /PC·모바일 화면/ }).check();
  await page.getByRole('checkbox', { name: /다중 관계 그래프/ }).check();
  await page.getByText('오늘의 샘플 할 일을 모두 마쳤어요. 수고했어요!').waitFor();
  assert.equal(await page.locator('.ct-home-task').count(), 0);
  assert.equal(await page.locator('.ct-home-recommendation a').getAttribute('href'), './relationship-lab.html');
  await page.getByRole('button', { name: '완료 체크 모두 되돌리기' }).click();
  assert.equal(await page.locator('.ct-home-task').count(), 3);
  assert.deepEqual(errors, []);
  assert.deepEqual(failedResponses, []);
  console.log('Browser smoke passed: navigation, persistence, Data readiness, mobile preview and checklist.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
