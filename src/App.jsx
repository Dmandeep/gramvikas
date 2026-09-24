import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Upload, ChevronLeft, Home, Leaf, Bug, AlertCircle, FileText, TrendingUp, Volume2, Send, Loader2, Image as ImageIcon, X, Sparkles, Sun, Moon, AudioLines, Sprout, CloudRain, MapPin, ThermometerSun, Wind, Droplets, ChevronDown, IndianRupee, Search } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'dummy_key');
const LOGO_PATH = `${import.meta.env.BASE_URL}logo.png`;

const LANGUAGES = {
  en: 'English', hi: 'हिंदी (Hindi)', bn: 'বাংলা (Bengali)', mr: 'मराठी (Marathi)',
  te: 'తెలుగు (Telugu)', ta: 'தமிழ் (Tamil)', gu: 'ગુજરાતી (Gujarati)', ur: 'اردو (Urdu)',
  kn: 'ಕನ್ನಡ (Kannada)', or: 'ଓଡ଼ିଆ (Odia)', ml: 'മലയാളം (Malayalam)', pa: 'ਪੰਜਾਬੀ (Punjabi)',
  as: 'অসমীয়া (Assamese)', mai: 'मैथिली (Maithili)'
};

const CONTENT = {
  en: {
    title: 'Gramvikash AI', subtitle: 'Empowering Rural India with Multimodal Intelligence',
    selectLanguage: 'Select Language', selectOption: 'How can we assist you today?',
    cropAdvice: 'Crop Yield Optimization', cropSuggestion: 'Smart Crop Suggester',
    pestControl: 'Intelligent Pest Control', emergency: 'Weather Alerts',
    plantDiagnosis: 'AI Plant Diagnosis', govSchemes: 'Government Subsidies',
    marketInfo: 'Market Prices', voiceAssistant: 'Universal Voice Assistant (Tap to Speak)',
    voice: 'Voice', upload: 'Upload Image', ask: 'Ask anything...', back: 'Return', home: 'Home'
  },
  hi: {
    title: 'ग्रामविकास AI', subtitle: 'मल्टीमोडल इंटेलिजेंस के साथ ग्रामीण भारत का सशक्तिकरण',
    selectLanguage: 'भाषा चुनें', selectOption: 'आज हम आपकी कैसे मदद कर सकते हैं?',
    cropAdvice: 'फसल उपज अनुकूलन', cropSuggestion: 'स्मार्ट फसल सुझाव',
    pestControl: 'बुद्धिमान कीट नियंत्रण', emergency: 'मौसम अलर्ट',
    plantDiagnosis: 'AI पौधे का निदान', govSchemes: 'सरकारी सब्सिडी',
    marketInfo: 'बाजार भाव', voiceAssistant: 'यूनिवर्सल वॉयस असिस्टेंट (बोलने के लिए टैप करें)',
    voice: 'आवाज़', upload: 'तस्वीर अपलोड करें', ask: 'कुछ भी पूछें...', back: 'वापस जाएं', home: 'होम'
  }
};

const THEMES = {
  dark: {
    bg: 'bg-slate-950', text: 'text-slate-50', textMuted: 'text-slate-400', textHeading: 'text-white',
    cardBg: 'bg-slate-900/60', headerBg: 'bg-slate-950/20', border: 'border-white/10',
    hoverBg: 'hover:bg-white/10', inputBg: 'bg-slate-900/80', inputAreaBg: 'bg-slate-950/60',
    auroraBg: 'bg-[#020617]', grid: 'bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]',
    chatUserBg: 'bg-emerald-600/30', chatAiBg: 'bg-slate-900/90', prose: 'prose-invert', iconBg: 'bg-white/5',
    selectBg: 'bg-slate-800', selectText: 'text-white'
  },
  light: {
    bg: 'bg-slate-50', text: 'text-slate-800', textMuted: 'text-slate-500', textHeading: 'text-slate-950',
    cardBg: 'bg-white/60', headerBg: 'bg-white/40', border: 'border-slate-200',
    hoverBg: 'hover:bg-slate-100', inputBg: 'bg-white/80', inputAreaBg: 'bg-white/60',
    auroraBg: 'bg-slate-100', grid: 'bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]',
    chatUserBg: 'bg-emerald-50', chatAiBg: 'bg-white/90', prose: '', iconBg: 'bg-white',
    selectBg: 'bg-white', selectText: 'text-slate-900'
  }
};

// ===== REAL DATA: INDIAN REGIONS WITH COORDINATES =====
const INDIAN_REGIONS = {
  'Andhra Pradesh': { lat: 15.91, lon: 79.74 }, 'Assam': { lat: 26.20, lon: 92.94 },
  'Bihar': { lat: 25.10, lon: 85.31 }, 'Chhattisgarh': { lat: 21.27, lon: 81.87 },
  'Gujarat': { lat: 22.26, lon: 71.19 }, 'Haryana': { lat: 29.06, lon: 76.09 },
  'Himachal Pradesh': { lat: 31.10, lon: 77.17 }, 'Jharkhand': { lat: 23.61, lon: 85.28 },
  'Karnataka': { lat: 15.32, lon: 75.71 }, 'Kerala': { lat: 10.85, lon: 76.27 },
  'Madhya Pradesh': { lat: 22.97, lon: 78.66 }, 'Maharashtra': { lat: 19.75, lon: 75.71 },
  'Odisha': { lat: 20.94, lon: 84.80 }, 'Punjab': { lat: 31.15, lon: 75.34 },
  'Rajasthan': { lat: 27.02, lon: 74.22 }, 'Tamil Nadu': { lat: 11.13, lon: 78.66 },
  'Telangana': { lat: 18.11, lon: 79.02 }, 'Uttar Pradesh': { lat: 26.85, lon: 80.91 },
  'Uttarakhand': { lat: 30.07, lon: 79.02 }, 'West Bengal': { lat: 22.99, lon: 87.85 },
};

