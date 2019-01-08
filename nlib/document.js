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

"use strict";

const _ = require("iotdb-helpers");
const errors = require("iotdb-errors");

const assert = require("assert");

/**
 *  Paramaterized superfunction - do everything at once
 */
const document = (http_method, is_document) => paramd => _.promise((self, done) => {
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
        assert.ok(false, `${document.method}: must be paramaterized with String or Dictionary`)
    }

    paramd.method = paramd.method || http_method;

    [ "bearer_token", "accept", "headers", "document", ].forEach(key => {
        if (paramd[key] !== true) {
            return;
        }

        assert.ok(self[key], `${document.method}: expected self.${key} because of paramd.${key} == true`);
        paramd[key] = self[key];
    })

    _.promise(self)
        .then(fetch[http_method].p(paramd.url, paramd.query || {}))
        .conditional(paramd.bearer_token, fetch.headers.authorization.bearer(paramd.bearer_token))
        .conditional(paramd.accept, fetch.headers.accept(paramd.accept))
        .conditional(paramd.headers, fetch.headers.p(paramd.headers))
        .conditional(paramd.document, fetch.body.document.p(paramd.document))
        .then(fetch.go)
        .end(done, self, "url,headers,document,document_length,document_media_type,document_encoding,document_name")
})

document.method = "document"
document.description = `Parameterized fetch`
document.requires = {
    __fetch: {
        method: _.is.String,
        url: _.is.AbsoluteURL,
        bodys: _.is.Array,
    },
}


/**
 *  API - note that these are _all_ still parameterized
 */
exports.document = document("get", true)

;[ "get", "put", "patch", "post", "delete", "head" ].forEach(method_name => {
    exports.document[method_name] = document(method_name, true)
})
