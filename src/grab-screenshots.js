#!/usr/bin/env node

const puppeteer = require("puppeteer-core");
const imgur = require("imgur");
const path = require('path');
const { promises: fs, constants } = require('fs');
const locateChrome = require("./locate-chrome.js");

const relativeUrl  = process.env.URL || '';
const [ name ] = (process.env.FOLDER || './').split('/').slice(-1);
const folderPath = path.join('../', process.env.FOLDER || './');
const screenshotPath = path.join(folderPath, 'images/screenshot.png');
const pdfPath = path.join(folderPath, `pdf/${name}.pdf`);

(async () => {
  const timeout = 0;
  const headless = true;
  const executablePath = await locateChrome();
  const browser = await puppeteer.launch({
    headless,
    executablePath,
    timeout
  });
  
  const page = await browser.newPage();
  await page.goto(`https://estheradeniyi.com/${relativeUrl}`, { timeout });
  await Promise.all([
    page.screenshot({ path: screenshotPath }),
    page.pdf({path: pdfPath, format: 'A4'})
  ]);

  // await fs.copyFile(`${name}.png`, screenshotPath);
  // await fs.unlink(`${name}.png`);
  // await fs.copyFile(`${name}.pdf`, pdfPath);
  // await fs.unlink(`${name}.pdf`);

  await browser.close();
})();
