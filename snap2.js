const puppeteer = require('puppeteer');
const path = require('path');
const fs   = require('fs');

(async () => {
  const cwd  = process.cwd().replace(/\\/g, '/');
  const file = 'file:///' + cwd + '/aneesi.html';
  const out  = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(out)) fs.mkdirSync(out);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  async function scrollReveal(page) {
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y <= h; y += 500) {
      await page.evaluate(p => window.scrollTo(0, p), y);
      await new Promise(r => setTimeout(r, 60));
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 350));
  }

  /* Desktop */
  const desk = await browser.newPage();
  await desk.setViewport({ width: 1440, height: 900 });
  await desk.goto(file, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 900));
  await desk.screenshot({ path: path.join(out, 'aneesi-desktop-hero.png') });
  console.log('✅ desktop hero');
  await scrollReveal(desk);
  await new Promise(r => setTimeout(r, 700));
  await desk.screenshot({ path: path.join(out, 'aneesi-desktop-full.png'), fullPage: true });
  console.log('✅ desktop full');
  await desk.close();

  /* Mobile */
  const mob = await browser.newPage();
  await mob.setViewport({ width: 390, height: 844 });
  await mob.goto(file, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 700));
  await mob.screenshot({ path: path.join(out, 'aneesi-mobile-hero.png') });
  console.log('✅ mobile hero');
  await scrollReveal(mob);
  await new Promise(r => setTimeout(r, 600));
  await mob.screenshot({ path: path.join(out, 'aneesi-mobile-full.png'), fullPage: true });
  console.log('✅ mobile full');
  await mob.close();

  await browser.close();
  console.log('\n✨ Done →', out);
})().catch(e => { console.error('❌', e.message); process.exit(1); });
