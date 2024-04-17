const userRouter = require('express').Router()

const { getAllUsers } = require("../controllers/controllers")

userRouter
    .route('/')
    .get(getAllUsers)

module.exports = userRouter