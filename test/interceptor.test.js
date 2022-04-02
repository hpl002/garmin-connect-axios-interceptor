const axios = require('axios');
const { connect } = require('puppeteer');
const { setInterceptors } = require("../src/index")
jest.setTimeout(30000)

test("try to get resource from garmin connect without interceptor", async () => {
    let config = {
        method: 'get',
        url: 'https://connect.garmin.com/modern/proxy/weight-service/weight/first?_=1648840919907',
        headers: {}
    };

    try {
        await axios(config)
    } catch (error) {
        expect(error.isAxiosError).toBe(true)
        expect(error.response.status > 200).toBe(true)
    }
});

test("try to get resource from garmin connect with interceptor", async () => {
    let config = {
        method: 'get',
        url: 'https://connect.garmin.com/modern/proxy/weight-service/weight/first?_=1648851627966'
    };
    try {
        setInterceptors({
            client: axios,
            credentials: {
                password: process.env.GARMIN_CONNECT_PASSWORD,
                username: process.env.GARMIN_CONNECT_USERNAME
            },
            debug: false
        })
        const response = await axios(config)
        expect(!!response.data.weight).toBe(true)
    } catch (error) {
        throw error
    }
});

test("try to get resource from garmin connect with interceptor:should try to use the same cookies for the lifetime of the process", async () => {
    let config = {
        method: 'get',
        url: 'https://connect.garmin.com/modern/proxy/weight-service/weight/first?_=1648851627966'
    };
    try {
        setInterceptors({
            client: axios,
            credentials: {
                password: process.env.GARMIN_CONNECT_PASSWORD,
                username: process.env.GARMIN_CONNECT_USERNAME
            },
            debug: false
        })
        // get cookies
        // check that the same cookies are used in subsequent requests
        const response = await axios(config)
        const Cookie = response.request._headers.cookie
        expect(!!response.data.weight).toBe(true)

        const response1 = await axios(config)
        expect(Cookie === response1.request._headers.cookie).toBe(true)
        expect(!!response1.data.weight).toBe(true)

        const response2 = await axios(config)
        expect(Cookie === response2.request._headers.cookie).toBe(true)
        expect(!!response2.data.weight).toBe(true)


    } catch (error) {
        throw error
    }
});

test("try to get resource from garmin connect with interceptor:store and reuse token if debug is true", async () => {
    let config = {
        method: 'get',
        url: 'https://connect.garmin.com/modern/proxy/weight-service/weight/first?_=1648851627966'
    };
    try {
        setInterceptors({
            client: axios,
            credentials: {
                password: process.env.GARMIN_CONNECT_PASSWORD,
                username: process.env.GARMIN_CONNECT_USERNAME
            },
            debug: false
        })
        // get cookies
        // check that the same cookies are used in subsequent requests
        const response = await axios(config)
        const Cookie = response.request._headers.cookie
        expect(!!response.data.weight).toBe(true)

        const response1 = await axios(config)
        expect(Cookie === response1.request._headers.cookie).toBe(true)
        expect(!!response1.data.weight).toBe(true)

        const response2 = await axios(config)
        expect(Cookie === response2.request._headers.cookie).toBe(true)
        expect(!!response2.data.weight).toBe(true)


    } catch (error) {
        throw error
    }
});

//check that it uses the same cookies if not expired
// perform multiple request in series and check that the value remains unchanged


