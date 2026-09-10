// <stdin>
import React, { useState, useEffect } from "https://esm.sh/react@19.2.0";
import { Mic, MicOff, Upload, ChevronLeft, Home, Leaf, Bug, AlertCircle, FileText, TrendingUp, Volume2 } from "https://esm.sh/lucide-react?deps=react@19.2.0,react-dom@19.2.0";
var LANGUAGES = {
  en: "English",
  hi: "\u0939\u093F\u0902\u0926\u0940",
  pa: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40",
  ta: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD",
  te: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41",
  kn: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1"
};
var CONTENT = {
  en: {
    title: "Rural AI Assistant",
    selectLanguage: "Select Language",
    selectOption: "Select Assistance Type",
    cropAdvice: "Crop Loss Reduction",
    pestControl: "Pest Control Measures",
    emergency: "Emergency Response",
    plantDiagnosis: "Plant Diagnosis",
    govSchemes: "Government Schemes",
    marketInfo: "Market Demand",
    voice: "Voice Assistant",
    upload: "Upload Plant Image",
    ask: "Ask Question",
    back: "Back",
    home: "Home"
  },
  hi: {
    title: "\u0917\u094D\u0930\u093E\u092E\u0940\u0923 AI \u0938\u0939\u093E\u092F\u0915",
    selectLanguage: "\u092D\u093E\u0937\u093E \u091A\u0941\u0928\u0947\u0902",
    selectOption: "\u0938\u0939\u093E\u092F\u0924\u093E \u092A\u094D\u0930\u0915\u093E\u0930 \u091A\u0941\u0928\u0947\u0902",
    cropAdvice: "\u092B\u0938\u0932 \u0928\u0941\u0915\u0938\u093E\u0928 \u092E\u0947\u0902 \u0915\u092E\u0940",
    pestControl: "\u0915\u0940\u091F \u0928\u093F\u092F\u0902\u0924\u094D\u0930\u0923 \u0909\u092A\u093E\u092F",
    emergency: "\u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u092A\u094D\u0930\u0924\u093F\u0915\u094D\u0930\u093F\u092F\u093E",
    plantDiagnosis: "\u092A\u094C\u0927\u0947 \u0915\u093E \u0928\u093F\u0926\u093E\u0928",
    govSchemes: "\u0938\u0930\u0915\u093E\u0930\u0940 \u092F\u094B\u091C\u0928\u093E\u090F\u0902",
    marketInfo: "\u092C\u093E\u091C\u093E\u0930 \u092E\u093E\u0902\u0917",
    voice: "\u0906\u0935\u093E\u091C \u0938\u0939\u093E\u092F\u0915",
    upload: "\u092A\u094C\u0927\u0947 \u0915\u0940 \u0924\u0938\u094D\u0935\u0940\u0930 \u0905\u092A\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
    ask: "\u0938\u0935\u093E\u0932 \u092A\u0942\u091B\u0947\u0902",
    back: "\u0935\u093E\u092A\u0938",
    home: "\u0939\u094B\u092E"
  }
};
function RuralAIAssistant() {
  const [language, setLanguage] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("language");
  const [selectedOption, setSelectedOption] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const t = language ? CONTENT[language] : CONTENT.en;
  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setCurrentScreen("menu");
  };
  const handleVoiceInput = async () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in your browser");
      return;
    }
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === "en" ? "en-US" : `${language}-IN`;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join("");
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
      let prompt = "";
      let hasImage = false;
      if (selectedOption === "plantDiagnosis" && uploadedImage) {
        prompt = `Analyze this plant image and identify any diseases, nutrient deficiencies, or damage. Provide:
1. What is wrong with the plant
2. Possible causes
3. Treatment recommendations in ${LANGUAGES[language]}. User context: ${userInput}`;
        hasImage = true;
      } else {
        prompt = getPromptForOption(selectedOption, userInput);
      }
      const messages = hasImage ? [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image", dataUrl: uploadedImage, mimeType: "image/jpeg" }
        ]
      }] : [{ role: "user", content: prompt }];
      let fullResponse = "";
      for await (const chunk of hatch.chat({ messages })) {
        if (chunk.content) {
          fullResponse += chunk.content;
        }
      }
      setAiResponse(fullResponse);
      speakResponse(fullResponse);
    } catch (error) {
      setAiResponse("Error getting response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const speakResponse = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "en" ? "en-US" : `${language}-IN`;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };
  if (currentScreen === "language") {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8 flex items-center justify-center" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-md w-full" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-2xl shadow-xl p-8" }, /* @__PURE__ */ React.createElement("h1", { className: "text-4xl font-bold text-center text-green-700 mb-2" }, t.title), /* @__PURE__ */ React.createElement("p", { className: "text-center text-gray-600 mb-8" }, "Unified AI Rural Assistance"), /* @__PURE__ */ React.createElement("div", { className: "mb-8" }, /* @__PURE__ */ React.createElement("p", { className: "text-center text-sm font-semibold text-gray-700 mb-4" }, t.selectLanguage), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4" }, Object.entries(LANGUAGES).map(([code, name]) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: code,
        onClick: () => handleLanguageSelect(code),
        className: "p-4 border-2 border-green-300 rounded-lg hover:bg-green-100 transition text-center font-medium text-gray-800"
      },
      name
    )))))));
  }
  if (currentScreen === "menu") {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-2xl mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-2xl shadow-xl p-8 mb-6" }, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-bold text-green-700 mb-2" }, t.title), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, t.selectOption)), /* @__PURE__ */ React.createElement("div", { className: "grid gap-4 md:grid-cols-2" }, [
      { key: "cropAdvice", icon: Leaf, color: "bg-green-100 text-green-700" },
      { key: "pestControl", icon: Bug, color: "bg-orange-100 text-orange-700" },
      { key: "emergency", icon: AlertCircle, color: "bg-red-100 text-red-700" },
      { key: "plantDiagnosis", icon: Upload, color: "bg-blue-100 text-blue-700" },
      { key: "govSchemes", icon: FileText, color: "bg-purple-100 text-purple-700" },
      { key: "marketInfo", icon: TrendingUp, color: "bg-yellow-100 text-yellow-700" }
    ].map(({ key, icon: Icon, color }) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key,
        onClick: () => {
          setSelectedOption(key);
          setCurrentScreen("detail");
          setUserInput("");
          setAiResponse("");
          setUploadedImage(null);
        },
        className: `p-6 rounded-xl ${color} hover:shadow-lg transition text-left`
      },
      /* @__PURE__ */ React.createElement(Icon, { className: "w-8 h-8 mb-3" }),
      /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-lg" }, t[key])
    ))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentScreen("language"),
        className: "mt-8 w-full p-3 bg-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-300 transition flex items-center justify-center gap-2"
      },
      /* @__PURE__ */ React.createElement(Home, { className: "w-5 h-5" }),
      " ",
      t.selectLanguage
    )));
  }
  if (currentScreen === "detail") {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-2xl mx-auto" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentScreen("menu"),
        className: "mb-6 flex items-center gap-2 text-green-700 font-semibold hover:text-green-900"
      },
      /* @__PURE__ */ React.createElement(ChevronLeft, { className: "w-5 h-5" }),
      " ",
      t.back
    ), /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-2xl shadow-xl p-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-green-700 mb-6" }, t[selectedOption]), selectedOption === "plantDiagnosis" && /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-3" }, t.upload), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "file",
        accept: "image/*",
        onChange: handleImageUpload,
        className: "w-full p-3 border-2 border-dashed border-green-300 rounded-lg cursor-pointer"
      }
    ), uploadedImage && /* @__PURE__ */ React.createElement("img", { src: uploadedImage, alt: "Plant", className: "mt-4 max-h-64 rounded-lg" })), /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-3" }, t.ask), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: userInput,
        onChange: (e) => setUserInput(e.target.value),
        placeholder: `Describe your ${t[selectedOption].toLowerCase()}...`,
        className: "w-full p-4 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 resize-none h-32"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-4 mb-6" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleVoiceInput,
        className: `flex-1 p-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${isListening ? "bg-red-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"}`
      },
      isListening ? /* @__PURE__ */ React.createElement(MicOff, { className: "w-5 h-5" }) : /* @__PURE__ */ React.createElement(Mic, { className: "w-5 h-5" }),
      isListening ? "Stop Listening" : t.voice
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleSubmit,
        disabled: isLoading || !userInput.trim(),
        className: "flex-1 p-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
      },
      isLoading ? "Loading..." : "Get Advice"
    )), aiResponse && /* @__PURE__ */ React.createElement("div", { className: "bg-green-50 rounded-lg p-6 border-2 border-green-200" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-4" }, /* @__PURE__ */ React.createElement("h3", { className: "font-semibold text-green-700" }, "Response"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => speakResponse(aiResponse),
        className: "p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      },
      /* @__PURE__ */ React.createElement(Volume2, { className: "w-5 h-5" })
    )), /* @__PURE__ */ React.createElement("p", { className: "text-gray-800 whitespace-pre-wrap leading-relaxed" }, aiResponse)))));
  }
}
export {
  RuralAIAssistant as default
};
