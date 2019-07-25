/*
 *  nlib/document.js
 *
 *  David Janes
 *  IOTDB.org
 *  2018-01-07
 *
 *  Copyright [2013-2019] David P. Janes
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

"use strict"

const _ = require("iotdb-helpers")
const errors = require("iotdb-errors")

const assert = require("assert")

/**
 */
const document = http_method => paramd => _.promise((self, done) => {
    const fetch = require("..")

    if (!paramd) {
        paramd = {
            url: null,
        }
    } else if (_.is.String(paramd)) {
        paramd = {
            url: paramd,
        }
    } else if (_.is.Dictionary(paramd)) {
        paramd = _.promise.clone(paramd)
    } else {
        assert.ok(false, `${document.method}: must be paramaterized with String or Dictionary`)
    }

    paramd.method = paramd.method || http_method;

    [ "bearer_token", "accept", "headers", "document", "form", "json", "url", ].forEach(key => {
        if (paramd[key] !== true) {
            return;
        }

        assert.ok(self[key], `${document.method}: expected self.${key} because of paramd.${key} == true`);
        paramd[key] = self[key];
    })

    _.promise(self)
        .then(fetch[http_method].p(paramd.url || self.url, paramd.query || {}))
        .conditional(paramd.bearer_token, fetch.headers.authorization.bearer(paramd.bearer_token))
        .conditional(paramd.accept, fetch.headers.accept(paramd.accept))
        .conditional(paramd.headers, fetch.headers.p(paramd.headers))
        .conditional(paramd.form, fetch.body.form.p(paramd.form))
        .conditional(paramd.json, fetch.body.json.p(paramd.json))
        .conditional(paramd.document, fetch.body.document.p(paramd.document, paramd.document_name || self.document_name))
        .then(fetch.go)
        .end(done, self, "url,headers,document,document_length,document_media_type,document_encoding,document_name")
})

document.method = "document"
document.description = `Fetch Document (parameterized)
    
    If !paramd, or paramd.url is null or true, self.url is used instead
    If paramd.{bearer_token,accept,headers,json} are true, self.* is used instead
`
document.requires = {
}
document.requires = {
    url: _.is.String,
    headers: _.is.Dictionary,

    document: [ _.is.Buffer, _.is.String ],
    document_encoding: _.is.String,
    document_name: _.is.String,
    document_media_type: _.is.String,
    document_length: _.is.Integer,
}


/**
 *  API - note that these are _all_ still parameterized
 */
exports.document = document("get")
exports.document.method = "document"

;[ "get", "put", "patch", "post", "delete", "head" ].forEach(method_name => {
    exports.document[method_name] = document(method_name)
    exports.document[method_name].method = "document." + method_name
})
