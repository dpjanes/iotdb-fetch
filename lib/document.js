/*
 *  document.js
 *
 *  David Janes
 *  IOTDB.org
 *  2017-12-25
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

const assert = require("assert");

/**
 *  Paramaterized superfunction - do everything at once
 */
const document = (http_method, is_json) => paramd => _.promise.make((self, done) => {
    const method = `${is_json ? "json" : "document" }.${http_method}`;

    const fetch = require("..")

    if (!paramd) {
        paramd = {}
    } else if (_.is.String(paramd)) {
        paramd = {
            url: paramd,
        }
    } else if (_.is.Dictionary(paramd)) {
        paramd = _.promise.clone(paramd)
    } else {
        assert.ok(false, `${method}: must be paramaterized with String or Dictionary`)
    }

    paramd.method = paramd.method || http_method;

    [ "bearer_token", "accept", "headers", "form", "json", "document", "document_name" ].forEach(key => {
        if (paramd[key] !== true) {
            return;
        }

        assert.ok(self[key], `${method}: expected self.${key} because of paramd.${key} == true`);
        paramd[key] = self[key];
    })

    _.promise.make(self)
        .then(fetch[http_method].p(paramd.url, paramd.query || {}))
        .then(_.promise.conditional(paramd.bearer_token, fetch.headers.authorization.bearer(paramd.bearer_token)))
        .then(_.promise.conditional(paramd.accept, fetch.headers.accept(paramd.accept)))
        .then(_.promise.conditional(paramd.headers, fetch.headers.p(paramd.headers)))
        .then(_.promise.conditional(paramd.form, fetch.body.form.p(paramd.form)))
        .then(_.promise.conditional(paramd.json, fetch.body.json.p(paramd.json)))
        .then(_.promise.conditional(paramd.document, fetch.attach.p(paramd.document, paramd.document_name || self.document_name)))
        .then(is_json ? fetch.go.json : fetch.go)
        .then(_.promise.done(done, self, 
            is_json ? "url,json,headers" : "url,headers,document,document_length,document_media_type,document_encoding,document_name"))
        .catch(done)
})


/**
 *  API - note that these are _all_ still parameterized
 */
exports.document = document("get")
exports.document.get = document("get")
exports.document.put = document("put")
exports.document.patch = document("patch")
exports.document.post = document("post")
exports.document.delete = document("delete")
exports.document.head = document("head")

exports.json = document("get", true)
exports.json.get = document("get", true)
exports.json.put = document("put", true)
exports.json.patch = document("patch", true)
exports.json.post = document("post", true)
exports.json.delete = document("delete", true)
exports.json.head = document("head", true)
