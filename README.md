# Modules for Laravel

Modules for Laravel is a community-maintained fork of the Laravel VS Code
extension with first-class support for applications built with
[`nwidart/laravel-modules`](https://github.com/nWidart/laravel-modules).

This project is not affiliated with, endorsed by, or sponsored by Laravel LLC.
Laravel is a trademark of Laravel Holdings Inc. The original extension and
Laravel LSP are available from the
[`laravel/vs-code-extension`](https://github.com/laravel/vs-code-extension) and
[`laravel/lsp`](https://github.com/laravel/lsp) repositories.

## Features

The extension provides the completions, hover information, diagnostics, links,
code actions, Artisan commands, Pint integration, and test integration from the
upstream extension. Its LSP fork additionally discovers enabled Laravel modules
and their models, controllers, providers, configuration, views, Blade
components, routes, and translations.

Module-aware additions include:

- automatic discovery through `nwidart/laravel-modules`;
- modern and legacy module directory layouts;
- module-aware Eloquent model discovery;
- namespaced views, configuration, routes, and translations;
- namespace generation from the nearest module `composer.json`;
- `module:make-model` when creating a model inside a module;
- external `@mixin` paths;
- optional Eloquent database inspection.

The extension supports Laravel versions covered by the
[Laravel support policy](https://laravel.com/docs/releases#support-policy) and
requires PHP 8.2 or later.

## Installation

Install **Modules for Laravel** from the Visual Studio Marketplace, or build a
VSIX locally:

```bash
npm ci
npm run vsix
```

This extension is a replacement for `laravel.vscode-laravel`. Do not enable
both extensions in the same workspace: both start a Laravel language server and
contribute the same Laravel and Blade integrations.

## Configuration

No configuration is required for projects using the conventional `Modules`
directory or a registered `nwidart/laravel-modules` repository.

To set a fallback module root explicitly:

```json
{
    "Laravel.modules.enabled": true,
    "Laravel.modules.root": "Modules"
}
```

Additional application model directories can be configured with:

```json
{
    "Laravel.model.paths": ["app/Models", "app/Domain"]
}
```

By default, the LSP inspects discovered Eloquent models through `model:show`.
For large applications, or when database access should be avoided, disable it:

```json
{
    "Laravel.eloquent.databaseInspection": false
}
```

Classes referenced by `@mixin` outside Composer autoload paths can be loaded
from files or directories. Relative paths use the Laravel project root:

```json
{
    "Laravel.mixin.paths": [
        "_ide_helper_models.php",
        "app/Support/Mixins",
        "Modules/Shared/Support/Mixin.php"
    ]
}
```

Changes to module, model, mixin, or database-inspection settings require a VS
Code window reload.

The standard PHP environment settings remain available:

```json
{
    "Laravel.phpEnvironment": "sail",
    "Laravel.memoryLimit": "1G"
}
```

For the complete list, open the extension settings in VS Code.

## LSP updates

The extension downloads platform-specific binaries from the
[`fagundes/laravel-lsp`](https://github.com/fagundes/laravel-lsp) releases. It
checks for updates at most once every two hours. To force a check, run
`Laravel: Update LSP` from the command palette.

For development, set `LARAVEL_LSP_BINARY_PATH` before starting VS Code to use a
local LSP binary.

## Support and security

Report bugs and feature requests in this project's
[issue tracker](https://github.com/fagundes/vscode-modules-for-laravel/issues). Please do
not report fork-specific problems to the upstream Laravel repositories.

For security-sensitive reports, follow this repository's
[security policy](https://github.com/fagundes/vscode-modules-for-laravel/security/policy).

## Maintenance

See the [publishing guide](docs/PUBLISHING.md) for the release procedure for a
new LSP binary and for the VS Code extension.

## License

This project is distributed under the [MIT license](LICENSE.md) and preserves
the attribution of the upstream Laravel VS Code extension.
