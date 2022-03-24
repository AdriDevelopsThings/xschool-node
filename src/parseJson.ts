export const parseJSON = (json: any) => {
    const terms: any[] = []
    for (const term of json.Terms) {
        const outTerm: any = { id: term.Id, title: term.Title, current: term.IsCurrent }
        const students = json.Students.filter((s: any) => s.TermId == term.Id)
        outTerm['students'] = students.map((student: any) => ({
            id: student.Id,
            firstname: student.Firstname,
            lastname: student.Lastname,
            subjects: student.Subjects.map((subject: any) => ({
                id: subject.Id,
                title: subject.Title,
                marks: subject.Ratings.map((rating: any) => ({
                    id: rating.ColumnId,
                    title: rating.Title,
                    dateOfCorrection: rating.DateOfCorrection,
                    dateOfRating: rating.DateOfRating,
                    mark: rating.MarkValue ? +rating.MarkValue : null
                }))
            }))
        }))
        terms.push(outTerm)
    }
    return terms
}