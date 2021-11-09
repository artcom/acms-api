const Repo = require("../src/repo")

const { copyAll, createGitFunctions, createTempDir } = require("./helpers")

describe("Delete Data", () => {
  let repo
  let originRepoDir


  beforeAll(async () => {
    originRepoDir = createTempDir() // bare origin repo
    const helperRepoDir = createTempDir() // used to push test data into the bare origin repo

    // create helper functions
    const { git, commit } = createGitFunctions(helperRepoDir)

    git("init", "--bare", originRepoDir)
    git("clone", originRepoDir, helperRepoDir)

    commit("rootFile.json", { foo: "bar", })
    commit("dir/nestedFile1.json", { foo: "bar" })
    git("push", "origin", "master")
  })

  beforeEach(async () => {
    const originRepoDirCopy = createTempDir()
    await copyAll(originRepoDir, originRepoDirCopy)

    repo = new Repo(originRepoDirCopy, createTempDir())
    await repo.init()
  })

  test("delete file", async () => {
    const newCommitHash = await repo.deleteFile("master", "master", "", "test", "rootFile")
    const commitHashResult = await repo.getData(newCommitHash, "", true)
    const masterResult = await repo.getData("master", "", true)

    expect(commitHashResult.data.rootFile).toBeUndefined()
    expect(commitHashResult.commitHash).toEqual(newCommitHash)
    expect(masterResult.data.rootFile).toBeUndefined()
    expect(masterResult.commitHash).toEqual(newCommitHash)
  })

  test("delete directory", async () => {
    const newCommitHash = await repo.deleteDirectory("master", "master", "", "test", "dir")
    const commitHashResult = await repo.getData(newCommitHash, "", true)
    const masterResult = await repo.getData("master", "", true)

    expect(commitHashResult.data.dir).toBeUndefined()
    expect(commitHashResult.commitHash).toEqual(newCommitHash)
    expect(masterResult.data.dir).toBeUndefined()
    expect(masterResult.commitHash).toEqual(newCommitHash)
  })
})
