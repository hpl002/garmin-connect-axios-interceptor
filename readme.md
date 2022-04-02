# readme
Axios request interceptor that handles cookie based authentication to *garmin connect*.  

**Disclaimer:**  
This project is unfit for any and all commercial applications as we are handling user credentials directly.  
Be smart about this please..


## Motivation
Garmin only offers their API to enterprise clients(which is objectively stupid).  
This project is a very inefficient and slighly hacky way of circumventing this.   
Purely intended to be used in your own crappy side-projects. 

*I wanted some way of publishing my weight from a non-supported smart scale to garmin-connect.
To my surprise the smart-scale had a nice API while garmin did not(honestly thought it would be the other way around..)*


## Install
yarn add garmin-connect-axios-interceptor  

## Example
```
const axios = require('axios');
const { setInterceptors } = require("garmin-connect-axios-interceptor");

let config = {
    method: 'get',
    url: 'https://connect.garmin.com/modern/proxy/weight-service/weight/first?_=1648851627966'
};

setInterceptors({
    client: axios,
    credentials: {
        password: <your password>
        username: <your username>
    },
    debug: false
    // Optional flag that will persist relevant cookies in a local file and try to reuse these if still valid
    // This flag is recommended when developing to prevent SSO from giving you a HTTP 429(ca 60min ban)
});

const { data } = await axios(config)
console.log("data", data);
/*
    data {
    date: 1647388800000,
    version: 1647414215072,
    weight: 73000,
    bmi: null,
    bodyFat: null,
    bodyWater: null,
    boneMass: null,
    muscleMass: null,
    physiqueRating: null,
    visceralFat: null,
    metabolicAge: null,
    caloricIntake: null,
    sourceType: 'USER_SETTING',
    timestampGMT: 1647414215490
    }
*/

```