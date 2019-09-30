const JSON5 = require("json5")
const get = require("lodash.get")
const mapKeys = require("lodash.mapkeys")
const pickBy = require("lodash.pickby")
const set = require("lodash.set")

/*
  Only caches data and files of the last requested commit.
*/
module.exports = class Cache {
  constructor() {
    this.commitHash = null
    this.object = {}
    this.files = {}
  }

  async update(commit) {
    if (commit.sha() !== this.commitHash) {
      const fileEntries = await this.getFileEntries(commit)
      const { object, files } = await this.buildData(fileEntries)

      this.commitHash = commit.sha()
      this.object = object
      this.files = files
    }
  }

  async getFileEntries(commit) {
    const tree = await commit.getTree()
    return new Promise((resolve, reject) => {
      const files = []
      tree.walk(true)
        .on("entry", entry => {
          if (entry.isFile() && entry.name().endsWith(".json")) {
            files.push(entry)
          }
        })
        .on("end", () => resolve(files))
        .on("error", error => reject(error))
        .start()
    })
  }

  async buildData(fileEntries) {
    const object = {}
    const files = {}
    for (const entry of fileEntries) {
      const blob = await entry.getBlob()
      const fileData = JSON5.parse(blob.content())
      const path = entry.path().slice(0, -5)
      files[path] = fileData
      set(object, path.split("/"), fileData)
    }

    return { object, files }
  }

  getCommitHash() {
    return this.commitHash
  }

  getObject(path) {
    if (path.length > 0) {
      const result = get(this.object, path.split("/"))

      if (typeof result === "undefined") {
        throw new Error("Not found")
      }

      return result
    } else {
      return this.object
    }
  }

  getFiles(path) {
    if (path.length > 0) {
      const files = pickBy(this.files, (data, file) => file.startsWith(path) && file !== path)
      return mapKeys(files, (data, file) => file.substr(path.length + 1))
    } else {
      return this.files
    }
  }
}
