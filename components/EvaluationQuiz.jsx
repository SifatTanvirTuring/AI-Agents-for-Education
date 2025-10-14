import React, { useState, useEffect } from 'react';
import { SUBJECTS } from '../constants.js';
import { generateEvaluationQuiz, evaluateQuizAnswers, generateStudyPlan } from '../services/geminiService.js';

const WelcomeStep = ({ onNext, userName, setUserName }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userName.trim()) onNext();
  };

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-4">🎓 Welcome to Learning Buddy</h1>
      <p className="text-slate-300 mb-8 text-lg">Your AI-powered companion for O-Level success</p>

      <div className="mb-8">
        <label className="block text-slate-300 text-sm font-medium mb-2">What should we call you?</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your name"
          className="w-full max-w-sm mx-auto px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!userName.trim()}
        className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
      >
        Let's Get Started
      </button>
    </div>
  );
};

const ProfileStep = ({ onNext, onBack, userData, setUserData }) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">📋 Tell us about yourself</h2>

    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Current Grade</label>
        <select
          value={userData.grade}
          onChange={(e) => setUserData(prev => ({ ...prev, grade: e.target.value }))}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select your grade</option>
          <option value="Secondary 1">Secondary 1</option>
          <option value="Secondary 2">Secondary 2</option>
          <option value="Secondary 3">Secondary 3</option>
          <option value="Secondary 4">Secondary 4</option>
          <option value="Secondary 5">Secondary 5</option>
        </select>
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Target O-Level Year</label>
        <select
          value={userData.examYear}
          onChange={(e) => setUserData(prev => ({ ...prev, examYear: e.target.value }))}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a year</option>
          {[2024, 2025, 2026, 2027, 2028].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">When is your next exam?</label>
        <input
          type="date"
          value={userData.examDate}
          onChange={(e) => setUserData(prev => ({ ...prev, examDate: e.target.value }))}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>

    <div className="flex space-x-4 mt-8">
      <button onClick={onBack} className="px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors">Back</button>
      <button onClick={onNext} disabled={!userData.grade || !userData.examYear} className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">Continue</button>
    </div>
  </div>
);

const EvaluationQuiz = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({ userName: '', grade: '', examYear: '', subjects: [], topics: {}, level: '', examDate: '' });
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [evaluation, setEvaluation] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);

  const availableSubjects = SUBJECTS;

  const handleNext = async () => {
    if (step === 2) {
      setIsGenerating(true);
      const selectedSubjects = availableSubjects.filter(s => userData.subjects.includes(s.id));
      const topicsBySubject = {};
      selectedSubjects.forEach(subject => {
        topicsBySubject[subject.id] = subject.topics.filter(t => userData.topics[subject.id]?.includes(t.id));
      });

      const generatedQuiz = await generateEvaluationQuiz(selectedSubjects, topicsBySubject, userData.level, userData.examYear);
      setQuiz(generatedQuiz || []);
      setIsGenerating(false);
      if (generatedQuiz) setStep(s => s + 1);
    } else setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleAnswer = (questionIndex, answer) => setAnswers(prev => ({ ...prev, [questionIndex]: answer }));

  const handleSubmit = async () => {
    setIsEvaluating(true);
    const evaluationResult = await evaluateQuizAnswers(quiz, answers);
    setEvaluation(evaluationResult);
    setIsEvaluating(false);
    setStep(s => s + 1);
  };

  const handleGeneratePlan = async () => {
    setIsPlanning(true);
    const selectedSubjects = availableSubjects.filter(s => userData.subjects.includes(s.id));
    const topicsBySubject = {};
    selectedSubjects.forEach(subject => {
      topicsBySubject[subject.id] = subject.topics.filter(t => userData.topics[subject.id]?.includes(t.id));
    });
    const plan = await generateStudyPlan(evaluation, selectedSubjects, topicsBySubject);
    setStudyPlan(plan);
    setIsPlanning(false);
    setStep(s => s + 1);
  };

  const handleFinish = () => onComplete(userData, answers, quiz, evaluation, studyPlan);

  const renderStep = () => {
    if (isGenerating || isEvaluating || isPlanning) {
      return (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {isGenerating && "Generating your personalized quiz..."}
            {isEvaluating && "Evaluating your answers..."}
            {isPlanning && "Creating your study plan..."}
          </h2>
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      );
    }

    switch (step) {
      case 0: return <WelcomeStep onNext={handleNext} userName={userData.userName} setUserName={(name) => setUserData(prev => ({ ...prev, userName: name }))} />;
      case 1: return <ProfileStep onNext={handleNext} onBack={handleBack} userData={userData} setUserData={setUserData} />;
      default: return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 p-4">
      <div className="w-full max-w-3xl bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700 transition-all duration-500">
        {renderStep()}
      </div>
    </div>
  );
};

export default EvaluationQuiz;
