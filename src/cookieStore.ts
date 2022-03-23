export class CookieStore {
    cookies: { [key: string]: string } = {}
    
    addCookie (name: string, value: string) {
        this.cookies[name] = value
    }

    getCookie (name: string): string | null {
        return this.cookies[name]
    }

    removeCookie (name: string) {
        delete this.cookies[name]
    }

    parseCookiesFromSet (setCookies: string[]) {
        setCookies.forEach(setCookie => {
            const list = setCookie.split('; ')
            if (list.length > 0) {
                const [cookieName, cookieValue] = list[0].split('=')
                this.addCookie(cookieName, cookieValue)
            }
        })
    }

    parseToCookieHeader (): string {
        let header = ''
        for (const [cookieName, cookieValue] of Object.entries(this.cookies)) {
            header += `; ${cookieName}=${cookieValue}`
        }
        return header.slice(2)
    }
}