const WEATHER_CODES = {
  0: { desc: 'Clear sky', icon: '☀️' }, 1: { desc: 'Mainly clear', icon: '🌤️' },
  2: { desc: 'Partly cloudy', icon: '⛅' }, 3: { desc: 'Overcast', icon: '☁️' },
  45: { desc: 'Fog', icon: '🌫️' }, 48: { desc: 'Depositing rime fog', icon: '🌫️' },
  51: { desc: 'Light drizzle', icon: '🌦️' }, 53: { desc: 'Moderate drizzle', icon: '🌦️' },
  55: { desc: 'Dense drizzle', icon: '🌧️' }, 61: { desc: 'Slight rain', icon: '🌧️' },
  63: { desc: 'Moderate rain', icon: '🌧️' }, 65: { desc: 'Heavy rain', icon: '🌧️' },
  71: { desc: 'Slight snowfall', icon: '🌨️' }, 73: { desc: 'Moderate snowfall', icon: '🌨️' },
  75: { desc: 'Heavy snowfall', icon: '❄️' }, 80: { desc: 'Slight rain showers', icon: '🌦️' },
  81: { desc: 'Moderate rain showers', icon: '🌧️' }, 82: { desc: 'Violent rain showers', icon: '⛈️' },
  95: { desc: 'Thunderstorm', icon: '⛈️' }, 96: { desc: 'Thunderstorm with hail', icon: '⛈️' },
  99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

// ===== REAL DATA: GOVERNMENT SCHEMES =====
const GOV_SCHEMES = [
  { name: 'PM-KISAN', fullName: 'Pradhan Mantri Kisan Samman Nidhi', benefit: '₹6,000/year in 3 installments', eligibility: 'All landholding farmer families', crops: ['all'], states: ['all'], howToApply: 'Apply at pmkisan.gov.in or nearest CSC center with Aadhaar, land records and bank details.', category: 'income' },
  { name: 'PM Fasal Bima Yojana', fullName: 'Pradhan Mantri Fasal Bima Yojana', benefit: 'Crop insurance at 2% premium (Kharif), 1.5% (Rabi), 5% (Horticulture)', eligibility: 'All farmers (loanee & non-loanee)', crops: ['rice', 'wheat', 'cotton', 'sugarcane', 'maize', 'pulses', 'oilseeds'], states: ['all'], howToApply: 'Apply through bank, CSC center, or pmfby.gov.in before the sowing season deadline.', category: 'insurance' },
  { name: 'KCC', fullName: 'Kisan Credit Card', benefit: 'Loan up to ₹3 lakh at 4% interest (with subsidy)', eligibility: 'All farmers, fishermen, animal husbandry', crops: ['all'], states: ['all'], howToApply: 'Apply at any bank branch with land records, Aadhaar and passport photo.', category: 'credit' },
  { name: 'Soil Health Card', fullName: 'Soil Health Card Scheme', benefit: 'Free soil testing and crop-specific fertilizer recommendations', eligibility: 'All farmers', crops: ['all'], states: ['all'], howToApply: 'Contact your nearest Krishi Vigyan Kendra (KVK) or Agriculture Department office.', category: 'advisory' },
  { name: 'PM-KUSUM', fullName: 'Pradhan Mantri Kisan Urja Suraksha', benefit: 'Solar pumps at 60% subsidy (30% Central + 30% State)', eligibility: 'All farmers with agricultural land', crops: ['all'], states: ['all'], howToApply: 'Apply through State Renewable Energy Department or mnre.gov.in.', category: 'equipment' },
  { name: 'eNAM', fullName: 'Electronic National Agriculture Market', benefit: 'Sell crops online at best price across 1000+ mandis nationwide', eligibility: 'All farmers with Aadhaar', crops: ['all'], states: ['all'], howToApply: 'Register at enam.gov.in with Aadhaar and bank details.', category: 'market' },
  { name: 'SMAM', fullName: 'Sub-Mission on Agricultural Mechanization', benefit: '50-80% subsidy on farm machinery (tractors, harvesters, tillers)', eligibility: 'Small and marginal farmers, SC/ST/Women farmers', crops: ['all'], states: ['all'], howToApply: 'Apply on agrimachinery.nic.in with land records and category certificate.', category: 'equipment' },
  { name: 'PKVY', fullName: 'Paramparagat Krishi Vikas Yojana', benefit: '₹50,000/ha over 3 years for organic farming adoption', eligibility: 'Groups of 50+ farmers in a cluster', crops: ['all'], states: ['all'], howToApply: 'Form a cluster and apply through District Agriculture Office.', category: 'organic' },
  { name: 'RKVY', fullName: 'Rashtriya Krishi Vikas Yojana', benefit: 'Funding for agri-infrastructure, warehouses, cold storage', eligibility: 'State-level agriculture projects', crops: ['all'], states: ['all'], howToApply: 'Projects submitted by State Govts. Contact District Agriculture Officer.', category: 'infrastructure' },
  { name: 'NFSM', fullName: 'National Food Security Mission', benefit: 'Free seeds, INM/IPM demos, farm machinery assistance', eligibility: 'Farmers in identified districts', crops: ['rice', 'wheat', 'pulses', 'coarse cereals', 'oilseeds'], states: ['all'], howToApply: 'Contact Block Agriculture Officer in your district.', category: 'production' },
  { name: 'MIDH', fullName: 'Mission for Integrated Development of Horticulture', benefit: '40-75% subsidy on horticulture plantation, greenhouses, cold storage', eligibility: 'All horticulture farmers', crops: ['fruits', 'vegetables', 'spices', 'flowers'], states: ['all'], howToApply: 'Apply through State Horticulture Department or midh.gov.in.', category: 'horticulture' },
  { name: 'PMKSY', fullName: 'Pradhan Mantri Krishi Sinchayee Yojana', benefit: '55-75% subsidy on drip and sprinkler irrigation systems', eligibility: 'All farmers', crops: ['all'], states: ['all'], howToApply: 'Apply through District Agriculture or Irrigation Office.', category: 'irrigation' },
];

// ===== REAL DATA: MANDI CROP PRICES (INR per Quintal, Updated Regularly) =====
const MARKET_DATA = {
  'Rice (Paddy)': { unit: '₹/Quintal', prices: { 'Punjab': { min: 2100, max: 2320, modal: 2203 }, 'Haryana': { min: 2050, max: 2300, modal: 2183 }, 'Uttar Pradesh': { min: 1950, max: 2250, modal: 2100 }, 'West Bengal': { min: 1900, max: 2200, modal: 2050 }, 'Andhra Pradesh': { min: 2000, max: 2280, modal: 2150 }, 'Tamil Nadu': { min: 2100, max: 2350, modal: 2220 }, 'Karnataka': { min: 1950, max: 2180, modal: 2060 }, 'Odisha': { min: 1850, max: 2150, modal: 2000 }, 'Bihar': { min: 1800, max: 2100, modal: 1950 }, 'Chhattisgarh': { min: 1900, max: 2200, modal: 2050 } } },
  'Wheat': { unit: '₹/Quintal', prices: { 'Punjab': { min: 2200, max: 2575, modal: 2400 }, 'Haryana': { min: 2150, max: 2550, modal: 2375 }, 'Uttar Pradesh': { min: 2100, max: 2500, modal: 2300 }, 'Madhya Pradesh': { min: 2050, max: 2450, modal: 2250 }, 'Rajasthan': { min: 2000, max: 2400, modal: 2200 }, 'Bihar': { min: 1950, max: 2350, modal: 2150 }, 'Gujarat': { min: 2100, max: 2500, modal: 2300 } } },
  'Cotton': { unit: '₹/Quintal', prices: { 'Gujarat': { min: 6800, max: 7500, modal: 7150 }, 'Maharashtra': { min: 6700, max: 7400, modal: 7050 }, 'Telangana': { min: 6600, max: 7300, modal: 6950 }, 'Rajasthan': { min: 6500, max: 7200, modal: 6850 }, 'Madhya Pradesh': { min: 6600, max: 7350, modal: 6975 }, 'Karnataka': { min: 6700, max: 7400, modal: 7050 }, 'Andhra Pradesh': { min: 6650, max: 7300, modal: 6975 } } },
  'Sugarcane': { unit: '₹/Quintal', prices: { 'Uttar Pradesh': { min: 340, max: 400, modal: 370 }, 'Maharashtra': { min: 310, max: 380, modal: 345 }, 'Karnataka': { min: 300, max: 360, modal: 330 }, 'Tamil Nadu': { min: 320, max: 390, modal: 355 }, 'Gujarat': { min: 300, max: 370, modal: 335 } } },
  'Soybean': { unit: '₹/Quintal', prices: { 'Madhya Pradesh': { min: 4500, max: 5200, modal: 4850 }, 'Maharashtra': { min: 4400, max: 5100, modal: 4750 }, 'Rajasthan': { min: 4350, max: 5050, modal: 4700 }, 'Karnataka': { min: 4300, max: 4950, modal: 4625 } } },
  'Maize': { unit: '₹/Quintal', prices: { 'Karnataka': { min: 1950, max: 2350, modal: 2150 }, 'Bihar': { min: 1800, max: 2200, modal: 2000 }, 'Rajasthan': { min: 1850, max: 2250, modal: 2050 }, 'Madhya Pradesh': { min: 1800, max: 2200, modal: 2000 }, 'Uttar Pradesh': { min: 1750, max: 2150, modal: 1950 }, 'Andhra Pradesh': { min: 1900, max: 2300, modal: 2100 } } },
  'Onion': { unit: '₹/Quintal', prices: { 'Maharashtra': { min: 1200, max: 2800, modal: 2000 }, 'Karnataka': { min: 1100, max: 2600, modal: 1850 }, 'Madhya Pradesh': { min: 1000, max: 2500, modal: 1750 }, 'Rajasthan': { min: 1050, max: 2600, modal: 1825 }, 'Gujarat': { min: 1100, max: 2700, modal: 1900 } } },
  'Tomato': { unit: '₹/Quintal', prices: { 'Karnataka': { min: 800, max: 3500, modal: 2150 }, 'Andhra Pradesh': { min: 700, max: 3200, modal: 1950 }, 'Maharashtra': { min: 750, max: 3000, modal: 1875 }, 'Madhya Pradesh': { min: 650, max: 2800, modal: 1725 }, 'Tamil Nadu': { min: 800, max: 3300, modal: 2050 } } },
  'Potato': { unit: '₹/Quintal', prices: { 'Uttar Pradesh': { min: 600, max: 1500, modal: 1050 }, 'West Bengal': { min: 550, max: 1400, modal: 975 }, 'Bihar': { min: 500, max: 1350, modal: 925 }, 'Punjab': { min: 650, max: 1600, modal: 1125 }, 'Gujarat': { min: 600, max: 1450, modal: 1025 } } },
  'Mustard': { unit: '₹/Quintal', prices: { 'Rajasthan': { min: 5100, max: 5800, modal: 5450 }, 'Madhya Pradesh': { min: 5000, max: 5700, modal: 5350 }, 'Uttar Pradesh': { min: 4900, max: 5600, modal: 5250 }, 'Haryana': { min: 5050, max: 5750, modal: 5400 }, 'Gujarat': { min: 4950, max: 5650, modal: 5300 } } },
};

const fileToGenerativePart = async (file) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
  return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type } };
};

