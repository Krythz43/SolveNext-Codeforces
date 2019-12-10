const {getProblemSet} = require('./requests/problemset')
const {getUsersData} = require('./requests/userdata')
const readline = require('readline')
require('dotenv').config({path: '.././config.env'})
const numberValidation = line => !isNaN(parseInt(line)) || !line
const editToNumber = (line, key) => !line ? defaults[key] : parseInt(line)
const lineToArray = line => line.split(',').map(element => element.trim())
const initials = {
    users : !process.env.TAGS?[]:lineToArray(process.env.USERS),
    tags : !process.env.TAGS?[]:lineToArray(process.env.TAGS),
    ROUND : parseInt(process.env.ROUND),
    number_of_problems : parseInt(process.env.NUMBER_OF_PROBLEMS),
    lower_bound : parseInt(process.env.LOWER_BOUND),
    upper_bound : parseInt(process.env.UPPER_BOUND)  
}
const defaults = {
    ROUND : 500,
    number_of_problems : 10,
    lower_bound : 1600,
    upper_bound : 4000 
}
const getInitials = async (question, validate) => {
    const rl = readline.createInterface(process.stdin, process.stdout)
    return new Promise(async (resolve, reject) => {
        rl.setPrompt(question)
        rl.prompt()
        rl.on('line', async line => {
            line = line.trim()
            if(!validate(line)){
                console.log("Invalid Input! Please follow proper format!")
                rl.prompt()
            }
            else{
                rl.close()
                resolve(line)
            }
        })
    })
}
const initialize = async () => {
    if(!initials.users || !initials.users[0])
        initials.users = lineToArray(await getInitials("Enter username(s) (separated by commas) : ", line => line))
    if(!initials.tags || !initials.tags[0])
        initials.tags = lineToArray(await getInitials("Enter problem tags(s) (separated by commas) : ", line => true))
    if(!initials.ROUND)
        initials.ROUND = editToNumber(await getInitials("Enter oldest Round number (leave empty for default) : ", numberValidation), "ROUND")
    if(!initials.number_of_problems)
        initials.number_of_problems = editToNumber(await getInitials("Enter number of problems required (leave empty for default) : ", numberValidation), "number_of_problems")
    if(!initials.lower_bound)
        initials.lower_bound = editToNumber(await getInitials("Enter minimum problem rating (leave empty for default) : ", numberValidation), "lower_bound")
    if(!initials.upper_bound)
        initials.upper_bound = editToNumber(await getInitials("Enter maximum problem rating (leave empty for default) : ", numberValidation), "upper_bound")
}
//main
const main = async () => {

    //Initialization
    let problemsetPromise = getProblemSet()
    await initialize()
    let usersPromise = getUsersData(initials.users)
    console.log("Getting data from CodeForces API...")
    const problemset_data = await problemsetPromise
    console.log(`Total problems present : ${problemset_data.problems.length}`)
    console.log(`Total problem stats : ${problemset_data.problemStatistics.length}`)

    //modify and sort
    const sorted_list = problemset_data.problems
        .filter(problem => problem.contestId >= initials.ROUND && problem.rating >= initials.lower_bound && problem.rating <= initials.upper_bound)
        .map(problem => {
            problem.solved = problemset_data.problemStatistics[problemset_data.problems.indexOf(problem)].solvedCount
            return problem
        })
        .sort((a, b) => a.solved < b.solved ? 1 : -1)
    
    //filter by tag
    var tagged_list = (!initials.tags || !initials.tags[0]) ? sorted_list : sorted_list.filter(problem => {
        for(tagIndex in problem.tags){
            if(initials.tags.includes(problem.tags[tagIndex]))
                return true
        }
        return false
    })
    if(!tagged_list.length){
        initials.tags = [''];
        console.log(`Found 0 problems with the given tag(s). Showing results for all tags!`)
        tagged_list = (!initials.tags || !initials.tags[0]) ? sorted_list : sorted_list.filter(problem => {
            for(tagIndex in problem.tags){
                if(initials.tags.includes(problem.tags[tagIndex]))
                    return true
            }
            return false
        })
    }
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
        if(index >= initials.number_of_problems)
            return
        console.log(`${problem.contestId}${problem.index}\tSolved by : ${problem.solved}\tRating : ${problem.rating}\thttps://codeforces.com/contest/${problem.contestId}/problem/${problem.index})\t${problem.name}`)
    })
}
main()