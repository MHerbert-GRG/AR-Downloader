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
const { PDFNet } = require('@pdftron/pdfnet-node');



const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
(async () => {

    // Prompts user for ASX code & the year they wish to query 
    const asxCode = 'CBA'
    const year = '2022'
    

    const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    const page = await browser.newPage();

    // Manually setting the timeout
    await page.setDefaultNavigationTimeout(200000); 
    const navigationPromise = page.waitForNavigation();

    // Opens browser (Chromium)
     await page.setViewport({ width: 0, height: 0 });
    const pdfLink = 'https://announcements.asx.com.au/asxpdf/20220810/pdf/45cqlq2j96m9wv.pdf';
 
    // Goes to Annual Report
    await page.goto(pdfLink);   
    await new Promise(resolve => setTimeout(resolve, 3000));
    await navigationPromise;

    const https = require('https'); // or 'https' for https:// URLs
    const fs = require('fs');

    const file = fs.createWriteStream("file.pdf");
    const request = https.get(pdfLink, function (response) {
        response.pipe(file);

        // after download completed close filestream
        file.on("finish", () => {
            file.close();
            console.log("Download Completed");
        });
    });

    await navigationPromise;

    //Core.setWorkerPath('../lib/core');
    const doc = await PDFNet.PDFDoc.createFromURL('file.pdf');
    await doc.initSecurityHandler();
    doc.removeSecurity();
    
    
    
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