# Platform Node

## Release Workflow

Packages are published to [npmjs.org](https://www.npmjs.com/) under the
`@dts-stn` scope by the [Release Please](.github/workflows/release.yaml) workflow.

1.  **Use Conventional Commits:** Write commit messages such as
    `feat(tab-id-hook): add a new option` or
    `fix(tab-id-hook): handle missing storage`. Include a `BREAKING CHANGE:`
    footer for breaking API changes.
2.  **Merge to `main`:** Release Please opens or updates a release pull request
    that bumps package versions and updates changelogs.
3.  **Merge the release pull request:** The workflow creates an
    `@dts-stn/tab-id-hook@X.Y.Z` git tag and GitHub release, then checks
    formatting, builds, verifies package exports, and publishes to npmjs.org.

Publishing uses npm [trusted publishing](https://docs.npmjs.com/trusted-publishers)
(OIDC); no npm token is stored in this repository. Each package must have a
trusted publisher configured on npmjs.com for repository `STN-DTS/platform-node`
and workflow filename `release.yaml`.
