const { getCookies } = require("../src")
jest.setTimeout(30000)
test("get cookies by autenticating", async () => {
    try {
        const { cookies } = await getCookies(false)
        cookies.forEach(c => {
            expect(["SESSIONID", "__cflb"].includes(c.name)).toBe(true)
        });
    } catch (error) {
        throw error
    }
});