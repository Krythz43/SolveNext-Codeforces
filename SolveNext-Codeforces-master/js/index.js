const {getProblemSet} = require('./requests/problemset')
const {getUsersData} = require('./requests/userdata')
//Initialization
const preferences = {
    ROUND : 500,
    number_of_problems : 10,
    lower_bound : 1600,
    upper_bound : 4000   
}
const users = ["nks43"]
const tags = ["number theory"]
//main
const main = async () => {
    let problemsetPromise = getProblemSet()
    let usersPromise = getUsersData(users)
    //get problemset
    const problemset_data = await problemsetPromise
    console.log(`Total problems present : ${problemset_data.problems.length}`)
    console.log(`Total problem stats : ${problemset_data.problemStatistics.length}`)

    //modify and sort
    const sorted_list = problemset_data.problems
        .filter(problem => problem.contestId >= preferences.ROUND && problem.rating >= preferences.lower_bound && problem.rating <= preferences.upper_bound)
        .map(problem => {
            problem.solved = problemset_data.problemStatistics[problemset_data.problems.indexOf(problem)].solvedCount
            return problem
        })
        .sort((a, b) => a.solved < b.solved ? 1 : -1)
    
    //filter by tag
    const tagged_list = sorted_list.filter(problem => {
        for(tagIndex in problem.tags){
            if(tags.includes(problem.tags[tagIndex]))
                return true
        }
        return false
    })

    //remove solved and display
    const solved = await usersPromise
    console.log(`Number of problems solved is : ${solved.length}`)
    console.log(`Final list length : ${tagged_list.length}`)
    const final_list = tagged_list.filter(problem => solved.includes(problem.name) === false)
    console.log(`Problems solved in this category : ${tagged_list.length - final_list.length}`)
    console.log(`Remaining problems to solve in list : ${final_list.length}`)

    //suggest problems to solve
    console.log(`Suggested problems to solve :`)
    final_list.forEach((problem, index) => {
        if(index >= preferences.number_of_problems)
            return
        console.log(`${problem.contestId}${problem.index}\tSolved by : ${problem.solved}\tRating : ${problem.rating}\thttps://codeforces.com/contest/${problem.contestId}/problem/${problem.index})\t${problem.name}`)
    })
}
main()