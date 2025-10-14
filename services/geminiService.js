// Real Gemini API service integration
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key-here');

export const generateEvaluationQuiz = async (subjects, topics, level, year) => {
  try {
    console.log('Generating quiz with Gemini API for:', { subjects, topics, level, year });
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    Generate a comprehensive evaluation quiz for a ${level} student preparing for their ${year} O-Level exams.
    
    Subjects: ${subjects.map(s => s.name || s).join(', ')}
    Topics: ${Object.values(topics).flat().map(t => t.name || t).join(', ')}
    
    Please generate 5 questions that:
    1. Cover the specified subjects and topics
    2. Are appropriate for ${level} level
    3. Include multiple choice questions with 4 options each
    4. Vary in difficulty (Easy, Medium, Hard)
    5. Are relevant to O-Level preparation
    
    Return the response as a JSON array with this structure:
    [
      {
        "question": "Question text here",
        "questionType": "MCQ",
        "options": ["A", "B", "C", "D"],
        "subjectName": "Subject name",
        "topicName": "Topic name",
        "difficulty": "Easy/Medium/Hard",
        "correctAnswer": "A"
      }
    ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const quiz = JSON.parse(text);
    console.log('Generated quiz with Gemini API:', quiz);
    return quiz;
    
  } catch (error) {
    console.error('Error generating quiz with Gemini API:', error);
    // Fallback to a basic quiz if API fails
    return [
      {
        question: 'What is 2 + 2?',
        questionType: 'MCQ',
        options: ['3', '4', '5', '6'],
        subjectName: subjects[0]?.name || 'Mathematics',
        topicName: topics[subjects[0]?.id]?.[0]?.name || 'Basic Arithmetic',
        difficulty: 'Easy',
        correctAnswer: '4'
      }
    ];
  }
};

export const evaluateQuizAnswers = async (quiz, answers) => {
  try {
    console.log('Evaluating answers with Gemini API:', { quiz, answers });
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    Evaluate the following quiz answers and provide a comprehensive analysis:
    
    Quiz Questions: ${JSON.stringify(quiz, null, 2)}
    Student Answers: ${JSON.stringify(answers, null, 2)}
    
    Please provide:
    1. Overall score (percentage)
    2. Subject-wise performance breakdown
    3. Strengths and weaknesses analysis
    4. Specific recommendations for improvement
    5. Difficulty level assessment
    
    Return the response as JSON with this structure:
    {
      "overallScore": 85,
      "subjectBreakdown": {
        "Mathematics": {
          "score": 90,
          "strengths": ["Algebra", "Basic Arithmetic"],
          "weaknesses": ["Geometry", "Trigonometry"]
        }
      },
      "strengths": ["Strong in algebra", "Good problem-solving"],
      "weaknesses": ["Geometry concepts", "Time management"],
      "recommendations": ["Focus on geometry", "Practice more problems"],
      "difficultyLevel": "Intermediate"
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const evaluation = JSON.parse(text);
    console.log('Generated evaluation with Gemini API:', evaluation);
    return evaluation;
    
  } catch (error) {
    console.error('Error evaluating answers with Gemini API:', error);
    // Fallback evaluation
    return {
      overallScore: 75,
      subjectBreakdown: {
        Mathematics: {
          score: 75,
          strengths: ["Basic concepts"],
          weaknesses: ["Advanced topics"]
        }
      },
      strengths: ["Basic understanding"],
      weaknesses: ["Advanced concepts"],
      recommendations: ["Practice more", "Review fundamentals"],
      difficultyLevel: "Beginner"
    };
  }
};

export const generateStudyPlan = async (evaluation, subjects, topics) => {
  try {
    console.log('Generating study plan with Gemini API:', { evaluation, subjects, topics });
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    Create a personalized study plan based on the following evaluation:
    
    Evaluation Results: ${JSON.stringify(evaluation, null, 2)}
    Subjects: ${subjects.map(s => s.name || s).join(', ')}
    Topics: ${Object.values(topics).flat().map(t => t.name || t).join(', ')}
    
    Generate a 4-week study plan that:
    1. Addresses the identified weaknesses
    2. Builds on existing strengths
    3. Includes daily study activities
    4. Provides specific learning objectives
    5. Suggests practice exercises and resources
    
    Return the response as JSON with this structure:
    {
      "weeklySchedule": {
        "Week 1": {
          "Monday": ["Subject: Topic - Activity"],
          "Tuesday": ["Subject: Topic - Activity"]
        }
      },
      "milestones": ["Complete algebra basics", "Master geometry concepts"],
      "resources": ["Textbook chapters", "Online practice", "Video tutorials"],
      "goals": ["Improve geometry", "Strengthen algebra"]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const studyPlan = JSON.parse(text);
    console.log('Generated study plan with Gemini API:', studyPlan);
    return studyPlan;
    
  } catch (error) {
    console.error('Error generating study plan with Gemini API:', error);
    // Fallback study plan
    return {
      weeklySchedule: {
        "Week 1": {
          "Monday": ["Mathematics: Algebra - Practice linear equations"],
          "Tuesday": ["Mathematics: Geometry - Review basic shapes"]
        }
      },
      milestones: ["Complete basic concepts", "Practice problem-solving"],
      resources: ["Textbook", "Online exercises"],
      goals: ["Improve understanding", "Build confidence"]
    };
  }
};
