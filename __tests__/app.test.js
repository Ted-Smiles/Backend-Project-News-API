const request = require("supertest")
const app = require("../app")
const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data")
const endpoints = require("../endpoints.json")
require("jest-sorted")

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
                .then(({ body })=>{
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
                .then(({ body })=>{
                    const { topics } = body
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
                .then(({ body })=>{
                    const { articles } = body
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
    test("GET 200 and all articles upon request sorted by created_at when passed no sort_by query", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
                .then(({ body })=>{
                    const { articles } = body
                    expect(articles.length).toBe(13)
                    expect(articles).toBeSortedBy("created_at", {descending: true})
                })
    })
    test("GET 200 and all articles sorted by the sort_by query upon request", () => {
        return request(app)
            .get("/api/articles?sort_by=title")
            .expect(200)
                .then(({ body })=>{
                    const { articles } = body
                    expect(articles.length).toBe(13)
                    expect(articles).toBeSortedBy("title", {descending: true})
                })
    })
    test("GET 200 and all articles order by ascending created_at upon request", () => {
        return request(app)
            .get("/api/articles?order=asc")
            .expect(200)
                .then(({ body })=>{
                    const { articles } = body
                    expect(articles.length).toBe(13)
                    expect(articles).toBeSortedBy("created_at")
                })
    })
    test("GET 200 and should be able to take multiple queries at once", () => {
        return request(app)
            .get("/api/articles?sort_by=title&&order=asc&&topic=mitch")
            .expect(200)
                .then(({ body })=>{
                    const { articles } = body
                    expect(articles.length).toBe(12)
                    expect(articles).toBeSortedBy("title")
                    articles.forEach((article)=>{
                        expect(article.topic).toBe('mitch')
                    })
                })
    })
    test("GET 400 and no articles and an error message when passed a valid but non-existent sort_by category", () => {
        return request(app)
            .get("/api/articles?sort_by=toby")
            .expect(400)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("Invalid sort query")
                })
    })
    test("GET 400 and no articles and an error message when passed a valid but non-existent order category", () => {
        return request(app)
            .get("/api/articles?order=toby")
            .expect(400)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("Invalid order query")
                })
    })
    test("GET 200 and all articles of a topic (mitch) upon request", () => {
        return request(app)
            .get("/api/articles?topic=mitch")
            .expect(200)
                .then(({ body })=>{
                    const { articles } = body
                    expect(articles.length).toBe(12)
                    articles.forEach((article)=>{
                        expect(article.topic).toBe('mitch')
                    })
                })
    })
    test("GET 404 and no articles when passed a valid but non-existent topic", () => {
        return request(app)
            .get("/api/articles?topic=toby")
            .expect(404)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("There are no articles within this query")
                })
    })
    test("GET 400 and error message when passed an invalid query", () => {
        return request(app)
            .get("/api/articles?test=testing")
            .expect(400)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("Invalid query")
                })
    })
})

