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
                        expect.objectContaining({
                            slug: expect.any(String),
                            description: expect.any(String)
                        })
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
                        expect.objectContaining({
                            article_id: expect.any(Number),
                            author: expect.any(String),
                            title: expect.any(String),
                            topic: expect.any(String),
                            created_at: expect.any(String),
                            votes: expect.any(Number),
                            article_img_url: expect.any(String),
                            comment_count: expect.any(String),
                        })
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

                    const desiredArticle =   {
                        title: "Living in the shadow of a great man",
                        topic: "mitch",
                        author: "butter_bridge",
                        body: "I find this existence challenging",
                        created_at: "2020-07-09T20:11:00.000Z",
                        votes: 100,
                        article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                    }

                    expect(article).toMatchObject(desiredArticle)
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

describe("/api/articles/:article_id/comments",()=>{
    test("GET 200 and the requested article by id", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
                .then(({body})=>{
                    const {comments} = body
                    comments.forEach(comment => {
                        expect.objectContaining({
                            comment_id: expect.any(Number),
                            votes: expect.any(Number),
                            created_at: expect.any(String),
                            author: expect.any(String),
                            body: expect.any(String),
                            article_id: expect.any(Number),
                        })
                    })
                })
    })
    test("GET 404 when given an valid article_id but it doesn't have any comments",()=>{
        return request(app)
            .get("/api/articles/7/comments")
            .expect(200)  // Not sure what status code to use as there is an article but no comments
                .then(({body})=>{
                    const {msg} = body
                    expect(msg).toBe("There are no comments on this article")
                })
    })
    test("GET 404 when given an valid but non-existent article_id",()=>{
        return request(app)
            .get("/api/articles/100/comments")
            .expect(404)
                .then(({body})=>{
                    const {msg} = body
                    expect(msg).toBe("article_id does not exist")
                })
    })
    test("GET 404 when given an valid but non-existent article_id",()=>{
        return request(app)
            .get("/api/articles/banana/comments")
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