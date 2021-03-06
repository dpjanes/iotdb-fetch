/*
 *  nlib/json.js
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

const _ = require("iotdb-helpers")
const errors = require("iotdb-errors")

const assert = require("assert")

/**
 */
const json = http_method => {
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

            ;[ "bearer_token", "accept", "headers", "json", "url", ].forEach(key => {
                if ((paramd[key] !== true) && !_.is.Null(paramd[key])) {
                    return;
                }

                paramd[key] = self[key] || null
            })

            _.promise(self)
                .then(fetch[http_method].p(paramd.url || self.url, paramd.query || {}))
                .conditional(paramd.bearer_token, fetch.headers.authorization.bearer(paramd.bearer_token))
                .conditional(paramd.accept, fetch.headers.accept(paramd.accept))
                .conditional(paramd.headers, fetch.headers.p(paramd.headers))
                .conditional(paramd.json, fetch.body.json.p(paramd.json))
                .then(fetch.go.json)
                .end(done, self, outerf)
        })

        innerf.method = outerf.method
        innerf.description = outerf.description
        innerf.requires = outerf.requires
        innerf.accepts = outerf.accepts
        innerf.produces = outerf.produces

        return innerf
    }

    outerf.method = `json.${http_method}`
    outerf.description = `Fetch JSON (parameterized)
        
        If !paramd, or paramd.url is null or true, self.url is used instead
        If paramd.{bearer_token,accept,headers,json} are true or null, self.* is used instead
    `
    outerf.requires = {
    }
    outerf.produces = {
        url: _.is.String,
        json: _.is.JSON,
        headers: _.is.Dictionary,
    }
    
    return outerf
}


/**
 *  API - note root is not parameterized
 */
exports.json = json("get")(null)
exports.json.method = "json"
exports.json.description = `GET JSON by URL`
exports.json.required = {
    url: _.is.AbsoluteURL,
}

/*
 *  these are parameterized
 */
;[ "get", "put", "patch", "post", "delete", "head" ].forEach(method_name => {
    exports.json[method_name] = json(method_name)
})
