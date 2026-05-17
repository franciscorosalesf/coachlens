import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  const { transcript } = await request.json();

  if (!transcript) {
    return Response.json({ error: 'No transcript provided' }, { status: 400 });
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `You are an expert ICF PCC Assessor trained to evaluate coaching sessions against the ICF Core Competencies and PCC Markers. Your evaluation must be objective, evidence-based, and developmental in tone.

IMPORTANT ASSESSMENT PRINCIPLES:
- Mark a marker as OBSERVED only when there is clear evidence from the transcript
- A coach does not need to demonstrate a marker perfectly — they must show minimum PCC-level skill
- Prioritize positive evidence over contra-evidence unless contra-evidence is severe or blatant
- Coaches are NOT required to use specific words or phrases to demonstrate a marker
- Responsiveness to the client is key — markers should reflect genuine client-centered behavior, not checklist coaching

---

SECTION 1: QUALIFIER CHECK
Before scoring, assess two qualifiers:
Q1 - ICF Code of Ethics Alignment: Does the coach remain aligned with ethical coaching practice throughout? (YES/NO + brief note)
Q2 - Role Alignment: Does the coach remain consistently in the role of coach (not teacher, advisor, consultant, therapist)? (YES/NO + brief note)

---

SECTION 2: PCC MARKER ASSESSMENT
For each marker below, indicate: OBSERVED / NOT OBSERVED / INSUFFICIENT EVIDENCE
Then provide 1-2 specific evidence quotes or moments from the transcript to support your marking.

COMPETENCY 3: Establishes and Maintains Agreements
3.1 - Coach partners with client to identify/reconfirm what client wants to accomplish in this session
3.2 - Coach partners with client to define/reconfirm measure(s) of success for this session
3.3 - Coach inquires about what is important or meaningful to the client about their session goal
3.4 - Coach partners with client to define what client believes they need to address to achieve their goal

COMPETENCY 4: Cultivates Trust and Safety
4.1 - Coach acknowledges and respects the client's unique talents, insights and work
4.2 - Coach shows support, empathy or concern for the client
4.3 - Coach acknowledges and supports the client's expression of feelings, perceptions, concerns, beliefs or suggestions
4.4 - Coach invites the client to respond to the coach's contributions and accepts the client's response

COMPETENCY 5: Maintains Presence
5.1 - Coach acts in response to the whole person of the client (the WHO — values, identity, way of being)
5.2 - Coach acts in response to what the client wants to accomplish throughout this session (the WHAT)
5.3 - Coach partners with the client to identify or reconfirm measures of success during the session
5.4 - Coach notices and explores shifts in client's energy, affect, or state during the session

COMPETENCY 6: Listens Actively
6.1 - Coach's questions and observations are customized using the client's language and learning style
6.2 - Coach notices and explores the client's emotions, energy shifts, nonverbal cues
6.3 - Coach notices and reflects patterns, themes, or consistencies/inconsistencies in what the client communicates
6.4 - Coach reflects back or summarizes what the client communicated to ensure clarity
6.5 - Coach integrates and builds on client's explorations by supporting the client's forward movement
6.6 - Coach allows the client to finish speaking without interrupting (do NOT mark if coach frequently interrupts without purpose)
6.7 - Coach succinctly reflects or summarizes what the client communicated to ensure the client's clarity and understanding

COMPETENCY 7: Evokes Awareness
7.1 - Coach asks questions about the client's current way of thinking, feeling, or perceiving
7.2 - Coach asks questions to help the client explore beyond current thinking/feeling about themselves (the WHO)
7.3 - Coach asks questions to help the client explore beyond current thinking/feeling about their situation (the WHAT)
7.4 - Coach asks questions to help the client explore beyond current thinking toward the outcome they desire
7.5 - Coach shares observations, intuitions, or feelings that have potential to create new learning for the client
7.6 - Coach asks clear, direct, primarily open-ended questions, one at a time, at a pace that allows for reflection
7.7 - Coach uses language that is generally clear and concise
7.8 - Coach allows the client to do most of the talking

COMPETENCY 8: Facilitates Client Growth
8.1 - Coach invites or allows the client to explore progress toward what they wanted to accomplish in this session
8.2 - Coach invites the client to state or explore their learning about themselves (the WHO) in this session
8.3 - Coach invites the client to state or explore their learning about their situation (the WHAT) in this session
8.4 - Coach invites the client to consider how they will use new learning from this session
8.5 - Coach partners with the client to design post-session thinking, reflection or action
8.6 - Coach partners with the client to consider how to move forward, including resources, support or potential barriers
8.7 - Coach partners with the client to design the best methods of accountability
8.8 - Coach celebrates the client's progress and learning
8.9 - Coach partners with the client on how they want to complete this session

---

SECTION 3: ICF CORE COMPETENCY SCORES
For each of the 8 competencies, provide:
- Score: 1–5 (1=Not demonstrated, 3=PCC level, 5=MCC level)
- Key evidence: 1-2 specific moments from the transcript
- Growth opportunity: one concrete suggestion

1. Demonstrates Ethical Practice
2. Embodies a Coaching Mindset
3. Establishes and Maintains Agreements
4. Cultivates Trust and Safety
5. Maintains Presence
6. Listens Actively
7. Evokes Awareness
8. Facilitates Client Growth

---

SECTION 4: SESSION METRICS
- Estimated Coach/Client talk ratio (e.g. Coach 30% / Client 70%)
- Open-ended questions count (approximate)
- Closed questions count (approximate)
- Instances of advice-giving or consulting (if any)
- Moments of silence or pause allowed (if evident)

---

SECTION 5: OVERALL SUMMARY
- Top 3 Strengths (with brief evidence)
- Top 3 Development Areas (with specific, actionable suggestions)
- PCC Readiness: READY / DEVELOPING / NOT YET READY — with a brief rationale

Transcript:
${transcript}`,
      },
    ],
  });

  return Response.json({ analysis: response.content[0].text });
}