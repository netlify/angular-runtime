const { builder } = require("@netlify/functions")
const awsServerlessExpress = require("aws-serverless-express")
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware")

// TO-DO: this path wont work dynamically anymore
 /* eslint-disable node/no-missing-require */
const server = require("../../dist/netlify-serverless/serverless/main")

// makes event and context available to app
server.app.use(awsServerlessExpressMiddleware.eventContext())

const serverProxy = awsServerlessExpress.createServer(server.app)

const handler = (event, context) =>
  awsServerlessExpress.proxy(
    serverProxy,
    event,
    context,
    "PROMISE"
  ).promise

exports.handler = builder(handler)
