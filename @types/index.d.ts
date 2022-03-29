type Mark = {
    id: string,
    title: string,
    dateOfCorrection?: string,
    dateOfRating?: string,
    mark: string | null
}

type Subject = {
    id: string,
    title: string,
    marks: Mark[]
}

type Student = {
    id: string,
    firstname: string,
    lastname: string,
    subjects: Subject[]
}

type Term = {
    id: string,
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

export class XSchoolError extends Error {
    step: string
    message: string
}

export class ApiError extends XSchoolError {
    public step: string
    public url: string
    public status: string | number
    public content: string
}

export class NoCSRFTokenAvailable extends XSchoolError {
    public url: string
}