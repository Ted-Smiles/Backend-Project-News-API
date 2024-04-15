const db = require("../db/connection")
const endpoints = require("../endpoints.json")

exports.selectAllEndpoints = () => {
    return endpoints
}

exports.selectAllTopics = () => {
    let queryStr = `SELECT * FROM topics`

    return db.query(queryStr)
}

exports.selectAllArticles = () => {
    let queryStr = `SELECT articles.article_id, articles.author, title, topic, articles.created_at, articles.votes, article_img_url, COUNT (comments.comment_id) AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id GROUP BY articles.article_id;`

    return db.query(queryStr)
}

exports.selectArticleById = (id) => {
    let queryStr = `SELECT * FROM articles`

    queryStr += ` WHERE article_id = ${id}`

    return db.query(queryStr)
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: 'article_id does not exist'})
        } else {
            return rows[0]
        }
    })
}

exports.selectAllCommentsFromArticleId = (id) => {
    let queryStr = `SELECT * FROM comments`

    queryStr += ` WHERE article_id = ${id}`

    return db.query(queryStr)
    .then(({ rows }) => {
        if (rows.length === 0) {
            return this.selectArticleById(id)
            .then((article) => {
                if (article.length === 0) {
                    return Promise.reject({ status: 404, msg: 'article_id does not exist' });
                } else {
                    return Promise.reject({ status: 200, msg: 'There are no comments on this article'})
                }
            })
        } else {
            return rows
        }
    })
}