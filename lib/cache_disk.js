/*
 *  cache_disk.js
 *
 *  David Janes
 *  IOTDB.org
 *  2017-08-02
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
const fs = require("iotdb-fs");

const unirest = require("unirest");
const content_type = require("content-type")
const canonical_json = require("canonical-json");

const assert = require("assert");
const crypto = require("crypto");
const path = require("path");
const os = require("os");

const LOG = _.noop;

/**
 *  Figure out the cache hash ... and file location
 */
const _add_hash = _.promise.make((self, done) => {
    const method = "cache.disk/_add_hash";

    const hasher = crypto.createHash("md5");
    hasher.update(self.url)
    hasher.update("@@")
    hasher.update(canonical_json(self.query || {}))

    self.__cache_url_hash = hasher.digest("hex")
    self.__cache_url_path = path.join(os.homedir(), ".iotdb-fetch", self.__cache_url_hash.substring(0, 2), self.__cache_url_hash)

    LOG("HERE:HASH", self.url, self.__cache_url_hash, self.__cache_url_path)

    done(null, self);
})

/**
 *  Pull the current version from the cache
 */
const _cache_get = _.promise.make((self, done) => {
    const method = "cache.disk/_cache_get";

    _.promise.make(self)
        .then(sd => _.d.update(sd, {
            otherwise: null,
            path: self.__cache_url_path,
        }))
        .then(fs.read.json)
        .then(sd => {
            // LOG("HERE:XXX", self.__cache_url_path, sd.json)
            return sd;
        })
        .then(sd => done(null, sd))
        .catch(done)
})

/**
 */
const _cache_put = _.promise.make((self, done) => {
    const method = "cache.disk/_cache_put";

    assert.ok(self.__cache_url_path, `${method}: expected self.__cache_url_path by now`)

    _.promise.make(self)
        .then(sd => _.d.update(sd, {
            path: self.__cache_url_path,
        }))
        .then(fs.mkdir.parent)
        .then(fs.write.json)
        .then(sd => done(null, sd))
        .catch(done)
})

/**
 */
const _cache_merge = _.promise.make((self, done) => {
    const method = "cache.disk/_cache_merge";

    if (!self.json) {
        return done(null, self);
    }

    if (self.json.error) {
        const error = new Error();
        error = Object.assign(error, self.json.error)
        error.__cacher_self = self;
        error.__cacher_self.cached_date = self.json.when;

        LOG("-", "DISK_CACHER ERROR HIT", self.__cache_url_hash);

        return done(error)
    }

    LOG("HAS DOC.1", self.json.self.document ? true : false)
    Object.assign(self, self.json.self)
    LOG("HAS DOC.2", self.document ? true : false)
    self.cached_date = self.json.when;

    LOG("-", "DISK_CACHER HIT", self.__cache_url_hash, self.document)
    return done(null, self)
})

/**
 */
const _expire_cache_minimum = _.promise.make((self, done) => {
    const method = "cache.disk/_cache_minimum";

    LOG("HERE:XXX.1")
    if (self.json) {
        const now = new Date().getTime();
        const cache_minimum_ms = (self.cache_minimum || 3 * 60) * 1000;
        const when_minimum_ms = self.json.when + cache_minimum_ms;

        LOG("HERE:XXX.2", (now - when_minimum_ms) / 1000)
        if (now > when_minimum_ms) {
            LOG("HERE:XXX.3 - EXPIRE")
            self.json = null;
        }
    }

    return done(null, self)
})

/**
 */
const _expire_cache_maximum = _.promise.make((self, done) => {
    const method = "cache.disk/_cache_maximum";

    if (self.json) {
        const now = new Date().getTime();
        const cache_maximum_ms = (self.cache_maximum || 1 * 24 * 60 * 60) * 1000;
        const when_maximum_ms = self.json.when + cache_maximum_ms;

        if (now > when_maximum_ms) {
            self.json = null;
        }
    }

    return done(null, self)
})


/**
 */
const _cacher = _outer_self => {
    const cacher_self = Object.assign({})
    const outer_self = _.d.clone.shallow(_outer_self)

    cacher_self.go = _.promise.make((self, done) => {
        _.promise.make(self)
            .then(_add_hash)
            .then(_cache_get)
            .then(_expire_cache_minimum)
            .then(_cache_merge)
            .then(sd => {
                if (sd.cached_date) {
                    self.cached_date = sd.cached_date;

                    self.url = sd.url;
                    self.__cache_url_path = sd.__cache_url_path;
                    self.__cache_url_hash = sd.__cache_url_hash;

                    self.document = sd.document;
                    self.document_length = sd.document_length;
                    self.document_media_type = sd.document_media_type;
                    self.document_encoding = sd.document_encoding;

                } else {
                    self.cached_date = null;

                    self.url = sd.url;
                    self.__cache_url_path = sd.__cache_url_path;
                    self.__cache_url_hash = sd.__cache_url_hash;
                }

                LOG("DISK_CACHER", "GO", sd.__cache_url_hash, sd.cached_date)
                LOG("GO.A", self.url)
                LOG("GO.A", self.__cache_url_path)
                LOG("GO.A", self.__cache_url_hash)

                done(null, self)
            })
            .catch(done)
    })

    cacher_self.save = (_result_error, _self, done) => {
        const self = _self || _result_error.self;
        const method = "lib.__cache.memory/cacher.save";

        assert.ok(self.url, `${method}: expected self.url`)
        assert.ok(self.__cache_url_path, `${method}: expected self.__cache_url_path`)
        assert.ok(self.__cache_url_hash, `${method}: expected self.__cache_url_hash`)

        console.log("SAVE.A", self.url)
        console.log("SAVE.A", self.__cache_url_path)
        console.log("SAVE.A", self.__cache_url_hash)
        /*
         *  The magic: if there's an error but we have a 
         *  cached result, we can just use the cached result
         */
        if (_result_error) {
            _.promise.make(self)
                // .then(_add_hash)
                .then(_cache_get)
                .then(_expire_cache_maximum)
                .then(_cache_merge)
                .then(sd => {
                    LOG("DISK_CACHER", "SAVE(RECOVERY)", sd.__cache_url_hash, sd.cached_date)
                    done(null, sd)
                })
                .catch(done)

            return;
        }

        /*
         *  Save
         */
        const cd = {
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
        _.promise.make(self)
            .then(sd => _.d.add(sd, "json", cd))
            // .then(_add_hash)
            .then(_cache_put)
            .then(sd => {
                LOG("DISK_CACHER", "SAVE(OK)", sd.__cache_url_hash, sd.cached_date)
                done(null, sd)
            })
            .catch(done)
    }

    return cacher_self;
}

/**
 */
const cache_disk = _.promise.make((self, done) => {
    const method = "cache.disk";

    assert.ok(self.__request, `${method}: expected self.__request`);

    self.__cache = _cacher(self);
    self.__cache.go(self, done)
})

/**
 */
exports.cache_disk = cache_disk;
