import { Question } from "@/data/interviewQuestions";

export interface EvaluationResult {
  score: number;
  feedback: {
    strengths: string[];
    improvements: string[];
  };
  detailedFeedback: string;
}

function calculateScore(answer: string, expectedPoints: string[]): number {
  // Simple scoring based on keyword matching
  const lowerAnswer = answer.toLowerCase();
  let score = 0;
  
  expectedPoints.forEach(point => {
    const keywords = point.toLowerCase().split(' ');
    const matchCount = keywords.filter(word => 
      word.length > 3 && lowerAnswer.includes(word)
    ).length;
    
    if (matchCount > keywords.length / 2) {
      score += 2;
    }
  });

  return Math.min(score, 10); // Cap at 10 points
}

function analyzeStrengths(answer: string, expectedPoints: string[]): string[] {
  const strengths: string[] = [];
  const lowerAnswer = answer.toLowerCase();

  // Check answer length
  if (answer.length > 200) {
    strengths.push("Provided a detailed response");
  }

  // Check for examples
  if (answer.toLowerCase().includes("example") || answer.toLowerCase().includes("instance")) {
    strengths.push("Included practical examples");
  }

  // Check for technical terms
  expectedPoints.forEach(point => {
    const keywords = point.toLowerCase().split(' ');
    const matchCount = keywords.filter(word => 
      word.length > 3 && lowerAnswer.includes(word)
    ).length;
    
    if (matchCount > keywords.length / 2) {
      strengths.push(`Demonstrated understanding of ${point}`);
    }
  });

  return strengths;
}

function analyzeImprovements(answer: string, expectedPoints: string[]): string[] {
  const improvements: string[] = [];
  const lowerAnswer = answer.toLowerCase();

  // Check answer length
  if (answer.length < 100) {
    improvements.push("Provide more detailed explanation");
  }

  // Check for missing points
  expectedPoints.forEach(point => {
    const keywords = point.toLowerCase().split(' ');
    const matchCount = keywords.filter(word => 
      word.length > 3 && lowerAnswer.includes(word)
    ).length;
    
    if (matchCount <= keywords.length / 2) {
      improvements.push(`Consider discussing ${point}`);
    }
  });

  // Check for examples
  if (!lowerAnswer.includes("example") && !lowerAnswer.includes("instance")) {
    improvements.push("Include practical examples to support your explanation");
  }

  return improvements;
}

export async function evaluateAnswer(question: Question, answer: string): Promise<EvaluationResult> {
  try {
    // Calculate score
    const score = calculateScore(answer, question.expectedPoints);
    
    // Analyze strengths and improvements
    const strengths = analyzeStrengths(answer, question.expectedPoints);
    const improvements = analyzeImprovements(answer, question.expectedPoints);

    // Generate detailed feedback
    let detailedFeedback = "";
    if (score >= 8) {
      detailedFeedback = "Excellent response! You demonstrated strong understanding of the concepts and provided good examples. ";
    } else if (score >= 6) {
      detailedFeedback = "Good response. You covered many key points but there's room for more detail. ";
    } else if (score >= 4) {
      detailedFeedback = "Fair response. Consider expanding your answer and including more specific examples. ";
    } else {
      detailedFeedback = "Your response needs improvement. Try to cover more key concepts and provide specific examples. ";
    }

    if (improvements.length > 0) {
      detailedFeedback += "Focus on the suggested improvements to strengthen your answer.";
    }

    return {
      score,
      feedback: {
        strengths: strengths.length > 0 ? strengths : ["Good attempt at answering the question"],
        improvements: improvements.length > 0 ? improvements : ["Continue practicing and expanding your knowledge"]
      },
      detailedFeedback
    };
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return {
      score: 0,
      feedback: {
        strengths: ["Attempted to answer the question"],
        improvements: ["Technical error in evaluation - please try again"]
      },
      detailedFeedback: "There was an error evaluating your answer. Please try again."
    };
  }
}
