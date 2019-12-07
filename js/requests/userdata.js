const request = require('request')
const sendGET = (user) => {
    return new Promise((resolve, reject) => {
        request(`https://codeforces.com/api/user.status?handle=${user}`, (error, response, body) => {
            const content = JSON.parse(response.body).result
            resolve(content)
        })
    })
}
const getData = async (user) => {
    let content = await sendGET(user)
    let solved = []
    content.forEach(data => {
        if(data.verdict === "OK")
            if(solved.includes(data.problem.name) === false)
                solved.push(data.problem.name)
    })
    return solved
}
const combineAllUsers = async (users) => {
    var solved = []
    var promises = users.map(async user => {
        const user_data = await getData(user)
        solved.push(...user_data)
    })
    return new Promise((resolve, reject) => {
        Promise.all(promises)
            .then(() => {
                resolve(solved)
            })
    })
}
const getUsersData = async (users) => {
    const solved = await combineAllUsers(users)
    return solved
}
module.exports = {
    getUsersData,
}