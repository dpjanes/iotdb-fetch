/*
 *  headers.js
 *
 *  David Janes
 *  IOTDB.org
 *  2017-10-23
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
const headers = _.promise(self => {
    _.promise.validate(self, headers)

    self.__fetch.headers = Object.assign({}, self.__fetch.headers)

    _.mapObject(self.headers, (value, key) => {
        self.__fetch.headers[key.toLowerCase()] = value
    })
})

headers.method = "headers"
headers.description = `
    Add headers to a request`
headers.requires = {
    __fetch: _.is.Dictionary,
    headers: _.is.JSON,
}

/**
 *  Parameterized 
 */
const headers_p = _headers => _.promise((self, done) => {
    _.promise(self)
        .add("headers", _headers)
        .then(headers)
        .end(done, self, "__fetch")
})

/**
 */
exports.headers = headers;
exports.headers.p = headers_p;
exports.headers.accept = v => headers_p({ "Accept": v })
exports.headers.user_agent = v => headers_p({ "User-Agent": v })
exports.headers.authorization = v => headers_p({ "Authorization": v })
exports.headers.authorization.bearer = v => headers_p({ "Authorization": "Bearer " + v })
