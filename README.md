# Backend project - News API

Link to API - https://backend-project-news-api-f5wp.onrender.com

This is a backend API to provide access data to be used to build a frontend onto for a news website

In order to access on your local machine, you need to git clone this repo and run the following command:
* npm install - This will install all the necessary dependencies to run the code
* npm run setup-dbs - This will create the table that will be seeded with the appropiate data
* npm run seed - This will seed the development database 
* npm test - This will run all the test suite which will also seed the test database

In order to connect to the databases, you need to create two files - '.env.test' and '.env.development' where they contain PGDATABASE = to the test and development databases respectively.

Minimum versions of Node.JS = v21.6.2 and Postgres = v16.2