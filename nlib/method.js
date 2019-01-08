/*
 *  lib/method.js
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
const method = METHOD => _.promise(self => {
    _.promise.validate(self, method)

    self.__fetch = {
        method: METHOD,
        url: self.url,
        query: self.query || {},
    }
})

method.method = "method"
method.description = `
    Do a HTTP/HTTPS method (parameterized)`
method.requires = {
    url: _.is.AbsoluteURL,
}
method.accepts = {
    query: _.is.Dictionary,
}

/**
 */
const method_p = METHOD => (url, query) => _.promise((self, done) => {
    _.promise(self)
        .add({
            "url": url,
            "query": query || null,
        })
        .then(exports.method(METHOD))
        .end(done, self, "__fetch")
})

/**
 *  This just does the GET and then GO
 */
const method_go = METHOD => _.promise((self, done) => {
    _.promise(self)
        .then(method(METHOD))
        .then(require("./go").go)
        .end(done, self, "__fetch")
})

/**
 */
exports.get = method("GET")
exports.get.p = method_p("GET")
exports.get.go = method_go("GET")
