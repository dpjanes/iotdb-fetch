/*
 *  samples/get_redirect.js
 *
 *  David Janes
 *  IOTDB.org
 *  2017-08-01
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

const fetch = require("..")


/**
 *  Demonstrate the URL changing on a redirect
 */
_.promise.make({
    url: "http://dev.consensas.com",
})
    .then(fetch.get)
    .then(fetch.go)
    .then(sd => {
        console.log("+", "final url", sd.url)
    })
    .catch(error => {
        console.log("#", error)
    })
