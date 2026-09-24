import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Upload, ChevronLeft, Home, Leaf, Bug, AlertCircle, FileText, TrendingUp, Volume2, Send, Loader2, Image as ImageIcon, X, Sparkles, Sun, Moon, AudioLines } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

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
    title: 'Gramvikash AI',
    subtitle: 'Empowering Rural India with Multimodal Intelligence',
    selectLanguage: 'Select Language',
    selectOption: 'How can we assist you today?',
    cropAdvice: 'Crop Yield Optimization',
    pestControl: 'Intelligent Pest Control',
    emergency: 'Disaster Response',
    plantDiagnosis: 'AI Plant Diagnosis',
    govSchemes: 'Government Subsidies',
    marketInfo: 'Market Intelligence',
    voiceAssistant: 'Universal Voice Assistant (Tap to Speak)',
    voice: 'Voice',
    upload: 'Upload Image',
    ask: 'Ask anything...',
    back: 'Return',
    home: 'Home'
  },
  hi: {
    title: 'ग्रामविकास AI',
    subtitle: 'मल्टीमोडल इंटेलिजेंस के साथ ग्रामीण भारत का सशक्तिकरण',
    selectLanguage: 'भाषा चुनें',
    selectOption: 'आज हम आपकी कैसे मदद कर सकते हैं?',
    cropAdvice: 'फसल उपज अनुकूलन',
    pestControl: 'बुद्धिमान कीट नियंत्रण',
    emergency: 'आपदा प्रतिक्रिया',
    plantDiagnosis: 'AI पौधे का निदान',
    govSchemes: 'सरकारी सब्सिडी',
    marketInfo: 'बाजार खुफिया जानकारी',
    voiceAssistant: 'यूनिवर्सल वॉयस असिस्टेंट (बोलने के लिए टैप करें)',
    voice: 'आवाज़',
    upload: 'तस्वीर अपलोड करें',
    ask: 'कुछ भी पूछें...',
    back: 'वापस जाएं',
    home: 'होम'
  }
};

