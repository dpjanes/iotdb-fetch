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

const _ = require("iotdb-helpers");
const errors = require("iotdb-errors");

const assert = require("assert");

/**
 */
const json = http_method => paramd => _.promise((self, done) => {
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
        assert.ok(false, `${json.method}: must be paramaterized with String or Dictionary`)
    }

    paramd.method = paramd.method || http_method;

    [ "bearer_token", "accept", "headers", "json", "url", ].forEach(key => {
        if (paramd[key] !== true) {
            return;
        }

        assert.ok(self[key], `${json.method}: expected self.${key} because of paramd.${key} == true`);
        paramd[key] = self[key];
    })

    _.promise(self)
        .then(fetch[http_method].p(paramd.url || self.url, paramd.query || {}))
        .conditional(paramd.bearer_token, fetch.headers.authorization.bearer(paramd.bearer_token))
        .conditional(paramd.accept, fetch.headers.accept(paramd.accept))
        .conditional(paramd.headers, fetch.headers.p(paramd.headers))
        .conditional(paramd.json, fetch.body.json.p(paramd.json))
        .then(fetch.go.json)
        .end(done, self, "url,json,headers")
})

json.method = "json"
json.description = `Fetch JSON (parameterized)
    
    If !paramd, or paramd.url is null or true, self.url is used instead
    If paramd.{bearer_token,accept,headers,json} are true, self.* is used instead
`
json.requires = {
}
json.accepts = {
    url: _.is.String,
    json: _.is.JSON,
    headers: _.is.Dictionary,
}


/**
 *  API - note that these are _all_ still parameterized
 */
exports.json = json("get")
exports.json.method = "json"

;[ "get", "put", "patch", "post", "delete", "head" ].forEach(method_name => {
    exports.json[method_name] = json(method_name)
    exports.json[method_name].method = "json." + method_name
})
