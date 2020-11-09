module.exports = {
  jira: {
    // Host domain for your Jira instance
    host: "https://jira.example.com",

    credentials: {
      // Email for your Jira user. It's recommended to set this in the `.env` file for local
      // development in case you wish to commit this file to source control
      username: process.env.JIRA_USER,

      // Token for your Jira user. (Some older versions of Jira may allow a password.) It's
      // recommended to set this in the `.env` file for local development in case you wish to
      // commit this file to source control
      token: process.env.JIRA_TOKEN,
    },
    
    // The JQL query for the issues you're interested in
    query: "project=PROJ",
  },
};
