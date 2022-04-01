const puppeteer = require('puppeteer');
const axios = require("axios")

const formatCookies = (list) => {
  const formatted = [];
  list.forEach(cookie => {
    formatted.push(`${cookie.name}=${cookie.value}`)
  });
  return formatted.join("; ")
}

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

const ping = async () => {
  const instance = axios.create()

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
      'Cookie': process.env.COOKIES,
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'same-origin',
      'TE': 'trailers',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache'
    }
  };
  let status = 0
  try {
    const response = await instance(config)
    status = response.status
  } catch (error) {
    if (error?.response?.status) {
      status = error.response.status
    }
    else {
      throw error
    }
  }
  return { status }
}

const getAndStoreCookies = async () => {
  let { cookies } = await getCookies()
  process.env.COOKIES = formatCookies(cookies)
}

const InvalidCookiesError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidCookiesError";
  }
}

const addHeaders = (headers, config) => {
  const newHeaders = {
    ...headers,
    ...config.headers
  }
  config.headers = newHeaders;
}

const requestInterceptor = async (config) => {
  addHeaders({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0',
    'NK': 'NT'
  }, config)
  try {
    if (!process.env.COOKIES) throw new InvalidCookiesError("no cookies set")
    const { status } = await ping()
    if (status !== 200) {
      delete process.env.COOKIES
      throw new InvalidCookiesError("cookies expired, get new")
    }
  } catch (error) {
    if (error instanceof InvalidCookiesError) {
      await getAndStoreCookies()
      addHeaders({"Cookie": process.env.COOKIES}, config)
    }
    else {
      throw error
    }
  }
  return config
}

const setInterceptors = (client) => {
  client.interceptors.request.use(requestInterceptor, undefined);
}

module.exports = {
  setInterceptors
}