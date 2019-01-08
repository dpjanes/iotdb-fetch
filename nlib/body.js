/*
 *  lib/body.js
 *
 *  David Janes
 *  IOTDB.org
 *  2019-01-07
 *
 *  Copyright [2013-2019] David P. Janes
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

/**
 */
const body_json = _.promise(self => {
    _.promise.validate(self, body_json)

    self.__fetch.bodys = [ JSON.stringify(self.json) ]
    self.__fetch.headers["content-length"] = Buffer.byteLength(self.__fetch.bodys[0])
    self.__fetch.headers["content-type"] = "application/json"
})

body_json.method = "body.json"
body_json.description = `
    Send JSON in the HTTP request`
body_json.requires = {
    __fetch: _.is.Dictionary,
    json: _.is.JSON,
}

/**
 */
exports.body = {
    json: body_json,
}
