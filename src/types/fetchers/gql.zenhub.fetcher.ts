export type IZenhubIssue = { pullRequest?: boolean };

export type IPipeline = {
    name: string;
    issues: IZenhubIssue[];
};

export type IZenhubData = {
    pipelines: IPipeline[];
    closedIssues: IZenhubIssue[];
};

export type IWorkspaceRaw = {
    pipelinesConnection: {
        nodes: Array<{ id: string; name: string }>;
    };
};
