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
parse array of cookies into string that can be added to to req

package the actual middleware
middleware should check if it already has retrieved the cookies
if no cookes the get some more
if cookies return 401 the get some more
if cookie returns any other response then fail


## where to continue:
continue on actual middleware. need to validate cookies via ping to api + handle non 2xx cases