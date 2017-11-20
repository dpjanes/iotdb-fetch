/*
 *  samples/post_json_p.js
 *
 *  David Janes
 *  IOTDB.org
 *  2017-11-20
 *
 *  Copyright [2013-2017] [David P. Janes]
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

"use strict";

const _ = require("iotdb-helpers");

const fetch = require("..")

/**
 *  POST with JSON payload
 */
_.promise.make({})
    .then(fetch.post.p("https://jsonplaceholder.typicode.com/posts"))
    .then(fetch.body.json.p({
        a: 1,
        b: "two",
        c: [ 3, "four", ],
    }))
    .then(fetch.go.json)
    .then(_.promise.make(sd => {
        console.log("+", "final url", sd.url, sd.json)
    }))
    .catch(error => {
        console.log("#", error)
    })
