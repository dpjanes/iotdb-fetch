/*
 *  headers.js
 *
 *  David Janes
 *  IOTDB.org
 *  2017-10-23
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
const headers = (_self, done) => {
    const self = _.d.clone.shallow(_self)
    const method = "headers";

    assert.ok(self.headers, `${method}: expected self.headers`);
    assert.ok(self.__request, `${method}: expected self.__request`);

    self.__request = self.__request.headers(self.headers)

    done(null, self)
}

/**
 *  Parameterized 
 */
const headers_p = headers => _.promise.denodeify((_self, done) => {
    const self = _.d.clone.shallow(_self)
    const method = "headers.p";

    _.promise.make(self)
        .then(sd => _.d.add(sd, "headers", headers || sd.headers))
        .then(exports.headers)
        .then(sd => done(null, sd))
        .catch(done)
})

const authorization = v => headers_p({ "Authorization": v })
const authorization_bearer = v => headers_p({ "Authorization": "Bearer " + v })

/**
 */
exports.headers = _.promise.denodeify(headers);
exports.headers.p = headers_p;
exports.headers.authorization = authorization;
exports.headers.authorization.bearer = authorization_bearer;
