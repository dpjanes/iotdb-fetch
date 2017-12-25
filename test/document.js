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

    describe("get", function() {
        it("works - raw URL (HTML)", function(done) {
            _.promise.make(self)
                .then(fetch.document(self.server_url + "/index.html"))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (GET)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "GET");
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - just URL (HTML)", function(done) {
            _.promise.make(self)
                .then(fetch.document({
                    url: self.server_url + "/index.html",
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (GET)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "GET");
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - just URL (TXT)", function(done) {
            _.promise.make(self)
                .then(fetch.document({
                    url: self.server_url + "/index.txt",
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("index.txt (GET)") > -1)
                    assert.deepEqual(sd.document_media_type, "text/plain")
                    assert.deepEqual(sd.document_name, "index.txt")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.txt")
                    assert.deepEqual(sd.last_request.method, "GET");
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - root URL with Accept", function(done) {
            _.promise.make(self)
                .then(fetch.document({
                    url: self.server_url,
                    accept: "text/html",
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (GET)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/")
                    assert.deepEqual(sd.last_request.method, "GET");
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - root URL with Accept as Headers", function(done) {
            _.promise.make(self)
                .then(fetch.document({
                    url: self.server_url,
                    headers: {
                        accept: "text/plain",
                    }
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("index.txt (GET)") > -1)
                    assert.deepEqual(sd.document_media_type, "text/plain")
                    assert.deepEqual(sd.document_name, "index.plain")   // BLECH - needs to be fixed
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/")
                    assert.deepEqual(sd.last_request.method, "GET");
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - URL with query string", function(done) {
            _.promise.make(self)
                .then(fetch.document({
                    url: self.server_url + "/index.html?a=b",
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (GET)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html?a=b")
                    assert.deepEqual(sd.last_request.method, "GET");
                    assert.deepEqual(sd.last_request.query, { a: 'b', })
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - URL with query object", function(done) {
            _.promise.make(self)
                .then(fetch.document({
                    url: self.server_url + "/index.html",
                    query: {
                        "c": "d",
                    }
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (GET)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html?c=d")
                    assert.deepEqual(sd.last_request.method, "GET");
                    assert.deepEqual(sd.last_request.query, { c: 'd' })
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - URL with query string + query object", function(done) {
            _.promise.make(self)
                .then(fetch.document({
                    url: self.server_url + "/index.html?a=b",
                    query: {
                        "c": "d",
                    }
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (GET)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html?a=b&c=d")
                    assert.deepEqual(sd.last_request.method, "GET");
                    assert.deepEqual(sd.last_request.query, { a: 'b', c: 'd' })
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - bearer token", function(done) {
            _.promise.make(self)
                .then(fetch.document({
                    url: self.server_url + "/index.html",
                    bearer_token: "abcde",
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (GET)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "GET");
                    assert.deepEqual(sd.last_request.headers.authorization, 'Bearer abcde')
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
    })
    describe("put", function() {
        it("works - just URL", function(done) {
            _.promise.make(self)
                .then(fetch.document.put({
                    url: self.server_url + "/index.html",
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (PUT)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "PUT");
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - form data", function(done) {
            _.promise.make(self)
                .then(fetch.document.put({
                    url: self.server_url + "/index.html",
                    form: {
                        "hello": "world",
                    },
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (PUT)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "PUT");
                    assert.deepEqual(sd.last_request.body, { hello: 'world' });
                    assert.deepEqual(sd.last_request.headers['content-type'], 'application/x-www-form-urlencoded')
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - JSON data", function(done) {
            _.promise.make(self)
                .then(fetch.document.put({
                    url: self.server_url + "/index.html",
                    json: {
                        "hello": "world",
                    },
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (PUT)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "PUT");
                    assert.deepEqual(sd.last_request.body, { hello: 'world' });
                    assert.deepEqual(sd.last_request.headers['content-type'], 'application/json')
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
    })
    describe("patch", function() {
        it("works - just URL", function(done) {
            _.promise.make(self)
                .then(fetch.document.patch({
                    url: self.server_url + "/index.html",
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (PATCH)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "PATCH");
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - form data", function(done) {
            _.promise.make(self)
                .then(fetch.document.patch({
                    url: self.server_url + "/index.html",
                    form: {
                        "hello": "world",
                    },
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (PATCH)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "PATCH");
                    assert.deepEqual(sd.last_request.body, { hello: 'world' });
                    assert.deepEqual(sd.last_request.headers['content-type'], 'application/x-www-form-urlencoded')
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - JSON data", function(done) {
            _.promise.make(self)
                .then(fetch.document.patch({
                    url: self.server_url + "/index.html",
                    json: {
                        "hello": "world",
                    },
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (PATCH)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "PATCH");
                    assert.deepEqual(sd.last_request.body, { hello: 'world' });
                    assert.deepEqual(sd.last_request.headers['content-type'], 'application/json')
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
    })
    describe("delete", function() {
        it("works - just URL", function(done) {
            _.promise.make(self)
                .then(fetch.document.delete({
                    url: self.server_url + "/index.html",
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (DELETE)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "DELETE");
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
    })
    describe("post", function() {
        it("works - just URL", function(done) {
            _.promise.make(self)
                .then(fetch.document.post({
                    url: self.server_url + "/index.html",
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (POST)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "POST");
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - form data", function(done) {
            _.promise.make(self)
                .then(fetch.document.post({
                    url: self.server_url + "/index.html",
                    form: {
                        "hello": "world",
                    },
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (POST)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "POST");
                    assert.deepEqual(sd.last_request.body, { hello: 'world' });
                    assert.deepEqual(sd.last_request.headers['content-type'], 'application/x-www-form-urlencoded')
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - JSON data", function(done) {
            _.promise.make(self)
                .then(fetch.document.post({
                    url: self.server_url + "/index.html",
                    json: {
                        "hello": "world",
                    },
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (POST)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "POST");
                    assert.deepEqual(sd.last_request.body, { hello: 'world' });
                    assert.deepEqual(sd.last_request.headers['content-type'], 'application/json')
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - file (boolean flag, string text file)", function(done) {
            _.promise.make(self)
                .then(fs.read.p(path.join(__dirname, "data", "document.txt"), "utf-8"))
                .then(fetch.document.post({
                    url: self.server_url + "/index.html",
                    attachment: true,
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (POST)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "POST");
                    assert.deepEqual(sd.last_request.body, { 'document.txt': 'Hello, World\n' });
                    assert.ok(sd.last_request.headers['content-type'].startsWith("multipart/form-data"))
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - file (boolean flag, buffer text file)", function(done) {
            _.promise.make(self)
                .then(fs.read.p(path.join(__dirname, "data", "document.txt")))
                .then(fetch.document.post({
                    url: self.server_url + "/index.html",
                    attachment: true,
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (POST)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "POST");
                    assert.deepEqual(sd.last_request.body, { 'document.txt': 'Hello, World\n' });
                    assert.ok(sd.last_request.headers['content-type'].startsWith("multipart/form-data"))
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
        it("works - file (boolean flag, buffer image)", function(done) {
            _.promise.make(self)
                .then(fs.read.p(path.join(__dirname, "data", "image.png")))
                .then(fetch.document.post({
                    url: self.server_url + "/index.html",
                    attachment: true,
                }))
                .then(_.promise.make(sd => {
                    assert.ok(sd.document.indexOf("<h1>index.html (POST)</h1>") > -1)
                    assert.deepEqual(sd.document_media_type, "text/html")
                    assert.deepEqual(sd.document_name, "index.html")
                }))
                .then(simulator.last_request)
                .then(_.promise.make(sd => {
                    assert.ok(sd.last_request);
                    assert.deepEqual(sd.last_request.url, "/index.html")
                    assert.deepEqual(sd.last_request.method, "POST");
                    assert.ok(sd.last_request.body["image.png"])
                    assert.ok(sd.last_request.headers['content-type'].startsWith("multipart/form-data"))
                }))
                .then(_.promise.done(done))
                .catch(done)
        })
    })
})
