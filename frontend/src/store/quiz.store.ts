import { create } from "zustand";
import { 
  fetchQuestions, 
  fetchAnswersByQuestion, 
  answerQuiz,
  submitQuiz
} from "../api/quiz_api";
import type { 
  QuizQuestion, 
  QuizAnswer, 
  SuitableJobCategory 
} from "../api/quiz_api";

interface QuizState {
  // Data
  questions: QuizQuestion[];
  answersByQuestion: Record<number, QuizAnswer[]>;
  selectedAnswers: Record<number, number[]>; // questionId -> answerIds[]
  currentQuestionIndex: number;
  results: SuitableJobCategory[];
  
  // Status
  isLoading: boolean;
  isLoadingAnswers: boolean;
  isSubmitting: boolean;
  isSavingAnswer: boolean;
  error: string | null;
  isCompleted: boolean;
  
  // Actions
  loadQuestions: () => Promise<void>;
  loadAnswersForQuestion: (questionId: number) => Promise<void>;
  selectAnswer: (questionId: number, answerId: number) => void;
  nextQuestion: () => Promise<void>;
  previousQuestion: () => void;
  submitQuizAndGetResults: () => Promise<void>;
  setResults: (results: SuitableJobCategory[]) => void;
  resetQuiz: () => void;
  
  // Helpers
  getCurrentQuestion: () => QuizQuestion | null;
  getCurrentAnswers: () => QuizAnswer[];
  getSelectedAnswersForCurrent: () => number[];
  getProgress: () => number;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  // Initial state
  questions: [],
  answersByQuestion: {},
  selectedAnswers: {},
  currentQuestionIndex: 0,
  results: [],
  isLoading: false,
  isLoadingAnswers: false,
  isSubmitting: false,
  isSavingAnswer: false,
  error: null,
  isCompleted: false,

  // Load all questions
  loadQuestions: async () => {
    set({ isLoading: true, error: null });
    try {
      const questions = await fetchQuestions();
      set({ questions, isLoading: false });
    } catch {
      set({ 
        error: "Không thể tải câu hỏi. Vui lòng thử lại.",
        isLoading: false 
      });
    }
  },

  // Load answers for specific question
  loadAnswersForQuestion: async (questionId: number) => {
    const { answersByQuestion } = get();
    
    // Skip if already loaded
    if (answersByQuestion[questionId]) return;
    
    set({ isLoadingAnswers: true });
    try {
      const answers = await fetchAnswersByQuestion(questionId);
      set({ 
        answersByQuestion: { 
          ...answersByQuestion, 
          [questionId]: answers 
        },
        isLoadingAnswers: false 
      });
    } catch {
      set({ 
        error: "Không thể tải đáp án. Vui lòng thử lại.",
        isLoadingAnswers: false 
      });
    }
  },

  // Select/deselect answer (UI only, no API call)
  selectAnswer: (questionId: number, answerId: number) => {
    const { selectedAnswers } = get();
    const currentAnswers = selectedAnswers[questionId] || [];
    
    let newAnswers: number[];
    if (currentAnswers.includes(answerId)) {
      // Deselect
      newAnswers = currentAnswers.filter(id => id !== answerId);
    } else {
      // Select (max 3 answers)
      if (currentAnswers.length >= 3) return;
      newAnswers = [...currentAnswers, answerId];
    }
    
    // Update local state only
    set({
      selectedAnswers: {
        ...selectedAnswers,
        [questionId]: newAnswers
      }
    });
  },

  // Navigation - Save current answer and go to next question
  nextQuestion: async () => {
    const { currentQuestionIndex, questions, selectedAnswers } = get();
    
    if (currentQuestionIndex < questions.length - 1) {
      set({ isSavingAnswer: true });
      
      // Save current question's answer via API
      const currentQuestion = questions[currentQuestionIndex];
      const currentAnswers = selectedAnswers[currentQuestion.id] || [];
      
      if (currentAnswers.length > 0) {
        try {
          await answerQuiz(currentQuestion.id, currentAnswers);
        } catch (err) {
          console.error("Error saving answer:", err);
          // Continue anyway, don't block progression
        }
      }
      
      // Move to next question
      set({ 
        currentQuestionIndex: currentQuestionIndex + 1,
        isSavingAnswer: false 
      });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  // Submit quiz and get job categories
  submitQuizAndGetResults: async () => {
    set({ isSubmitting: true, error: null });
    try {
      // Submit quiz and get job categories results
      const results = await submitQuiz();
      
      set({ 
        results: results || [],
        isCompleted: true, 
        isSubmitting: false 
      });
    } catch {
      set({ 
        error: "Không thể nộp bài. Vui lòng thử lại.",
        isSubmitting: false 
      });
    }
  },

  // Set results directly (for loading results page)
  setResults: (results: SuitableJobCategory[]) => {
    set({ results });
  },

  // Reset quiz
  resetQuiz: () => {
    set({
      questions: [],
      answersByQuestion: {},
      selectedAnswers: {},
      currentQuestionIndex: 0,
      results: [],
      isLoading: false,
      isLoadingAnswers: false,
      isSubmitting: false,
      isSavingAnswer: false,
      error: null,
      isCompleted: false,
    });
  },

  // Helper functions
  getCurrentQuestion: () => {
    const { questions, currentQuestionIndex } = get();
    return questions[currentQuestionIndex] || null;
  },

  getCurrentAnswers: () => {
    const { answersByQuestion } = get();
    const currentQuestion = get().getCurrentQuestion();
    return currentQuestion ? answersByQuestion[currentQuestion.id] || [] : [];
  },

  getSelectedAnswersForCurrent: () => {
    const { selectedAnswers } = get();
    const currentQuestion = get().getCurrentQuestion();
    return currentQuestion ? selectedAnswers[currentQuestion.id] || [] : [];
  },

  getProgress: () => {
    const { questions, currentQuestionIndex } = get();
    return questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  },

  canGoNext: () => {
    const { questions, currentQuestionIndex } = get();
    return currentQuestionIndex < questions.length - 1;
  },

  canGoPrevious: () => {
    const { currentQuestionIndex } = get();
    return currentQuestionIndex > 0;
  },
}));