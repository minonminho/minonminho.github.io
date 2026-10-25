declare module "cloudflare:workers" {
  export abstract class WorkflowEntrypoint<Env = unknown, Params = unknown> {
    protected env: Env;
    constructor(ctx: unknown, env: Env);
    abstract run(event: { payload: Params; instanceId: string }, step: { do<T>(name: string, callback: () => Promise<T>): Promise<T> }): Promise<void>;
  }
}
