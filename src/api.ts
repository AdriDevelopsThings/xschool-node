import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import { ApiError, NoCSRFTokenAvailable } from './errors.js';
import { FormData } from 'node-fetch';
import totp from 'totp-generator';
import { CookieStore } from './cookieStore.js';
import { parseJSON } from './parseJson.js';

export class Api {
    private cookie = new CookieStore()
    private authenticated = false

    constructor (private endpoint: string, private username: string, private password: string, private totpKey: string, cookies?: { [key: string]: string }) {
        if (cookies)
            this.cookie.cookies = cookies
    }

    private async getCSRFToken (url: string): Promise<string> {
        const response = await fetch(this.endpoint + url)
        if (response.status !== 200)
            throw new ApiError(`getCSRFToken`, url, response.status, await response.text())
        if (response.headers.has('set-cookie'))
            this.cookie.parseCookiesFromSet(response.headers.raw()['set-cookie']!)
        const root = parse(await response.text())
        const tokens = root.querySelectorAll('input[name=__RequestVerificationToken]')
        if (tokens.length === 0 && tokens[0].getAttribute('value') !== null) {
            throw new NoCSRFTokenAvailable(url)
        } else {
            return tokens[0].getAttribute('value')!
        }
    }

    private async sendCode () {
        const csrfToken = await this.getCSRFToken('/Account/VerifyCode?RememberClient=False&ReturnUrl=%2F&TokenProvider=Google%20Authenticator')
        const formData = new FormData()
        formData.append('code', String(totp(this.totpKey)))
        formData.append('ReturnUrl', '/')
        formData.append('__RequestVerificationToken', csrfToken)
        const response = await fetch(this.endpoint + '/Account/VerifyCode?RememberClient=False&ReturnUrl=%2F&TokenProvider=Google%20Authenticator', {
            method: 'POST',
            body: formData,
            headers: {
                cookie: this.cookie.parseToCookieHeader()
            }, redirect: 'manual'
        })
        if (response.status == 302 && response.headers.get('Location') == '/' && response.headers.has('set-cookie')) {
            this.cookie.parseCookiesFromSet(response.headers.raw()['set-cookie']!)
        } else {
            throw new ApiError('sendCode', '/Account/VerifyCode?RememberClient=False&ReturnUrl=%2F&TokenProvider=Google%20Authenticator', response.status, await response.text())
        }
    }

    async login () {
        const csrfToken = await this.getCSRFToken('/Account/Login?ReturnUrl=%2F')
        const loginResponse = await fetch(this.endpoint + '/Account/Login?ReturnUrl=%2F', { method: 'POST', body: new URLSearchParams({
            Username: this.username,
            Password: this.password,
            '__RequestVerificationToken': csrfToken
        }), headers: {
            cookie: this.cookie.parseToCookieHeader(),
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Move': 'navigate',
            'Sec-Fetch-User': '?1',
            'Sec-GPC': '1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.83 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded'
        }, redirect: 'manual' })
        if (loginResponse.status === 302 && loginResponse.headers.has('set-cookie')) {
            this.cookie.parseCookiesFromSet(loginResponse.headers.raw()['set-cookie']!)
            if (loginResponse.headers.get('Location') == '/Account/SendCode?ReturnUrl=%2F') {
                await this.sendCode()
            }
            this.authenticated = true
        } else {
            throw new ApiError('login', '/Account/Login?ReturnUrl=%2F', loginResponse.status, await loginResponse.text())
        }
    }

    async getMarks () {
        if (!this.authenticated)
            await this.login()
        const response = await fetch(this.endpoint + '/Marks/Parent', { headers: { cookie: this.cookie.parseToCookieHeader() }, redirect: 'manual' })
        if (response.status == 200) {
            const root = parse(await response.text())
            const viewModel = root.querySelector('#viewModel')!
            const value = viewModel.getAttribute('value')!.replace('&quot;', '"')
            const json = JSON.parse(value)
            return parseJSON(json)
        } else {
            throw new ApiError('getMarks', '/Marks/Parent', response.status, await response.text())
        }
    }

    getCookies () {
        return this.cookie.cookies
    }
}