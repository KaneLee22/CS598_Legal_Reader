import { analysisSchema } from './analysisSchema'

export function buildLegalSimplificationPrompt(inputText: string): string {
  return `Role:
You are generating structured reading support for a legal text simplification interface.
You are not giving legal advice. You are not determining legal enforceability.
Your job is to help a non-expert reader understand the text while preserving traceability to the original wording.

Task:
Given one legal clause, generate an AnalysisResult object for a traceable dual-pane reader.

The goal is to balance readability and fidelity:
- make the text easier to read across several levels,
- keep each simplified block traceable to the original text,
- and make any legally meaningful compression, omission, weakening, simplification, or generalization visible.

Input:
${inputText}

Core output requirements:
1. Split the original legal text into 3-6 originalBlocks.
2. Generate exactly four levels:
   - Level 0 Original
   - Level 1 Closer to Original
   - Level 2 Balanced
   - Level 3 More Guided
3. Every generated block must include sourceBlockIds.
4. Every sourceBlockId must refer to an existing originalBlock.
5. Output only valid JSON matching the provided schema.
6. Do not include markdown, commentary, explanation, or extra text outside the JSON.

Segmentation rules:
- Each originalBlock should be a meaningful legal unit.
- Do not split in the middle of a condition, exception, deadline, or consequence unless necessary.
- Preserve the exact wording of the original text inside originalBlocks.
- Use stable ids such as "o1", "o2", "o3".

Level guidance:
Level 0 Original:
- Do not simplify or paraphrase.
- Reproduce the originalBlocks exactly.
- The purpose of this level is to preserve the source text.

Level 1 Closer to Original:
- Reduce sentence density while staying close to the original legal wording.
- Keep legal terms when they are important.
- Preserve conditions, exceptions, deadlines, consequences, and obligations.
- Minimal simplification.

Level 2 Balanced:
- Use plain language for a general reader.
- Keep legally meaningful details.
- Clarify relationships between conditions and consequences.
- Avoid removing qualifiers such as "may", "must", "only if", "unless", "subject to", or "except".

Level 3 More Guided:
- Use the easiest language.
- You may explain implications more explicitly.
- You may break one idea into multiple short statements.
- Do not add legal advice.
- Do not invent rights, obligations, remedies, or consequences.
- If a detail is too complex to fully preserve, mark it in fidelityNotes.

Legal fidelity preservation checklist:
Always preserve or explicitly flag changes to:
- parties
- rights
- obligations
- prohibitions
- conditions
- exceptions
- deadlines
- refund rules
- cancellation consequences
- termination rules
- liability limits
- renewal terms
- dispute resolution terms
- privacy or data-sharing consequences
- procedural requirements

Traceability rules:
- Every block in levels 1-3 must include one or more sourceBlockIds.
- Level 0 blocks should also include sourceBlockIds pointing to their originalBlock.
- If a simplified block combines multiple original blocks, include all relevant sourceBlockIds.
- Do not create a simplified block that is not supported by the original text.
- If a legally meaningful source detail is omitted from a simplified level, add a fidelityNote.
- If a simplified block weakens or broadens the original meaning, add a fidelityNote.

Fidelity note types:
The schema only allows these FidelityNote.type values. Choose the closest matching value:
- "Condition Compressed"
- "Condition Omitted"
- "Exception Compressed"
- "Exception Omitted"
- "Notice Requirement Simplified"
- "Timing Detail Simplified"
- "Legal Term Generalized"
- "Liability Detail Compressed"
- "Meaning Preserved"

Fidelity note rules:
- Each fidelityNote must attach to the relevant simplified block using blockId.
- blockId must reference a valid simplified block id.
- The sourceBlockIds for the note are inferred from the referenced simplified block.
- Each fidelityNote.message must explain what changed in simple language.
- Each fidelityNote.whyItMatters must explain why the change matters for understanding the clause.
- Do not add notes for every wording change.
- Do not exaggerate risk.
- Do not provide legal advice.
- Focus on reading support and meaning preservation.

Legal term rules:
- Extract important legal or contract-related phrases that a non-expert reader may not understand.
- Terms must appear exactly in the original text.
- Provide short plain-language explanations.
- Explanations must be contextual to this clause, not generic dictionary entries.
- Do not define terms that are not present in the original text.
- Do not recommend actions.

ID conventions:
- originalBlocks: "o1", "o2", "o3", and so on.
- simplified blocks: "l{level}-b{number}", such as "l2-b3".
- fidelity notes: "n1", "n2", "n3", and so on.
- terms: "t1", "t2", "t3", and so on.
- SimplifiedBlock.fidelityNoteIds must reference existing FidelityNote.id values.
- SimplifiedBlock.termIds must reference existing TermItem.id values.
- FidelityNote.blockId must reference a valid simplified block id.
- TermItem.sourceBlockId must reference an existing OriginalBlock.id.

Internal validation before final output:
Before producing the final JSON, silently check:
1. Is the output valid JSON?
2. Are there exactly 3-6 originalBlocks?
3. Are there exactly four levels: 0, 1, 2, 3?
4. Does every simplified block have valid sourceBlockIds?
5. Are legally meaningful omissions, compressions, generalizations, or softenings marked?
6. Are deadlines, conditions, exceptions, and consequences preserved or flagged?
7. Does the output match the provided JSON schema exactly?

Final instruction:
Output only the JSON object. Do not output your reasoning.

JSON schema:
${JSON.stringify(analysisSchema, null, 2)}`
}
