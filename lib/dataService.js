const { MongoClient, ObjectId } = require('mongodb');


class DataService {

  async init() {
    this.uri = (process.env.NODE_ENV === 'production') ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_DEV;
    this.client = await MongoClient.connect(this.uri);
    this.db = this.client.db(process.env.MONGO_DB);

    this.users = this.db.collection("users");
    this.cells = this.db.collection("cells");
    this.layoutReports = this.db.collection("layoutReports");
    this.othersReports = this.db.collection("othersReports");
    this.schematicReports = this.db.collection("schematicReports");
    this.projectMock = this.db.collection("projectmock");

    console.debug('Database connected.');
  }

  /* ****USERS**** */
  async findUser(param) {
    return await this.users.findOne(param);
  }

  async updateOneUser(filter, param, value) {
      const updObj = {};
      updObj[param] = value;
      await this.users.updateOne(filter, [{'$set': updObj}, {'$set': {'updatedAt': '$$NOW'}}] );
  }

  async updateOneWithId(id, updObj) {
      await this.users.updateOne({_id: ObjectId(id)}, [{'$set': updObj}, {'$set': {'updatedAt': '$$NOW'}}] );
  }

  async addUser(userObj) {
    const insertOps = await this.users.insertOne(userObj);

    if (insertOps.acknowledged) {
      const user = await this.findUser ({_id: insertOps.insertedId});

      if (user) {
        return user;
      }
    }

    return null;
  }

  /* ****CELLS**** */
  async getActiveDashboard(param) {
      const items = await this.cells.find(param);
      return await items.toArray();
  }

  async clearDailyCellsCol(param) {
      await this.cells.deleteMany(param);
  }

  async updateDailyCellsCol(param) {
      await this.cells.insertMany(param);
  }

  /* ****LAYOUT REPORTS**** */
  async addLayoutReports(param) {
      await this.layoutReports.insertMany(param);  
  }

  /* ****OTHERS REPORTS**** */
  async addOthersReports(param) {
      await this.othersReports.insertMany(param);   
  }

  /* ****SCHEMATIC REPORTS**** */
  async addSchematicReports(param) {
      await this.schematicReports.insertMany(param); 
  }

  /* ****PROJECT**** */
  async getProjects() {
    const items = await this.projectMock.aggregate( [ { $group : { _id : "$project" } } ] );
    return await items.toArray();
  }

  async getProjectData(param) {
    const items = await this.projectMock.find(param);
    return await items.toArray();
  }

}


module.exports = DataService;
module.exports.instance = new DataService();
