const db = require("../db/connection")
const endpoints = require("../endpoints.json")

exports.selectAllEndpoints = () => {
    return endpoints
}

exports.selectAllTopics = () => {
    let queryStr = `SELECT * FROM topics`

    return db.query(queryStr)
}

exports.selectAllUser = () => {
    let queryStr = `SELECT * FROM users`

    return db.query(queryStr)
}

exports.selectAllArticles = (topicQuery) => {
    const queryValues = []
    let queryStr = `SELECT articles.article_id, articles.author, title, topic, articles.created_at, articles.votes, article_img_url, COUNT (comments.comment_id) AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id`

    if (topicQuery) {
        queryValues.push(topicQuery)
        queryStr += ` WHERE topic = $${queryValues.length}`
    }

    queryStr += ` GROUP BY articles.article_id`

    return db.query(queryStr, queryValues)
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

    queryStr += ` WHERE article_id = $1`

    const promise1 =  db.query(queryStr, [id])
    const promise2  =  this.selectArticleById(id)

    return Promise.all([promise1, promise2])
    .then(([{ rows }, article]) => {
        if (rows.length === 0) { 
            if (article.length === 0) {
                return Promise.reject({ status: 404, msg: 'article_id does not exist' });
            } else {
                return Promise.reject({ status: 200, msg: 'There are no comments on this article'})
            }
        } else {
            return rows
        }
    })
}

exports.updateNewComment = (newComment, id) => {
    const { author, body } = newComment

    return db.query(`
        INSERT INTO comments
            (author, body, article_id)
        VALUES
            ($1, $2, $3)
        RETURNING *
        `, [author, body, id])
    
    .then(({ rows }) => {
        return rows[0]
    })
}

exports.updateArticleVotes = ({ inc_votes }, id) => {
    return db.query(`UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`,[inc_votes, id])
    .then(({rows}) => {
        if (rows[0] === undefined) {
            return Promise.reject({ status: 404, msg: 'article_id does not exist'})
        } else {
            return rows[0]
        }
    })
}

exports.deleteCommentById = (id) => {
    return db.query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *`,[id])
    .then(({ rows }) => {
        if (rows[0] === undefined) {
            return Promise.reject({ status: 404, msg: 'article_id does not exist'})
        } else {
            return rows[0]
        }
    })
}