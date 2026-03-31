import type { StructuredQuestion } from "@/components/interview/MultiQuestionForm";

/**
 * Fallback: extract questions from plain text when the AI fails to return
 * a structured `questions` array. Returns null if fewer than 2 questions found.
 */
export function extractQuestionsFromMessage(text: string): StructuredQuestion[] | null {
  // Split on newlines, then find sentences ending with "?"
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);

  const questions: StructuredQuestion[] = [];

  for (const line of lines) {
    // A line might contain multiple sentences; split on sentence boundaries
    const sentences = line.split(/(?<=[.!?])\s+/);
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.endsWith("?") && trimmed.length > 10) {
        // Strip leading markdown list markers (-, *, 1., etc.)
        const cleaned = trimmed.replace(/^[-*•]\s*/, "").replace(/^\d+[.)]\s*/, "").trim();
        if (cleaned.length > 10) {
          questions.push({
            id: `extracted_${questions.length + 1}`,
            label: cleaned,
            type: "textarea",
            placeholder: "Type your answer here...",
          });
        }
      }
    }
  }

  return questions.length >= 2 ? questions : null;
}
