const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const cwd = process.cwd().replace(/\\/g, '/');
  const file = 'file:///' + cwd + '/aneesi-creative.html';
  const outDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  // ── Helper: scroll page top-to-bottom to trigger all IntersectionObservers ──
  async function scrollToReveal(page) {
    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    const step = 600;
    for (let y = 0; y <= totalHeight; y += step) {
      await page.evaluate(pos => window.scrollTo(0, pos), y);
      await new Promise(r => setTimeout(r, 80));
    }
    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 400));
  }

  // ── Desktop Hero (above fold) ──
  const desktop = await browser.newPage();
  await desktop.setViewport({ width: 1440, height: 900 });
  await desktop.goto(file, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await desktop.screenshot({ path: path.join(outDir, 'aneesi--desktop--hero.png') });
  console.log('✅ desktop hero');

  // ── Desktop Full Page ──
  await scrollToReveal(desktop);
  await new Promise(r => setTimeout(r, 700)); // let transitions finish
  await desktop.screenshot({ path: path.join(outDir, 'aneesi--desktop--full.png'), fullPage: true });
  console.log('✅ desktop full-page');
  await desktop.close();

  // ── Tablet ──
  const tablet = await browser.newPage();
  await tablet.setViewport({ width: 768, height: 1024 });
  await tablet.goto(file, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await tablet.screenshot({ path: path.join(outDir, 'aneesi--tablet--hero.png') });
  await scrollToReveal(tablet);
  await new Promise(r => setTimeout(r, 600));
  await tablet.screenshot({ path: path.join(outDir, 'aneesi--tablet--full.png'), fullPage: true });
  console.log('✅ tablet');
  await tablet.close();

  // ── Mobile ──
  const mobile = await browser.newPage();
  await mobile.setViewport({ width: 390, height: 844 });
  await mobile.goto(file, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await mobile.screenshot({ path: path.join(outDir, 'aneesi--mobile--hero.png') });
  await scrollToReveal(mobile);
  await new Promise(r => setTimeout(r, 600));
  await mobile.screenshot({ path: path.join(outDir, 'aneesi--mobile--full.png'), fullPage: true });
  console.log('✅ mobile');
  await mobile.close();

  await browser.close();
  console.log(`\n✨ All 6 screenshots saved → ${outDir}`);
})().catch(e => { console.error('❌', e.message); process.exit(1); });
