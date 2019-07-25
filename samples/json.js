/*
 *  samples/json.js
 *
 *  David Janes
 *  IOTDB.org
 *  2017-08-02
 *
 *  Copyright (2013-2019) David P. Janes
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict"

const _ = require("iotdb-helpers")
const fetch = require("..")

const minimist = require("minimist")

const ad = minimist(process.argv.slice(2))
const action_name = ad._[0]

const actions = []
const action = name => {
    actions.push(name)

    return action_name === name
}

const _error = error => {
    delete error.self
    if (error.errors) {
        console.log("#", error.errors)
    } else {
        console.log("#", error)
    }
}

if (action("json")) {
    _.promise({
        url: "https://jsonplaceholder.typicode.com/posts/1",
    })
        // non parameterized
        .then(fetch.json)
        .then(sd => {
            console.log("+", sd.url, sd.json)
        })
        .catch(_error)
} else if (action("get")) {
    _.promise({})
        // parameterized
        .then(fetch.json.get("https://jsonplaceholder.typicode.com/posts/1"))
        .then(sd => {
            console.log("+", sd.url, sd.json)
        })
        .catch(_error)
} else if (action("get-2")) {
    _.promise({
        url: "https://jsonplaceholder.typicode.com/posts/1",
    })
        // empty param assumes self.url
        .then(fetch.json.get())
        .then(sd => {
            console.log("+", sd.url, sd.json)
        })
        .catch(_error)
} else if (action("head")) {
    _.promise({})
        .then(fetch.json.head("https://jsonplaceholder.typicode.com/posts/1"))
        .then(sd => {
            console.log("+", sd.url, sd.headers)
        })
        .catch(_error)
} else if (!action_name) {
    console.log("#", "action required - should be one of:", actions.join(", "))
} else {
    console.log("#", "unknown action - should be one of:", actions.join(", "))
}

