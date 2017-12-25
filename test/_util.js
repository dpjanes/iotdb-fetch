/*
 *  test/_util.js
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

const _ = require("iotdb-helpers");

const assert = require("assert")
const path = require("path")

const express = require("iotdb-express")
const simulator = require("iotdb-website-simulator")

const auto_fail = done => _.promise.make(self => done(new Error("didn't expect to get here")));
const ok_error = done => error => done(null);

/**
 */
const setup = _.promise.make((self, done) => {
    _.promise.make({})
        // setup temporary website
        .then(express.initialize)
        .then(express.listen.http.p())

        // setup simulator
        .then(simulator.initialize)
        .then(simulator.record)
        .then(simulator.website.p(path.join(__dirname, "data", "website")))
        .then(_.promise.make(sd => {
            sd.server_url = _.values(sd.servers)[0].url;
        }))

        .then(_.promise.done(done))
        .catch(done)
})

/**
 */
const teardown = _.promise.make((self, done) => {
    _.promise.make(self)
        .then(express.stop)
        .then(_.promise.done(done, self))
        .catch(done)
})

/**
 *  API
 */
exports.auto_fail = auto_fail;
exports.ok_error = ok_error;
exports.setup = setup;
exports.teardown = teardown;
