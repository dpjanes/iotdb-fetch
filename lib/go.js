/*
 *  lib/go.js
 *
 *  David Janes
 *  IOTDB.org
 *  2019-01-07
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
const document = require("iotdb-document")

const http = require("http")
const http_request = http.request
const https = require("https")
const https_request = https.request

const URL = require("url").URL
const path = require("path")
const zlib = require("zlib")

const content_type = require("../contrib/content-type")

/**
 */
const go = _.promise((self, done) => {
    _.promise.validate(self, go)

    const _done = _error => {
        if (_error) {
            _error.self = self
        }

        done(_error, self)
        done = _.noop
    }
    
    const _doit = _url => {
        let url = new URL(_url)
        let processor = null

        switch (url.protocol) {
        case "http:":
            processor = http_request
            break

        case "https:":
            processor = https_request
            break

        default:
            return _done(new errors.NotImplemented(`unknown protocol: ${url.protocol}`))
        }

        const options = {
            method: self.__fetch.method,
            headers: Object.assign({}, self.__fetch.headers),
        }

        if (self.__fetch.query) {
            _.mapObject(self.__fetch.query, (value, key) => {
                url.searchParams.set(key, value)
            })
        }

        url.method = options.method
        url.headers = options.headers

        const request = processor(url.toString(), options, response => {
            self.headers = response.headers
            self.headers.status = response.statusCode

            self.document = Buffer.alloc(0)

            const ct = content_type.parse(response.headers['content-type'] || "application/octet-stream")
            self.document_media_type = ct.type
            self.document_encoding = ct.parameters.charset || null
            if (!self.document_encoding) {
                if (self.document_media_type === "application/json") {
                    self.document_encoding = "utf8"
                } else if (self.document_media_type.match(/^application\/[^+]+[+](json|xml)$/)) {
                    self.document_encoding = "utf8"
                } else if (self.document_media_type.match(/^text\//)) {
                    self.document_encoding = "utf8"
                }
            }

            self.document_name = path.basename(url.pathname)
            if ((self.document_name === ".") || (self.document_name === "")) {
                self.document_name = "index." + self.document_media_type.replace(/^.*\//, "")
            }

            response.on('data', chunk => {
                self.document = Buffer.concat([ self.document, chunk ])
            });
            response.on('end', () => {
                // console.log("fetch.headers", _url, response.headers)
                
                let location = response.headers.location
                if (!_.is.Empty(response.headers.location)) {
                    if (++self.__fetch.redirects > 4) {
                        return _done(new errors.Internal("too many redirects"))
                    } else {
                        process.nextTick(() => {
                            _doit(new URL(location, url).href)
                        })
                    }

                    return
                }

                if (response.headers.encoding === "gzip") {
                    self.document = zlib.gunzipSync(response)
                }

                if (self.document_encoding) {
                    self.document = document.to.string.i(self).document
                }

                self.document_length = _.coerce.to.Integer(response.headers['content-length'], self.document.length)
                if (self.document_length === 0) {
                    self.document = ""
                }
                self.url = url.href

                switch (Math.floor(self.headers.status / 100)) {
                case 4:
                case 5:
                    const error = new errors.Unavailable(`${url.hostname}: status ${self.headers.status}`)
                    error.statusCode = self.headers.status

                    return _done(error)
                    break;

                default:
                    return _done(null, self)
                }
            });

        })
        request.on("error", error => {
            return _done(error)
        })

        self.__fetch.bodys.forEach(body => {
            request.write(body) 
        })

        request.end()
    }

    _doit(self.__fetch.url)
})

go.method = "go"
go.description = `Actually do request`
go.requires = {
    __fetch: {
        method: _.is.String,
        url: _.is.AbsoluteURL,
        bodys: _.is.Array,
    },
}

/**
 */
const go_json = _.promise((self, done) => {
    _.promise.validate(self, go_json)

    _.promise(self)
        .make(sd => {
            self.__fetch.headers["content-type"] = "application/json"
        })
        .then(go)
        .make(sd => {
            sd.json = null;

            switch (Math.floor(sd.headers.status / 100)) {
            case 3:
                break

            case 2:
                // empty document is null - happens e.g. HEAD
                if (!_.is.Empty(sd.document)) {
                    sd.json = JSON.parse(sd.document)
                }
                break

            default:
                // forgive non-JSON here (acutally probably never get here)
                try {
                    sd.json = JSON.parse(sd.document)
                } catch (x) {
                }
                break
            }
        })
        .end(done, self, "json,headers,url")
})

go_json.method = "go"
go_json.description = `Do JSON request`
go_json.requires = {
    __fetch: {
        method: _.is.String,
        url: _.is.AbsoluteURL,
    },
}

/**
 */
exports.go = go
exports.go.json = go_json
