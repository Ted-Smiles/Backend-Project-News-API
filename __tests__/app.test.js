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

describe("/api/articles",()=>{
    test("GET 200 and all articles upon request", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
                .then(({body})=>{
                    const {articles} = body
                    expect(articles.length).toBe(13)
                    articles.forEach((article)=>{
                        expect(typeof article.article_id).toBe("number")
                        expect(typeof article.author).toBe("string")
                        expect(typeof article.title).toBe("string")
                        expect(typeof article.topic).toBe("string")
                        expect(typeof article.created_at).toBe("string")
                        expect(typeof article.votes).toBe("number")
                        expect(typeof article.article_img_url).toBe("string")
                        expect(typeof article.comment_count).toBe("string")
                    })
                })
    })
})

describe("/api/articles/:article_id",()=>{
    test("GET 200 and the requested article by id", () => {
        return request(app)
            .get("/api/articles/1")
            .expect(200)
                .then(({body})=>{
                    const {article} = body
                    expect(article.title).toBe("Living in the shadow of a great man")
                    expect(article.topic).toBe("mitch")
                    expect(article.author).toBe("butter_bridge")
                    expect(article.body).toBe("I find this existence challenging")
                    expect(article.created_at).toBe("2020-07-09T20:11:00.000Z")
                    expect(article.votes).toBe(100)
                    expect(article.article_img_url).toBe("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700")
                })
    })
    test("GET 404 when given an valid but non-existent article_id",()=>{
        return request(app)
            .get("/api/articles/100")
            .expect(404)
                .then(({body})=>{
                    const {msg} = body
                    expect(msg).toBe("article_id does not exist")
                })
    })
    test("GET 404 when given an valid but non-existent article_id",()=>{
        return request(app)
            .get("/api/articles/banana")
            .expect(404)
                .then(({body})=>{
                    const {msg} = body
                    expect(msg).toBe("Invalid article_id")
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