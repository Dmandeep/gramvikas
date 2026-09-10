import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Upload, ChevronLeft, Home, Leaf, Bug, AlertCircle, FileText, TrendingUp, Volume2 } from 'lucide-react';

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
    title: 'Rural AI Assistant',
    selectLanguage: 'Select Language',
    selectOption: 'Select Assistance Type',
    cropAdvice: 'Crop Loss Reduction',
    pestControl: 'Pest Control Measures',
    emergency: 'Emergency Response',
    plantDiagnosis: 'Plant Diagnosis',
    govSchemes: 'Government Schemes',
    marketInfo: 'Market Demand',
    voice: 'Voice Assistant',
    upload: 'Upload Plant Image',
    ask: 'Ask Question',
    back: 'Back',
    home: 'Home'
  },
  hi: {
    title: 'ग्रामीण AI सहायक',
    selectLanguage: 'भाषा चुनें',
    selectOption: 'सहायता प्रकार चुनें',
    cropAdvice: 'फसल नुकसान में कमी',
    pestControl: 'कीट नियंत्रण उपाय',
    emergency: 'आपातकालीन प्रतिक्रिया',
    plantDiagnosis: 'पौधे का निदान',
    govSchemes: 'सरकारी योजनाएं',
    marketInfo: 'बाजार मांग',
    voice: 'आवाज सहायक',
    upload: 'पौधे की तस्वीर अपलोड करें',
    ask: 'सवाल पूछें',
    back: 'वापस',
    home: 'होम'
  }
};

export default function RuralAIAssistant() {
  const [language, setLanguage] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('language');
  const [selectedOption, setSelectedOption] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  const t = language ? CONTENT[language] : CONTENT.en;

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setCurrentScreen('menu');
  };

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in your browser');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : `${language}-IN`;

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
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPromptForOption = (option, input) => {
    const prompts = {
      cropAdvice: `As a agricultural expert, provide advice on reducing crop loss. User question: ${input}. Give specific, actionable advice suitable for Indian farmers.`,
      pestControl: `As a pest control expert, provide pest management solutions. User question: ${input}. Include organic and conventional methods.`,
      emergency: `As a disaster management expert for agriculture, provide emergency response guidance. User question: ${input}. Give immediate actionable steps.`,
      govSchemes: `As a government benefits advisor, explain Indian agricultural schemes and eligibility. User question: ${input}. Include eligibility criteria and application process.`,
      marketInfo: `As an agricultural market analyst, provide crop market demand and seasonal information. User question: ${input}. Include pricing and best seasons.`
    };
    return prompts[option] || input;
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    try {
      let prompt = '';
      let hasImage = false;

      if (selectedOption === 'plantDiagnosis' && uploadedImage) {
        prompt = `Analyze this plant image and identify any diseases, nutrient deficiencies, or damage. Provide:
1. What is wrong with the plant
2. Possible causes
3. Treatment recommendations in ${LANGUAGES[language]}. User context: ${userInput}`;
        hasImage = true;
      } else {
        prompt = getPromptForOption(selectedOption, userInput);
      }

      const messages = hasImage
        ? [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image', dataUrl: uploadedImage, mimeType: 'image/jpeg' }
            ]
          }]
        : [{ role: 'user', content: prompt }];

      let fullResponse = '';
      for await (const chunk of hatch.chat({ messages })) {
        if (chunk.content) {
          fullResponse += chunk.content;
        }
      }
      setAiResponse(fullResponse);
      speakResponse(fullResponse);
    } catch (error) {
      setAiResponse('Error getting response. Please try again.');
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

  if (currentScreen === 'language') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-4xl font-bold text-center text-green-700 mb-2">{t.title}</h1>
            <p className="text-center text-gray-600 mb-8">Unified AI Rural Assistance</p>
            
            <div className="mb-8">
              <p className="text-center text-sm font-semibold text-gray-700 mb-4">{t.selectLanguage}</p>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageSelect(code)}
                    className="p-4 border-2 border-green-300 rounded-lg hover:bg-green-100 transition text-center font-medium text-gray-800"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h1 className="text-3xl font-bold text-green-700 mb-2">{t.title}</h1>
            <p className="text-gray-600">{t.selectOption}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { key: 'cropAdvice', icon: Leaf, color: 'bg-green-100 text-green-700' },
              { key: 'pestControl', icon: Bug, color: 'bg-orange-100 text-orange-700' },
              { key: 'emergency', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
              { key: 'plantDiagnosis', icon: Upload, color: 'bg-blue-100 text-blue-700' },
              { key: 'govSchemes', icon: FileText, color: 'bg-purple-100 text-purple-700' },
              { key: 'marketInfo', icon: TrendingUp, color: 'bg-yellow-100 text-yellow-700' }
            ].map(({ key, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedOption(key);
                  setCurrentScreen('detail');
                  setUserInput('');
                  setAiResponse('');
                  setUploadedImage(null);
                }}
                className={`p-6 rounded-xl ${color} hover:shadow-lg transition text-left`}
              >
                <Icon className="w-8 h-8 mb-3" />
                <p className="font-semibold text-lg">{t[key]}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentScreen('language')}
            className="mt-8 w-full p-3 bg-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-300 transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" /> {t.selectLanguage}
          </button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'detail') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setCurrentScreen('menu')}
            className="mb-6 flex items-center gap-2 text-green-700 font-semibold hover:text-green-900"
          >
            <ChevronLeft className="w-5 h-5" /> {t.back}
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-green-700 mb-6">{t[selectedOption]}</h2>

            {selectedOption === 'plantDiagnosis' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t.upload}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-3 border-2 border-dashed border-green-300 rounded-lg cursor-pointer"
                />
                {uploadedImage && (
                  <img src={uploadedImage} alt="Plant" className="mt-4 max-h-64 rounded-lg" />
                )}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t.ask}
              </label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={`Describe your ${t[selectedOption].toLowerCase()}...`}
                className="w-full p-4 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 resize-none h-32"
              />
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={handleVoiceInput}
                className={`flex-1 p-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                {isListening ? 'Stop Listening' : t.voice}
              </button>

              <button
                onClick={handleSubmit}
                disabled={isLoading || !userInput.trim()}
                className="flex-1 p-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {isLoading ? 'Loading...' : 'Get Advice'}
              </button>
            </div>

            {aiResponse && (
              <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-green-700">Response</h3>
                  <button
                    onClick={() => speakResponse(aiResponse)}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
