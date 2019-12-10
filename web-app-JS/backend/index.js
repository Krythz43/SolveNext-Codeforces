const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const {getProblemSet} = require('./requests/problemset')
const {getUserData} = require('./requests/userdata')
const morgan = require('morgan')
app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });
const problemsetData = {}
const tagList = []
const refreshSetData = async () => {
    const data = await getProblemSet()
    problemsetData.problems = data.problems
    problemsetData.problemStatistics = data.problemStatistics
    problemsetData.problems.forEach(problem => {
        problem.tags.forEach(tag => {
            if(!tagList.includes(tag))
                tagList.push(tag)
        })
    })
    console.log("Refreshed problemset data")
}
const userdata = {} //For server side caching
const collectUserData = async users => {
    const uData = {
        solved : [],
        invalidHandles: []
    }
    const promises = users.map(async user => {
        if(!userdata[user]){
            userdata[user] = await getUserData(user)
            setTimeout(() => delete userdata[user], 3600*1000)  //remove user data from cache after 1 hour
        }
        (userdata[user].error)?uData.invalidHandles.push(user):uData.solved.push(...userdata[user].solved)
    })
    return new Promise((resolve, reject) => {
        Promise.all(promises)
            .then(() => resolve(uData))
    })
}
const PORT = process.env.PORT || 3001
app.get('/', (request, response) => {
    response.json(problemsetData.problems.length)
})
app.get('/tags', (request, response) => {
    response.json(tagList)
})
app.get('/get/', async (request, response) => {
    const params = {
        users: request.query.users? request.query.users.split(',') : [],
        tags: request.query.tags? request.query.tags.split(',') : [],
        round: parseInt(request.query.ROUND) || 0,
        number_of_problems: parseInt(request.query.nop) || 10,
        lower_bound: parseInt(request.query.lowerBound) || 0,
        upper_bound: parseInt(request.query.upperBound) || 4000
    }
    const uData = await collectUserData(params.users)
    const result = {
        problems: [],
        invalidHandles: uData.invalidHandles,
    }
    const sortedList = problemsetData.problems
        .filter(problem => problem.contestId >= params.round && problem.rating >= params.lower_bound && problem.rating <= params.upper_bound)
        .map(problem => {
            problem.solved = problemsetData.problemStatistics[problemsetData.problems.indexOf(problem)].solvedCount
            return problem
        })
        .sort((a, b) => a.solved < b.solved ? 1 : -1)
    const taggedList = !params.tags.length?sortedList:sortedList.filter(problem => {
        for(tagIndex in problem.tags)
            if(params.tags.includes(problem.tags[tagIndex]))
                return true
        return false
    })
    const solved = uData.solved
    const finalList = taggedList.filter(problem => !solved.includes(problem.name))
    finalList.forEach((problem, index) => {
        if(index >= params.number_of_problems)
            return
        result.problems.push(problem)
    })
    response.json(result)
})
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`)
    refreshSetData()
    setInterval(()=>refreshSetData(), 24*3600*1000)
})