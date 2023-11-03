const { Console, count } = require('console');
const { Condition } = require('selenium-webdriver');
const { By, Builder, Options, WebElement } = require('selenium-webdriver');
const { NoSuchElementError, ElementNotInteractableError } = require('selenium-webdriver/lib/error');
const { checkedNodeCall } = require('selenium-webdriver/lib/promise');
const { createSecureContext } = require('tls');
// const edge = require('selenium-webdriver/edge');

let driver;

async function initBrowser() {
  console.log('Creating user session...');
  driver = await new Builder().forBrowser('MicrosoftEdge').build();
  await goToWebPage('https://www.bing.com/');
  await removeAnyPopUp();

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

async function goToSearchPage() {
  await goToWebPage("https://www.bing.com/search?q=google");
}

async function removeAnyPopUp() {
 // FUNCTION: Check for pop ups
  try {
    let isPopup = await driver.findElement(By.id('bnp_container'));

      const buttons = await isPopup.findElements(By.tagName('button'));
      if(buttons){
        let acceptButton, rejectButton;
        let buttonQuantity = buttons.length;
        for (const button of buttons){
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
    if (e instanceof NoSuchElementError){
      console.log("Note: No Pop Up Found");
    } 
    else if (e instanceof ElementNotInteractableError){
      
      console.log("Note: No Interactable Element");
    }
    else {
    console.log("Error: " + e);
    }
  }
}

async function searchCompleter() {
  await initBrowser();

  let isSearchComplete = false

  try {
    console.log('Starting Search Completer...');
    await driver.manage().setTimeouts({ implicit: 2000 });
    

    // Go To Dashboard: Find how many search points remaining
    goToDashboard(false);
    let pointsBreakdown = await driver.findElement(By.id('dailypointColumnCalltoAction'));
    await pointsBreakdown.click();

    // Daily search breakdown (PC Search & Edge Bonus)
    const searchDataList = await driver.findElements(By.className('title-detail'));
    let currentSearchAmount = 0;
    let totalSearchAmount = 0;
    for (const searchData of searchDataList) {
      let element = await searchData.findElement(By.css('p[ng-bind-html="$ctrl.pointProgressText"]'));
      const data = await element.getText();
      const parts = data.split('/');

      // Find and parse values such that current and total search amount is saved as int
      currentSearchAmount = parseInt(parts[0].trim());
      totalSearchAmount = parseInt(parts[1].trim());
      console.log(currentSearchAmount + "/" + totalSearchAmount);
    }

    let remainingSearchAmount = (totalSearchAmount - currentSearchAmount) / 3;
    console.log("Remaining Search: " + remainingSearchAmount);

    await goToSearchPage();

    let searchpageTextForm = await driver.findElement(By.id('sb_form_q'));

    if(searchpageTextForm) {

      // Iterate through remaining seraches
      for (let i = 0; i < remainingSearchAmount; i++) {
        let searchpageTextForm = await driver.findElement(By.id('sb_form_q'));
        await searchpageTextForm.clear();
        await searchpageTextForm.sendKeys('MicrosoftEdge' + i.toString());
        await searchpageTextForm.submit();
      }

      isSearchComplete = true;
      
    } else {
      console.log("Error in finding searchpageTextForm")
    }

  } catch(e) {
   
    console.log("Error: " + e);
    
  } finally {
    if (isSearchComplete){
      console.log("Search Completed");
    }

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

async function taskCompleter() {
  try {
  let taskIndex = 0;

  
  await initBrowser();

  // Go to the search  page
  console.log('Starting Task Completer...');
  await driver.manage().setTimeouts({ implicit: 2000 });
  await goToSearchPage()
  await driver.navigate().refresh()

  // Click on Profile Icon
  let profile = await driver.findElement(By.id("id_rh"));
  
  // TODO: Test to see if the profile is instantiated to 
  if(profile){
    await profile.click();
  }

  // Store ALL possible tasks (their identifier) in a list
  // -> Those that have a number next to it


  // TODO: Make sure the iframe is open before going ahead
  // Switch to iframe level of the document
  await driver.switchTo().frame("panelFlyout");

  let bingRewards = await driver.findElement(By.id("bingRewards"));

  let tasks = await bingRewards.findElements(By.className("promo_cont"));
  
  const tasksToComplete = [];

  console.log("Storing all tasks... Please wait...")
  // Parse through and find tasks that have points assigned
  for(let task of tasks) {
    taskIndex++;
    try{
    let points = await task.findElement(By.className('point_cont'));
    let pointValue = await points.getText();
    if(pointValue != "") {
      tasksToComplete.push(task)
    }
    } catch (e) {
      if (e instanceof NoSuchElementError){
        // Do Nothing: Ignore
      }
    }
}


  // Find out which ones are simple click tasks (have these open in a new tab)

  // Some mention what it is i.e can you sore on this QUIZ in the descriptoin
  // or, Daily POLL/ Complete this PUZZLE in the title or TEST your knowledge

  for (let task of tasksToComplete){
    // Store title and description
    // See if any words from the list are contained
    let title = await task.findElement(By.className("b_subtitle promo-title"));
    let description = await task.findElement(By.className("fp_row b_footnote promo-desc"));
    console.log("Title: " + await title.getText());
    console.log("Desc: " + await description.getText());
    
    // Set it that this does this in a new tab!
    // await task.click();
  }

  // Return to the top level
  await driver.switchTo().defaultContent();
  

  


} catch (e) {
  console.log("Error [Task Completer]: " + e);

} finally {

  if(driver) {
    await driver.quit()
  }
}
}

// searchCompleter();
taskCompleter();