describe("/api/articles/:article_id",()=>{
    test("GET 200 and the requested article by id", () => {
        return request(app)
            .get("/api/articles/1")
            .expect(200)
                .then(({ body })=>{
                    const { article } = body

                    const desiredArticle =   {
                        title: "Living in the shadow of a great man",
                        topic: "mitch",
                        author: "butter_bridge",
                        body: "I find this existence challenging",
                        created_at: "2020-07-09T20:11:00.000Z",
                        votes: 100,
                        article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                        comment_count: "11"
                    }

                    expect(article).toMatchObject(desiredArticle)
                })
    })
    test("GET 404 when given a valid but non-existent article_id",()=>{
        return request(app)
            .get("/api/articles/100")
            .expect(404)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("article_id does not exist")
                })
    })
    test("GET 404 when given an invalid article_id",()=>{
        return request(app)
            .get("/api/articles/banana")
            .expect(404)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("Invalid article_id")
                })
    })


    // PATCH
    test("PATCH 200 should increase votes of the specific article and return the article", () => {

        const newVote = {
            inc_votes: 100
        }

        return request(app)
        .patch("/api/articles/1")
        .send(newVote)
        .expect(200)
            .then(({ body }) => {
                const { article } = body

                const desiredArticle =   {
                    title: "Living in the shadow of a great man",
                    topic: "mitch",
                    author: "butter_bridge",
                    body: "I find this existence challenging",
                    created_at: "2020-07-09T20:11:00.000Z",
                    votes: 200, // Increment the votes by 100
                    article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                }

                expect(article).toMatchObject(desiredArticle)
            })
    })

    test("PATCH 200 should decrease votes of the specific article and return the article", () => {

        const newVote = {
            inc_votes: -100
        }

        return request(app)
        .patch("/api/articles/1")
        .send(newVote)
        .expect(200)
            .then(({ body }) => {
                const { article } = body

                const desiredArticle =   {
                    title: "Living in the shadow of a great man",
                    topic: "mitch",
                    author: "butter_bridge",
                    body: "I find this existence challenging",
                    created_at: "2020-07-09T20:11:00.000Z",
                    votes: 0, // Increment the votes by 100
                    article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                }

                expect(article).toMatchObject(desiredArticle)
            })
    })

    test("PATCH 400 should return an error when the inc_votes isn't an number", () => {

        const newVote = {
            inc_votes: "Hi"
        }

        return request(app)
        .patch("/api/articles/1")
        .send(newVote)
        .expect(400)
        .then(({ body })=>{
            const { msg } = body
            expect(msg).toBe("Invalid path params")
        })
    })

    test("PATCH 400 should return an error when the inc_vote isn't correctly formatted", () => {

        const newVote = {
            John: 100
        }

        return request(app)
        .patch("/api/articles/1")
        .send(newVote)
        .expect(400)
        .then(({ body })=>{
            const { msg } = body
            expect(msg).toBe("Invalid new entry")
        })
    })


    test("PATCH 404 when given an valid but non-existent article_id",()=>{
    
        const newVote = {
            inc_votes: 100
        }

        return request(app)
            .patch("/api/articles/100")
            .send(newVote)
            .expect(404)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("article_id does not exist")
                })
    })
    test("PATCH 400 when given an invalid article_id",()=>{
    
        const newVote = {
            inc_votes: 100
        }

        return request(app)
            .patch("/api/articles/banana")
            .send(newVote)
            .expect(400)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("Invalid path params")
                })
    })
})

describe("/api/articles/:article_id/comments",()=>{
    // GET
    test("GET 200 and the requested article by id", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
                .then(({ body })=>{
                    const { comments } = body
                    expect(comments.length).toBe(11)
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
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("There are no comments on this article")
                })
    })
    test("GET 404 when given an valid but non-existent article_id",()=>{
        return request(app)
            .get("/api/articles/100/comments")
            .expect(404)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("article_id does not exist")
                })
    })
    test("GET 400 when given an invalid article_id",()=>{
        return request(app)
            .get("/api/articles/banana/comments")
            .expect(400)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("Invalid path params")
                })
    })



    // Post
    test("POST 201 and the created comment", () => {

        const newComment = {
            author: "butter_bridge",
            body: "This is a test comment"
        }

        return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(201)
        .then(({ body })=>{
            const { comment } = body
            
            const finalComment = {
                author: "butter_bridge",
                body: "This is a test comment",
                article_id: 1
            }
            expect(comment).toMatchObject(finalComment)
        })
    })

    test("POST 201 and the created comment should work even if there are unnecessary properties in the new comment", () => {

        const newComment = {
            author: "butter_bridge",
            body: "This is a test comment",
            date: "Monday",
            weather: "Windy"
        }

        return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(201)
        .then(({ body })=>{
            const { comment } = body
            
            const finalComment = {
                author: "butter_bridge",
                body: "This is a test comment",
                article_id: 1
            }
            expect(comment).toMatchObject(finalComment)
        })
    })

    test("POST 404 when given an valid but non-existent article_id",()=>{

        const newComment = {
            author: "butter_bridge",
            body: "This is a test comment"
        }

        return request(app)
            .post("/api/articles/100/comments")
            .send(newComment)
            .expect(404)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("article_id does not exist")
                })
    })
    test("POST 400 when given an invalid article_id",()=>{

        const newComment = {
            author: "butter_bridge",
            body: "This is a test comment"
        }

        return request(app)
            .post("/api/articles/banana/comments")
            .send(newComment)
            .expect(400)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("Invalid path params")
                })
    })

    test("POST 400 when given an invalid new comment with a invalid value",()=>{

        const newComment = {
            author: "TedSmiles",
            body: "This is a test comment"
        }

        return request(app)
            .post("/api/articles/1/comments")
            .send(newComment)
            .expect(404)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("Not a valid user")
                })
    })

    test("POST 400 when given an invalid new comment with a invalid key",()=>{

        const newComment = {
            john: "butter_bridge",
            body: "This is a test comment"
        }

        return request(app)
            .post("/api/articles/1/comments")
            .send(newComment)
            .expect(400)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("Invalid new entry")
                })
    })

})


