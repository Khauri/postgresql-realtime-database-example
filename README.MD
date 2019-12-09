# Postgres Real Time Database Example

An example of using postgres as a real time database with:

- Express
- WebSockets/ws
- Postgres 9.6+

## The Gist

This repository contains a lot of code that bootstraps a decent use-case but the most relevant files are 
`/src/lib/pg-pubsub/server.js` and `/src/server/

- Create TRIGGERs and trigger functions using SQL queries to listen for changes in tables
- Create a client that listens for notifications using LISTEN
- Open websocket connection between client and server
- Subscribe to specific database changes from client
- Push relevant data from server to client when connected

## Running

If you don't have a clean database to test this on, I would reccommend using Docker

```
docker run --rm -it -p "5432:5432" postgres:9.6
```

Set this environment variable or add it to a .env file inside `/src/server`

```
PSQL_CONNECTION_STRING=postgres://postgres@localhost:5432/postgres
```

Now in the root folder simply:

`npm install` and `npm run dev`