const { getConnection } = require('typeorm');
const { HierarchyLevel } = require('../../../models/entities/hierarchy_level');
const { Status } = require('../../../models/entities/status');

module.exports = {
  prepareDatabase: async () => {
    const connection = getConnection();
    await connection.query("DELETE FROM issues");
    await connection.query("DELETE FROM fields");
    await connection.query("DELETE FROM hierarchy_levels");
    await connection.query("DELETE FROM statuses");

    const levels = await connection.getRepository(HierarchyLevel).create([
      { name: "Story", issueType: "Story" },
      { name: "Epic", issueType: "Epic" }
    ]);
    await connection.getRepository(HierarchyLevel).save(levels);

    const statuses = await connection.getRepository(Status).create([
      { name: "Backlog", category: "To Do", externalId: "1" },
      { name: "In Progress", category: "In Progress", externalId: "2" },
      { name: "Done", category: "Done", externalId: "3" }
    ]);
    await connection.getRepository(Status).save(statuses);
  },

  resetDatabase: async () => {
    const connection = getConnection();
    await connection.query("DELETE FROM issues");
  }
}
