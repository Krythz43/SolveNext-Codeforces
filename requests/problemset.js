const request = require('request')
const sendGET = () => {
    return new Promise((resolve, reject) => {
        request(`https://codeforces.com/api/problemset.problems?`, (error, response, body) => {
            const content = JSON.parse(response.body).result
            resolve(content)
        })
    })
}
const getProblemSet = async () => {
    let data = await sendGET()
    return data
}

module.exports = {
    getProblemSet,
}