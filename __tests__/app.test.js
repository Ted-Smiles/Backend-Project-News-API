const request = require("supertest")
const app = require("../app")
const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data")
const endpoints = require("../endpoints.json")

afterAll(()=>{
    db.end()
})
beforeEach(()=>{
    return seed(data)
})

describe("/api",()=>{
    test("GET 200 and all endpoint with description upon request", () => {
        return request(app)
            .get("/api")
            .expect(200)
                .then(({body})=>{
                    const { requestedEndpoints } = body
                    expect(requestedEndpoints).toEqual(endpoints)
                })
    })
})

describe("/api/topics",()=>{
    test("GET 200 and all topics upon request", () => {
        return request(app)
            .get("/api/topics")
            .expect(200)
                .then(({body})=>{
                    const {topics} = body
                    expect(topics.length).toBe(3)
                    topics.forEach((topics)=>{
                        expect(typeof topics.slug).toBe("string")
                        expect(typeof topics.description).toBe("string")
                    })
                })
    })
})

describe("Invalid endpoint", () => {
    test("GET 404 where the request is not found", () => {
        return request(app)
            .get("/not-a-real-path")
            .expect(404)
                .then(({body})=>{
                    const { msg } = body
                    expect(msg).toEqual('Path not found')
                })
    })
})