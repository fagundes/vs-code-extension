# Publishing guide

This project has two independent deliverables, in this order:

1. the `fagundes/laravel-lsp` fork binary;
2. the `fagundes.vscode-modules-for-laravel` extension on the Visual Studio Marketplace.

Publish the LSP first. The extension looks for binaries in releases from the fork and should only be published after all five assets for the new version are available.

## 1. Publishing a new Laravel LSP binary

The LSP repository's `.github/workflows/build-release-binaries.yml` workflow is triggered when a tag is pushed. For fork versions, use tags in the `v0.0.31-modules.N` format.

The inherited `release.sh` script only accepts plain SemVer versions and requires the `main` branch. Do not use it for `-modules.N` tags without adapting it first.

### Prepare and test

```bash
cd /path/to/laravel-lsp
git switch feat/laravel-modules-support
git pull --ff-only origin feat/laravel-modules-support
composer install
./vendor/bin/pint --test
./vendor/bin/pest
```

All tests should pass. In a development clone, also confirm that the fixtures used by the tests exist and were not omitted by local `.gitignore` rules.

### Build the PHAR with the correct version

Choose the next revision. Example:

```bash
LSP_RELEASE=v0.0.31-modules.4
php server app:build laravel-lsp --build-version="$LSP_RELEASE"
chmod +x builds/laravel-lsp
./builds/laravel-lsp --version
./builds/laravel-lsp list
```

The first verification command must print exactly the selected version, for example `Laravel LSP v0.0.31-modules.4`.

### Commit, tag, and trigger the release

```bash
git add builds/laravel-lsp
git commit -m "Build $LSP_RELEASE"
git push origin feat/laravel-modules-support
git tag -a "$LSP_RELEASE" -m "$LSP_RELEASE"
git push origin "$LSP_RELEASE"
```

Then monitor the workflow in GitHub Actions. It should create a GitHub Release containing the `laravel-lsp` PHAR and these five executables:

```text
server-v0.0.31-modules.4-arm64-darwin
server-v0.0.31-modules.4-arm64-linux
server-v0.0.31-modules.4-x64-darwin
server-v0.0.31-modules.4-x64-linux
server-v0.0.31-modules.4-x64-win32.exe
```

Optional CLI verification:

```bash
gh release view "$LSP_RELEASE" --repo fagundes/laravel-lsp
gh release download "$LSP_RELEASE" --repo fagundes/laravel-lsp --dir /tmp/laravel-lsp-release
```

Do not publish the extension while the release is missing, incomplete, or the PHAR reports a version different from the tag.

## 2. Prepare the Visual Studio Marketplace

This setup only needs to be done once:

1. Create or confirm the `fagundes` publisher in the Visual Studio Marketplace.
2. Confirm that the `publisher` value in `package.json` exactly matches that publisher ID.
3. In the publisher settings, configure Trusted Publishing/OIDC for the `fagundes/vscode-modules-for-laravel` repository and the `.github/workflows/publish.yml` workflow.
4. Rename the GitHub repository to `vscode-modules-for-laravel` and update the local remote:

```bash
git remote set-url origin git@github.com:fagundes/vscode-modules-for-laravel.git
git remote -v
```

The workflow uses OIDC and does not depend on a Marketplace PAT.

## 3. Publishing a new extension version

### Update the version and changelog

Starting from the branch that will be published:

```bash
git switch main
git pull --ff-only origin main
npm ci
npm version patch --no-git-tag-version
```

Use `minor` or `major` instead of `patch` for a significant feature or breaking change. Update `CHANGELOG.md` with the same version generated in `package.json`.

### Validate

```bash
npm audit --omit=dev --audit-level=high
composer --working-dir=src/test/fixtures/laravel-react run setup
npm test
npm run vsix
```

The environment requires Node.js 22, PHP 8.4, and the `fileinfo`, `sqlite3`, and `pdo_sqlite` extensions. Install the VSIX locally and perform a quick test in a real project using `nwidart/laravel-modules`:

```bash
code --install-extension ./vscode-modules-for-laravel-<version>.vsix
```

Do not enable `laravel.vscode-laravel` and `fagundes.vscode-modules-for-laravel` in the same workspace.

### Create the release

Commit and push the main branch. Then use a tag matching the version in `package.json`, with a `v` prefix:

```bash
EXTENSION_RELEASE=v0.1.1
git add package.json package-lock.json CHANGELOG.md
git commit -m "Release $EXTENSION_RELEASE"
git push origin main
git tag -a "$EXTENSION_RELEASE" -m "$EXTENSION_RELEASE"
git push origin "$EXTENSION_RELEASE"
gh release create "$EXTENSION_RELEASE" --repo fagundes/vscode-modules-for-laravel --verify-tag --generate-notes
```

When the GitHub Release is published, the workflow runs the tests, builds the VSIX, stores it as an artifact, and publishes it to the Marketplace through OIDC. For a Marketplace test release, mark the GitHub Release as a pre-release; the workflow will add `--pre-release` to the package command.

### Final checklist

1. The `verify` job completes successfully.
2. The `publish` job completes successfully.
3. The Marketplace page shows the new version, the correct icon, README, license, and fork links.
4. In a clean installation, confirm that the LSP binary downloads correctly for the tested platform: Linux x64, Linux ARM64, macOS x64, macOS ARM64, or Windows x64.