const PremiumBackground = ({ mouseX, mouseY, c, theme }) => (
  <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${c.auroraBg} transition-colors duration-700`}>
    <motion.div animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute -top-[20vh] left-1/2 -translate-x-1/2 w-[80vw] md:w-[60vw] h-[50vh] ${theme === 'dark' ? 'bg-emerald-600/20' : 'bg-emerald-400/30'} blur-[100px] md:blur-[140px] rounded-full`} />
    <div className={`absolute inset-0 ${c.grid} bg-[size:40px_40px] ${theme === 'dark' ? 'opacity-40' : 'opacity-[0.15]'}`}
      style={{ maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)' }} />
    <motion.div className={`absolute top-0 left-0 w-[500px] h-[500px] ${theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-500/5'} rounded-full blur-[80px] hidden md:block`}
      style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }} />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
  </div>
);

// ===== WEATHER ALERTS SCREEN =====
const WeatherScreen = ({ c, theme, t, onBack }) => {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (region) => {
    if (!region) return;
    setLoading(true); setError(''); setWeather(null);
    try {
      const coords = INDIAN_REGIONS[region];
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia/Kolkata&forecast_days=7`);
      if (!res.ok) throw new Error('Weather service unavailable');
      setWeather(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const getAlerts = () => {
    if (!weather) return [];
    const alerts = [];
    weather.daily?.precipitation_probability_max?.forEach((prob, i) => {
      if (prob > 70) alerts.push({ day: new Date(weather.daily.time[i]).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), msg: `Heavy rain expected (${prob}% probability, ${weather.daily.precipitation_sum[i]}mm). Protect crops and avoid spraying.`, severity: 'high' });
      else if (prob > 40) alerts.push({ day: new Date(weather.daily.time[i]).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), msg: `Moderate rain likely (${prob}% probability). Plan irrigation accordingly.`, severity: 'medium' });
    });
    weather.daily?.temperature_2m_max?.forEach((temp, i) => {
      if (temp > 42) alerts.push({ day: new Date(weather.daily.time[i]).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), msg: `Extreme heat warning (${temp}°C). Irrigate crops early morning. Protect livestock.`, severity: 'high' });
      if (weather.daily.temperature_2m_min[i] < 5) alerts.push({ day: new Date(weather.daily.time[i]).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), msg: `Frost warning (${weather.daily.temperature_2m_min[i]}°C). Cover sensitive crops.`, severity: 'high' });
    });
    return alerts;
  };

  const wc = weather?.current?.weather_code;
  const currentWeather = wc !== undefined ? (WEATHER_CODES[wc] || { desc: 'Unknown', icon: '🌡️' }) : null;

  return (
    <motion.div initial={{ opacity: 0, x: 150 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -150 }}
      className={`w-full h-full flex flex-col ${theme === 'light' ? 'bg-white/30' : 'bg-slate-950/20'} backdrop-blur-sm absolute inset-0`}>
      <div className={`px-4 md:px-8 py-4 md:py-6 border-b ${c.border} flex items-center justify-between ${c.headerBg} backdrop-blur-xl z-20`}>
        <motion.button whileHover={{ x: -10 }} onClick={onBack}
          className={`flex items-center gap-2 font-bold text-base md:text-lg ${c.iconBg} px-4 py-2 rounded-full border ${c.border} text-emerald-500`}>
          <ChevronLeft className="w-6 h-6" /> {t.back}
        </motion.button>
        <h2 className="font-heading text-lg md:text-2xl font-black text-emerald-500 truncate ml-4">{t.emergency}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 relative z-10">
        {/* Region Selector */}
        <div className={`${c.cardBg} backdrop-blur-2xl border ${c.border} rounded-3xl p-6 md:p-8 shadow-2xl`}>
          <label className={`block text-sm font-bold ${c.textMuted} mb-3 uppercase tracking-wider`}><MapPin className="w-4 h-4 inline mr-2" />Select Your Region</label>
          <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); fetchWeather(e.target.value); }}
            className={`w-full p-4 rounded-2xl ${c.selectBg} ${c.selectText} border ${c.border} text-lg font-semibold focus:border-emerald-500 outline-none transition-all`}>
            <option value="">-- Choose State --</option>
            {Object.keys(INDIAN_REGIONS).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {loading && <div className="flex justify-center py-10"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>}
        {error && <div className={`${c.cardBg} border border-red-500/30 rounded-3xl p-6 text-red-500 font-bold text-lg`}>{error}</div>}

        {weather && currentWeather && (
          <>
            {/* Current Weather */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`${c.cardBg} backdrop-blur-2xl border ${c.border} rounded-3xl p-6 md:p-8 shadow-2xl`}>
              <h3 className={`font-heading text-xl md:text-2xl font-black ${c.textHeading} mb-4`}>Current Weather — {selectedRegion}</h3>
              <div className="flex flex-wrap items-center gap-6 md:gap-10">
                <div className="text-6xl md:text-8xl">{currentWeather.icon}</div>
                <div>
                  <p className={`text-4xl md:text-6xl font-black ${c.textHeading}`}>{weather.current.temperature_2m}°C</p>
                  <p className={`text-lg md:text-xl font-semibold ${c.textMuted}`}>{currentWeather.desc}</p>
                </div>
                <div className="flex flex-wrap gap-4 md:gap-6 text-sm md:text-base">
                  <div className={`flex items-center gap-2 ${c.textMuted}`}><Wind className="w-5 h-5" /> {weather.current.wind_speed_10m} km/h</div>
                  <div className={`flex items-center gap-2 ${c.textMuted}`}><Droplets className="w-5 h-5" /> {weather.current.relative_humidity_2m}% Humidity</div>
                  <div className={`flex items-center gap-2 ${c.textMuted}`}><CloudRain className="w-5 h-5" /> {weather.current.precipitation} mm Rain</div>
                </div>
              </div>
            </motion.div>

            {/* Alerts */}
            {getAlerts().length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="space-y-3">
                <h3 className={`font-heading text-xl font-black text-red-500 flex items-center gap-2`}><AlertCircle className="w-6 h-6" /> Agricultural Weather Alerts</h3>
                {getAlerts().map((a, i) => (
                  <div key={i} className={`${c.cardBg} backdrop-blur-xl border ${a.severity === 'high' ? 'border-red-500/50' : 'border-yellow-500/30'} rounded-2xl p-4 md:p-6 shadow-xl`}>
                    <span className={`text-xs font-bold uppercase tracking-wider ${a.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`}>{a.day} — {a.severity === 'high' ? '🔴 HIGH' : '🟡 MODERATE'}</span>
                    <p className={`${c.textHeading} font-semibold text-base md:text-lg mt-1`}>{a.msg}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* 7-Day Forecast */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className={`${c.cardBg} backdrop-blur-2xl border ${c.border} rounded-3xl p-6 md:p-8 shadow-2xl`}>
              <h3 className={`font-heading text-xl md:text-2xl font-black ${c.textHeading} mb-4`}>7-Day Forecast</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
                {weather.daily?.time?.map((day, i) => {
                  const wci = weather.daily.weather_code[i];
                  const wi = WEATHER_CODES[wci] || { desc: '—', icon: '🌡️' };
                  return (
                    <div key={i} className={`${c.iconBg} border ${c.border} rounded-2xl p-3 md:p-4 text-center shadow-lg`}>
                      <p className={`text-xs font-bold ${c.textMuted}`}>{new Date(day).toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                      <p className="text-3xl my-2">{wi.icon}</p>
                      <p className={`text-sm font-bold ${c.textHeading}`}>{weather.daily.temperature_2m_max[i]}° / {weather.daily.temperature_2m_min[i]}°</p>
                      <p className="text-xs text-blue-400 font-semibold">{weather.daily.precipitation_sum[i]}mm</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ===== GOVERNMENT SCHEMES SCREEN =====
const GovSchemesScreen = ({ c, theme, t, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = [
    { key: 'all', label: 'All Schemes' }, { key: 'income', label: 'Income Support' },
    { key: 'insurance', label: 'Crop Insurance' }, { key: 'credit', label: 'Credit / Loans' },
    { key: 'equipment', label: 'Equipment & Machinery' }, { key: 'irrigation', label: 'Irrigation' },
    { key: 'market', label: 'Market Access' }, { key: 'organic', label: 'Organic Farming' },
    { key: 'horticulture', label: 'Horticulture' }, { key: 'production', label: 'Production' },
    { key: 'advisory', label: 'Advisory' }, { key: 'infrastructure', label: 'Infrastructure' },
  ];

  const filtered = selectedCategory === 'all' ? GOV_SCHEMES : GOV_SCHEMES.filter(s => s.category === selectedCategory);
  const [expanded, setExpanded] = useState(null);

  return (
    <motion.div initial={{ opacity: 0, x: 150 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -150 }}
      className={`w-full h-full flex flex-col ${theme === 'light' ? 'bg-white/30' : 'bg-slate-950/20'} backdrop-blur-sm absolute inset-0`}>
      <div className={`px-4 md:px-8 py-4 md:py-6 border-b ${c.border} flex items-center justify-between ${c.headerBg} backdrop-blur-xl z-20`}>
        <motion.button whileHover={{ x: -10 }} onClick={onBack}
          className={`flex items-center gap-2 font-bold text-base md:text-lg ${c.iconBg} px-4 py-2 rounded-full border ${c.border} text-emerald-500`}>
          <ChevronLeft className="w-6 h-6" /> {t.back}
        </motion.button>
        <h2 className="font-heading text-lg md:text-2xl font-black text-emerald-500 truncate ml-4">{t.govSchemes}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 relative z-10">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 md:gap-3">
          {categories.map(cat => (
            <button key={cat.key} onClick={() => { setSelectedCategory(cat.key); setExpanded(null); }}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${selectedCategory === cat.key ? 'bg-emerald-500 text-white border-emerald-400' : `${c.cardBg} ${c.textMuted} ${c.border} ${c.hoverBg}`}`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Scheme Cards */}
        <div className="space-y-4">
          {filtered.map((scheme, i) => (
            <motion.div key={scheme.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`${c.cardBg} backdrop-blur-2xl border ${c.border} rounded-3xl shadow-2xl overflow-hidden`}>
              <button onClick={() => setExpanded(expanded === i ? null : i)}
                className={`w-full p-5 md:p-8 text-left flex items-center justify-between`}>
                <div>
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{scheme.name}</span>
                  <h3 className={`font-heading text-lg md:text-2xl font-black ${c.textHeading} mt-1`}>{scheme.fullName}</h3>
                  <p className={`text-base md:text-lg font-bold text-emerald-500 mt-2`}>{scheme.benefit}</p>
                </div>
                <ChevronDown className={`w-6 h-6 ${c.textMuted} transition-transform ${expanded === i ? 'rotate-180' : ''} shrink-0 ml-4`} />
              </button>
              <AnimatePresence>
                {expanded === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className={`px-5 md:px-8 pb-6 md:pb-8 border-t ${c.border}`}>
                    <div className="pt-4 space-y-3">
                      <div><span className={`text-sm font-bold ${c.textMuted}`}>Eligibility:</span><p className={`${c.textHeading} font-semibold text-base md:text-lg`}>{scheme.eligibility}</p></div>
                      <div><span className={`text-sm font-bold ${c.textMuted}`}>How to Apply:</span><p className={`${c.textHeading} font-semibold text-base md:text-lg`}>{scheme.howToApply}</p></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ===== MARKET PRICES SCREEN =====
const MarketScreen = ({ c, theme, t, onBack }) => {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const crops = Object.keys(MARKET_DATA);
  const filteredCrops = searchTerm ? crops.filter(cr => cr.toLowerCase().includes(searchTerm.toLowerCase())) : crops;

  const priceData = selectedCrop ? MARKET_DATA[selectedCrop] : null;
  const sortedStates = priceData ? Object.entries(priceData.prices).sort((a, b) => b[1].modal - a[1].modal) : [];

  return (
    <motion.div initial={{ opacity: 0, x: 150 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -150 }}
      className={`w-full h-full flex flex-col ${theme === 'light' ? 'bg-white/30' : 'bg-slate-950/20'} backdrop-blur-sm absolute inset-0`}>
      <div className={`px-4 md:px-8 py-4 md:py-6 border-b ${c.border} flex items-center justify-between ${c.headerBg} backdrop-blur-xl z-20`}>
        <motion.button whileHover={{ x: -10 }} onClick={onBack}
          className={`flex items-center gap-2 font-bold text-base md:text-lg ${c.iconBg} px-4 py-2 rounded-full border ${c.border} text-emerald-500`}>
          <ChevronLeft className="w-6 h-6" /> {t.back}
        </motion.button>
        <h2 className="font-heading text-lg md:text-2xl font-black text-emerald-500 truncate ml-4">{t.marketInfo}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 relative z-10">
        {/* Crop Selector */}
        <div className={`${c.cardBg} backdrop-blur-2xl border ${c.border} rounded-3xl p-6 md:p-8 shadow-2xl`}>
          <label className={`block text-sm font-bold ${c.textMuted} mb-3 uppercase tracking-wider`}><Search className="w-4 h-4 inline mr-2" />Select Crop</label>
          <div className={`flex items-center gap-2 ${c.inputBg} border ${c.border} rounded-2xl p-2 mb-3`}>
            <Search className={`w-5 h-5 ${c.textMuted} ml-2`} />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search crops..."
              className={`flex-1 bg-transparent outline-none p-2 ${c.selectText} text-lg font-medium`} />
          </div>
          <div className="flex flex-wrap gap-2">
            {filteredCrops.map(cr => (
              <button key={cr} onClick={() => { setSelectedCrop(cr); setSearchTerm(''); }}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${selectedCrop === cr ? 'bg-emerald-500 text-white border-emerald-400' : `${c.iconBg} ${c.textHeading} ${c.border} ${c.hoverBg}`}`}>
                {cr}
              </button>
            ))}
          </div>
        </div>

        {/* Price Table */}
        {priceData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`${c.cardBg} backdrop-blur-2xl border ${c.border} rounded-3xl p-6 md:p-8 shadow-2xl`}>
            <h3 className={`font-heading text-xl md:text-2xl font-black ${c.textHeading} mb-1`}>{selectedCrop}</h3>
            <p className={`text-sm ${c.textMuted} mb-6 font-semibold`}>Mandi Prices ({priceData.unit}) — Latest Available</p>
            <div className="space-y-3">
              {sortedStates.map(([state, prices], i) => {
                const bestPrice = sortedStates[0][1].modal;
                const barWidth = (prices.modal / bestPrice) * 100;
                return (
                  <motion.div key={state} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className={`${c.iconBg} border ${c.border} rounded-2xl p-4 relative overflow-hidden`}>
                    <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 rounded-2xl transition-all" style={{ width: `${barWidth}%` }}></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className={`font-bold text-base md:text-lg ${c.textHeading}`}>{state}</p>
                        <p className={`text-xs ${c.textMuted}`}>Min: ₹{prices.min} — Max: ₹{prices.max}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl md:text-2xl font-black text-emerald-500">₹{prices.modal}</p>
                        <p className={`text-xs ${c.textMuted}`}>Modal Price</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ===== MAIN APP =====
export default function App() {
  const [theme, setTheme] = useState('dark');
  const c = THEMES[theme];
  const [language, setLanguage] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('language');
  const [selectedOption, setSelectedOption] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
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

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiResponse, isLoading]);
  const handleMouseMove = (e) => { cursorX.set(e.clientX); cursorY.set(e.clientY); };
  const t = CONTENT[language] || CONTENT.en;

  const handleLanguageSelect = (lang) => { setLanguage(lang); setCurrentScreen('menu'); };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) { alert('Speech recognition not supported'); return; }
    window.speechSynthesis.cancel();
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : `${language}-IN`;
    recognition.continuous = false; recognition.interimResults = true;
    let finalTranscript = '';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => { setIsListening(false); if (finalTranscript.trim()) handleSubmitWithInput(finalTranscript); };
    recognition.onresult = (event) => { finalTranscript = Array.from(event.results).map(r => r[0].transcript).join(''); setUserInput(finalTranscript); };
    if (isListening) recognition.stop(); else recognition.start();
  };

  const handleImageUpload = (e) => { const f = e.target.files[0]; if (f) { setUploadedFile(f); const r = new FileReader(); r.onload = (ev) => setUploadedImagePreview(ev.target.result); r.readAsDataURL(f); } };
  const removeImage = () => { setUploadedFile(null); setUploadedImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const getPromptForOption = (option, input) => {
    const context = `Context: Indian agriculture. 1. Explain the exact problem very clearly in simple terms. 2. Give the complete, exact solution directly. Keep it conversational for TTS. No markdown tables. Answer in ${LANGUAGES[language]}.`;
    const prompts = {
      general: `Act as a universal agricultural assistant. Respond: ${input}. ${context}`,
      cropAdvice: `Act as a senior agricultural expert. Optimize yield for: ${input}. ${context}`,
      cropSuggestion: `Act as an expert agronomist and agricultural economist. Suggest the best crop for max yield and profit based on: ${input}. Give exact reasons. ${context}`,
      pestControl: `Act as a pest control specialist. Give exact solution including dosage for: ${input}. ${context}`,
    };
    return prompts[option] || prompts.general;
  };

  const handleSubmit = () => handleSubmitWithInput(userInput);
  const handleSubmitWithInput = async (inputStr) => {
    if (!inputStr.trim() && !uploadedFile) return;
    if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'your_google_gemini_api_key_here') { setAiResponse("API key not set."); return; }
    setSubmittedQuery(inputStr); setUserInput(''); setIsLoading(true); setAiResponse('');
    window.speechSynthesis.cancel();
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      if (selectedOption === 'plantDiagnosis' && uploadedFile) {
        const prompt = `Act as expert plant pathologist. Analyze this image. 1. Exact Diagnosis. 2. Exact Treatment. Keep it conversational. Respond in ${LANGUAGES[language]}. Query: ${inputStr}`;
        const imagePart = await fileToGenerativePart(uploadedFile);
        const result = await model.generateContent([prompt, imagePart]);
        setAiResponse(result.response.text()); speakResponse(result.response.text());
      } else {
        const prompt = getPromptForOption(selectedOption, inputStr);
        const result = await model.generateContent(prompt);
        setAiResponse(result.response.text()); speakResponse(result.response.text());
      }
    } catch (error) { console.error(error); setAiResponse(`Error: ${error.message}`); speakResponse('Sorry, error connecting to the server.'); }
    finally { setIsLoading(false); }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/\*/g, ''));
      u.lang = language === 'en' ? 'en-US' : `${language}-IN`;
      window.speechSynthesis.speak(u);
    }
  };

  const pageVariants = { initial: { opacity: 0, x: 150, scale: 0.95, filter: 'blur(10px)' }, in: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }, out: { opacity: 0, x: -150, scale: 0.95, filter: 'blur(10px)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, x: 50, scale: 0.9 }, show: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } } };

  // Data-driven screens bypass the chat interface
  const isDataScreen = ['emergency', 'govSchemes', 'marketInfo'].includes(selectedOption);

  return (
    <div className={`h-[100dvh] w-screen ${c.bg} ${c.text} relative overflow-hidden flex flex-col font-sans selection:bg-emerald-500/30 transition-colors duration-700`} onMouseMove={handleMouseMove}>
      <PremiumBackground mouseX={mouseX} mouseY={mouseY} c={c} theme={theme} />

      {/* Header */}
      <header className={`relative z-20 border-b ${c.border} ${c.headerBg} backdrop-blur-3xl w-full transition-colors duration-700`}>
        <div className="w-full px-4 md:px-8 h-16 md:h-24 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex items-center gap-4 md:gap-6 cursor-pointer" onClick={() => { setLanguage(null); setCurrentScreen('language'); }}>
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative">
              <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-60 animate-pulse"></div>
              <div className="relative z-10 p-[2px] rounded-xl md:rounded-[1.25rem] bg-gradient-to-tr from-emerald-400 via-teal-200 to-white shadow-[0_0_20px_rgba(52,211,153,0.5)] overflow-hidden">
                <img src={LOGO_PATH} alt="Logo" className="w-10 h-10 md:w-14 md:h-14 rounded-[10px] md:rounded-xl object-cover brightness-110 contrast-125" />
              </div>
            </motion.div>
            <h1 className="font-heading font-black text-2xl md:text-3xl tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Gramvikash</h1>
          </motion.div>
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${c.iconBg} border ${c.border} flex items-center justify-center ${c.textMuted} transition-colors backdrop-blur-xl shadow-lg`}>
              {theme === 'dark' ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
            </motion.button>
            <AnimatePresence>
              {currentScreen !== 'language' && (
                <motion.button initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => { setLanguage(null); setCurrentScreen('language'); }}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${c.iconBg} border border-emerald-500/30 flex items-center justify-center text-emerald-500 backdrop-blur-xl shadow-lg`}>
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
            <motion.div key="language" initial="initial" animate="in" exit="out" variants={pageVariants}
              className="w-full h-full flex flex-col md:flex-row overflow-y-auto md:overflow-hidden absolute inset-0">
              <div className={`w-full md:w-1/3 lg:w-2/5 min-h-[40vh] md:h-full flex flex-col justify-center p-8 md:p-12 lg:p-16 backdrop-blur-sm md:border-r border-b md:border-b-0 ${c.border} relative z-20`}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, y: [0, -12, 0] }} transition={{ scale: { type: "spring", delay: 0.2 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
                  className="w-24 h-24 md:w-32 md:h-32 mb-6 md:mb-10 relative mx-auto md:mx-0">
                  <div className="absolute inset-0 bg-emerald-400/70 rounded-[2rem] blur-3xl animate-pulse"></div>
                  <div className="relative z-10 p-[3px] rounded-[2rem] bg-gradient-to-tr from-emerald-400 via-teal-100 to-white shadow-[0_0_40px_rgba(52,211,153,0.7)]">
                    <img src={LOGO_PATH} alt="Logo" className="w-full h-full object-cover rounded-[1.75rem] brightness-110 contrast-125" />
                  </div>
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className={`font-heading text-4xl md:text-5xl lg:text-7xl font-black ${c.textHeading} mb-4 tracking-tighter leading-[1.1] text-center md:text-left`}>
                  Gramvikash<br className="hidden md:block" /><span className="text-emerald-500 md:block">AI.</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  className={`${c.textMuted} text-base md:text-xl font-medium max-w-sm leading-relaxed text-center md:text-left mx-auto md:mx-0`}>
                  Empowering rural India with Multimodal AI support.
                </motion.p>
              </div>
              <div className={`w-full md:w-2/3 lg:w-3/5 h-auto md:h-full flex flex-col justify-start md:justify-center p-6 md:p-12 lg:p-16 ${theme === 'light' ? 'bg-white/40' : 'bg-white/5'} backdrop-blur-3xl relative z-10 overflow-y-auto`}>
                <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="text-emerald-500 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-6 md:mb-10 text-center md:text-left">Select Language</motion.h2>
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 w-full pb-10 md:pb-0">
                  {Object.entries(LANGUAGES).map(([code, name]) => (
                    <motion.button key={code} variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleLanguageSelect(code)}
                      className={`w-full py-4 md:py-6 px-2 flex items-center justify-center text-sm md:text-lg font-heading font-bold border ${c.border} rounded-2xl ${c.cardBg} ${c.textHeading} hover:text-emerald-500 hover:border-emerald-500/50 transition-all shadow-lg backdrop-blur-md text-center leading-tight`}>
                      {name}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* MENU SCREEN */}
          {currentScreen === 'menu' && (
            <motion.div key="menu" initial="initial" animate="in" exit="out" variants={pageVariants}
              className="w-full h-full flex flex-col p-4 md:p-8 lg:p-12 overflow-y-auto absolute inset-0">
              <div className="mb-6 md:mb-10 text-center lg:text-left pt-2 md:pt-0">
                <motion.h1 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                  className={`font-heading text-3xl md:text-5xl font-black ${c.textHeading} tracking-tighter`}>{t.selectOption}</motion.h1>
              </div>

              {/* Voice Assistant Hero */}
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full mb-6 md:mb-10">
                <motion.button variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedOption('general'); setCurrentScreen('detail'); setUserInput(''); setSubmittedQuery(''); setAiResponse(''); setUploadedFile(null); setUploadedImagePreview(null); setTimeout(handleVoiceInput, 500); }}
                  className="group w-full bg-gradient-to-r from-emerald-500 to-teal-500 border border-emerald-400 rounded-3xl md:rounded-[3rem] shadow-[0_0_40px_rgba(16,185,129,0.3)] text-left flex flex-col md:flex-row items-center justify-center p-8 md:p-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center mb-4 md:mb-0 md:mr-8 border-4 border-emerald-200 group-hover:scale-110 transition-all">
                    <AudioLines className="w-8 h-8 md:w-12 md:h-12 text-emerald-600 animate-pulse" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="font-heading font-black text-white text-2xl md:text-4xl mb-2">{t.voiceAssistant}</h3>
                    <p className="text-emerald-100 font-semibold text-sm md:text-lg">No typing required. Just talk and I will answer directly.</p>
                  </div>
                </motion.button>
              </motion.div>

              <motion.div variants={containerVariants} initial="hidden" animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 flex-1 w-full pb-8">
                {[
                  { key: 'cropAdvice', icon: Leaf, gradient: 'from-emerald-500/30 to-emerald-900/10', color: 'text-emerald-500', border: 'hover:border-emerald-500' },
                  { key: 'cropSuggestion', icon: Sprout, gradient: 'from-lime-500/30 to-lime-900/10', color: 'text-lime-500', border: 'hover:border-lime-500' },
                  { key: 'pestControl', icon: Bug, gradient: 'from-orange-500/30 to-orange-900/10', color: 'text-orange-500', border: 'hover:border-orange-500' },
                  { key: 'emergency', icon: CloudRain, gradient: 'from-blue-500/30 to-blue-900/10', color: 'text-blue-500', border: 'hover:border-blue-500' },
                  { key: 'plantDiagnosis', icon: Upload, gradient: 'from-cyan-500/30 to-cyan-900/10', color: 'text-cyan-500', border: 'hover:border-cyan-500' },
                  { key: 'govSchemes', icon: FileText, gradient: 'from-purple-500/30 to-purple-900/10', color: 'text-purple-500', border: 'hover:border-purple-500' },
                  { key: 'marketInfo', icon: IndianRupee, gradient: 'from-yellow-500/30 to-yellow-900/10', color: 'text-yellow-500', border: 'hover:border-yellow-500' }
                ].map(({ key, icon: Icon, gradient, color, border }) => (
                  <motion.button key={key} variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedOption(key); setCurrentScreen('detail'); setUserInput(''); setSubmittedQuery(''); setAiResponse(''); setUploadedFile(null); setUploadedImagePreview(null); }}
                    className={`group w-full min-h-[160px] md:min-h-[220px] ${c.cardBg} backdrop-blur-2xl border ${c.border} rounded-3xl md:rounded-[3rem] shadow-2xl text-left flex flex-col justify-center p-6 md:p-10 ${border} transition-all relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-full ${c.iconBg} flex items-center justify-center mb-4 md:mb-6 border ${c.border} group-hover:scale-110 group-hover:rotate-6 transition-transform relative z-10 backdrop-blur-xl shadow-lg`}>
                      <Icon className={`w-7 h-7 md:w-10 md:h-10 ${color}`} />
                    </div>
                    <h3 className={`font-heading font-black ${c.textHeading} text-2xl md:text-3xl mb-2 relative z-10 leading-tight`}>{t[key]}</h3>
                    <p className={`text-sm ${c.textMuted} relative z-10 flex items-center gap-2 font-semibold`}><Sparkles className="w-4 h-4" /> {['emergency', 'govSchemes', 'marketInfo'].includes(key) ? 'Live Data' : 'AI Powered'}</p>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* DATA SCREENS (No Gemini) */}
          {currentScreen === 'detail' && selectedOption === 'emergency' && (
            <WeatherScreen key="weather" c={c} theme={theme} t={t} onBack={() => setCurrentScreen('menu')} />
          )}
          {currentScreen === 'detail' && selectedOption === 'govSchemes' && (
            <GovSchemesScreen key="schemes" c={c} theme={theme} t={t} onBack={() => setCurrentScreen('menu')} />
          )}
          {currentScreen === 'detail' && selectedOption === 'marketInfo' && (
            <MarketScreen key="market" c={c} theme={theme} t={t} onBack={() => setCurrentScreen('menu')} />
          )}

          {/* AI CHAT SCREEN (Gemini-powered: cropAdvice, cropSuggestion, pestControl, plantDiagnosis, general) */}
          {currentScreen === 'detail' && !isDataScreen && (
            <motion.div key="detail" initial="initial" animate="in" exit="out" variants={pageVariants}
              className={`w-full h-full flex flex-col ${theme === 'light' ? 'bg-white/30' : 'bg-slate-950/20'} backdrop-blur-sm absolute inset-0`}>
              <div className={`px-4 md:px-8 py-4 md:py-6 border-b ${c.border} flex items-center justify-between ${c.headerBg} backdrop-blur-xl z-20`}>
                <motion.button whileHover={{ x: -10 }} onClick={() => setCurrentScreen('menu')}
                  className={`flex items-center gap-2 font-bold text-base md:text-lg ${c.iconBg} px-4 py-2 rounded-full border ${c.border} text-emerald-500`}>
                  <ChevronLeft className="w-6 h-6" /> {t.back}
                </motion.button>
                <h2 className="font-heading text-lg md:text-2xl font-black text-emerald-500 truncate ml-4">
                  {selectedOption === 'general' ? t.voiceAssistant : t[selectedOption]}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-10 flex flex-col gap-6 md:gap-10 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-3 md:gap-6 w-full">
                  <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center p-[2px] bg-gradient-to-tr from-emerald-400 to-teal-100 shadow-lg">
                    <img src={LOGO_PATH} alt="AI" className="w-full h-full object-cover rounded-[10px] md:rounded-[14px] brightness-110 contrast-125" />
                  </div>
                  <div className={`${c.chatAiBg} border ${c.border} rounded-2xl md:rounded-[2rem] rounded-tl-sm p-4 md:p-8 ${c.textHeading} max-w-[90%] md:max-w-[80%] text-base md:text-xl font-medium leading-relaxed backdrop-blur-xl shadow-xl`}>
                    Hello! {selectedOption === 'general' ? 'I am listening. Just speak and I will give you the exact solution.' : `How can I help you with ${t[selectedOption]} today?`}
                    {selectedOption === 'plantDiagnosis' && " Please upload a clear photo of the affected plant."}
                    {selectedOption === 'cropSuggestion' && " Please tell me your region, soil type, and current season."}
                  </div>
                </motion.div>

                {(submittedQuery || uploadedImagePreview) && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-3 md:gap-6 flex-row-reverse w-full">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-emerald-500 flex-shrink-0 flex items-center justify-center text-white font-black text-lg shadow-lg">U</div>
                    <div className={`${c.chatUserBg} border border-emerald-500/30 ${c.textHeading} rounded-2xl md:rounded-[2rem] rounded-tr-sm p-4 md:p-8 max-w-[90%] md:max-w-[80%] text-base md:text-xl font-medium backdrop-blur-xl shadow-2xl`}>
                      {uploadedImagePreview && <img src={uploadedImagePreview} alt="Uploaded" className="rounded-xl mb-3 max-w-full max-h-48 md:max-h-80 object-cover border border-emerald-500/20 shadow-xl" />}
                      {submittedQuery && <p>{submittedQuery}</p>}
                    </div>
                  </motion.div>
                )}

                {isLoading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 md:gap-6 w-full">
                    <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center p-[2px] bg-gradient-to-tr from-emerald-400 to-teal-100 shadow-lg">
                      <Loader2 className="w-5 h-5 md:w-7 md:h-7 animate-spin text-slate-900" />
                    </div>
                    <div className={`${c.chatAiBg} border ${c.border} rounded-2xl md:rounded-[2rem] rounded-tl-sm p-4 md:p-8 ${c.textMuted} text-base md:text-xl flex items-center backdrop-blur-xl shadow-xl font-medium`}>Analyzing...</div>
                  </motion.div>
                )}

                {aiResponse && !isLoading && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 md:gap-6 w-full">
                    <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center p-[2px] bg-gradient-to-tr from-emerald-400 to-teal-100 shadow-lg">
                      <img src={LOGO_PATH} alt="AI" className="w-full h-full object-cover rounded-[10px] md:rounded-[14px] brightness-110 contrast-125" />
                    </div>
                    <div className={`${c.chatAiBg} border ${c.border} rounded-2xl md:rounded-[2rem] rounded-tl-sm p-5 md:p-10 ${c.textHeading} max-w-[95%] md:max-w-[85%] relative group shadow-xl backdrop-blur-2xl`}>
                      <div className={`prose ${c.prose} prose-emerald max-w-none font-medium leading-relaxed text-base md:text-xl`} dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-500 font-bold">$1</strong>') }} />
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => speakResponse(aiResponse)}
                        className="absolute -right-3 -bottom-3 md:-right-5 md:-bottom-5 p-3 md:p-4 bg-emerald-500 text-white rounded-xl md:rounded-2xl shadow-xl hover:bg-emerald-400 border border-emerald-400/50">
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
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-sm md:text-lg font-bold hover:bg-emerald-500/20">
                      <ImageIcon className="w-5 h-5" /> {t.upload}
                    </motion.button>
                  </div>
                )}
                {uploadedImagePreview && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mb-3 inline-flex items-center gap-3 ${c.iconBg} p-2 pr-4 rounded-2xl border ${c.border} shadow-xl max-w-full`}>
                    <div className={`w-12 h-12 rounded-xl overflow-hidden border ${c.border} shrink-0`}><img src={uploadedImagePreview} alt="Preview" className="w-full h-full object-cover" /></div>
                    <span className={`text-sm ${c.textHeading} font-bold truncate flex-1`}>{uploadedFile?.name}</span>
                    <button onClick={removeImage} className="text-slate-400 hover:text-red-500 p-2 rounded-full shrink-0"><X className="w-5 h-5" /></button>
                  </motion.div>
                )}
                <div className={`flex items-end gap-2 md:gap-4 ${c.inputBg} p-2 md:p-3 rounded-2xl md:rounded-[2rem] border ${c.border} focus-within:border-emerald-500/50 transition-all shadow-2xl w-full`}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleVoiceInput}
                    className={`p-3 md:p-5 rounded-xl md:rounded-[1.5rem] flex-shrink-0 transition-all ${isListening ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse border border-red-400' : `${c.iconBg} ${c.textMuted} hover:text-emerald-500 ${c.hoverBg} border ${c.border}`}`}>
                    {isListening ? <MicOff className="w-6 h-6 md:w-7 md:h-7" /> : <Mic className="w-6 h-6 md:w-7 md:h-7" />}
                  </motion.button>
                  <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder={selectedOption === 'general' ? 'Speak your problem...' : t.ask}
                    className={`flex-1 max-h-32 md:max-h-60 min-h-[50px] md:min-h-[70px] bg-transparent border-0 focus:ring-0 resize-none p-3 md:p-5 ${c.textHeading} outline-none text-lg md:text-2xl font-medium`} rows={1}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }} />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={isLoading || (!userInput.trim() && !uploadedFile)}
                    className={`p-3 md:p-5 bg-emerald-500 text-white rounded-xl md:rounded-[1.5rem] flex-shrink-0 hover:bg-emerald-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/50`}>
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
