const request = require('request')
const sendGET = (user) => {
    return new Promise((resolve, reject) => {
        request({
            'url':`https://codeforces.com/api/user.status?handle=${user}`,
            'method': "GET",
            //For the rest of the world, uncomment this
             'proxy':''
            // For Usage in KGP uncomment the below lines
            //'proxy':'http://172.16.2.30:8080'
        }, (error, response, body) => {
            if(error){
                console.log("Couldn't collect user data from CodeForces API.")
                console.error("Error details:\n", error, "\nExiting...")
            }
            if(JSON.parse(response.body).status.toString() !== "OK"){
                console.log(`Ignoring invalid CodeForces handle: ${user}`)
                resolve([])
            }
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