/*
 *  document.js
 *
 *  David Janes
 *  IOTDB.org
 *  2017-12-25
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

const _ = require("iotdb-helpers")
const fs = require("iotdb-fs")
const simulator = require("iotdb-website-simulator")
const fetch = require("..")

const assert = require("assert")
const path = require("path")

const _util = require("./_util")

describe("document", function() {
    let self = {};

    before(function(done) {
        _.promise.make(self)
            .then(_util.setup)
            .then(_.promise.make(sd => self = sd))
            .then(_.promise.done(done, self))
            .catch(done)

    })
    after(function(done) {
        _.promise.make(self)
            .then(_util.teardown)
            .then(_.promise.done(done, self))
            .catch(done)
    })

    describe("bad", function() {
        it("number", function(done) {
            _.promise.make(self)
                .then(fetch.json.get(10))
                .then(_util.auto_fail(done))
                .catch(_util.ok_error(done));
        })
    })
    describe("get", function() {
        it("works - raw URL", function(done) {
            _.promise.make(self)
                .then(fetch.json.get(self.server_url + "/index.json"))
                .then(_.promise.make(sd => {
                    assert.ok(_.is.AbsoluteURL(sd.url))
                    assert.deepEqual(sd.json, { method: 'GET', route: '/index.json' });
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.json")
                    assert.deepEqual(sd.last_request.method, "GET");
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - URL", function(done) {
            _.promise.make(self)
                .then(fetch.json.get({
                    url: self.server_url + "/index.json",
                }))
                .then(_.promise.make(sd => {
                    assert.ok(_.is.AbsoluteURL(sd.url))
                    assert.deepEqual(sd.json, { method: 'GET', route: '/index.json' });
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.json")
                    assert.deepEqual(sd.last_request.method, "GET");
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - bearer token", function(done) {
            _.promise.make(self)
                .then(fetch.json.get({
                    url: self.server_url + "/index.json",
                    bearer_token: "abcde",
                }))
                .then(_.promise.make(sd => {
                    assert.ok(_.is.AbsoluteURL(sd.url))
                    assert.deepEqual(sd.json, { method: 'GET', route: '/index.json' });
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.json")
                    assert.deepEqual(sd.last_request.method, "GET");
                    assert.deepEqual(sd.last_request.headers.authorization, 'Bearer abcde')
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
    })
})

