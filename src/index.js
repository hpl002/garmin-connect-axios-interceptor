const puppeteer = require('puppeteer');
const axios = require("axios")

const getCookies = async (debug = false) => {
  const garminUsername = process.env.GARMIN_CONNECT_USERNAME
  const garminPassword = process.env.GARMIN_CONNECT_PASSWORD
  if (!garminUsername) throw new Error("missing env var GARMIN_CONNECT_USERNAME")
  if (!garminPassword) throw new Error("missing env var GARMIN_CONNECT_PASSWORD")

  const browser = await puppeteer.launch({ devtools: debug })

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4427.0 Safari/537.36');
  await page.goto('https://connect.garmin.com/signin/');

  const elementHandle = await page.waitForSelector('#gauth-widget-frame-gauth-widget');
  const frame = await elementHandle.contentFrame();

  const username = await frame.waitForSelector('#username', { visible: true });
  await username.type(garminUsername);

  const password = await frame.waitForSelector('#password', { visible: true });
  await password.type(garminPassword);

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

const ping = async ({ req }) => {
  //TODO: get cookies from process.env and add to our new req


  let config = {
    method: 'get',
    url: 'https://connect.garmin.com/modern/proxy/info-service/api/system/release-system?_=1648762135006',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://connect.garmin.com/modern/',
      'NK': 'NT',
      'X-app-ver': '4.53.1.0',
      'X-lang': 'en-US',
      'X-Requested-With': 'XMLHttpRequest',
      'Connection': 'keep-alive',
      'Cookie': 'TEALCDN=com:1648848529558; ku1-vid=fd33fea4-53e8-3407-7333-25a1977d103d; CONSENTMGR=c1:1%7Cc2:1%7Cc3:1%7Cc4:1%7Cc5:1%7Cc6:1%7Cc7:1%7Cc8:1%7Cc9:1%7Cc10:1%7Cc11:1%7Cc12:1%7Cc13:1%7Cc14:1%7Cc15:1%7Cts:1648762129558%7Cconsent:true; utag_main=v_id:017f7fcb6945007f1a65eb3372e800052002500f00b78$_sn:13$_ss:1$_st:1648763929560$ses_id:1648762129560%3Bexp-session$_pn:1%3Bexp-session; notice_preferences=2:; notice_gdpr_prefs=0,1,2:; notice_poptime=1619726400000; cmapi_cookie_privacy=permit 1,2,3; _gcl_au=1.1.1435776242.1647455354; G_ENABLED_IDPS=google; cmapi_gtm_bl=; GarminBuyReferrer=https://www.google.com/; ku1-sid=F7jO6ELjisZUyeqay5wum; notice_behavior=implied,eu; GarminUserPrefs=en-US; __cfruid=89dfd978d789f71f9f72690cad368fcb5127aad0-1648410187; notice_behavior=implied,eu; __cflb=02DiuJLbVZHipNWxN8yYRX3u8XkAfEE5A4AvQkbYmqyLx; GARMIN-SSO=1; GarminNoCache=true; GARMIN-SSO-GUID=5CF2C30EE24953AA6367F5B8CA2882BF04053015; GARMIN-SSO-CUST-GUID=92d4f9d3-7c2d-40aa-b66b-fe0a04ad55c4; SESSIONID=NjE3YjQ1OGMtOWU0ZC00MzczLWE0NTUtMTdiODI4YjIyNmYx; SameSite=None; ADRUM_BTa=R:23|g:caaaf450-3902-4756-b1ff-48c09e4d5964|n:garmin_869629ee-d273-481d-b5a4-f4b0a8c4d5a3; ADRUM_BT1=R:23|i:562441|e:249',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'same-origin',
      'TE': 'trailers',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache'
    }
  };

  return await axios(config)
}

const garminConnectMiddleware = async ({ req, res, next }) => {
  // if cookies exist then try to perform request
  if (process.env.COOKIES && process.env.COOKES.map(cookie => ["SESSIONID", "__cflb"].includes(cookie.name))) {
    try {
      // try to ping api to validate cookies
      await ping()
      // add cookies from env to req
    } catch (error) {
      const { status } = error.response
      if (status === 401) {
        console.info("caught error while trying perform request with pre-existing cookies")
        // del local cookies as these are likely invalidated
        delete process.env.GARMIN_CONNECT_PASSWORD
        garminConnectMiddleware({ req, res, next })
      }
      console.error("unhandled error while trying to get cookies")
      throw error
    }
    // try to ping garmin connect to check if req is valid
    // if valid then append cookies to req and next()

  } else {
    const { cookies } = await getCookies()
    //TODO: format cookies into string that can be added to req directly
    process.env.COOKIES = cookies
    garminConnectMiddleware({ req, res, next })
  }
  next()

}

module.exports = { getCookies, garminConnectMiddleware }
