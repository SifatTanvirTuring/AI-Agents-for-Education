import React, { useState } from 'react';

const LearningSession = ({ subject, topic, onExit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const content = [
    "Introduction to the topic.",
    "Explanation of core concepts.",
    "Practice questions.",
    "Summary and next steps."
  ];

  return (
    <div className="p-8 bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-white text-xl mb-4">{subject.name} - {topic.name}</h2>
      <p className="text-slate-300 mb-6">{content[currentStep]}</p>

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
          className="px-4 py-2 bg-gray-600 rounded"
        >
          Previous
        </button>
        {currentStep < content.length - 1 ? (
          <button
            onClick={() => setCurrentStep(s => s + 1)}
            className="px-4 py-2 bg-indigo-600 rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={onExit}
            className="px-4 py-2 bg-red-600 rounded"
          >
            Exit Session
          </button>
        )}
      </div>
    </div>
  );
};

export default LearningSession;
