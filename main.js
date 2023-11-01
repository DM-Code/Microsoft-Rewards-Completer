const { Console, count } = require('console');
const { By, Builder, Options, WebElement } = require('selenium-webdriver');
const { checkedNodeCall } = require('selenium-webdriver/lib/promise');
const { createSecureContext } = require('tls');
// const edge = require('selenium-webdriver/edge');

let driver;

async function initBrowser() {
  console.log('Creating user session...');
  driver = await new Builder().forBrowser('MicrosoftEdge').build();
  await goToWebPage('https://www.bing.com/')
}

async function goToWebPage(page) {
      // Browser action (Navigate to a web page)
      await driver.get(page);

      // Wait implicitly 
      // TODO: Look for better Waiting Stratergies (there are better waiting strategies)
      await driver.manage().setTimeouts({ implicit: 2000 });

      try{
        removeAnyPopUp();
      } catch (e) {
        console.log("Error [goToWebPage]: " + e);
      }
}

async function removeAnyPopUp() {
 // FUNCTION: Check for pop ups
  try {
    let isPopup = await driver.findElement(By.id('bnp_container'));

      const buttons = await isPopup.findElements(By.tagName('button'));
      if(buttons){
        let acceptButton, rejectButton;
        let buttonQuantity = buttons.length;
        console.log('Button Quantity: ' + buttonQuantity);
        for (const button of buttons){
          console.log()
          const id = await button.getAttribute('id');
          if(id.includes('accept')) {
            acceptButton = button
          } else if (id.includes('reject')){ 
            rejectButton = button
            
          }
        };
        
        // Click the Reject Button
        await rejectButton.click();

      } else {
      // Do Nothing
      console.log('No buttons found');
    }
  } catch (e) {
    console.log('Error: ' + e);
  }
}

async function searchCompleter() {
  await initBrowser();
  await removeAnyPopUp();

  try {
    console.log('Starting Search Completer...');
    // Set any required Edge Options here
    // let Options = new edge.Options();

    // First entry into search box
    // let homepageTextForm = await driver.findElement(By.id('sb_form_q'));
    // await homepageTextForm.sendKeys('Microsoft Edge');
    // await homepageTextForm.submit();
    await driver.manage().setTimeouts({ implicit: 2000 });
    

    // Check on how many search points I need
    goToDashboard(false);
    let pointsBreakdown = await driver.findElement(By.id('dailypointColumnCalltoAction'));
    await pointsBreakdown.click();

    const searchDataList = await driver.findElements(By.className('title-detail'));
    let currentSearchAmount = 0;
    let totalSearchAmount = 0;
    for (const searchData of searchDataList) {
      let element = await searchData.findElement(By.css('p[ng-bind-html="$ctrl.pointProgressText"]'));
      const data = await element.getText();
      const parts = data.split('/');

      // Find and parse values such that current and total search amount is saved as int
      currentSearchAmount += parseInt(parts[0].trim());
      totalSearchAmount += parseInt(parts[1].trim());
    }

    let remainingSearchAmount = (totalSearchAmount - currentSearchAmount) / 3;

    await goToWebPage("https://www.bing.com/search?q=Google");

    let searchpageTextForm = await driver.findElement(By.id('sb_form_q'));

    if(searchpageTextForm) {

      // Iterate through remaining seraches
      for (let i = 0; i < remainingSearchAmount; i++) {
        let searchpageTextForm = await driver.findElement(By.id('sb_form_q'));
        await searchpageTextForm.clear();
        await searchpageTextForm.sendKeys('MicrosoftEdge' + i.toString());
        await searchpageTextForm.submit();
      }

      
    } else {
      console.log("Error in finding searchpageTextForm")
    }

  } catch (e) {
    console.log("Error: " + e);

  } finally {
    
    // End the session
    if (driver) {
      await driver.quit();
    }
  }
}

async function goToDashboard(newTab) {
  if(newTab){
    // Open in a new tab
    await goToWebPage('https://rewards.bing.com/');
  } else {
    await goToWebPage('https://rewards.bing.com/');
  }
}


searchCompleter();