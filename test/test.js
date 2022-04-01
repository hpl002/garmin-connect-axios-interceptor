const { getCookies } = require("../src")
const { formatCookies } = require("../src/utils")
jest.setTimeout(30000)
/*

unit: login and get cookie

middleware: perform request directly after cookie has been retrieved and stored in env

middleware: try to perform a new request after the cookie has been invalided (handle 401 response)

*/

test("format cookies", async () => {
    const cookies = [
        {
            "name": "SESSIONID",
            "value": "redacted",
            "domain": "connect.garmin.com",
            "path": "/",
            "expires": -1,
            "size": 57,
            "httpOnly": true,
            "secure": true,
            "session": true,
            "sameSite": "Lax",
            "sameParty": false,
            "sourceScheme": "Secure",
            "sourcePort": 443
        },
        {
            "name": "__cflb",
            "value": "redacted",
            "domain": "connect.garmin.com",
            "path": "/",
            "expires": 1648840887.257783,
            "size": 51,
            "httpOnly": true,
            "secure": true,
            "session": false,
            "sameSite": "None",
            "sameParty": false,
            "sourceScheme": "Secure",
            "sourcePort": 443
        }
    ]

    expect(formatCookies(cookies).split(";").length == 2).toBe(true)
});

test("missing env var GARMIN_CONNECT_USERNAME", async () => {
    process.env.GARMIN_CONNECT_USERNAME = "test"
    process.env.GARMIN_CONNECT_PASSWORD = "test"
    delete process.env.GARMIN_CONNECT_USERNAME
    try {
        await getCookies(true)
        expect(false).toBe(true)
    } catch (error) {
        expect(error.message).toBe("missing env var GARMIN_CONNECT_USERNAME")
    }
});

test("missng env var GARMIN_CONNECT_PASSWORD", async () => {
    process.env.GARMIN_CONNECT_USERNAME = "test"
    process.env.GARMIN_CONNECT_PASSWORD = "test"
    delete process.env.GARMIN_CONNECT_PASSWORD
    try {
        await getCookies(true)
        expect(false).toBe(true)
    } catch (error) {
        expect(error.message).toBe("missing env var GARMIN_CONNECT_PASSWORD")
    }
});
