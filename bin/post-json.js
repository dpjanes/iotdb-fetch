const _ = require("iotdb-helpers")
const fetch = require("iotdb-fetch")
const fs = require("iotdb-fs")

const minimist = require("minimist")
const ad = minimist(process.argv.slice(2), {
})

const help = message => {
    const name = "post-json"

    if (message) {
        console.log(`${name}: ${message}`)
        console.log()
    }

    console.log(`\
usage: ${name} [options]
`)

    process.exit(message ? 1 : 0)
}


if (!ad.url && ad._.length) {
    ad.url = ad._.shift()
}

if (!ad.url) {
    help("--url url is required")
}


_.logger.levels({
    debug: ad.debug || ad.verbose,
    trace: ad.trace || ad.verbose,
})


/**
 */
const read_stdin = () => {
    return new Promise((resolve, reject) => {
        process.stdin.resume()
        process.stdin.setEncoding("utf8")

        let buffer = ""

        process.stdin.on("data", chunk => buffer += chunk)
        process.stdin.on("end", () => resolve(buffer))
    })
}

_.promise({
    url: ad.url,
})
    .make(async sd => {
        sd.json = JSON.parse(await read_stdin())
    })
    .then(fetch.json.post({
        url: null,
        json: null,
    }))
    .make(sd => {
        console.log(JSON.stringify(sd.json, null, 2))
    })

    .catch(error => {
        console.log("#", _.error.message(error))
    })
