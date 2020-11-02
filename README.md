# iotdb-fetch
Pipe oriented URL fetcher with cache

## Notes

* if you want to be able to deal with unusual
  (by Node.JS standards) charsets, install
  `iconv` or `iconv-lite` and this will use it

## GET
    
### Parameterized Quick Functions

Get a text document. The result will be a string

    _.promise()
        .then(fetch.document.get("http://www.davidjanes.com/"))
        .make(sd => {
            assert.ok(_.is.String(sd.document))
            console.log(sd.document)
        })

Get a binary document. The result will be a Buffer. Note this
is the same call as the text one, it just figures out the
right thing to do.

    _.promise()
        .then(fetch.document.get("https://via.placeholder.com/600/24f355"))
        .make(sd => {
            assert.ok(_.is.Buffer(sd.document))
        })

Get a JSON document. The result will be a JSON (Object)

    _.promise()
        .then(fetch.json.get("http://jsonplaceholder.typicode.com/posts"))
        .make(sd => {
            assert.ok(_.is.JSON(sd.json))
        })

# Contrib

Some third party code is directly included, to avoid package dependencies

* https://github.com/jshttp/content-type