describe("/api/comments/:comment_id",()=>{ 
    // PATCH
    test("PATCH 200 should increase votes of the specific comment and return the comment", () => {

        const newVote = {
            inc_votes: 100
        }

        return request(app)
        .patch("/api/comments/3")
        .send(newVote)
        .expect(200)
            .then(({ body }) => {
                const { comment } = body

                const desiredAComment=   {
                    body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
                    votes: 200,
                    author: "icellusedkars",
                    article_id: 1,
                    created_at: "2020-03-01T01:13:00.000Z"
                }

                expect(comment).toMatchObject(desiredAComment)
            })
    })

    test("PATCH 200 should decrease votes of the specific article and return the article", () => {

        const newVote = {
            inc_votes: -100
        }

        return request(app)
        .patch("/api/comments/3")
        .send(newVote)
        .expect(200)
            .then(({ body }) => {
                const { comment } = body

                const desiredComment =   {
                    body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
                    votes: 0, // decrease votes by 100
                    author: "icellusedkars",
                    article_id: 1,
                    created_at: "2020-03-01T01:13:00.000Z"
                }

                expect(comment).toMatchObject(desiredComment)
            })
    })

    test("PATCH 400 should return an error when the inc_votes isn't an number", () => {

        const newVote = {
            inc_votes: "Hi"
        }

        return request(app)
        .patch("/api/comments/3")
        .send(newVote)
        .expect(400)
        .then(({ body })=>{
            const { msg } = body
            expect(msg).toBe("Invalid path params")
        })
    })

    test("PATCH 400 should return an error when the inc_vote isn't correctly formatted", () => {

        const newVote = {
            John: 100
        }

        return request(app)
        .patch("/api/comments/1")
        .send(newVote)
        .expect(400)
        .then(({ body })=>{
            const { msg } = body
            expect(msg).toBe("Invalid new entry")
        })
    })


    test("PATCH 404 when given an valid but non-existent comment_id",()=>{
    
        const newVote = {
            inc_votes: 100
        }

        return request(app)
            .patch("/api/comments/100")
            .send(newVote)
            .expect(404)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("comment_id does not exist")
                })
    })
    test("PATCH 400 when given an invalid comment_id",()=>{
    
        const newVote = {
            inc_votes: 100
        }

        return request(app)
            .patch("/api/comments/banana")
            .send(newVote)
            .expect(400)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("Invalid path params")
                })
    })
    
    // DELETE
    test("DELETE 204, delete the comment from the comment id", () => {
        return request(app)
        .delete("/api/comments/1")
        .expect(204)
    })
    test("DELETE 404 when given an valid but non-existent article_id", () => {
        return request(app)
        .delete("/api/comments/100")
        .expect(404)
        .then(({ body })=>{
            const { msg } = body
            expect(msg).toBe("article_id does not exist")
        })
    })
    test("DELETE 400 when given an invalid article_id", () => {
        return request(app)
        .delete("/api/comments/banana")
        .expect(400)
        .then(({ body })=>{
            const { msg } = body
            expect(msg).toBe("Invalid path params")
        })
    })
})

describe("/api/users",()=>{
    test("GET 200 and all users upon request", () => {
        return request(app)
            .get("/api/users")
            .expect(200)
                .then(({ body })=>{
                    const { users } = body
                    expect(users.length).toBe(4)
                    users.forEach((user)=>{
                        expect.objectContaining({
                            username: expect.any(String),
                            name: expect.any(String),
                            avatar_url: expect.any(String)
                        })
                    })
                })
    })

    test("GET 200 and the specific user upon request", () => {
        return request(app)
            .get("/api/users/butter_bridge")
            .expect(200)
                .then(({ body })=>{
                    const { user } = body

                    const desiredUser =   {
                        username: "butter_bridge",
                        avatar_url: "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
                        name: "jonny",
                    }

                    expect(user).toMatchObject(desiredUser)
                })
    })
    test("GET 404 when given a valid but non-existent username",()=>{
        return request(app)
            .get("/api/users/banana")
            .expect(404)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toBe("Username does not exist")
                })
    })
})


describe("Invalid endpoint", () => {
    test("GET 404 where the request is not found", () => {
        return request(app)
            .get("/not-a-real-path")
            .expect(404)
                .then(({ body })=>{
                    const { msg } = body
                    expect(msg).toEqual('Path not found')
                })
    })
})
