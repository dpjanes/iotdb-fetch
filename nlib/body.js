/*
 *  lib/body.js
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

const querystring = require("querystring")
const path = require("path")

/* --- Document --- */

/**
 */
const body_document = _.promise(self => {
    _.promise.validate(self, body_document)

    const CRLF = "\r\n"
    const boundary = `--${_.random.id(32)}`
    const delimeter_open = `${CRLF}--${boundary}`
    const delimeter_close = `${delimeter_open}--`
    const body_headers = [
        `Content-Disposition: form-data; name="file"; filename="${path.basename(self.document_name)}"` + CRLF
    ]

    const body = Buffer.concat([
        Buffer.from(delimeter_open + CRLF + body_headers.join('') + CRLF),
        _.is.String(self.document) ? Buffer.from(self.document, "utf-8") : self.document,
        Buffer.from(delimeter_close)
    ]);

    self.__fetch.bodys = [ body ]
    self.__fetch.headers["content-length"] = Buffer.byteLength(self.__fetch.bodys[0])
    self.__fetch.headers["content-type"] = `multipart/form-data; boundary=${boundary}`

    /*
    console.log("HERE:XXX.1", self.__fetch)
    console.log("HERE:XXX.2", delimeter_open + CRLF + body_headers.join('') + CRLF)
    console.log("HERE:XXX.3", self.document)
    // process.exit()
    */
})

body_document.method = "body.document"
body_document.description = `
    Send document in the HTTP request`
body_document.requires = {
    __fetch: _.is.Dictionary,
    document: [ _.is.String, _.is.Buffer ],
    document_name: _.is.String,
}

/**
 */
const body_document_p = (document, document_name) => _.promise((self, done) => {
    _.promise(self)
        .add({
            document: document,
            document_name: document_name || "document.dat",
        })
        .then(body_document)
        .end(done, self, "__fetch")
})

/* --- JSON --- */

/**
 *  NOT FINISHED - likely needs doc conversion
 */
const body_raw = _.promise(self => {
    _.promise.validate(self, body_raw)

    self.__fetch.bodys = [ self.document ]
    self.__fetch.headers["content-length"] = Buffer.byteLength(self.__fetch.bodys[0])
    self.__fetch.headers["content-type"] = "application/octet-stream"
})

body_raw.method = "body.raw"
body_raw.description = `
    Send raw document in the HTTP request`
body_raw.requires = {
    __fetch: _.is.Dictionary,
    document: _.is.String,
}

/* --- JSON --- */

/**
 */
const body_json = _.promise(self => {
    _.promise.validate(self, body_json)

    self.__fetch.bodys = [ JSON.stringify(self.json) ]
    self.__fetch.headers["content-length"] = Buffer.byteLength(self.__fetch.bodys[0])
    self.__fetch.headers["content-type"] = "application/json"
})

body_json.method = "body.json"
body_json.description = `
    Send JSON in the HTTP request`
body_json.requires = {
    __fetch: _.is.Dictionary,
    json: _.is.JSON,
}

/**
 */
const body_json_p = json => _.promise((self, done) => {
    _.promise(self)
        .add("json", json)
        .then(body_json)
        .end(done, self, "__fetch")
})

/* --- XML --- */

/**
 */
const body_xml = _.promise(self => {
    _.promise.validate(self, body_xml)

    self.__fetch.bodys = [ self.xml ]
    self.__fetch.headers["content-length"] = Buffer.byteLength(self.__fetch.bodys[0])
    self.__fetch.headers["content-type"] = "text/xml"
})

body_xml.method = "body.xml"
body_xml.description = `
    Send XML in the HTTP request`
body_xml.requires = {
    __fetch: _.is.Dictionary,
    xml: [ _.is.String, _.is.Buffer ],
}

/**
 */
const body_xml_p = xml => _.promise((self, done) => {
    _.promise(self)
        .add("xml", xml)
        .then(body_xml)
        .end(done, self, "__fetch")
})

/* --- FORM --- */

/**
 */
const body_form = _.promise(self => {
    _.promise.validate(self, body_form)

    self.__fetch.bodys = [ querystring.stringify(self.json) ]
    self.__fetch.headers["content-length"] = Buffer.byteLength(self.__fetch.bodys[0])
    self.__fetch.headers["content-type"] = "application/x-www-form-urlencoded"
})

body_form.method = "body.form"
body_form.description = `
    Send XML in the HTTP request`
body_form.requires = {
    __fetch: _.is.Dictionary,
    json: _.is.JSON,
}

/**
 */
const body_form_p = form => _.promise((self, done) => {
    _.promise(self)
        .add("json", form)
        .then(body_form)
        .end(done, self, "__fetch")
})

/**
 */
exports.body = {}
exports.body.document = body_document
exports.body.document.p = body_document_p
exports.body.raw = body_raw
exports.body.json = body_json
exports.body.json.p = body_json_p
exports.body.xml = body_xml
exports.body.xml.p = body_xml_p
exports.body.form = body_form
exports.body.form.p = body_form_p
