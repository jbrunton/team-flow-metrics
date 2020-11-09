const { getConnection } = require('typeorm');
const { HierarchyLevel } = require('../../../models/entities/hierarchy_level');

module.exports = {
  prepareDatabase: async () => {
    const connection = getConnection();
    await connection.query("DELETE FROM issues");
    await connection.query("DELETE FROM fields");
    await connection.query("DELETE FROM hierarchy_levels");

    const levels = await connection.getRepository(HierarchyLevel).create([
      { name: "Story", issueType: "Story" },
      { name: "Epic", issueType: "Epic" }
    ])
    await connection.getRepository(HierarchyLevel).save(levels);
  },

  resetDatabase: async () => {
    const connection = getConnection();
    await connection.query("DELETE FROM issues");
  }
}
