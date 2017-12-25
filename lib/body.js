/*
 *  body.js
 *
 *  David Janes
 *  IOTDB.org
 *  2017-10-23
 *
 *  Copyright [2013-2018] [David P. Janes]
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
 *  Send form data
 */
const body_form = _.promise.make(self => {
    const method = "body.form";

    assert.ok(_.is.JSON(self.json), `${method}: expected self.json to be JSON`);
    assert.ok(self.__request, `${method}: expected self.__request`);

    self.__request = self.__request
        .type('form')
        .send(self.json)
})

/**
 *  Parameterized 
 */
const body_form_p = json => _.promise.make((self, done) => {
    const method = "body.form.p";

    _.promise.make(self)
        .then(_.promise.add("json", json || sd.json))
        .then(body_form)
        .then(_.promise.done(done))
        .catch(done)
})

/**
 *  Send JSON 
 */
const body_json = _.promise.make(self => {
    const method = "body.json";

    assert.ok(_.is.JSON(self.json), `${method}: expected self.json to be JSON`);
    assert.ok(self.__request, `${method}: expected self.__request`);

    self.__request = self.__request
        .type('json')
        .send(JSON.stringify(self.json,null,2));

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
exports.body = {}
exports.body.form = body_form;
exports.body.form.p = body_form_p;
exports.body.json = body_json;
exports.body.json.p = body_json_p;
