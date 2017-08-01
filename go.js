/*
 *  go.js
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

const go = (_self, done) => {
    const self = _.d.clone.shallow(_self)
    const method = "go";

    assert.ok(self.request, `${method}: expected self.request`);

    self.request
        .end(result => {
            if (result.error) {
                console.log("#", "GET", result.status, result.error, typeof result.error)
                done(null, self)
                return
            }

            self.url = result.request.href || self.url;
            self.document = result.raw_body;
            self.document_media_type = result.headers['content-type'] || "application/octet-stream"
            self.document_length = _.coerce.to.Integer(result.headers['content-length'], "application/octet-stream")
            self.document_encoding = null;

            done(null, self)
        })
}

/**
 */
exports.go = Q.denodeify(go);
