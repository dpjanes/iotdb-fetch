/*
 *  delete.js
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
const _delete = (_self, done) => {
    const self = _.d.clone.shallow(_self)
    const method = "delete";

    assert.ok(self.url, `${method}: expected self.url`);

    self.__request = unirest.delete(self.url)

    if (self.query) {
        self.__request = self.__request.query(self.query)
    }

    done(null, self)
}

/**
 */
exports.delete = _.promise.denodeify(_delete);
