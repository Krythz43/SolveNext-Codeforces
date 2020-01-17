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
                resolve({error: "Invalid Handle"})
            }
            const content = JSON.parse(response.body).result
            resolve(content)
        })
    })
}
const getData = async (user) => {
    const result = {
        solved: [],
    }
    let content = await sendGET(user)
    if(content.error){
        result.error = content.error
        return result
    }
    content.forEach(data => {
        if(data.verdict === "OK")
            if(result.solved.includes(data.problem.name) === false)
                result.solved.push(data.problem.name)
    })
    return result
}
const getUserData = async (user) => {
    const result = await getData(user)
    return result
}
module.exports = {
    getUserData,
}