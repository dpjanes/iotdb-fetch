/*
 *  attach.js
 *
 *  David Janes
 *  IOTDB.org
 *  2017-12-26
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

const unirest = require("unirest");

const assert = require("assert");

/**
 *  Send document.
 *  THIS LIKELY DOES NOT WORK.
 */
const attach = _.promise.make(self => {
    const method = "attach";

    assert.ok(_.is.String(self.document) || _.is.Buffer(self.document), 
        `${method}: expected self.document to be String or Buffer`);
    assert.ok(_.is.String(self.document_name), `${method}: expected self.document_name to be String`);
    assert.ok(_.is.String(self.document_name), `${method}: expected self.document_name to be String`);
    assert.ok(self.__request, `${method}: expected self.__request`);

    const document = _.is.String(self.document) ? Buffer.from(self.document, "utf-8") : self.document;

    self.__request = self.__request
        .attach(self.document_name, document)
})

/**
 *  Parameterized 
 */
const attach_p = (document, document_name) => _.promise.make((self, done) => {
    const method = "attach.p";

    _.promise.make(self)
        .then(_.promise.add(sd => ({
            document: document || sd.document,
            document_name: document_name || sd.document_name,
        })))
        .then(exports.attach)
        .then(_.promise.done(done, self, "__request,url")) 
        .catch(done)
})

/**
 */
exports.attach = attach;
exports.attach.p = attach_p;
