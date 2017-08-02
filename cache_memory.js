/*
 *  cache_memory.js
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
const canonical_json = require("canonical-json");


const assert = require("assert");
const crypto = require("crypto");

const cdd = {};

const _cacher = _outer_self => {
    const self = Object.assign({})
    const outer_self = _.d.clone.shallow(_outer_self)

    self.go = (_request_self, done) => {
        const request_self = _.d.clone.shallow(_request_self)

        const hasher = crypto.createHash("md5");
        hasher.update(request_self.url)
        hasher.update("@@")
        hasher.update(canonical_json(request_self.query || {}))

        request_self.url_hash = hasher.digest("hex")

        const cd = cdd[request_self.url_hash];
        if (cd) {
            if (cd.error) {
                const error = new Error();
                error = Object.assign(error, cd.error)
                error.self = request_self;
                error.self.cached_result = true;

                console.log("-", "CACHE ERROR HIT", request_self.url_hash);
                return done(error)
            }

            Object.assign(request_self, cd.self)
            request_self.cached_result = true;

            console.log("-", "CACHE HIT", request_self.url_hash);
            return done(null, request_self)

        }

        self.cached_result = false;

        console.log("MEMORY_CACHER", "GO", request_self.url_hash)

        done(null, request_self)
    }

    self.save = (_result_error, _result_self, done) => {
        const rs = _result_self || _result_error.self;

        const cd = {
            self: {
                document: rs.document,
                url: rs.url,
                document_length: rs.document_length,
                document_media_type: rs.document_media_type,
                document_encoding: rs.document_encoding,
            },
        }

        if (_result_error) {
            cd.error = {
                message: _result_error.message,
                statusCode: _result_error.statusCode,
            }
        }

        cdd[_result_self.url_hash] = cd;

        console.log("MEMORY_CACHER", "SAVE", _result_self.url_hash);
        done(_result_error, _result_self)
    }

    return self;
}

/**
 */
const cache_memory = (_self, done) => {
    const self = _.d.clone.shallow(_self)
    const method = "cache.memory";

    assert.ok(self.request, `${method}: expected self.request`);

    self.cache = _cacher(self);
    self.cache.go(self, done)
}

/**
 */
exports.cache_memory = Q.denodeify(cache_memory);
