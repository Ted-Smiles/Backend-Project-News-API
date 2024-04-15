const express = require("express")
const app = express()

const { getAllTopics } = require("./controllers/controllers")

app.use(express.json())

app.get('/api/topics', getAllTopics)


app.use((req, res, next) => {
    const err = {
        status: 404,
        msg: 'Path not found'
    }
    next(err)
})

app.use((err, req, res, next) => {
    console.log(err)
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        res.status(500).send({ msg: 'Internal Server Error' })
    }
})

module.exports = app