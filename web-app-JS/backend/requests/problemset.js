const request = require('request')
const sendGET = () => {
    return new Promise((resolve, reject) => {
        request({
            'url':`https://codeforces.com/api/problemset.problems?`,
            'method': "GET",
            //For the rest of the world, uncomment this
            'proxy':''
            //For Usage in KGP uncomment the below lines
            // 'proxy':'http://172.16.2.30:8080'
            }, (error, response, body) => {
                if(error){
                    console.log()
                    if(error.code === 'ENOTFOUND')
                        console.log("Couldn't connect to CodeForces API! Check your internet connection.\nExiting...")
                    else
                        console.error("Error details:\n", error, "\nExiting...")
                    process.exit(0)
                }
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