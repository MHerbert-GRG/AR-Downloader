/* 
  - Name: Annual Report Downloader (index.js);
  - Date created: 27/04/2023
  - Description: Uses the puppeteer library to open input data into the ASX Historical Annoucements web form and finds the AR to download. Creates PDF of AR ready for markup.
  - Author: MH
*/

const puppeteer = require('puppeteer');
const readline = require('readline');
const select = require ('puppeteer-select');
const playwright = require('@playwright/test');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
(async () => {
  // Prompts user for ASX code & the year they wish to query 
  const asxCode = await promptUser('Enter asx code: ');
  const year = await promptUser('Enter the year: ');

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Opens browser (Chromium)
  await page.setViewport({ width: 1280, height: 800 });

  // ASX historical announcements web form
  await page.goto('https://www.asx.com.au/asx/v2/statistics/announcements.do');
  // ASX historical announcements website
  //await page.goto('https://www2.asx.com.au/markets/trade-our-cash-market/historical-announcements');

  // Reset for page navigation (USED FOR .click())
  const navigationPromise = page.waitForNavigation()

  /*
  // Selecting Accept cookies
  await page.waitForSelector('button[id="onetrust-accept-btn-handler"]');
  await page.click('button[id="onetrust-accept-btn-handler"]');
  */

 // Selecting the company, inputs data into the form
 await page.type('#issuerCode', asxCode);
 await page.click('#timeframeType2');
 await page.select('#year',year);
 await page.click('.actionbutton');
 await navigationPromise;

 // Finds where the AR is and highlights the match
 const found = await page.evaluate(() => window.find("Annual Report"));
 await navigationPromise;

 // Clicks link, AR
 const element = await select(page).getElement('a:contains(Annual Report)');
 await element.click();
 await navigationPromise;

 //const agree = await select(page).getElement('a:contains(Agree and)');

/*
const pageList = await browser.pages();    
await console.log("NUMBER TABS:", pageList.length);
await console.log("NUMBER TABS:", pageList[2]._target._targetInfo.url);
await navigationPromise;
page2 = await browser.newPage()
            
const redirectedUrlforService =   pageList[2]._target._targetInfo.url;
await page2.goto(redirectedUrlforService)
await page2.bringToFront(); 

const agree = await select(page).getElement('a:contains(Agree and)');
//await agree.click();

await navigationPromise;
*/

  //await browser.close();

  // Browser 
  function promptUser(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
    //await browser.close();
  
})()