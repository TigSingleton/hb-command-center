// Content Engine AI Integration
// Calls the `agent-run` Supabase Edge Function (Gemini 2.0 Flash)

import { supabase } from './supabase';

export interface AgentResponse {
    markdown: string;
}

export const generateAgentResponse = async (agent: string, input: string): Promise<AgentResponse> => {
    try {
        const { data, error } = await supabase.functions.invoke('agent-run', {
            body: { agentId: agent, input },
        });

        if (error) {
            console.error('Edge Function error:', error);
            return { markdown: `**Error:** ${error.message || 'Failed to reach the agent. Check Edge Function logs.'}` };
        }

        if (data?.error) {
            console.error('Agent error:', data.error);
            return { markdown: `**Agent Error:** ${data.error}` };
        }

        return { markdown: data.content || 'No response generated.' };
    } catch (err: any) {
        console.error('Network error:', err);
        return { markdown: `**Connection Error:** Could not reach the server. Is the Edge Function deployed?` };
    }
};
