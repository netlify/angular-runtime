const { builder } = require('@netlify/functions')
const awsServerlessExpress = require('aws-serverless-express')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// eslint-disable-next-line node/no-missing-require, node/no-unpublished-require
const server = require(`../../dist/netlify-serverless/serverless/main`)

// makes event and context available to app
server.app.use(awsServerlessExpressMiddleware.eventContext())

const serverProxy = awsServerlessExpress.createServer(server.app)

const handler = (event, context) => awsServerlessExpress.proxy(serverProxy, event, context, 'PROMISE').promise

exports.handler = builder(handler)
