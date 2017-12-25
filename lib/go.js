/*
 *  go.js
 *
 *  David Janes
 *  IOTDB.org
 *  2017-08-01
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
const content_type = require("content-type")

const assert = require("assert");

/**
 *  Note that when errors are returned, the "self"
 *  object with the best result when can get will
 *  still be available.
 */
const go = _.promise.make((self, done) => {
    const method = "go";

    assert.ok(self.__request, `${method}: expected self.__request`);

    if (self.cached_date) {
        delete self.__request;
        delete self.__cache;
        delete self.__cached_date;
        delete self.__cache_url_path;
        delete self.__cache_url_hash;

        // console.log("-", "GO USE CACHED RESULT")
        return done(null, self);
    }

    const _done = (error, sd) => {
        if (self.cache) {
            self.cache.save(error, sd, done)
        } else {
            done(error, sd);
        }
    }

    self.__request
        .end(result => {
            result.__request = result.__request || self.__request;
            result.headers = result.headers || {};

            self.url = result.__request.href || self.url;
            self.cached_date = null;
            self.headers = result.headers;

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

            delete self.__request;
            delete self.__cache;
            delete self.__cached_date;
            delete self.__cache_url_path;
            delete self.__cache_url_hash;

            return _done(null, self)
        })
})

/**
 */
const go_json = _.promise.make((self, done) => {
    const method = "go.json";

    _.promise.make(self)
        .then(_.promise.make(sd => {
            sd.__request = sd.__request.json()
            sd.json = null;
        }))
        .then(exports.go)
        .then(_.promise.make(sd => {
            sd.json = JSON.parse(sd.document)
        }))
        .then(_.promise.done(done, self, "json,headers,url"))
        .catch(done)
})

/**
 */
exports.go = go;
exports.go.json = go_json;
