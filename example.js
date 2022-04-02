const axios = require('axios');
// Uncomment if you intent on running this example locally
const { setInterceptors } = require(".");
//const { setInterceptors } = require("garmin-connect-axios-interceptor");

let config = {
    method: 'get',
    url: 'https://connect.garmin.com/modern/proxy/weight-service/weight/first?_=1648851627966'
};

setInterceptors({
    client: axios,
    credentials: {
        password: process.env.GARMIN_CONNECT_PASSWORD,
        username: process.env.GARMIN_CONNECT_USERNAME
    },
    debug: false
});

    (async () => {
        const { data } = await axios(config)
        console.log("data", data);
    })()