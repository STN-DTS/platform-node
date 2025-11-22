# Platform Node

## Release Workflow

To release updates to packages in this monorepo, follow this manual process:

1.  **Create a Changeset:** Run the interactive tool to generate a changeset
    file describing your changes.

    ```bash
    pnpm changeset
    ```

2.  **Commit Changeset:** Commit the changeset file generated in the previous
    step.

    ```bash
    git add .
    git commit -m "docs(<package-name>): add changeset for <package-name>"
    ```

3.  **Bump Versions:** Update package versions and changelogs based on the
    changeset.

    ```bash
    pnpm version
    ```

4.  **Commit Version Bumps:** Commit the updated `package.json` and
    `CHANGELOG.md` files.

    ```bash
    git add .
    git commit -m "chore(<package-name>): release <package-name>@<version>"
    ```

5.  **Publish:** Build and publish the packages to the registry.

    ```bash
    pnpm release
    ```

6.  **Tag Release:** Create a signed git tag for the release.

    ```bash
    git tag --sign <package-name>@<version> -m "<package-name>@<version>"
    git push origin --tags
    ```
