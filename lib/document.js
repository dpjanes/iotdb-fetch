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
 *  All the nesting is required to keep all the POP framing in place
 */
const document = http_method => {
    const outerf = _paramd => {
        const innerf = _.promise((self, done) => {
            const fetch = require("..")

            let paramd
            if (!_paramd) {
                paramd = {
                    url: null, 
                }
            } else if (_.is.String(_paramd)) {
                paramd = {
                    url: _paramd,
                }
            } else if (_.is.Dictionary(_paramd)) {
                paramd = _.d.clone(_paramd)
            } else {
                assert.ok(false, `${document.method}: must be paramaterized with String or Dictionary`)
            }

            paramd.method = paramd.method || http_method

            ;[ "bearer_token", "accept", "headers", "document", "form", "json", "url", "options", ].forEach(key => {
                if ((paramd[key] !== true) && !_.is.Null(paramd[key])) {
                    return;
                }

                paramd[key] = self[key] || null
            })


            _.promise(self)
                .then(fetch[http_method].p(paramd.url || self.url, paramd.query || {}, paramd.options || {}))
                .conditional(paramd.bearer_token, fetch.headers.authorization.bearer(paramd.bearer_token))
                .conditional(paramd.accept, fetch.headers.accept(paramd.accept))
                .conditional(paramd.headers, fetch.headers.p(paramd.headers))
                .conditional(paramd.form, fetch.body.form.p(paramd.form))
                .conditional(paramd.json, fetch.body.json.p(paramd.json))
                .conditional(paramd.document, fetch.body.document.p(paramd.document, paramd.document_name || self.document_name))
                .then(fetch.go)
                .end(done, self, outerf)
        })

        innerf.method = outerf.method
        innerf.description = outerf.description
        innerf.requires = outerf.requires
        innerf.accepts = outerf.accepts
        innerf.produces = outerf.produces

        return innerf
    }

    outerf.method = `document.${http_method}`
    outerf.description = `Fetch Document (parameterized)
        
        If !paramd, or paramd.url is null or true, self.url is used instead
        If paramd.{bearer_token,accept,headers,json} are true or null, self.* is used instead
    `
    outerf.requires = {
    }
    outerf.accepts = {
    }
    outerf.produces = {
        url: _.is.String,
        headers: _.is.Dictionary,

        document: [ _.is.Buffer, _.is.String ],
        document_encoding: _.is.String,
        document_name: _.is.String,
        document_media_type: _.is.String,
        document_length: _.is.Integer,
    }

    return outerf
}

/**
 *  API - note root is not parameterized
 */
exports.document = document("get")(null)
exports.document.method = "document"
exports.document.description = `GET document by URL`
exports.document.required = {
    url: _.is.AbsoluteURL,
}

/**
 *  these are parameterized
 */
;[ "get", "put", "patch", "post", "delete", "head" ].forEach(method_name => {
    exports.document[method_name] = document(method_name)
    exports.document[method_name].method = "document." + method_name
})
