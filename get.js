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
const Q = require("bluebird-q");

const assert = require("assert");

const get = (_self, done) => {
    const self = _.d.clone.shallow(_self)
    const method = "get";

    assert.ok(self.url, `${method}: expected self.url`);

    self.request = unirest.get(self.url)

    if (self.query) {
        self.request = self.request.query(self.query)
    }

    done(null, self)
}

/**
 */
exports.get = Q.denodeify(get);