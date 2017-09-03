/*
 *  cache_memory.js
 *
 *  David Janes
 *  IOTDB.org
 *  2017-08-02
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
const content_type = require("content-type")
const canonical_json = require("canonical-json");

const assert = require("assert");
const crypto = require("crypto");

const cdd = {};

const _cacher = _outer_self => {
    const cacher_self = Object.assign({})
    const outer_self = _.d.clone.shallow(_outer_self)

    cacher_self.go = (_self, done) => {
        const self = _.d.clone.shallow(_self)

        const hasher = crypto.createHash("md5");
        hasher.update(self.url)
        hasher.update("@@")
        hasher.update(canonical_json(self.query || {}))

        self.url_hash = hasher.digest("hex")

        const cd = cdd[self.url_hash];
        if (cd) {
            const now = new Date().getTime();
            const cache_minimum_ms = (self.cache_minimum || 3 * 60) * 1000;
            const when_minimum_ms = cd.when + cache_minimum_ms;
            const cache_maximum_ms = (self.cache_maximum || 1 * 24 * 60 * 60) * 1000;
            const when_maximum_ms = cd.when + cache_maximum_ms;

            if (now > when_minimum_ms) {
                console.log("-", "CACHE EXPIRED", self.url_hash);
                return done(null, self)
            }

            if (cd.error) {
                const error = new Error();
                error = Object.assign(error, cd.error)
                error.cacher_self = self;
                error.cacher_self.cached_date = cd.when;

                console.log("-", "CACHE ERROR HIT", self.url_hash);
                return done(error)
            }

            Object.assign(self, cd.cacher_self)
            self.cached_date = cd.when;

            console.log("-", "CACHE HIT", self.url_hash);
            return done(null, self)

        }

        cacher_self.cached_date = null;

        console.log("MEMORY_CACHER", "GO", self.url_hash)

        done(null, self)
    }

    cacher_self.save = (_result_error, _self, done) => {
        const self = _self || _result_error.self;

        /*
         *  The magic: if there's an error but we have a 
         *  cached result, we can just use the cached result
         */
        let cd = cdd[self.url_hash];
        if (_result_error && cd) {
            const now = new Date().getTime();
            const cache_minimum_ms = (self.cache_minimum || 3 * 60) * 1000;
            const when_minimum_ms = cd.when + cache_minimum_ms;
            const cache_maximum_ms = (self.cache_maximum || 1 * 24 * 60 * 60) * 1000;
            const when_maximum_ms = cd.when + cache_maximum_ms;

            if (now > when_maximum_ms) {
                console.log("-", "CACHED TOO LONG", self.url_hash);
                return done(null, self)
            }

            // don't recycle an error, just use what we got
            if (cd.error) {
                return done(_result_error);
            }

            Object.assign(self, cd.cacher_self)
            self.cached_date = cd.when;

            console.log("-", "CACHE HIT ON ERROR", self.url_hash);
            return done(null, self)
        }

        cd = {
            when: new Date().getTime(),
            self: {
                document: self.document,
                url: self.url,
                document_length: self.document_length,
                document_media_type: self.document_media_type,
                document_encoding: self.document_encoding,
            },
        }

        if (_result_error) {
            cd.error = {
                message: _result_error.message,
                statusCode: _result_error.statusCode,
            }
        }

        cdd[_self.url_hash] = cd;

        console.log("MEMORY_CACHER", "SAVE", _self.url_hash);
        done(_result_error, _self)
    }

    return cacher_self;
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
exports.cache_memory = _.promise.denodeify(cache_memory);
