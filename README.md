# iotdb-fetch
Pipe oriented URL fetcher with cache


## GET
    
### Parameterized Quick Functions

Get a text document. The result will be a string

    _.promise({})
        .then(fetch.document("http://www.davidjanes.com/"))
        .make(sd => {
            assert.ok(_.is.Buffer(sd.document))
            console.log(sd.document)
        })

Get a binary document. The result will be a Buffer. Note this
is the same call as the text one, it just figures out the
right thing to do.

    _.promise({})
        .then(fetch.document("https://via.placeholder.com/600/24f355"))
        .make(sd => {
            assert.ok(_.is.Buffer(sd.document))
        })

Get a JSON document. The result will be an Object

    _.promise({})
        .then(fetch.json("http://jsonplaceholder.typicode.com/posts"))
        .make(sd => {
            assert.ok(_.is.JSON(sd.json))
        })
