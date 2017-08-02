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
const content_type = require("content-type")

const assert = require("assert");

/**
 *  Note that when errors are returned, the "self"
 *  object with the best result when can get will
 *  still be available.
 */
const go = (_self, done) => {
    const self = _.d.clone.shallow(_self)
    const method = "go";

    assert.ok(self.request, `${method}: expected self.request`);

    if (self.cached_result) {
        console.log("-", "GO USE CACHED RESULT")
        return done(null, self);
    }

    const _done = (error, sd) => {
        if (self.cache) {
            self.cache.save(error, sd, done)
        } else {
            done(error, sd);
        }
    }

    self.request
        .end(result => {
            result.request = result.request || self.request;
            result.headers = result.headers || {};

            self.url = result.request.href || self.url;
            self.document = result.raw_body || null;
            self.document_length = _.coerce.to.Integer(result.headers['content-length'], 0)
            self.document_media_type = content_type.parse(result.headers['content-type'] || "application/octet-stream").type
            self.document_encoding = null;

            if (result.error) {
                let error = result.error;

                if (result.error.code === 'ENOTFOUND') {
                    error = new errors.HostNotFound()
                    error.self = self;

                    return _done(error)
                }

                error.statusCode = error.status;
                error.self = self;

                return _done(error)
            }

            return _done(null, self)
        })
}

/**
 */
exports.go = Q.denodeify(go);
