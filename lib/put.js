/*
 *  put.js
 *
 *  David Janes
 *  IOTDB.org
 *  2017-09-03
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
const put = (_self, done) => {
    const self = _.d.clone.shallow(_self)
    const method = "put";

    assert.ok(self.url, `${method}: expected self.url`);

    self.__request = unirest.put(self.url)

    if (self.query) {
        self.__request = self.__request.query(self.query)
    }

    done(null, self)
}

/**
 *  Parameterized 
 */
const put_p = (url, query) => _.promise.make((self, done) => {
    const method = "put.p";

    _.promise.make(self)
        .then(sd => _.d.add(sd, "url", url || sd.url))
        .then(sd => _.d.add(sd, "query", query || sd.query || {}))
        .then(exports.put)
        .then(_.promise.done(done, self, "__request")) 
        .catch(done)
})

/**
 */
exports.put = _.promise.denodeify(put);
exports.put.p = put_p;
