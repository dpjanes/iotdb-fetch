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
const document = http_method => paramd => _.promise.make((self, done) => {
    const method = `document.${http_method}`;

    const fetch = require("..")

    if (_.is.String(paramd)) {
        paramd = {
            url: paramd,
        }
    } else if (_.is.Dictionary(paramd)) {
        paramd = _.promise.clone(paramd)
    } else {
        assert.ok(false, `${method}: must be paramaterized with String or Dictionary`)
    }

    paramd.method = paramd.method || http_method;

    _.promise.make(self)
        .then(fetch[http_method].p(paramd.url, paramd.query || {}))
        .then(_.promise.conditional(paramd.bearer_token, fetch.headers.authorization.bearer(paramd.bearer_token)))
        .then(_.promise.conditional(paramd.accept, fetch.headers.accept(paramd.accept)))
        .then(_.promise.conditional(paramd.headers, fetch.headers.p(paramd.headers)))
        .then(_.promise.conditional(paramd.form, fetch.body.form.p(paramd.form)))
        .then(_.promise.conditional(paramd.json, fetch.body.json.p(paramd.json)))
        .then(_.promise.conditional(paramd.attachment === true, fetch.attach))
        .then(fetch.go)
        .then(_.promise.done(done, self, "url,headers,document,document_length,document_media_type,document_encoding,document_name"))
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
