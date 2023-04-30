/* 
  - Name: Annual Report Downloader (index.js);
  - Date created: 27/04/2023
  - Description: Uses the puppeteer library to open input data into the ASX Historical Annoucements web form and finds the AR to download. Creates PDF of AR ready for markup.
  - Author: MH
*/

/**
* @jest-environment jsdom
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
   
    const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    const page = await browser.newPage();

    // Manually setting the timeout
    await page.setDefaultNavigationTimeout(200000); 

    // Opens browser (Chromium)
     await page.setViewport({ width: 0, height: 0 });

    // ASX historical announcements web form
    await page.goto('https://www.asx.com.au/asx/v2/statistics/announcements.do');
    // ASX historical announcements website
    //await page.goto('https://www2.asx.com.au/markets/trade-our-cash-market/historical-announcements');

    // Reset for page navigation (USED FOR .click())
    const navigationPromise = page.waitForNavigation();

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

    // setuping up puppeteer with the consent tab that opens after clicking on the link
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
        await element.click();
        const newPage = await newPagePromise;
        await navigationPromise;
        const url = await newPage.evaluate(() => document.location.href);
        //console.log(url);

    // Changes focus to consent form
    await page.goto(url);
   

        // Clicks agree and procced (WARNING:bug -> doesn't actually go to file, but returns to home page')
        /*
        await navigationPromise;
        await page.waitForSelector('input[value="Agree and proceed"]');
        await page.click('input[value="Agree and proceed"]');
        await navigationPromise;
        */
    await page.waitForSelector('input[name="pdfURL"]');
    const pdfLink = await page.$eval('input[name="pdfURL"]', el => el.value);

    console.log(pdfLink);
 
    await navigationPromise;
    // Goes to Annual Report
    await page.goto(pdfLink);
    await new Promise(resolve => setTimeout(resolve, 150000));
    //await page.once('load', () => console.log('Page loaded!'));
    await page.addStyleTag({ content: '.nav { display: none} .navbar { border: 0px} #print-button {display: none}' })
    await page.pdf({ path: asxCode +"_" + year + "_" + 'AR.pdf', printBackground: true, format:'A4' });
    
    await navigationPromise;
    await browser.close();
   
  

  function promptUser(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
    
  
})()