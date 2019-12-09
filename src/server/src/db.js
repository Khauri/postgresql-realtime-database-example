import PgPS from 'pg-pubsub/server';
import {Client} from 'pg';

export const pubsub = new PgPS();

const createTableSQL = `
  CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name varchar(40) NOT NULL CHECK (name <> ''),
    age integer NOT NULL,
    email text
  );
`

const createUserSQL = `  
  DELETE FROM users;
  INSERT INTO users (name, age, email)
  VALUES ('test', 23, 'test@gmail.com')
  ON CONFLICT DO NOTHING;
`

async function init() {
  const {PSQL_CONNECTION_STRING} = process.env;
  // connect to the database and set up a table
  const client = new Client({connectionString: PSQL_CONNECTION_STRING});
  await pubsub.init({connectionString: process.env.PSQL_CONNECTION_STRING});
  await client.connect();
  await client.query(createTableSQL);
  await pubsub.watchTables('users');
  await client.query(createUserSQL);
  await client.end();
}

init();
