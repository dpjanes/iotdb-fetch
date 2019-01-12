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

const http = require("http")
const https = require("https")
const URL = require("url").URL
const path = require("path")

const content_type = require("../contrib/content-type")

/**
 */
const go = _.promise((self, done) => {
    _.promise.validate(self, go)

    let processor = null
    const url = new URL(self.__fetch.url)
    switch (url.protocol) {
    case "http:":
        processor = http
        break

    case "https:":
        processor = https
        break

    default:
        return done(new errors.NotImplemented(`unknown protocol: ${url.protocol}`))
    }

    const options = {
        method: self.__fetch.method,
        headers: self.__fetch.headers,
    }

    if (self.__fetch.query) {
        _.mapObject(self.__fetch.query, (value, key) => {
            url.searchParams.set(key, value)
        })
    }

    const request = processor.request(url, options, response => {
        self.headers = response.headers
        self.headers.status = response.statusCode

        self.document = Buffer.alloc(0)

        const ct = content_type.parse(response.headers['content-type'] || "application/octet-stream")
        self.document_media_type = ct.type
        self.document_encoding = null

        let charset = ct.parameters.charset || null
        if (!charset) {
            if (self.document_media_type === "application/json") {
                charset = "utf8"
            } else if (self.document_media_type.match(/^application\/[^+]+[+]json$/)) {
                charset = "utf8"
            } else if (self.document_media_type.match(/^text\//)) {
                charset = "utf8"
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
            // in some future version, look for iconv-lite
            if (charset) {
                switch (charset) {
                case "iso-8859-1":
                case "iso8859-1":
                case "latin-1":
                    charset = "latin1"
                    break
                }

                self.document = self.document.toString(charset)
            }

            self.document_length = _.coerce.to.Integer(response.headers['content-length'], self.document.length)
            self.url = url.href

            switch (Math.floor(self.headers.status / 100)) {
            case 4:
            case 5:
                const error = new errors.Unavailable(`${url.hostname}: status ${self.headers.status}`)
                error.statusCode = self.headers.status
                error.self = self

                done(error, self)
                done = _.noop
                break;

            default:
                done(null, self)
                done = _.noop
            }
        });

    })

    request.on("error", error => {
        if (error.code === 'ENOTFOUND') {
            error = new errors.HostNotFound()
            error.self = self;
        }

        done(error)
        done = _.noop
    })

    self.__fetch.bodys.forEach(body => {
        request.write(body) 
    })

    request.end()
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
                sd.json = JSON.parse(sd.document)
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
