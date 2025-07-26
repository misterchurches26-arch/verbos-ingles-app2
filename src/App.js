import React, { useState } from 'react';

// Main App component
const App = () => {
  // Array of verb objects with base, past simple, and past participle forms
  // This can be expanded with more verbs
  const verbs = [
    { base: 'go', simple: 'went', participle: 'gone' },
    { base: 'eat', simple: 'ate', participle: 'eaten' },
    { base: 'see', simple: 'saw', participle: 'seen' },
    { base: 'do', simple: 'did', participle: 'done' },
    { base: 'make', simple: 'made', participle: 'made' },
    { base: 'take', simple: 'took', participle: 'taken' },
    { base: 'write', simple: 'wrote', participle: 'written' },
    { base: 'read', simple: 'read', participle: 'read' }, // Note: 'read' past forms are spelled the same but pronounced differently
    { base: 'sing', simple: 'sang', participle: 'sung' },
    { base: 'drink', simple: 'drank', participle: 'drunk' },
    { base: 'run', simple: 'ran', participle: 'run' },
    { base: 'speak', simple: 'spoke', participle: 'spoken' },
    { base: 'give', simple: 'gave', participle: 'given' },
    { base: 'come', simple: 'came', participle: 'come' },
    { base: 'get', simple: 'got', participle: 'gotten' },
    { base: 'find', simple: 'found', participle: 'found' },
    { base: 'think', simple: 'thought', participle: 'thought' },
    { base: 'know', simple: 'knew', participle: 'known' },
    { base: 'tell', simple: 'told', participle: 'told' },
    { base: 'feel', simple: 'felt', participle: 'felt' },
  ];

  // State variables for the application
  const [currentVerbIndex, setCurrentVerbIndex] = useState(0); // Index of the current verb being displayed
  const [pastSimpleInput, setPastSimpleInput] = useState(''); // User's input for past simple
  const [pastParticipleInput, setPastParticipleInput] = useState(''); // User's input for past participle
  const [feedbackMessage, setFeedbackMessage] = useState(''); // Message displayed to the user (correct/incorrect)
  const [feedbackColor, setFeedbackColor] = useState(''); // Color of the feedback message
  const [score, setScore] = useState(0); // User's score
  const [attempts, setAttempts] = useState(0); // Number of attempts for the current verb
  const [showAnswer, setShowAnswer] = useState(false); // Flag to show/hide the correct answer

  // State variables for Gemini API integration
  const [exampleSentenceSimple, setExampleSentenceSimple] = useState(''); // Stores generated simple past sentence
  const [exampleSentenceParticiple, setExampleSentenceParticiple] = useState(''); // Stores generated past participle sentence
  const [usageTip, setUsageTip] = useState(''); // Stores generated usage tip
  const [isLoadingSimple, setIsLoadingSimple] = useState(false); // Loading state for simple sentence generation
  const [isLoadingParticiple, setIsLoadingParticiple] = useState(false); // Loading state for participle sentence generation
  const [isLoadingTip, setIsLoadingTip] = useState(false); // Loading state for usage tip generation
  const [apiError, setApiError] = useState(''); // Stores any API errors

  // New states for translation and question generation
  const [sentenceToTranslate, setSentenceToTranslate] = useState(''); // User's input for sentence translation
  const [translatedSentence, setTranslatedSentence] = useState(''); // Stores the translated sentence
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false); // Loading state for translation
  const [generatedQuestion, setGeneratedQuestion] = useState(''); // Stores the generated question
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false); // Loading state for question generation

  // Get the current verb object based on the index
  const currentVerb = verbs[currentVerbIndex];

  // Function to check the user's answer
  const checkAnswer = () => {
    setAttempts(attempts + 1); // Increment attempts for the current verb
    const isPastSimpleCorrect = pastSimpleInput.toLowerCase().trim() === currentVerb.simple;
    const isPastParticipleCorrect = pastParticipleInput.toLowerCase().trim() === currentVerb.participle;

    if (isPastSimpleCorrect && isPastParticipleCorrect) {
      setFeedbackMessage('¡Correcto! Bien hecho.');
      setFeedbackColor('text-green-600');
      setScore(score + 1); // Increment score only if both are correct
      setShowAnswer(true); // Show the correct answer after a correct attempt
    } else {
      setFeedbackMessage('Incorrecto. Intenta de nuevo o muestra la respuesta.');
      setFeedbackColor('text-red-600');
    }
  };

  // Function to move to the next verb
  const nextVerb = () => {
    // Reset states for the next verb
    setPastSimpleInput('');
    setPastParticipleInput('');
    setFeedbackMessage('');
    setFeedbackColor('');
    setShowAnswer(false);
    setAttempts(0); // Reset attempts for the new verb
    setExampleSentenceSimple(''); // Clear generated sentences
    setExampleSentenceParticiple('');
    setUsageTip('');
    setApiError(''); // Clear API errors
    setSentenceToTranslate(''); // Clear translation states
    setTranslatedSentence('');
    setGeneratedQuestion(''); // Clear generated question
    setCurrentVerbIndex((prevIndex) => (prevIndex + 1) % verbs.length); // Move to the next verb, loop back to the beginning if at the end
  };

  // Function to show the correct answer
  const showCorrectAnswer = () => {
    setFeedbackMessage(`La respuesta correcta es: Pasado Simple: "${currentVerb.simple}", Participio Pasado: "${currentVerb.participle}"`);
    setFeedbackColor('text-blue-600');
    setShowAnswer(true);
  };

  // Function to reset the entire application
  const resetApp = () => {
    setCurrentVerbIndex(0);
    setPastSimpleInput('');
    setPastParticipleInput('');
    setFeedbackMessage('');
    setFeedbackColor('');
    setScore(0);
    setAttempts(0);
    setShowAnswer(false);
    setExampleSentenceSimple('');
    setExampleSentenceParticiple('');
    setUsageTip('');
    setApiError('');
    setSentenceToTranslate('');
    setTranslatedSentence('');
    setGeneratedQuestion('');
  };

  // Function to call Gemini API for generating example sentences, usage tips, translations or questions
  const callGeminiApi = async (prompt, type) => {
    setApiError(''); // Clear previous errors
    if (type === 'simple') setIsLoadingSimple(true);
    else if (type === 'participle') setIsLoadingParticiple(true);
    else if (type === 'tip') setIsLoadingTip(true);
    else if (type === 'translate') setIsLoadingTranslation(true);
    else if (type === 'question') setIsLoadingQuestion(true);

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = ""; // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        if (type === 'simple') setExampleSentenceSimple(text);
        else if (type === 'participle') setExampleSentenceParticiple(text);
        else if (type === 'tip') setUsageTip(text);
        else if (type === 'translate') setTranslatedSentence(text);
        else if (type === 'question') setGeneratedQuestion(text);
      } else {
        setApiError('Error al generar contenido: Estructura de respuesta inesperada.');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setApiError('Error al conectar con la API de Gemini. Inténtalo de nuevo.');
    } finally {
      if (type === 'simple') setIsLoadingSimple(false);
      else if (type === 'participle') setIsLoadingParticiple(false);
      else if (type === 'tip') setIsLoadingTip(false);
      else if (type === 'translate') setIsLoadingTranslation(false);
      else if (type === 'question') setIsLoadingQuestion(false);
    }
  };

  // Function to generate a simple past example sentence
  const generateSimpleSentence = () => {
    const prompt = `Generate a simple English sentence using the verb "${currentVerb.base}" in its past simple form, which is "${currentVerb.simple}". The sentence should be easy to understand for a language learner.`;
    callGeminiApi(prompt, 'simple');
  };

  // Function to generate a past participle example sentence
  const generateParticipleSentence = () => {
    const prompt = `Generate a simple English sentence using the verb "${currentVerb.base}" in its past participle form, which is "${currentVerb.participle}". The sentence should be easy to understand for a language learner.`;
    callGeminiApi(prompt, 'participle');
  };

  // Function to get a usage tip for the current verb
  const getVerbUsageTip = () => {
    const prompt = `Provide a brief and helpful tip for using the English verb "${currentVerb.base}" (past simple: "${currentVerb.simple}", past participle: "${currentVerb.participle}") in sentences. Focus on common mistakes or nuances for language learners. Keep it concise.`;
    callGeminiApi(prompt, 'tip');
  };

  // Function to translate a sentence
  const translateSentence = () => {
    if (!sentenceToTranslate.trim()) {
      setApiError('Por favor, escribe una oración para traducir.');
      return;
    }
    const prompt = `Translate the following Spanish sentence into English, ensuring the verb "${currentVerb.base}" (past simple: "${currentVerb.simple}", past participle: "${currentVerb.participle}") is used correctly if applicable: "${sentenceToTranslate}".`;
    callGeminiApi(prompt, 'translate');
  };

  // Function to generate a question
  const generateQuestion = () => {
    const prompt = `Generate a simple English question using the verb "${currentVerb.base}" in its past simple or past participle form. The question should be easy to understand for a language learner.`;
    callGeminiApi(prompt, 'question');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
          <span className="text-blue-600">Verbos</span> en Pasado
        </h1>

        <div className="mb-6">
          <p className="text-lg text-gray-700 mb-2">Verbo Base:</p>
          <p className="text-5xl font-bold text-purple-700 uppercase tracking-wide">
            {currentVerb.base}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="pastSimple" className="block text-gray-700 text-sm font-semibold mb-1">
              Pasado Simple:
            </label>
            <input
              type="text"
              id="pastSimple"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-lg text-gray-800"
              value={pastSimpleInput}
              onChange={(e) => setPastSimpleInput(e.target.value)}
              placeholder="Escribe aquí"
              disabled={showAnswer} // Disable input if answer is shown
            />
          </div>
          <div>
            <label htmlFor="pastParticiple" className="block text-gray-700 text-sm font-semibold mb-1">
              Participio Pasado:
            </label>
            <input
              type="text"
              id="pastParticiple"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-lg text-gray-800"
              value={pastParticipleInput}
              onChange={(e) => setPastParticipleInput(e.target.value)}
              placeholder="Escribe aquí"
              disabled={showAnswer} // Disable input if answer is shown
            />
          </div>
        </div>

        {feedbackMessage && (
          <p className={`text-center text-lg font-medium mb-4 ${feedbackColor}`}>
            {feedbackMessage}
          </p>
        )}

        {apiError && (
          <p className="text-center text-red-500 text-sm mb-4">{apiError}</p>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
          {!showAnswer && (
            <button
              onClick={checkAnswer}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Comprobar
            </button>
          )}
          {showAnswer ? (
            <button
              onClick={nextVerb}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              Siguiente Verbo
            </button>
          ) : (
            <button
              onClick={showCorrectAnswer}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            >
              Mostrar Respuesta
            </button>
          )}
        </div>

        {/* Gemini API Powered Features */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Funciones con IA ✨</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
            <button
              onClick={generateSimpleSentence}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 text-sm"
              disabled={isLoadingSimple}
            >
              {isLoadingSimple ? 'Generando...' : '✨ Oración (Pasado Simple)'}
            </button>
            <button
              onClick={generateParticipleSentence}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 text-sm"
              disabled={isLoadingParticiple}
            >
              {isLoadingParticiple ? 'Generando...' : '✨ Oración (Participio Pasado)'}
            </button>
          </div>
          {exampleSentenceSimple && (
            <p className="text-left text-gray-700 text-sm bg-gray-50 p-3 rounded-md mb-2">
              **Oración (Pasado Simple):** {exampleSentenceSimple}
            </p>
          )}
          {exampleSentenceParticiple && (
            <p className="text-left text-gray-700 text-sm bg-gray-50 p-3 rounded-md mb-4">
              **Oración (Participio Pasado):** {exampleSentenceParticiple}
            </p>
          )}

          <button
            onClick={getVerbUsageTip}
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50 text-sm w-full mb-4"
            disabled={isLoadingTip}
          >
            {isLoadingTip ? 'Obteniendo Consejo...' : '✨ Obtener Consejo de Uso'}
          </button>
          {usageTip && (
            <p className="text-left text-gray-700 text-sm bg-gray-50 p-3 rounded-md mt-2 mb-4">
              **Consejo de Uso:** {usageTip}
            </p>
          )}

          {/* New: Sentence Translator */}
          <div className="mt-4">
            <label htmlFor="sentenceToTranslate" className="block text-gray-700 text-sm font-semibold mb-1 text-left">
              ✨ Traducir Oración (con "{currentVerb.base}"):
            </label>
            <textarea
              id="sentenceToTranslate"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 ease-in-out text-lg text-gray-800 mb-2"
              value={sentenceToTranslate}
              onChange={(e) => setSentenceToTranslate(e.target.value)}
              placeholder="Escribe una oración aquí para traducir..."
              rows="2"
            ></textarea>
            <button
              onClick={translateSentence}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50 text-sm w-full"
              disabled={isLoadingTranslation}
            >
              {isLoadingTranslation ? 'Traduciendo...' : '✨ Traducir'}
            </button>
            {translatedSentence && (
              <p className="text-left text-gray-700 text-sm bg-gray-50 p-3 rounded-md mt-2">
                **Traducción:** {translatedSentence}
              </p>
            )}
          </div>

          {/* New: Question Generator */}
          <div className="mt-4">
            <button
              onClick={generateQuestion}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 text-sm w-full"
              disabled={isLoadingQuestion}
            >
              {isLoadingQuestion ? 'Generando Pregunta...' : '✨ Generar Pregunta'}
            </button>
            {generatedQuestion && (
              <p className="text-left text-gray-700 text-sm bg-gray-50 p-3 rounded-md mt-2">
                **Pregunta:** {generatedQuestion}
              </p>
            )}
          </div>

        </div>
        {/* End Gemini API Powered Features */}

        <div className="text-xl font-semibold text-gray-700 mt-6">
          Puntuación: <span className="text-green-700">{score}</span> / {verbs.length}
        </div>

        <button
          onClick={resetApp}
          className="mt-8 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 text-sm"
        >
          Reiniciar Aplicación
        </button>
      </div>
    </div>
  );
};

export default App;
