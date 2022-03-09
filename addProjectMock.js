const MongoClient = require('mongodb').MongoClient;

const data = require('./data/projectMock.json');

const url = `mongodb://damon:damon@localhost:27017/damon`;
const dbName = 'damon';
const projectMockCollection = 'projectMock';

async function main() {
  const client = await MongoClient.connect(url);
  const db = client.db(dbName);

  try {

    console.log('Preparing to insert mock data.');
    await db.collection(projectMockCollection).insertMany(data);
    console.log('Completed with mock data insertion.');

  } catch (error) {
    console.error('Error in adding project mock: ', error);

  } finally {

    client.close();
  }
}

main();
