/*
 *  cache_disk.js
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
const fs = require("iotdb-fs");

const unirest = require("unirest");
const Q = require("bluebird-q");
const content_type = require("content-type")
const canonical_json = require("canonical-json");

const assert = require("assert");
const crypto = require("crypto");
const path = require("path");
const os = require("os");

const LOG = _.noop;

/**
 */
const __xxx = (_self, done) => {
    const self = _.d.clone.shallow(_self);
}
const _xxx = Q.denodeify(__xxx);

/**
 *  Figure out the cache hash ... and file location
 */
const __add_hash = (_self, done) => {
    const self = _.d.clone.shallow(_self);

    const hasher = crypto.createHash("md5");
    hasher.update(self.url)
    hasher.update("@@")
    hasher.update(canonical_json(self.query || {}))

    self.url_hash = hasher.digest("hex")
    self.url_path = path.join(os.homedir(), ".iotdb-fetch", self.url_hash.substring(0, 2), self.url_hash)

    LOG("HERE:HASH", self.url, self.url_hash, self.url_path)

    done(null, self);
}
const _add_hash = Q.denodeify(__add_hash);

/**
 *  Pull the current version from the cache
 */
const __cache_get = (_self, done) => {
    const self = _.d.clone.shallow(_self);

    Q(self)
        .then(sd => _.d.update(sd, {
            otherwise: null,
            path: self.url_path,
        }))
        .then(fs.read.json)
        .then(sd => {
            // LOG("HERE:XXX", self.url_path, sd.json)
            return sd;
        })
        .then(sd => done(null, sd))
        .catch(done)
}
const _cache_get = Q.denodeify(__cache_get);

/**
 */
const __cache_put = (_self, done) => {
    const self = _.d.clone.shallow(_self);

    Q(self)
        .then(sd => _.d.update(sd, {
            path: self.url_path,
        }))
        .then(fs.mkdir.parent)
        .then(fs.write.json)
        .then(sd => done(null, sd))
        .catch(done)
}
const _cache_put = Q.denodeify(__cache_put);

/**
 */
const __cache_merge = (_self, done) => {
    const self = _.d.clone.shallow(_self);

    if (!self.json) {
        return done(null, self);
    }

    if (self.json.error) {
        const error = new Error();
        error = Object.assign(error, self.json.error)
        error.cacher_self = self;
        error.cacher_self.cached_date = self.json.when;

        LOG("-", "DISK_CACHER ERROR HIT", self.url_hash);

        return done(error)
    }

    Object.assign(self, self.json.self)
    self.cached_date = self.json.when;

    LOG("-", "DISK_CACHER HIT", self.url_hash);
    return done(null, self)
}
const _cache_merge = Q.denodeify(__cache_merge);

/**
 */
const __expire_cache_minimum = (_self, done) => {
    const self = _.d.clone.shallow(_self);

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
}
const _expire_cache_minimum = Q.denodeify(__expire_cache_minimum);

/**
 */
const __expire_cache_maximum = (_self, done) => {
    const self = _.d.clone.shallow(_self);

    if (self.json) {
        const now = new Date().getTime();
        const cache_maximum_ms = (self.cache_maximum || 1 * 24 * 60 * 60) * 1000;
        const when_maximum_ms = self.json.when + cache_maximum_ms;

        if (now > when_maximum_ms) {
            self.json = null;
        }
    }

    return done(null, self)
}
const _expire_cache_maximum = Q.denodeify(__expire_cache_maximum);


/**
 */
const _cacher = _outer_self => {
    const cacher_self = Object.assign({})
    const outer_self = _.d.clone.shallow(_outer_self)

    cacher_self.go = (_self, done) => {
        const self = _.d.clone.shallow(_self)

        self.cached_date = null;

        Q(self)
            .then(_add_hash)
            .then(_cache_get)
            .then(_expire_cache_minimum)
            .then(_cache_merge)
            .then(sd => {
                if (sd.cached_date) {
                    self.cached_date = sd.cached_date;
                } else {
                    self.url_path = sd.url_path;
                    self.url_hash = sd.url_hash;
                }
                LOG("DISK_CACHER", "GO", sd.url_hash, sd.cached_date)
                LOG("GO.A", self.url)
                LOG("GO.A", self.url_path)
                LOG("GO.A", self.url_hash)

                done(null, self)
            })
            .catch(done)
    }

    cacher_self.save = (_result_error, _self, done) => {
        const self = _self || _result_error.self;

        LOG("SAVE.A", self.url)
        LOG("SAVE.A", self.url_path)
        LOG("SAVE.A", self.url_hash)
        /*
         *  The magic: if there's an error but we have a 
         *  cached result, we can just use the cached result
         */
        if (_result_error) {
            Q(self)
                // .then(_add_hash)
                .then(_cache_get)
                .then(_expire_cache_maximum)
                .then(_cache_merge)
                .then(sd => {
                    LOG("DISK_CACHER", "SAVE(RECOVERY)", sd.url_hash, sd.cached_date)
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
        Q(self)
            .then(sd => _.d.add(sd, "json", cd))
            // .then(_add_hash)
            .then(_cache_put)
            .then(sd => {
                LOG("DISK_CACHER", "SAVE(OK)", sd.url_hash, sd.cached_date)
                done(null, sd)
            })
            .catch(done)
    }

    return cacher_self;
}

/**
 */
const cache_disk = (_self, done) => {
    const self = _.d.clone.shallow(_self)
    const method = "cache.memory";

    assert.ok(self.request, `${method}: expected self.request`);

    self.cache = _cacher(self);
    self.cache.go(self, done)
}

/**
 */
exports.cache_disk = Q.denodeify(cache_disk);
