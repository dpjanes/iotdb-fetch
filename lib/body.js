/*
 *  body.js
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
const body_json = _.promise.make(self => {
    const method = "body_json";

    assert.ok(_.is.JSON(self.json), `${method}: expected self.json to be JSON`);
    assert.ok(self.__request, `${method}: expected self.__request`);

    self.__request = self.__request.json(self.json)
})

/**
 *  Parameterized 
 */
const body_json_p = json => _.promise.make((self, done) => {
    const method = "body.json.p";

    _.promise.make(self)
        .then(_.promise.add("json", json || sd.json))
        .then(body_json)
        .then(_.promise.done(done))
        .catch(done)
})

/**
 */
exports.body = {};
exports.body.json = body_json;
exports.body.json.p = body_json_p;
