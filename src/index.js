const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({devtools: true})

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4427.0 Safari/537.36');
  await page.goto('https://connect.garmin.com/signin/');


  const elementHandle = await page.waitForSelector('#gauth-widget-frame-gauth-widget');
  const frame = await elementHandle.contentFrame();

  const username = await frame.waitForSelector('#username', {visible: true});
  await username.type(process.env.GARMIN_CONNECT_USERNAME);

  const password  = await frame.waitForSelector('#password', {visible: true});
  await password.type(process.env.GARMIN_CONNECT_PASSWORD);

  await frame.waitForSelector('#truste-consent-button', {visible: true})
  await frame.click('#truste-consent-button')


  await frame.waitForSelector('#login-btn-signin', {visible: true})
  await frame.click('#login-btn-signin')


  /* await page.waitForNavigation()
  await page.waitForSelector('#gauth-widgetas', { visible: true }) */
  // wait for login form to render
  //login using credentials from env
  // wait for redirect
  // get cookies
  setTimeout(() => { browser.close(); }, 3000);

  await browser.close();
})();