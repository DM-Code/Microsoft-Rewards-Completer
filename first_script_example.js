const {By, Builder, Options} = require('selenium-webdriver');

// Following the Getting Started: First Script tutorial
// https://www.selenium.dev/documentation/webdriver/getting_started/first_script/

async function scriptExample() {

    try {
    // Start the session
    driver = await new Builder().forBrowser('chrome').build();

    // Browser action (Navigate to a web page)
    await driver.get('https://www.selenium.dev/selenium/web/web-form.html');

    // Interaction: Requesting information from the browser
    let title = await driver.getTitle();

    // Wait implicitly (there are better waiting strategies)
    await driver.manage().setTimeouts({implicit: 1500});

    // Find some elements, required before you can interact
    let textBox = await driver.findElement(By.name('my-text'));
    let submitButton = await driver.findElement(By.css('button'));

    // Take action on some elements
    await textBox.sendKeys('Selenium');

    await submitButton.click();

    // Request element information
    let message = await driver.findElement(By.id('message'));
    let value = await message.getText();
    
    } catch (e) {
        console.log("Error: " + e);
    } finally {
        // End the session
        await driver.quit();
    }
}

// Runs the example
scriptExample();
