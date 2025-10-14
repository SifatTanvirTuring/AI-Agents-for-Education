import React from 'react';

const SpacedRepetitionSystem = ({ onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-slate-800 p-6 rounded-lg w-96">
      <h2 className="text-white text-lg font-bold mb-2">Spaced Repetition</h2>
      <p className="text-slate-400">
        This is a placeholder for the Spaced Repetition System.
      </p>
      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default SpacedRepetitionSystem;
