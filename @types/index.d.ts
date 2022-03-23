type Mark = {
    title: string,
    dateOfCorrection?: string,
    dateOfRating?: string,
    mark: string | null
}

type Subject = {
    title: string,
    marks: Mark[]
}

type Student = {
    firstname: string,
    lastname: string,
    subjects: Subject[]
}

type Term = {
    title: string,
    current: boolean
    students: Student[]
}

type Terms = Term[]

export class XSchoolApi {
    constructor (endpoint: string, username: string, password: string, totpKey: string, cookies?: { [key: string]: string })
    async getMarks (): Promise<Terms>
    async login(): Promise<void>
    getCookies(): { [key: string]: string }
}