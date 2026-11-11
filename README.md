# Platform Node

## Release Workflow

Packages are published to [npmjs.org](https://www.npmjs.com/) under the
`@dts-stn` scope by the [Release](.github/workflows/release.yaml) workflow.

1.  **Create a Changeset:** In your pull request, run `pnpm changeset` and
    commit the generated file.
2.  **Merge to `main`:** The workflow opens (or updates) a "chore: version
    packages" pull request that bumps versions and changelogs.
3.  **Merge the version pull request:** The workflow builds and publishes the
    changed packages to npmjs.org and creates git tags.

Publishing uses npm [trusted publishing](https://docs.npmjs.com/trusted-publishers)
(OIDC); no npm token is stored in this repository. Each package must have a
trusted publisher configured on npmjs.com for repository `STN-DTS/platform-node`
and workflow filename `release.yaml`.
