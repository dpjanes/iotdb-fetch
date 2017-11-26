/*
 *  get.js
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

const _ = require("iotdb-helpers");
const errors = require("iotdb-errors");

const unirest = require("unirest");

const assert = require("assert");

/**
 */
const get = _.promise.make(self => {
    const method = "get";

    assert.ok(self.url, `${method}: expected self.url`);

    self.__request = unirest.get(self.url)

    if (!_.is.Empty(self.query)) {
        self.__request = self.__request.query(self.query)
    }
})

/**
 *  Parameterized (note "url" and "query" remain in self
 *  so that the caching functions can see them)
 */
const get_p = (url, query) => _.promise.make((self, done) => {
    const method = "get.p";

    _.promise.make(self)
        .then(sd => _.d.add(sd, "url", url || sd.url))
        .then(sd => _.d.add(sd, "query", query || sd.query || {}))
        .then(exports.get)
        .then(_.promise.done(done)) 
        .catch(done)
})

/**
 *  This just does the GET and then GO
 */
const get_go = _.promise.make((self, done) => {
    _.promise.make(self)
        .then(get)
        .then(require("./go").go)
        .then(_.promise.done(done))
        .catch(done);
})

/**
 */
exports.get = get;
exports.get.p = get_p;
exports.get.go = get_go;
