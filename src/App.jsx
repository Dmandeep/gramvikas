import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Upload, ChevronLeft, Home, Leaf, Bug, AlertCircle, FileText, TrendingUp, Volume2, Send, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'dummy_key');

const LANGUAGES = {
  en: 'English',
  hi: 'हिंदी',
  pa: 'ਪੰਜਾਬੀ',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ'
};

const CONTENT = {
  en: {
    title: 'Gramvikash AI Assistant',
    subtitle: 'Empowering Rural India with Artificial Intelligence',
    selectLanguage: 'Select Your Language',
    selectOption: 'How can we help you today?',
    cropAdvice: 'Crop Loss Reduction',
    pestControl: 'Pest Control Measures',
    emergency: 'Emergency Response',
    plantDiagnosis: 'Plant Diagnosis',
    govSchemes: 'Government Schemes',
    marketInfo: 'Market Demand',
    voice: 'Voice Input',
    upload: 'Upload Plant Image',
    ask: 'Type your question...',
    back: 'Back to Menu',
    home: 'Home'
  },
  hi: {
    title: 'ग्रामविकास AI सहायक',
    subtitle: 'कृत्रिम बुद्धिमत्ता के साथ ग्रामीण भारत का सशक्तिकरण',
    selectLanguage: 'अपनी भाषा चुनें',
    selectOption: 'आज हम आपकी कैसे मदद कर सकते हैं?',
    cropAdvice: 'फसल नुकसान में कमी',
    pestControl: 'कीट नियंत्रण उपाय',
    emergency: 'आपातकालीन प्रतिक्रिया',
    plantDiagnosis: 'पौधे का निदान',
    govSchemes: 'सरकारी योजनाएं',
    marketInfo: 'बाजार मांग',
    voice: 'आवाज इनपुट',
    upload: 'पौधे की तस्वीर अपलोड करें',
    ask: 'अपना सवाल टाइप करें...',
    back: 'वापस जाएं',
    home: 'होम'
  }
};

