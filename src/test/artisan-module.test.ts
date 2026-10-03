import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import { getModuleNameFromUri } from "../artisan/module";

const workspaceFolder = (fsPath: string): vscode.WorkspaceFolder => ({
    uri: vscode.Uri.file(fsPath),
    name: path.basename(fsPath),
    index: 0,
});

suite("Artisan Module Test Suite", () => {
    const root = vscode.Uri.file(
        path.join(path.parse(process.cwd()).root, "repo"),
    ).fsPath;
    const workspace = workspaceFolder(root);

    test("detects the module from a standard nwidart model directory", () => {
        const uri = vscode.Uri.file(
            path.join(root, "Modules", "Autentica", "app", "Models"),
        );

        assert.strictEqual(
            getModuleNameFromUri(uri, workspace, "Modules"),
            "Autentica",
        );
    });

    test("supports a configured nested module root", () => {
        const uri = vscode.Uri.file(
            path.join(root, "packages", "modules", "Identity", "app", "Models"),
        );

        assert.strictEqual(
            getModuleNameFromUri(uri, workspace, "packages/modules"),
            "Identity",
        );
    });

    test("does not treat classic or external paths as module paths", () => {
        assert.strictEqual(
            getModuleNameFromUri(
                vscode.Uri.file(path.join(root, "app", "Models")),
                workspace,
                "Modules",
            ),
            undefined,
        );
        assert.strictEqual(
            getModuleNameFromUri(
                vscode.Uri.file(path.join(path.dirname(root), "external")),
                workspace,
                "Modules",
            ),
            undefined,
        );
    });
});