const THEMES = {
  dark: {
    bg: 'bg-slate-950',
    text: 'text-slate-50',
    textMuted: 'text-slate-400',
    textHeading: 'text-white',
    cardBg: 'bg-slate-900/60',
    headerBg: 'bg-slate-950/20',
    border: 'border-white/10',
    hoverBg: 'hover:bg-white/10',
    inputBg: 'bg-slate-900/80',
    inputAreaBg: 'bg-slate-950/60',
    auroraBg: 'bg-[#020617]',
    grid: 'bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]',
    accent: 'text-emerald-500',
    pulse: 'border-emerald-500/20',
    meteor: 'via-emerald-400',
    chatUserBg: 'bg-emerald-600/30',
    chatAiBg: 'bg-slate-900/90',
    prose: 'prose-invert',
    iconBg: 'bg-white/5'
  },
  light: {
    bg: 'bg-slate-50',
    text: 'text-slate-800',
    textMuted: 'text-slate-500',
    textHeading: 'text-slate-950',
    cardBg: 'bg-white/60',
    headerBg: 'bg-white/40',
    border: 'border-slate-200',
    hoverBg: 'hover:bg-slate-100',
    inputBg: 'bg-white/80',
    inputAreaBg: 'bg-white/60',
    auroraBg: 'bg-slate-100',
    grid: 'bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]',
    accent: 'text-emerald-600',
    pulse: 'border-emerald-500/20',
    meteor: 'via-emerald-500',
    chatUserBg: 'bg-emerald-50',
    chatAiBg: 'bg-white/90',
    prose: '',
    iconBg: 'bg-white'
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

// --- ULTRA-PREMIUM PRODUCTION BACKGROUND (Vercel/Linear Aesthetic) ---
const PremiumBackground = ({ mouseX, mouseY, c, theme }) => (
  <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${c.auroraBg} transition-colors duration-700`}>
    
    {/* 1. Ambient Top Glow (Subtle, elegant breathing light) */}
    <motion.div 
      animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute -top-[20vh] left-1/2 -translate-x-1/2 w-[80vw] md:w-[60vw] h-[50vh] ${theme === 'dark' ? 'bg-emerald-600/20' : 'bg-emerald-400/30'} blur-[100px] md:blur-[140px] rounded-full`}
    />

    {/* 2. Edge-Faded Architectural Grid */}
    <div 
      className={`absolute inset-0 ${c.grid} bg-[size:40px_40px] ${theme === 'dark' ? 'opacity-40' : 'opacity-[0.15]'}`}
      style={{
        maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)',
      }}
    />
    
    {/* 3. Interactive Mouse Spotlight (Subtle) */}
    <motion.div
      className={`absolute top-0 left-0 w-[500px] h-[500px] ${theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-500/5'} rounded-full blur-[80px] hidden md:block`}
      style={{
        x: mouseX,
        y: mouseY,
        translateX: '-50%',
        translateY: '-50%',
      }}
    />

    {/* 4. Film Grain for cinematic texture */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
  </div>
);

export default function App() {
  const [theme, setTheme] = useState('dark');
  const c = THEMES[theme];

  const [language, setLanguage] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('language'); 
  const [selectedOption, setSelectedOption] = useState(null);
  
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const chatEndRef = useRef(null);
  
  const cursorX = useMotionValue(-1000);
  const cursorY = useMotionValue(-1000);
  const springConfig = { damping: 25, stiffness: 150 };
  const mouseX = useSpring(cursorX, springConfig);
  const mouseY = useSpring(cursorY, springConfig);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiResponse, isLoading]);

  const handleMouseMove = (e) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
  };

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

    let finalTranscript = '';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      // Auto Submit for illiterate / zero-click users
      if (finalTranscript.trim() !== '') {
        handleSubmitWithInput(finalTranscript);
      }
    };
    
    recognition.onresult = (event) => {
      finalTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setUserInput(finalTranscript);
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
    const context = `Context: Indian agriculture. Keep the answer highly conversational, exactly like a human voice assistant. Give the exact solution and actionable advice directly. Do NOT use markdown tables or complex formatting as this will be read aloud by TTS. Keep it brief and precise. Answer in ${LANGUAGES[language]}.`;
    
    const prompts = {
      general: `Act as a universal agricultural assistant. Answer this query directly and provide an exact solution: ${input}. ${context}`,
      cropAdvice: `Act as a senior agricultural expert. Provide a highly specific, exact solution for optimizing yield or reducing crop loss based on this query: ${input}. ${context}`,
      pestControl: `Act as a pest control specialist for crops. Provide the exact organic or conventional management solution (including dosage if chemical) for this pest/issue: ${input}. ${context}`,
      emergency: `Act as an agricultural disaster management expert. Provide immediate, exact emergency response steps to minimize damage for: ${input}. ${context}`,
      govSchemes: `Act as an expert in Indian government agricultural schemes. Give the exact name of the relevant scheme and how to apply for: ${input}. ${context}`,
      marketInfo: `Act as an agricultural market analyst in India. Provide direct insights on pricing or where to sell for: ${input}. ${context}`
    };
    return prompts[option] || prompts.general;
  };

  const handleSubmit = () => {
    handleSubmitWithInput(userInput);
  }

  const handleSubmitWithInput = async (inputStr) => {
    if (!inputStr.trim() && !uploadedFile) return;

    if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'your_google_gemini_api_key_here') {
      setAiResponse("System configuration error: VITE_GEMINI_API_KEY is not set.");
      return;
    }

    setIsLoading(true);
    setAiResponse('');
    try {
      // Upgraded to gemini-flash-latest to ensure no 404s and the best, fastest model is selected
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      if (selectedOption === 'plantDiagnosis' && uploadedFile) {
        const prompt = `Act as an expert plant pathologist. Analyze this plant image and identify any diseases or pest damage. Provide: 1. Exact Diagnosis 2. Exact Treatment recommendations (organic and chemical). Keep it conversational and brief. Respond in ${LANGUAGES[language]}. User query: ${inputStr}`;
        const imagePart = await fileToGenerativePart(uploadedFile);
        
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        setAiResponse(response.text());
        speakResponse(response.text());
      } else {
        const prompt = getPromptForOption(selectedOption, inputStr);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        setAiResponse(response.text());
        speakResponse(response.text());
      }
    } catch (error) {
      console.error(error);
      setAiResponse(`API Error: ${error.message}. Please check your API key and internet connection.`);
      speakResponse(`Sorry, I encountered an error connecting to the intelligence server.`);
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

  const pageVariants = {
    initial: { opacity: 0, x: 150, scale: 0.95, filter: 'blur(10px)' },
    in: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
    out: { opacity: 0, x: -150, scale: 0.95, filter: 'blur(10px)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.9 },
    show: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  return (
    <div 
      className={`h-[100dvh] w-screen ${c.bg} ${c.text} relative overflow-hidden flex flex-col font-sans selection:bg-emerald-500/30 transition-colors duration-700`}
      onMouseMove={handleMouseMove}
    >
      <PremiumBackground mouseX={mouseX} mouseY={mouseY} c={c} theme={theme} />

      {/* Header */}
      <header className={`relative z-20 border-b ${c.border} ${c.headerBg} backdrop-blur-3xl w-full transition-colors duration-700`}>
        <div className="w-full px-4 md:px-8 h-16 md:h-24 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex items-center gap-4 md:gap-6 cursor-pointer"
            onClick={() => {
              setLanguage(null);
              setCurrentScreen('language');
            }}
          >
            <motion.div 
              animate={{ y: [0, -4, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-60 animate-pulse"></div>
              <div className="relative z-10 p-[2px] rounded-xl md:rounded-[1.25rem] bg-gradient-to-tr from-emerald-400 via-teal-200 to-white shadow-[0_0_20px_rgba(52,211,153,0.5)] overflow-hidden">
                <img src="/logo.png" alt="Gramvikash Logo" className="w-10 h-10 md:w-14 md:h-14 rounded-[10px] md:rounded-xl object-cover brightness-110 contrast-125" />
              </div>
            </motion.div>
            
            <h1 className={`font-heading font-black text-2xl md:text-3xl tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent drop-shadow-sm`}>
              Gramvikash
            </h1>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${c.iconBg} border ${c.border} flex items-center justify-center ${c.textMuted} hover:${c.textHeading} transition-colors backdrop-blur-xl shadow-lg`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
            </motion.button>

            <AnimatePresence>
              {currentScreen !== 'language' && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setLanguage(null);
                    setCurrentScreen('language');
                  }}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${c.iconBg} border border-emerald-500/30 flex items-center justify-center text-emerald-500 hover:text-emerald-400 transition-colors backdrop-blur-xl shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]`}
                >
                  <Home className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 w-full h-[calc(100dvh-4rem)] md:h-[calc(100dvh-6rem)] flex overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* LANGUAGE SCREEN */}
          {currentScreen === 'language' && (
            <motion.div 
              key="language"
              initial="initial" animate="in" exit="out" variants={pageVariants}
              className="w-full h-full flex flex-col md:flex-row overflow-y-auto md:overflow-hidden absolute inset-0"
            >
              <div className={`w-full md:w-1/2 min-h-[50vh] md:h-full flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-gradient-to-b md:bg-gradient-to-r from-${theme === 'dark' ? 'slate-950/80' : 'slate-50/80'} to-transparent backdrop-blur-sm md:border-r border-b md:border-b-0 ${c.border} relative z-10 transition-colors duration-700`}>
                <motion.div 
                  initial={{ scale: 0, rotate: -20 }} 
                  animate={{ scale: 1, rotate: 0, y: [0, -12, 0] }} 
                  transition={{ 
                    scale: { type: "spring", delay: 0.2 },
                    rotate: { type: "spring", delay: 0.2 },
                    y: { duration: 5, repeat: Infinity, ease: "easeInOut" } 
                  }} 
                  className="w-32 h-32 md:w-48 md:h-48 mb-8 md:mb-12 relative mx-auto md:mx-0"
                >
                  <div className="absolute inset-0 bg-emerald-400/70 rounded-[3rem] blur-3xl animate-pulse"></div>
                  <div className={`relative z-10 p-[3px] rounded-[3rem] bg-gradient-to-tr from-emerald-400 via-teal-100 to-white shadow-[0_0_50px_rgba(52,211,153,0.7)]`}>
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-[2.75rem] brightness-110 contrast-125" />
                  </div>
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`font-heading text-5xl md:text-6xl lg:text-8xl font-black ${c.textHeading} mb-4 md:mb-6 tracking-tighter leading-[1.1] text-center md:text-left drop-shadow-xl transition-colors duration-700`}>
                  Rural<br className="hidden md:block"/><span className="text-emerald-500 md:block drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">Intelligence.</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className={`${c.textMuted} text-lg md:text-2xl font-medium max-w-xl leading-relaxed text-center md:text-left mx-auto md:mx-0 transition-colors duration-700`}>
                  {t.subtitle}
                </motion.p>
              </div>
              
              <div className={`w-full md:w-1/2 min-h-[50vh] md:h-full flex flex-col justify-start md:justify-center p-8 md:p-16 lg:p-24 ${theme==='light' ? 'bg-white/40' : 'bg-white/5'} backdrop-blur-3xl relative z-10 transition-colors duration-700`}>
                <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-emerald-500 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-8 md:mb-12 text-center md:text-left drop-shadow-md">{t.selectLanguage}</motion.h2>
                <motion.div 
                  variants={containerVariants} initial="hidden" animate="show"
                  className="grid grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 w-full"
                >
                  {Object.entries(LANGUAGES).map(([code, name]) => (
                    <motion.button
                      key={code}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLanguageSelect(code)}
                      className={`w-full py-6 md:py-8 flex items-center justify-center text-xl md:text-2xl lg:text-3xl font-heading font-bold border ${c.border} rounded-2xl md:rounded-[2rem] ${c.cardBg} ${c.textHeading} hover:text-emerald-500 hover:border-emerald-500/50 transition-all shadow-xl backdrop-blur-md`}
                    >
                      {name}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* MENU SCREEN */}
          {currentScreen === 'menu' && (
            <motion.div 
              key="menu"
              initial="initial" animate="in" exit="out" variants={pageVariants}
              className="w-full h-full flex flex-col p-4 md:p-8 lg:p-12 overflow-y-auto custom-scrollbar absolute inset-0"
            >
              <div className="mb-6 md:mb-10 text-center lg:text-left pt-2 md:pt-0">
                <motion.h1 
                  initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                  className={`font-heading text-3xl md:text-5xl font-black ${c.textHeading} tracking-tighter`}
                >
                  {t.selectOption}
                </motion.h1>
              </div>

              {/* UNIVERSAL VOICE ASSISTANT HERO BUTTON */}
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full mb-6 md:mb-10">
                 <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedOption('general');
                      setCurrentScreen('detail');
                      setUserInput('');
                      setAiResponse('');
                      setUploadedFile(null);
                      setUploadedImagePreview(null);
                      // Auto start listening on click for extreme accessibility
                      setTimeout(handleVoiceInput, 500); 
                    }}
                    className={`group w-full bg-gradient-to-r from-emerald-500 to-teal-500 border border-emerald-400 rounded-3xl md:rounded-[3rem] shadow-[0_0_40px_rgba(16,185,129,0.3)] text-left flex flex-col md:flex-row items-center justify-center p-8 md:p-12 transition-all relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center mb-4 md:mb-0 md:mr-8 border-4 border-emerald-200 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-all duration-500">
                      <AudioLines className="w-8 h-8 md:w-12 md:h-12 text-emerald-600 animate-pulse" />
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="font-heading font-black text-white text-2xl md:text-4xl mb-2 drop-shadow-md">{t.voiceAssistant}</h3>
                      <p className="text-emerald-100 font-semibold text-sm md:text-lg">No typing required. Just talk and I will answer directly.</p>
                    </div>
                  </motion.button>
              </motion.div>

              <motion.div 
                variants={containerVariants} initial="hidden" animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 flex-1 w-full pb-8"
              >
                {[
                  { key: 'cropAdvice', icon: Leaf, gradient: 'from-emerald-500/30 to-emerald-900/10', color: 'text-emerald-500', border: 'hover:border-emerald-500' },
                  { key: 'pestControl', icon: Bug, gradient: 'from-orange-500/30 to-orange-900/10', color: 'text-orange-500', border: 'hover:border-orange-500' },
                  { key: 'emergency', icon: AlertCircle, gradient: 'from-red-500/30 to-red-900/10', color: 'text-red-500', border: 'hover:border-red-500' },
                  { key: 'plantDiagnosis', icon: Upload, gradient: 'from-blue-500/30 to-blue-900/10', color: 'text-blue-500', border: 'hover:border-blue-500' },
                  { key: 'govSchemes', icon: FileText, gradient: 'from-purple-500/30 to-purple-900/10', color: 'text-purple-500', border: 'hover:border-purple-500' },
                  { key: 'marketInfo', icon: TrendingUp, gradient: 'from-yellow-500/30 to-yellow-900/10', color: 'text-yellow-500', border: 'hover:border-yellow-500' }
                ].map(({ key, icon: Icon, gradient, color, border }) => (
                  <motion.button
                    key={key}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedOption(key);
                      setCurrentScreen('detail');
                      setUserInput('');
                      setAiResponse('');
                      setUploadedFile(null);
                      setUploadedImagePreview(null);
                    }}
                    className={`group w-full min-h-[160px] md:min-h-[220px] lg:h-full ${c.cardBg} backdrop-blur-2xl border ${c.border} rounded-3xl md:rounded-[3rem] shadow-2xl text-left flex flex-col justify-center p-6 md:p-10 ${border} transition-all relative overflow-hidden`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-full ${c.iconBg} flex items-center justify-center mb-4 md:mb-6 border ${c.border} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 relative z-10 backdrop-blur-xl shadow-lg`}>
                      <Icon className={`w-7 h-7 md:w-10 md:h-10 ${color}`} />
                    </div>
                    <h3 className={`font-heading font-black ${c.textHeading} text-2xl md:text-3xl mb-2 md:mb-3 relative z-10 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-500 transition-all`}>{t[key]}</h3>
                    <p className={`text-sm md:text-base ${c.textMuted} relative z-10 flex items-center gap-2 md:gap-3 group-hover:${c.textHeading} transition-colors font-semibold`}>
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 group-hover:animate-pulse" /> Start Analysis
                    </p>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* DETAIL/CHAT SCREEN */}
          {currentScreen === 'detail' && (
            <motion.div 
              key="detail"
              initial="initial" animate="in" exit="out" variants={pageVariants}
              className={`w-full h-full flex flex-col ${theme==='light'?'bg-white/30':'bg-slate-950/20'} backdrop-blur-sm absolute inset-0`}
            >
              <div className={`px-4 md:px-8 py-4 md:py-6 border-b ${c.border} flex items-center justify-between ${c.headerBg} backdrop-blur-xl z-20`}>
                <motion.button
                  whileHover={{ x: -10 }}
                  onClick={() => setCurrentScreen('menu')}
                  className={`flex items-center gap-2 text-emerald-600 dark:text-emerald-100 font-bold hover:text-emerald-500 transition-colors text-base md:text-lg ${c.iconBg} px-4 py-2 rounded-full border ${c.border} hover:${c.hoverBg}`}
                >
                  <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" /> {t.back}
                </motion.button>
                <h2 className="font-heading text-lg md:text-2xl font-black text-emerald-500 tracking-tight truncate ml-4 drop-shadow-sm">
                  {selectedOption === 'general' ? t.voiceAssistant : t[selectedOption]}
                </h2>
              </div>

              {/* Chat History Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-10 flex flex-col gap-6 md:gap-10 custom-scrollbar relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-3 md:gap-6 w-full">
                  <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center p-[2px] bg-gradient-to-tr from-emerald-400 to-teal-100 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    <img src="/logo.png" alt="AI" className="w-full h-full object-cover rounded-[10px] md:rounded-[14px] brightness-110 contrast-125" />
                  </div>
                  <div className={`${c.chatAiBg} border ${c.border} rounded-2xl md:rounded-[2rem] rounded-tl-sm md:rounded-tl-lg p-4 md:p-8 ${c.textHeading} max-w-[90%] md:max-w-[80%] text-base md:text-xl font-medium leading-relaxed backdrop-blur-xl shadow-xl`}>
                    Hello! {selectedOption === 'general' ? 'I am listening. Just speak and I will give you the exact solution.' : `How can I help you with ${t[selectedOption]} today?`}
                    {selectedOption === 'plantDiagnosis' && " Please upload a clear photo of the affected plant."}
                  </div>
                </motion.div>

                {(userInput || uploadedImagePreview) && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-3 md:gap-6 flex-row-reverse w-full">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-emerald-500 flex-shrink-0 flex items-center justify-center text-white font-black text-lg md:text-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/30">
                      U
                    </div>
                    <div className={`${c.chatUserBg} border border-emerald-500/30 ${c.textHeading} rounded-2xl md:rounded-[2rem] rounded-tr-sm md:rounded-tr-lg p-4 md:p-8 max-w-[90%] md:max-w-[80%] text-base md:text-xl font-medium backdrop-blur-xl shadow-2xl`}>
                      {uploadedImagePreview && (
                        <img src={uploadedImagePreview} alt="Uploaded" className="rounded-xl md:rounded-2xl mb-3 md:mb-5 max-w-full max-h-48 md:max-h-80 object-cover border border-emerald-500/20 shadow-xl" />
                      )}
                      {userInput && <p>{userInput}</p>}
                    </div>
                  </motion.div>
                )}

                {isLoading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 md:gap-6 w-full">
                    <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center p-[2px] bg-gradient-to-tr from-emerald-400 to-teal-100 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                       <Loader2 className="w-5 h-5 md:w-7 md:h-7 animate-spin text-slate-900" />
                    </div>
                    <div className={`${c.chatAiBg} border ${c.border} rounded-2xl md:rounded-[2rem] rounded-tl-sm md:rounded-tl-lg p-4 md:p-8 ${c.textMuted} text-base md:text-xl flex items-center backdrop-blur-xl shadow-xl font-medium`}>
                      Generating exact solution...
                    </div>
                  </motion.div>
                )}

                {aiResponse && !isLoading && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 md:gap-6 w-full">
                    <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center p-[2px] bg-gradient-to-tr from-emerald-400 to-teal-100 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                      <img src="/logo.png" alt="AI" className="w-full h-full object-cover rounded-[10px] md:rounded-[14px] brightness-110 contrast-125" />
                    </div>
                    <div className={`${c.chatAiBg} border ${c.border} rounded-2xl md:rounded-[2rem] rounded-tl-sm md:rounded-tl-lg p-5 md:p-10 ${c.textHeading} max-w-[95%] md:max-w-[85%] relative group shadow-[0_0_30px_rgba(16,185,129,0.1)] backdrop-blur-2xl`}>
                      <div className={`prose ${c.prose} prose-emerald max-w-none font-medium leading-relaxed text-base md:text-xl`} dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-500 font-bold">$1</strong>') }} />
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: -10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => speakResponse(aiResponse)}
                        className="absolute -right-3 -bottom-3 md:-right-5 md:-bottom-5 p-3 md:p-4 bg-emerald-500 text-white rounded-xl md:rounded-2xl shadow-xl hover:bg-emerald-400 transition-colors border border-emerald-400/50"
                      >
                        <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} className="h-4 md:h-10 shrink-0" />
              </div>

              {/* Input Dock */}
              <div className={`p-4 md:p-8 ${c.inputAreaBg} border-t ${c.border} relative z-20 backdrop-blur-3xl w-full mt-auto pb-safe shadow-[0_-20px_40px_rgba(0,0,0,0.1)]`}>
                {selectedOption === 'plantDiagnosis' && !uploadedImagePreview && (
                  <div className="mb-3 md:mb-5">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" ref={fileInputRef} />
                    <motion.button 
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center md:justify-start gap-2 md:gap-3 w-full md:w-auto px-6 py-3 md:py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl md:rounded-2xl text-sm md:text-lg font-bold hover:bg-emerald-500/20 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    >
                      <ImageIcon className="w-5 h-5 md:w-6 md:h-6" /> {t.upload}
                    </motion.button>
                  </div>
                )}

                {uploadedImagePreview && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mb-3 md:mb-5 inline-flex items-center gap-3 md:gap-5 ${c.iconBg} p-2 pr-4 md:pr-5 rounded-2xl border ${c.border} shadow-xl max-w-full backdrop-blur-xl`}>
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden border ${c.border} shrink-0`}>
                      <img src={uploadedImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className={`text-sm md:text-lg ${c.textHeading} font-bold truncate flex-1`}>{uploadedFile?.name}</span>
                    <button onClick={removeImage} className={`text-slate-400 hover:text-red-500 transition-colors p-2 ${c.hoverBg} rounded-full shrink-0`}>
                      <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </motion.div>
                )}

                <div className={`flex items-end gap-2 md:gap-4 ${c.inputBg} p-2 md:p-3 rounded-2xl md:rounded-[2rem] border ${c.border} focus-within:border-emerald-500/50 transition-all shadow-2xl w-full`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleVoiceInput}
                    className={`p-3 md:p-5 rounded-xl md:rounded-[1.5rem] flex-shrink-0 transition-all ${
                      isListening
                        ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse border border-red-400'
                        : `${c.iconBg} ${c.textMuted} hover:text-emerald-500 ${c.hoverBg} border ${c.border}`
                    }`}
                  >
                    {isListening ? <MicOff className="w-6 h-6 md:w-7 md:h-7" /> : <Mic className="w-6 h-6 md:w-7 md:h-7" />}
                  </motion.button>
                  
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={selectedOption === 'general' ? 'Speak your problem directly...' : t.ask}
                    className={`flex-1 max-h-32 md:max-h-60 min-h-[50px] md:min-h-[70px] bg-transparent border-0 focus:ring-0 resize-none p-3 md:p-5 ${c.textHeading} placeholder-${theme==='dark'?'slate-500':'slate-400'} outline-none text-lg md:text-2xl font-medium`}
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={isLoading || (!userInput.trim() && !uploadedFile)}
                    className={`p-3 md:p-5 bg-emerald-500 text-white rounded-xl md:rounded-[1.5rem] flex-shrink-0 hover:bg-emerald-400 transition-all disabled:${c.iconBg} disabled:text-slate-400 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:shadow-none border border-emerald-400/50 disabled:${c.border}`}
                  >
                    <Send className="w-6 h-6 md:w-7 md:h-7" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