const fileToGenerativePart = async (file) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export default function App() {
  const [language, setLanguage] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('language'); // language, menu, detail
  const [selectedOption, setSelectedOption] = useState(null);
  
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const t = language && CONTENT[language] ? CONTENT[language] : CONTENT.en;

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setCurrentScreen('menu');
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in your browser');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : `${language}-IN`;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setUserInput(transcript);
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setUploadedImagePreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedFile(null);
    setUploadedImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const getPromptForOption = (option, input) => {
    const prompts = {
      cropAdvice: `Act as a senior agricultural expert. Provide practical, low-cost advice on reducing crop loss. User question: ${input}. Context: Indian agriculture. Give specific, actionable steps. Answer in ${LANGUAGES[language]}.`,
      pestControl: `Act as a pest control specialist for crops. Provide management solutions (organic and conventional) for the issue: ${input}. Answer in ${LANGUAGES[language]}.`,
      emergency: `Act as an agricultural disaster management expert. Provide emergency response guidance for: ${input}. Give immediate actionable steps to minimize damage. Answer in ${LANGUAGES[language]}.`,
      govSchemes: `Act as an expert in Indian government agricultural schemes. Explain benefits and eligibility for: ${input}. Answer in ${LANGUAGES[language]}.`,
      marketInfo: `Act as an agricultural market analyst in India. Provide insights on crop market demand, seasonal pricing, and best selling strategies for: ${input}. Answer in ${LANGUAGES[language]}.`
    };
    return prompts[option] || input;
  };

  const handleSubmit = async () => {
    if (!userInput.trim() && !uploadedFile) return;

    if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'your_google_gemini_api_key_here') {
      setAiResponse("System configuration error: VITE_GEMINI_API_KEY is not set. Please add a valid Google Gemini API key to your .env file.");
      return;
    }

    setIsLoading(true);
    setAiResponse('');
    try {
      if (selectedOption === 'plantDiagnosis' && uploadedFile) {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Act as an expert plant pathologist. Analyze this plant image and identify any diseases, nutrient deficiencies, or pest damage. Provide: 1. Diagnosis 2. Possible causes 3. Treatment recommendations (organic and chemical). Respond in ${LANGUAGES[language]}. User context/question: ${userInput}`;
        const imagePart = await fileToGenerativePart(uploadedFile);
        
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        setAiResponse(response.text());
        speakResponse(response.text());
      } else {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = getPromptForOption(selectedOption, userInput);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        setAiResponse(response.text());
        speakResponse(response.text());
      }
    } catch (error) {
      console.error(error);
      setAiResponse('Sorry, an error occurred while generating the response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-US' : `${language}-IN`;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  // Variants for animations
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };
  const pageTransition = { type: "tween", ease: "anticipate", duration: 0.4 };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl tracking-tight">
            <Leaf className="w-6 h-6" />
            Gramvikash
          </div>
          {currentScreen !== 'language' && (
            <button 
              onClick={() => {
                setLanguage(null);
                setCurrentScreen('language');
              }}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <Home className="w-4 h-4" /> {t.home}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {currentScreen === 'language' && (
            <motion.div 
              key="language"
              initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
              className="w-full max-w-lg mt-12 sm:mt-24"
            >
              <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 p-8 sm:p-12 text-center border border-slate-100">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                  <Leaf className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-3">{t.title}</h1>
                <p className="text-slate-500 mb-10 text-lg">{t.subtitle}</p>
                
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t.selectLanguage}</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(LANGUAGES).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => handleLanguageSelect(code)}
                      className="p-4 border-2 border-slate-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all font-semibold text-slate-700 hover:text-emerald-700 active:scale-95"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentScreen === 'menu' && (
            <motion.div 
              key="menu"
              initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
              className="w-full max-w-4xl mt-6"
            >
              <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-3">{t.title}</h1>
                <p className="text-slate-500 text-lg">{t.selectOption}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { key: 'cropAdvice', icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'hover:border-emerald-200' },
                  { key: 'pestControl', icon: Bug, color: 'text-orange-600', bg: 'bg-orange-50', hover: 'hover:border-orange-200' },
                  { key: 'emergency', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', hover: 'hover:border-red-200' },
                  { key: 'plantDiagnosis', icon: Upload, color: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:border-blue-200' },
                  { key: 'govSchemes', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', hover: 'hover:border-purple-200' },
                  { key: 'marketInfo', icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50', hover: 'hover:border-yellow-200' }
                ].map(({ key, icon: Icon, color, bg, hover }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedOption(key);
                      setCurrentScreen('detail');
                      setUserInput('');
                      setAiResponse('');
                      setUploadedFile(null);
                      setUploadedImagePreview(null);
                    }}
                    className={`group p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-all text-left flex flex-col h-full ${hover} active:scale-[0.98]`}
                  >
                    <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                      <Icon className={`w-7 h-7 ${color}`} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{t[key]}</h3>
                    <p className="text-sm text-slate-500 mt-auto">Get AI assistance</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentScreen === 'detail' && (
            <motion.div 
              key="detail"
              initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
              className="w-full max-w-3xl mt-4"
            >
              <button
                onClick={() => setCurrentScreen('menu')}
                className="mb-6 flex items-center gap-2 text-slate-500 font-medium hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" /> {t.back}
              </button>

              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col h-[70vh] min-h-[500px]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    {selectedOption === 'cropAdvice' && <Leaf className="w-5 h-5"/>}
                    {selectedOption === 'pestControl' && <Bug className="w-5 h-5"/>}
                    {selectedOption === 'emergency' && <AlertCircle className="w-5 h-5"/>}
                    {selectedOption === 'plantDiagnosis' && <Upload className="w-5 h-5"/>}
                    {selectedOption === 'govSchemes' && <FileText className="w-5 h-5"/>}
                    {selectedOption === 'marketInfo' && <TrendingUp className="w-5 h-5"/>}
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">{t[selectedOption]}</h2>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                  {/* Default greeting */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex-shrink-0 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-sm p-4 text-slate-800 max-w-[85%]">
                      Hello! How can I help you with {t[selectedOption]} today?
                      {selectedOption === 'plantDiagnosis' && " Please upload a clear photo of the affected plant."}
                    </div>
                  </div>

                  {/* User Message Preview (if requested) */}
                  {(userInput || uploadedImagePreview) && (
                    <div className="flex gap-4 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">
                        U
                      </div>
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-4 max-w-[85%]">
                        {uploadedImagePreview && (
                          <img src={uploadedImagePreview} alt="Uploaded" className="rounded-xl mb-3 max-w-full max-h-48 object-cover border border-white/20" />
                        )}
                        {userInput && <p>{userInput}</p>}
                      </div>
                    </div>
                  )}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex-shrink-0 flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-slate-100 rounded-2xl rounded-tl-sm p-4 text-slate-500 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Processing...
                      </div>
                    </div>
                  )}

                  {/* AI Response */}
                  {aiResponse && !isLoading && (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex-shrink-0 flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-slate-100 rounded-2xl rounded-tl-sm p-5 text-slate-800 max-w-[85%] relative group">
                        <div className="prose prose-slate prose-sm" dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        <button
                          onClick={() => speakResponse(aiResponse)}
                          className="absolute -right-12 top-0 p-2 bg-white text-emerald-600 rounded-full shadow-md hover:bg-emerald-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Read aloud"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                  {selectedOption === 'plantDiagnosis' && !uploadedImagePreview && (
                    <div className="mb-3 flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium hover:bg-emerald-100 transition-colors"
                      >
                        <ImageIcon className="w-4 h-4" /> {t.upload}
                      </button>
                    </div>
                  )}

                  {uploadedImagePreview && (
                    <div className="mb-3 inline-flex items-center gap-3 bg-slate-50 p-2 pr-4 rounded-xl border border-slate-200">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                        <img src={uploadedImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm text-slate-600 truncate max-w-[150px]">{uploadedFile?.name}</span>
                      <button onClick={removeImage} className="text-slate-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-end gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                    <button
                      onClick={handleVoiceInput}
                      className={`p-3 rounded-xl flex-shrink-0 transition-colors ${
                        isListening
                          ? 'bg-red-100 text-red-600 animate-pulse'
                          : 'bg-white text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={t.voice}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={t.ask}
                      className="flex-1 max-h-32 min-h-[44px] bg-transparent border-0 focus:ring-0 resize-none p-3 text-slate-700 placeholder-slate-400 outline-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                    />
                    
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading || (!userInput.trim() && !uploadedFile)}
                      className="p-3 bg-emerald-600 text-white rounded-xl flex-shrink-0 hover:bg-emerald-700 transition-colors disabled:bg-slate-300 disabled:text-slate-500"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
