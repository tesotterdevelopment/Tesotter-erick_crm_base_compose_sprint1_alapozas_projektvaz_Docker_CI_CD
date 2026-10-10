// Runs only on first initialization of an empty MongoDB data directory.
// The official mongo entrypoint runs .js scripts via mongosh.
const target = db.getSiblingDB('app');
const password = process.env.MONGO_APP_PASSWORD;
if (!password) throw new Error('Missing MONGO_APP_PASSWORD');
if (!target.getUser('app')) {
  target.createUser({user: 'app', pwd: password, roles: [{role: 'readWrite', db: 'app'}]});
}
