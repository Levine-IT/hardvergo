# Module Federation Contributing Guide

Please also read the [README.md](./README.md) before contributing to this repository.

## Recommendations
- Use [VSCode](https://code.visualstudio.com/) as your editor.
- Install the [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) extension for VSCode.
- Disable ESlint and Prettier for the workspace on their extensions page.
- Look up the SemVer versioning scheme and follow it.

## Git(Hub) Workflow
1. Create your branch from `main` branch. For features use `feature/` prefix, for bugfixes use `bugfix/` prefix.
2. Use the node version that is specified in the [.nvmrc](./.nvmrc) file. With nvm installed, you can run `nvm use` to switch to the correct node version.
3. Install `pnpm` globally with `npm install -g pnpm`.
4. Install dependencies with `pnpm install`.
5. Run `pnpm test` to run the tests.
6. Make and commit your changes.
    - Making a commit will trigger a pre-commit hook that will run Biome formatting and linting. If there are any errors, you will need to fix them before you can commit.
7. Run `pnpm changeset` to create a changeset for your changes.
    - This will create a file in the `.changeset` directory that will be used to generate a changelog and bump the version when you merge your changes.
    - Make sure to select the correct type of change (major, minor, patch) and write a description of the change.
    - Use the space bar to select the change type and the arrow keys to navigate the options. Press enter to confirm your selection.
    - Commit the changeset file.
8. Push your branch to the remote repository.
9. Create a pull request to merge your branch into the `main` branch.
10. Wait for the CI checks to pass and for a reviewer to approve your changes.

## CI/CD Pipelines -> TODO
- When you create a pull request with a modified app, the CI pipeline will deploy your app to the dev environment. Your app will be accessible at TODO
- Upon merging your PR that contains a modified app AND a changeset file, a CI pipeline will create a new release PR. This PR will bump the version of the app and update the changelog.
    - After the release PR is merged, the CI pipeline will deploy the app to the prod environment. Your app will be accessible at TODO