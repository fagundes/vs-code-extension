import path from "path";
import * as vscode from "vscode";
import { config } from "../support/config";

export const getModuleNameFromUri = (
    uri: vscode.Uri,
    workspaceFolder: vscode.WorkspaceFolder,
    moduleRoot: string,
): string | undefined => {
    const relativePath = path.relative(workspaceFolder.uri.fsPath, uri.fsPath);

    if (
        relativePath === "" ||
        relativePath.startsWith("..") ||
        path.isAbsolute(relativePath)
    ) {
        return;
    }

    const rootSegments = moduleRoot
        .split(/[\\/]+/)
        .filter((segment) => segment.length > 0);
    const pathSegments = relativePath
        .split(path.sep)
        .filter((segment) => segment.length > 0);

    if (
        rootSegments.length === 0 ||
        pathSegments.length <= rootSegments.length ||
        !rootSegments.every((segment, index) => pathSegments[index] === segment)
    ) {
        return;
    }

    return pathSegments[rootSegments.length];
};

export const getModuleNameForUri = (
    uri: vscode.Uri,
    workspaceFolder: vscode.WorkspaceFolder,
): string | undefined =>
    getModuleNameFromUri(
        uri,
        workspaceFolder,
        config<string>("modules.root", "") || "Modules",
    );
