const { createLogger } = require("@artcom/logger")
const cors = require("cors")
const express = require("express")
const compression = require("compression")

const Repo = require("./repo")
const routes = require("./routes")
const log = createLogger()

let server

const gracefulShutdown = () => {
  log.info("Received shutdown signal")
  if (server) {
    log.info("Closing server")
    server.close(() => {
      log.info("Server closed")
      process.exit(0)
    })
  } else {
    process.exit(0)
  }
}

process.on("SIGINT", gracefulShutdown)
process.on("SIGTERM", gracefulShutdown)

async function main() {
  const app = express()
  app.use(compression())

  const port = process.env.PORT || 3000
  const repoUri = process.env.REPO_URI

  if (!repoUri) {
    log.fatal("REPO_URI environment variable must be set")
    process.exit(1)
  }

  const repo = new Repo(repoUri, "./.repo")

  log.info("Try to clone repository...", { repoUri: process.env.REPO_URI })

  await repo.init(log)
  log.info("Repository cloned")

  app.use(express.text({ type: "application/json", limit: process.env.BODY_SIZE_LIMIT || "1mb" }))

  if (process.env.SET_CORS_HEADERS === "true") {
    app.use(cors({ exposedHeaders: ["Git-Commit-Hash"] }))
  }

  app.set("trust proxy", true)
  app.use("/", routes(repo, log))

  server = app.listen(port, () => {
    log.info("Up and running", { port })
  })
}

main().catch((error) => {
  log.error({ error }, "Failed to start server")
  process.exit(1)
})
