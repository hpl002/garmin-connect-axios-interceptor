# readme

## garmin connect authentication flow
login to garmin connect
pull cookies
use cookies to authenticate subsequent requests

# how are requests authenticated in garmin connect?
cookies are stored in browser
requests are authenticated by use of these cookies
While the client stored lots of cookies, only 2 are required. A cookies that is local to cloudflare and a sessionid.

**Required headers**
User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0
NK:NT
Cookie:__cflb=redactedvalue;
SESSIONID=redactedvalue
Host:connect.garmin.com

**Required cookies**
__cflb -> some cloudflare specific cookie
SESSIONID -> session identifier
only need to refresh this


### you might hit the rate limit while debugging
this will give you a 1 hour ban



## todos
 
more tests
add a debug mode where it persists cookies to local file. this is to prevent rate limiting during frequent testing

if debug and local file exists then try to use this


 