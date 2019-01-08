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
const url = require("url").URL
const path = require("path")

const content_type = require("content-type")

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
    }

    const request = processor.request(self.__fetch.url, options, response => {
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

            done(null, self)
            done = _.noop
        });

    })

    request.on("error", error => {
        done(error)
        done = _.noop
    })

    request.end()
})

go.method = "method"
go.description = `
    Do a HTTP/HTTPS method (parameterized)`
go.requires = {
    __fetch: {
        method: _.is.String,
        url: _.is.AbsoluteURL,
        // query: [ _.is.Dictionary, _.is.Null ],
    },
}

/**
 */
exports.go = go
