import { handleKnowledgeRequest, type KnowledgeEnv } from "./knowledge";
export { KnowledgePaperWorkflow } from "./knowledge";

const worker = {
  async fetch(request: Request, env: KnowledgeEnv): Promise<Response> {
    const response = await handleKnowledgeRequest(request, env);
    if (response) return response;

    return Response.json({ error: "Not found." }, { status: 404 });
  },
};

export default worker;
