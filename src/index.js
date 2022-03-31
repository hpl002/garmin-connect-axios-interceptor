const puppeteer = require('puppeteer');

const getCookies = async (debug = false) => {
  const browser = await puppeteer.launch({ devtools: debug })

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4427.0 Safari/537.36');
  await page.goto('https://connect.garmin.com/signin/');

  const elementHandle = await page.waitForSelector('#gauth-widget-frame-gauth-widget');
  const frame = await elementHandle.contentFrame();

  const username = await frame.waitForSelector('#username', { visible: true });
  await username.type(process.env.GARMIN_CONNECT_USERNAME);

  const password = await frame.waitForSelector('#password', { visible: true });
  await password.type(process.env.GARMIN_CONNECT_PASSWORD);

  const acceptCookies = await await page.waitForSelector('#truste-consent-button')
  await acceptCookies.click()

  // simply wait for the cookie consent fade away
  await page.waitForTimeout(2000)

  const submitLogin = await frame.waitForSelector('#login-btn-signin', { visible: true });
  await submitLogin.click()

  // wait until network traffic is stale
  await page.waitForNavigation({ waitUntil: 'networkidle0' })

  // collect cookies and dump into file
  let cookies = await page.cookies();
  const cookieNames = ["SESSIONID", "__cflb"]
  cookies = cookies.filter(cookie => cookieNames.includes(cookie.name))
  await browser.close();
  return { cookies }
}

module.exports = { getCookies }
