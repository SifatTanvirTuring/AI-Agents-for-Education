import React, { useState } from 'react';

const DiagnosticAssessment = ({ onClose }) => {
  const [answers, setAnswers] = useState({});
  const questions = [
    { id: 1, text: "What is 5 + 7?", options: ["10", "12", "14"] },
    { id: 2, text: "Which shape has four equal sides?", options: ["Square", "Rectangle", "Triangle"] }
  ];

  const handleChange = (qid, option) => {
    setAnswers(prev => ({ ...prev, [qid]: option }));
  };

  const handleSubmit = () => {
    console.log("Diagnostic Answers:", answers);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-white text-lg mb-4">Diagnostic Assessment</h2>
        {questions.map(q => (
          <div key={q.id} className="mb-4">
            <p className="text-white mb-2">{q.text}</p>
            {q.options.map(opt => (
              <button
                key={opt}
                onClick={() => handleChange(q.id, opt)}
                className={`block w-full text-left px-3 py-2 rounded mb-1 ${
                  answers[q.id] === opt ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-300"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ))}
        <div className="flex justify-between mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 rounded">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticAssessment;
