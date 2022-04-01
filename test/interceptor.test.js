const axios = require('axios')
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

test.only("try to get resource from garmin connect with interceptor but no valid cookie", async () => {
    let config = {
        method: 'get',
        url: 'https://connect.garmin.com/modern/proxy/weight-service/weight/first?_=1648851627966'
    };
    try {
        setInterceptors(axios)
        const response = await axios(config)
    } catch (error) {
        expect(error?.isAxiosError).toBe(true)
        expect(error?.response?.status > 200).toBe(true)
    }
});

//check that it uses the same cookies if not expired
// perform multiple request in series and check that the value remains unchanged


