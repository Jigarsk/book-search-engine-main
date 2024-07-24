// Dependencies
const express = require('express');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const db = require('./config/connection');

// Set up the Express server
const app = express();
const PORT = process.env.PORT || 3001;

// Function to start the server
async function startServer() {
  // Set up the Apollo Server and pass in the schema
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  });

  // Start the Apollo Server
  await server.start();

  // Integrate the Apollo server with the Express application as middleware
  server.applyMiddleware({ app });

  // Express middleware for parsing
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Serve static assets if in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });

  // GraphQL and Express Server start
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
}

// Call the function to start the server
startServer();
