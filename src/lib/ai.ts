// Simulate AI Interaction
// In V2, this will connect to the real LLM (Gemini/OpenAI) via Edge Function

export interface AgentResponse {
    markdown: string;
}

export const generateAgentResponse = async (agent: string, input: string): Promise<AgentResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // MOCK RESPONSES BASED ON AGENT
    if (agent === "ALCHEMIST") {
        return {
            markdown: `### 1. THE SCRATCH
Everyone thinks "${input}" is the problem. It's not.

### 2. THE SHIFT
What if this is actually the solution trying to get your attention?

### 3. THE GOLD
**You are not broken.** You are just listening to the wrong frequency.

### 4. THE INVITATION
Stop trying to fix it. Just listen.`
        };
    }

    if (agent === "MUSE") {
        return {
            markdown: `### TRUTH BOMB
(Spoken Word Intro)
"We run from the silence... because the silence is loud."

### VERSES
(Verse 1)
I tried to outrun the shadow / but it was attached to my feet
I tried to scream at the mirror / but the reflection was sweet

(Chorus)
It's just love / disguising itself as pain
It's just sun / hiding inside the rain`
        };
    }

    if (agent === "PRODUCER") {
        return {
            markdown: `### RUN OF SHOW: "${input}"

**0:00 - WARM UP**
*   **Question**: "What is one thing you are over-thinking today?"

**0:10 - DEEP DIVE**
*   **Hook**: "${input} is the lie."
*   **Pillar 1**: Why we believe it.
*   **Pillar 2**: The Paradox.
*   **Pillar 3**: The Freedom.

**0:45 - THE MEDICINE (Meditation)**
*   **Focus**: Dropping the mental loop.`
        };
    }

    return { markdown: "Agent Offline." };
};
