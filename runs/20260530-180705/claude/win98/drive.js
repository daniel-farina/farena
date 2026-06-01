/* Drives the Win98 clone in headless Chrome and screenshots the showcase.
   Deterministic: disables auto-tour, then opens each app on a 2s cadence. */
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:8098/index.html#notour';
const OUT = path.join(__dirname, 'shots');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const APPS = [
  ['notepad','Notepad'], ['paint','Paint'], ['calc','Calculator'],
  ['mines','Minesweeper'], ['mycomputer','My Computer'], ['ie','Internet Explorer'],
  ['media','Windows Media Player'], ['recycle','Recycle Bin'], ['documents','My Documents'],
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox','--window-size=1024,768','--force-device-scale-factor=1','--autoplay-policy=no-user-gesture-required'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));

  console.log('loading', URL);
  await page.goto(URL, { waitUntil: 'networkidle0' });

  await sleep(700);  await page.screenshot({ path: path.join(OUT,'01-bios.png') });           console.log('01 BIOS');
  await sleep(2200); await page.screenshot({ path: path.join(OUT,'02-splash.png') });         console.log('02 splash');
  await page.waitForFunction(() => !document.querySelector('#desktop').classList.contains('hidden'), { timeout: 15000 });
  await sleep(900);  await page.screenshot({ path: path.join(OUT,'03-desktop.png') });         console.log('03 desktop');

  // Start menu (open, shoot, close cleanly)
  await page.evaluate(() => document.querySelector('#startbtn').click());
  await sleep(450); await page.screenshot({ path: path.join(OUT,'04-startmenu.png') });        console.log('04 start menu');
  await page.evaluate(() => document.querySelector('#startbtn').click());
  await sleep(300);

  // Showcase: open each application after 2 seconds, one at a time.
  let n = 5;
  for (const [key,label] of APPS) {
    await page.evaluate(k => window.W98.openApp(k), key);   // "click" the app
    await sleep(950);                                       // let it paint
    const fn = `${String(n).padStart(2,'0')}-app-${key}.png`;
    await page.screenshot({ path: path.join(OUT, fn) });
    console.log(`${String(n).padStart(2,'0')} opened ${label}`);
    n++;
    await sleep(1050);                                      // ~2s total per app
  }

  // All windows cascaded
  await sleep(400);
  await page.screenshot({ path: path.join(OUT, `${String(n++).padStart(2,'0')}-all-open.png`) });
  console.log('all windows open');

  // Interact: bring Minesweeper to front, then play a few cells
  await page.evaluate(() => window.W98.openApp('mines'));  // focuses existing window
  await sleep(400);
  await page.evaluate(() => {
    const cells = document.querySelectorAll('#m-grid .cell');
    [3,4,5,13,30,50,60].forEach(i => cells[i] && cells[i].click());
  });
  await sleep(500);
  await page.screenshot({ path: path.join(OUT, `${String(n++).padStart(2,'0')}-minesweeper-played.png`) });

  // Shutdown dialog
  await page.evaluate(() => document.querySelector('#startbtn').click());
  await sleep(250);
  await page.evaluate(() => document.querySelector('#sm-shutdown').click());
  await sleep(450);
  await page.screenshot({ path: path.join(OUT, `${String(n++).padStart(2,'0')}-shutdown-dialog.png`) });
  console.log('shutdown dialog');

  await browser.close();
  console.log('DONE — screenshots in', OUT);
})().catch(e => { console.error(e); process.exit(1); });
