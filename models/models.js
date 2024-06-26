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

exports.selectUserByUsername = (username) => {
    const queryValues = []
    let queryStr = `SELECT * FROM users`

    if (username) {
        queryValues.push(username)
        queryStr += ` WHERE username = $${queryValues.length}`
    }

    return db.query(queryStr, queryValues)
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: 'Username does not exist'})
        } else {
            return rows[0]
        }
    })
}

exports.selectAllArticles = (query) => {
    const allowedKeys = ['topic', 'sort_by', 'order', 'limit', 'p']

    let validQuery = false

    Object.keys(query).forEach(key => {
        if(allowedKeys.includes(key)) {
            validQuery = true
        }
    })
    
    if(!validQuery && Object.keys(query).length > 0) {
        return Promise.reject({status: 400, msg: 'Invalid query'})
    }

    const { topic } = query
    const { sort_by = 'created_at' } = query
    const { order = 'DESC' } = query
    const { limit = 9 } = query
    const { p: page = 1 }  = query

    if(!['ASC', 'DESC'].includes(order.toUpperCase())) {
        return Promise.reject({status: 400, msg: 'Invalid order query'})
    }

    if(!['title', 'topic', 'author', 'body', 'created_at', 'article_img_url', 'votes', 'comment_count'].includes(sort_by)) {
        return Promise.reject({status: 400, msg: 'Invalid sort query'})
    }

    const queryValues = []
    let queryStr = `SELECT 
        articles.article_id, 
        articles.author, 
        title, 
        topic, 
        articles.created_at, 
        articles.votes, 
        article_img_url, 
        COUNT (comments.comment_id) AS comment_count,
        COUNT(*) OVER() AS total_count
    FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id`

    if (topic) {
        queryValues.push(topic)
        queryStr += ` WHERE topic = $${queryValues.length}`
    }

    queryStr += ` GROUP BY articles.article_id`
    
    if (sort_by === 'comment_count') {
        queryStr += ` ORDER BY ${sort_by} ${order.toUpperCase()} LIMIT ${limit}`
    } else {
        queryStr += ` ORDER BY articles.${sort_by} ${order.toUpperCase()} LIMIT ${limit}`
    }

    let offset = (page - 1) * 9
    if(offset < 0) {
        return Promise.reject({status: 400, msg: 'Invalid page number'})
    }

    queryStr += ` OFFSET ${offset}`

    return db.query(queryStr, queryValues)

    .then(({ rows }) => {
        if (rows.length === 0 && page > 1) {
            return Promise.reject({ status: 404, msg: 'There are no articles on this page' });
        } else if (rows.length === 0) {
            return Promise.reject({status: 404, msg: 'There are no articles within this query'})
        } else {
            const total_count = Number(rows[0].total_count)
            rows.forEach(row => {
                delete row.total_count
            });
            return { rows, total_count }
        }
    })
}

exports.selectArticleById = (id) => {
    let queryStr = `SELECT 
        articles.article_id, 
        articles.author, 
        title, 
        articles.body, 
        topic, 
        articles.created_at, 
        articles.votes, 
        article_img_url, 
        COUNT (comments.comment_id) AS comment_count 
    FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id`

    queryStr += ` WHERE articles.article_id = ${id}`

    queryStr += ` GROUP BY articles.article_id`

    return db.query(queryStr)
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: 'article_id does not exist'})
        } else {
            return rows[0]
        }
    })
}

exports.selectAllCommentsFromArticleId = (query, id) => {
    const allowedKeys = ['limit', 'p']

    let validQuery = false

    Object.keys(query).forEach(key => {
        if(allowedKeys.includes(key)) {
            validQuery = true
        }
    })
    
    if(!validQuery && Object.keys(query).length > 0) {
        return Promise.reject({status: 400, msg: 'Invalid query'})
    }

    let { limit = 10 } = query
    const { p: page = 1 }  = query

    let queryStr = `SELECT 
        comment_id,
        body,
        votes, 
        author,  
        article_id, 
        created_at, 
        COUNT(*) OVER() AS total_count
    FROM comments`

    queryStr += ` WHERE article_id = $1`

    queryStr += ` ORDER BY created_at DESC`
        
    queryStr += ` LIMIT ${limit}`

    let offset = (page - 1) * 10
    if(offset < 0) {
        return Promise.reject({status: 400, msg: 'Invalid page number'})
    }

    queryStr += ` OFFSET ${offset}`

    const promise1 =  db.query(queryStr, [id])
    const promise2  =  this.selectArticleById(id)


    return Promise.all([promise1, promise2])
    .then(([{ rows }, article]) => {
        if (rows.length === 0) { 
            if (article.length === 0) {
                return Promise.reject({ status: 404, msg: 'article_id does not exist' });
            } else if (page > 1) {
                return Promise.reject({ status: 404, msg: 'There are no comments on this page' });
            } else {
                return Promise.reject({ status: 200, msg: 'There are no comments on this article'})
            }
        } else {
            const total_count = Number(rows[0].total_count)
            return { rows, total_count }
        }
    })
}

exports.updateNewTopic = (newTopic) => {
    const { slug, description } = newTopic

    if (!slug || !description) {
        return Promise.reject({status: 400, msg: 'Invalid new entry'})
    }

    return db.query(`
        INSERT INTO topics
            (slug, description)
        VALUES
            ($1, $2)
        RETURNING *
        `, [slug, description])
    
    .then(({ rows }) => {
        return rows[0]
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

exports.updateNewArticle = (newArticle) => {
    const { author, title, body, topic, article_img_url = 'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700' } = newArticle

    return db.query(`
    INSERT INTO articles
        (author, title, body, topic, article_img_url)
    VALUES
        ($1, $2, $3, $4, $5)
    RETURNING *
    `, [author, title, body, topic, article_img_url])

    .then(({ rows }) => {
        return rows[0]
    })
}

exports.deleteArticlesById = (id) => {
    return db.query(`DELETE FROM articles WHERE article_id = $1 RETURNING *`,[id])
    .then(({ rows }) => {
        if (rows[0] === undefined) {
            return Promise.reject({ status: 404, msg: 'article_id does not exist'})
        } else {
            return rows[0]
        }
    })
}

exports.updateCommentVotes = ({ inc_votes }, id) => {
    return db.query(`UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *`,[inc_votes, id])
    .then(({ rows }) => {
        if (rows[0] === undefined) {
            return Promise.reject({ status: 404, msg: 'comment_id does not exist'})
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