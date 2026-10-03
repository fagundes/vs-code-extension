import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import { createClientOptions, createServerOptions } from "../lsp/options";
import {
    resolveWorkspaceProjectFolder,
    resolveWorkspaceProjectPath,
} from "../support/project";

const workspaceFolder = (fsPath: string): vscode.WorkspaceFolder => ({
    uri: vscode.Uri.file(fsPath),
    name: path.basename(fsPath),
    index: 0,
});

suite("Laravel LSP Client Test Suite", () => {
    // Round-trip through vscode.Uri.file() so the expected path carries the
    // same lowercase Windows drive letter that fsPath produces for actuals.
    const root = vscode.Uri.file(
        path.join(path.parse(process.cwd()).root, "repo"),
    ).fsPath;

    test("resolves an empty base path to the workspace root", () => {
        assert.strictEqual(
            resolveWorkspaceProjectPath(workspaceFolder(root), ""),
            root,
        );
    });

    test("resolves a nested base path inside the workspace root", () => {
        assert.strictEqual(
            resolveWorkspaceProjectPath(workspaceFolder(root), "backend"),
            path.join(root, "backend"),
        );
    });

    test("normalizes trailing separators in the base path", () => {
        assert.strictEqual(
            resolveWorkspaceProjectPath(workspaceFolder(root), "backend/"),
            path.join(root, "backend"),
        );
    });

    test("uses the resolved project path as the LSP working directory and root", () => {
        const projectFolder = resolveWorkspaceProjectFolder(
            workspaceFolder(root),
            "backend",
        );
        const serverOptions = createServerOptions(
            "/bin/laravel-lsp",
            projectFolder,
        ) as { options?: { cwd?: string } };
        const clientOptions = createClientOptions(projectFolder);

        assert.strictEqual(
            serverOptions.options?.cwd,
            path.join(root, "backend"),
        );
        assert.strictEqual(
            clientOptions.workspaceFolder?.uri.fsPath,
            path.join(root, "backend"),
        );
    });

    test("forwards project discovery options to the LSP", () => {
        const clientOptions = createClientOptions();
        const initializationOptions = clientOptions.initializationOptions as {
            memoryLimit?: string;
            modelPaths?: string[];
            modulesEnabled?: boolean;
            modulesRoot?: string;
            mixinPaths?: string[];
            eloquentDatabaseInspection?: boolean;
        };

        assert.strictEqual(initializationOptions.memoryLimit, "512M");
        assert.deepStrictEqual(initializationOptions.modelPaths, [
            "app/Models",
        ]);
        assert.strictEqual(initializationOptions.modulesEnabled, true);
        assert.strictEqual(initializationOptions.modulesRoot, "");
        assert.deepStrictEqual(initializationOptions.mixinPaths, []);
        assert.strictEqual(
            initializationOptions.eloquentDatabaseInspection,
            true,
        );
    });

    test("forwards configured mixin paths to the LSP", async () => {
        const configuration = vscode.workspace.getConfiguration("Laravel");
        const originalValue =
            configuration.inspect<string[]>("mixin.paths")?.workspaceValue;

        await configuration.update(
            "mixin.paths",
            ["app/Support/Mixins", "Modules/Shared/Mixin.php"],
            vscode.ConfigurationTarget.Workspace,
        );

        try {
            const clientOptions = createClientOptions();
            const initializationOptions =
                clientOptions.initializationOptions as {
                    mixinPaths?: string[];
                };

            assert.deepStrictEqual(initializationOptions.mixinPaths, [
                "app/Support/Mixins",
                "Modules/Shared/Mixin.php",
            ]);
        } finally {
            await configuration.update(
                "mixin.paths",
                originalValue,
                vscode.ConfigurationTarget.Workspace,
            );
        }
    });

    test("forwards the Eloquent database inspection setting to the LSP", async () => {
        const configuration = vscode.workspace.getConfiguration("Laravel");
        const originalValue = configuration.inspect<boolean>(
            "eloquent.databaseInspection",
        )?.workspaceValue;

        await configuration.update(
            "eloquent.databaseInspection",
            false,
            vscode.ConfigurationTarget.Workspace,
        );

        try {
            const clientOptions = createClientOptions();
            const initializationOptions =
                clientOptions.initializationOptions as {
                    eloquentDatabaseInspection?: boolean;
                };

            assert.strictEqual(
                initializationOptions.eloquentDatabaseInspection,
                false,
            );
        } finally {
            await configuration.update(
                "eloquent.databaseInspection",
                originalValue,
                vscode.ConfigurationTarget.Workspace,
            );
        }
    });
});
