# xschool for nodejs

## Installation

```shell
npm install xschool
```

or when you are using yarn

```shell
yarn add xschool
```

## How to use

```javascript
import { XSchoolApi } from 'xschool'

const api = new XSchoolApi(endpoint, username, password, otpKey)
await api.login()
const terms = await api.getMarks()

// An example to get the mark average in the current term of bob in the subject 'Deutsch'

const currentTerm = terms.filter(term => term.current)[0]
const titleTerm = currentTerm.title
const student = currentTerm.students.filter(student => student.firstname == 'Bob')[0]
const subject = student.subjects.filter(subject => subject.title == 'Deutsch')[0]
// .filter(note => note) because some notes are empty
const marks = subject.marks.map(mark => mark.mark).filter(mark => mark)
const noteAverage = marks.reduce((p, c) => p + c, 0) / marks.length
console.log(`Your mark average in German is ${noteAverage}`)
```

### What does endpoint?

Your school have a subdomain of xschool.de. For example: your-school.xschool.de. The endpoint for this domain would be `https://your-school.xschool.de`. Don't put a `/` at the end of the url.

### What does otpKey mean?

xschool required 2 factor authentication via email or google authenticator. We want to use google authenticator here. You can enable google authenticator in the setting. xschool will give you a qr code and wants you to scan with google authenticator. You have to scan it with a other QR code scanner and get the raw string behind the qr code. The string is for example: `otpauth://totp/YOUR_USERNAME?secret=YOUR_SECRET&issuer=XSCHOOL`. Your `otpKey` is `YOUR_SECRET` in this url. Because xschool wants a verification otp code you have to scan the qr code with google authenticator now.

## Better use
When you make the first request the api have to authenticate you. The authentication details (Authorization codes) are saved in the cookies. If you save them the api doesn't have to make much requests again to authenticate you. Make it like that:

```javascript
import { XSchoolApi } from 'xschool'

let cookies = {}

if (cookiesWasSaved)
    cookies = JSON.parse(readCookiesFromFileDisk()) // you can use a json file for example

const api = new XSchoolApi(endpoint, username, password, otpKey, cookies) // you can pass the cookies in the constructor
if (!cookiesWasSaved)
    await api.login() // you have to re-login because you didn't save your cookies
    writeCookiesToFileDisk(JSON.stringify(api.getCookies()))

const terms = await api.getMarks()
```