import { useState, useEffect, useRef, FormEvent, MouseEvent, TouchEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors, MapPin, Clock, Phone, Instagram, Facebook, Menu, X, ChevronRight, Globe, MessageSquare, Send, Bot, User, Loader2, TrendingUp, Coins, Sun, Cloud, CloudRain, Wind, Thermometer, Upload, Camera, RefreshCw, Trash2 } from 'lucide-react';
import { translations, Language } from './translations';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function BeforeAfterSlider({ before, after, tBefore, tAfter }: { before: string, after: string, tBefore: string, tAfter: string }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const position = ((clientX - container.left) / container.width) * 100;
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => isResizing && handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => isResizing && handleMove(e.touches[0].clientX);
    const onUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchend', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [isResizing]);

  return (
    <div 
      ref={containerRef}
      className="relative aspect-square rounded-2xl overflow-hidden cursor-ew-resize select-none border border-white/10"
      onMouseDown={() => setIsResizing(true)}
      onTouchStart={() => setIsResizing(true)}
    >
      <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img 
          src={before} 
          alt="Before" 
          className="absolute inset-0 h-full object-cover max-w-none" 
          style={{ width: containerWidth || '100%' }} 
          referrerPolicy="no-referrer" 
        />
      </div>
      
      {/* Slider Handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-orange-500 cursor-ew-resize pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/50">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-black rounded-full" />
            <div className="w-1 h-4 bg-black rounded-full" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 pointer-events-none">
        {tBefore}
      </div>
      <div className="absolute top-4 right-4 px-3 py-1 bg-orange-500 text-black rounded-full text-[10px] font-bold uppercase tracking-widest pointer-events-none">
        {tAfter}
      </div>
    </div>
  );
}

function Weather({ title }: { title: string }) {
  const [weather, setWeather] = useState<{ temp: number, code: number } | null>(null);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=40.7686&longitude=73.3000&current_weather=true')
      .then(res => res.json())
      .then(data => {
        if (data && data.current_weather) {
          setWeather({
            temp: data.current_weather.temperature,
            code: data.current_weather.weathercode
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!weather) return null;

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun className="w-4 h-4 text-yellow-500" />;
    if (code <= 3) return <Cloud className="w-4 h-4 text-white/60" />;
    if (code >= 51) return <CloudRain className="w-4 h-4 text-blue-400" />;
    return <Cloud className="w-4 h-4 text-white/40" />;
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border-b border-white/10 py-2">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-end gap-6">
        <div className="flex items-center gap-2">
          <Thermometer className="w-3 h-3 text-orange-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{title}:</span>
        </div>
        <div className="flex items-center gap-2">
          {getWeatherIcon(weather.code)}
          <span className="font-mono font-bold text-sm">{weather.temp}°C</span>
        </div>
      </div>
    </div>
  );
}

function Marquee({ title, promoText }: { title: string, promoText: string }) {
  const [rates, setRates] = useState<{ [key: string]: number } | null>(null);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/KGS')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setRates({
            USD: 1 / data.rates.USD,
            RUB: 1 / data.rates.RUB,
            KZT: 1 / data.rates.KZT,
            UZS: 1 / data.rates.UZS,
          });
        }
      })
      .catch(() => {});
  }, []);

  const currencyString = rates ? 
    ` • USD: ${rates.USD.toFixed(2)} • RUB: ${rates.RUB.toFixed(2)} • KZT: ${rates.KZT.toFixed(2)} • 1000 UZS: ${(rates.UZS * 1000).toFixed(2)}` : 
    '';

  const fullText = `${promoText}${currencyString} • `;

  return (
    <div className="bg-orange-500 text-black py-3 overflow-hidden whitespace-nowrap border-y border-black/10">
      <div className="flex">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-8 pr-8"
        >
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-sm font-black uppercase italic tracking-wider flex items-center gap-4">
              <Scissors className="w-4 h-4" />
              {fullText}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function VirtualMirror({ t }: { t: any }) {
  const [beforeImg, setBeforeImg] = useState<string | null>(null);
  const [afterImg, setAfterImg] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyleName, setSelectedStyleName] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'before') setBeforeImg(url);
      else setAfterImg(url);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  useEffect(() => {
    if (isCameraActive && cameraRef.current) {
      setTimeout(() => {
        cameraRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isCameraActive]);

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const url = canvas.toDataURL('image/jpeg');
      setBeforeImg(url);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const generateAiStyle = async () => {
    if (!beforeImg || !selectedStyleName) return;
    setIsGenerating(true);
    try {
      // If it's a blob URL (from file upload), we need to fetch it first to get base64
      let base64Data = "";
      let mimeType = "image/jpeg";

      if (beforeImg.startsWith('data:')) {
        base64Data = beforeImg.split(',')[1];
        mimeType = beforeImg.split(',')[0].split(':')[1].split(';')[0];
      } else {
        const response = await fetch(beforeImg);
        const blob = await response.blob();
        mimeType = blob.type;
        const reader = new FileReader();
        base64Data = await new Promise((resolve) => {
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: `Apply a ${selectedStyleName} hairstyle to the person in this photo. Keep the face features, identity, expression, skin tone, and background identical. Strictly change ONLY the hair to match a clean and professional ${selectedStyleName} haircut. The result must be a highly realistic photo as if taken in a barbershop.`,
            },
          ],
        },
      });

      let generatedImg = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedImg = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (generatedImg) {
        setAfterImg(generatedImg);
      } else {
        console.error("No image part in AI response");
      }
    } catch (err) {
      console.error("AI Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section id="virtual-mirror" className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">{t.virtualMirrorTitle}</h2>
          <p className="text-white/40 uppercase text-xs tracking-[0.3em] font-bold">{t.virtualMirrorSubtitle}</p>
          <div className="w-24 h-1 bg-orange-500 mx-auto mt-6" />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => fileInputBeforeRef.current?.click()}
                className="flex flex-col items-center justify-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-center">{t.uploadBefore}</span>
                <input 
                  type="file" 
                  ref={fileInputBeforeRef} 
                  onChange={(e) => handleFileUpload(e, 'before')} 
                  className="hidden" 
                  accept="image/*"
                />
              </button>

              <button 
                onClick={() => fileInputAfterRef.current?.click()}
                className="flex flex-col items-center justify-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <RefreshCw className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-center">{t.uploadAfter}</span>
                <input 
                  type="file" 
                  ref={fileInputAfterRef} 
                  onChange={(e) => handleFileUpload(e, 'after')} 
                  className="hidden" 
                  accept="image/*"
                />
              </button>

              <button 
                onClick={startCamera}
                className="flex flex-col items-center justify-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-center">{t.takePhoto}</span>
              </button>
            </div>

            <div ref={cameraRef} className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold uppercase italic tracking-tight flex items-center gap-3">
                  <Camera className="w-5 h-5 text-orange-500" />
                  {t.takePhoto}
                </h3>
                {isCameraActive && (
                  <button onClick={stopCamera} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-white/5">
                {!isCameraActive ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      onClick={startCamera}
                      className="px-8 py-4 bg-orange-500 text-black font-black uppercase italic tracking-tighter rounded-full hover:scale-105 transition-transform"
                    >
                      {t.takePhoto}
                    </button>
                  </div>
                ) : (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                      <button 
                        onClick={takePhoto}
                        className="w-16 h-16 rounded-full bg-white border-4 border-orange-500 flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <div className="w-10 h-10 rounded-full bg-orange-500" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold uppercase italic tracking-tight flex items-center gap-3">
                  <Scissors className="w-5 h-5 text-orange-500" />
                  {t.chooseStyle}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {t.haircutStyles.map((style: any, i: number) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setAfterImg(style.image);
                      setSelectedStyleName(style.name);
                    }}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedStyleName === style.name ? 'border-orange-500 scale-95' : 'border-transparent hover:border-white/20'}`}
                    title={style.name}
                  >
                    <img src={style.image} alt={style.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[8px] font-bold uppercase text-white text-center px-1">{style.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              {beforeImg && selectedStyleName && (
                <button 
                  onClick={generateAiStyle}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.aiGenerating}
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5" />
                      {t.aiGenerate}
                    </>
                  )}
                </button>
              )}
            </div>

            {(beforeImg || afterImg) && (
              <button 
                onClick={() => { setBeforeImg(null); setAfterImg(null); setSelectedStyleName(null); }}
                className="w-full py-4 border border-white/10 rounded-2xl text-white/40 hover:text-orange-500 hover:border-orange-500/50 transition-all flex items-center justify-center gap-2 uppercase text-xs font-bold tracking-widest"
              >
                <Trash2 className="w-4 h-4" />
                Reset Images
              </button>
            )}
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-orange-500/20 blur-3xl rounded-full opacity-20" />
            <div className="relative bg-[#0F0F0F] p-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <div className="relative">
                <BeforeAfterSlider 
                  before={beforeImg || "https://images.unsplash.com/photo-1599351431247-f10b21ce53e2?auto=format&fit=crop&q=80&w=800"} 
                  after={afterImg || "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80&w=800"} 
                  tBefore={t.before}
                  tAfter={t.after}
                />
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4 z-50">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-orange-500 font-black uppercase italic tracking-widest animate-pulse">{t.aiGenerating}</p>
                  </div>
                )}
              </div>
              <div className="mt-8 text-center">
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.3em]">
                  {beforeImg && afterImg ? "Your personal transformation" : "Preview with sample images"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveQueue({ title, bookings }: { title: string, bookings: { name: string, service: string, time: string }[] }) {
  return (
    <div className="bg-[#0A0A0A] border-y border-white/5 py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <h2 className="text-xl font-black italic uppercase tracking-tighter">{title}</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
          <AnimatePresence mode="popLayout">
            {bookings.map((booking, i) => (
              <motion.div
                key={`${booking.name}-${i}`}
                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -50 }}
                className="shrink-0 bg-white/5 border border-white/10 p-6 rounded-2xl min-w-[240px] relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Scissors className="w-12 h-12 rotate-12" />
                </div>
                <div className="relative z-10">
                  <p className="text-orange-500 font-mono text-[10px] uppercase tracking-widest mb-1">{booking.time}</p>
                  <h3 className="text-lg font-bold uppercase tracking-tight mb-2">{booking.name}</h3>
                  <div className="flex items-center gap-2 text-white/40 text-xs uppercase font-bold">
                    <Bot className="w-3 h-3" />
                    {booking.service}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState<Language>('kg');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<{ name: string, service: string, time: string }[]>([
    { name: "Алибек", service: "Fade", time: "10:00" },
    { name: "Максат", service: "Beard Trim", time: "11:30" },
    { name: "Ислам", service: "Complex", time: "14:00" },
    { name: "Нурбек", service: "Buzz Cut", time: "16:15" },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAssistantOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: t.assistantWelcome }]);
    }
  }, [isAssistantOpen, t.assistantWelcome]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleLang = () => {
    const langs: Language[] = ['kg', 'uz', 'ru', 'en'];
    const currentIndex = langs.indexOf(lang);
    setLang(langs[(currentIndex + 1) % langs.length]);
  };

  const handleBookingClick = () => {
    setIsAssistantOpen(true);
    const bookingMessage = lang === 'ru' ? 'Я хочу записаться на стрижку' : 
                         lang === 'kg' ? 'Мен чач жасалгасына жазылгым келет' :
                         lang === 'uz' ? 'Men soch turmagiga yozilmoqchiman' :
                         'I want to book a haircut';
    
    // If assistant is already open, just send the message
    // Otherwise, the useEffect will handle the welcome message, then we can append the user message
    setInput(bookingMessage);
    // We use a small timeout to ensure the assistant is ready and welcome message is shown
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    }, 100);
  };

  const handleSendMessage = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, { role: 'user', content: userMessage }].map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: `You are a professional Barber Assistant for "Барбершоп" in Uzgen, Kyrgyzstan. 
          You help customers with hairstyle advice, service information, and booking appointments.
          Current language: ${lang}. Respond in the user's language or ${lang}.
          Services: Haircut (200 KGS), Beard Trim (100 KGS), Complex (300 KGS), Kids Haircut (150 KGS).
          Address: Manas St 42, Uzgen. Hours: 24/7 (Round the clock).
          Phone: 0990358545.
          You can also provide information about current currency exchange rates (USD, RUB, KZT, UZS to KGS) and current weather in Uzgen which are displayed on the website.
          When a user wants to book (записаться), ask for their name, preferred service, and time. 
          After getting the details, tell them to confirm by clicking the WhatsApp link or that you will provide a link.
          Inform them that they can also message directly on WhatsApp: https://wa.me/996990358545
          Be polite, stylish, and helpful.`,
        },
      });

      const assistantContent = response.text || "Sorry, I couldn't process that.";
      
      // Try to extract booking info if assistant confirms
      const lowerContent = assistantContent.toLowerCase();
      if (lowerContent.includes('whatsapp') || lowerContent.includes('подтвердите') || lowerContent.includes('confirm')) {
        const nameMatch = messages.find(m => m.role === 'user' && m.content.length < 20)?.content || "Клиент";
        const serviceMatch = t.serviceList.find(s => lowerContent.includes(s.name.toLowerCase()))?.name || "Стрижка";
        
        const newBooking = {
          name: nameMatch,
          service: serviceMatch,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setBookings(prev => [newBooking, ...prev.slice(0, 5)]);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to assistant." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { name: t.services, href: '#services' },
    { name: t.stylesTitle, href: '#styles' },
    { name: t.virtualMirror, href: '#virtual-mirror' },
    { name: t.beforeAfter, href: '#before-after' },
    { name: t.about, href: '#about' },
    { name: t.gallery, href: '#gallery' },
    { name: t.contact, href: '#contact' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-orange-500 selection:text-black">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="p-2 bg-orange-500 rounded-lg group-hover:rotate-12 transition-transform">
              <Scissors className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase italic text-orange-500">Барбершоп</span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a key={item.name} href={item.href} className="text-sm font-medium uppercase tracking-widest hover:text-orange-500 transition-colors">
                {item.name}
              </a>
            ))}
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1 border border-white/20 rounded-full hover:border-orange-500 transition-colors text-xs uppercase tracking-widest"
            >
              <Globe className="w-3 h-3" />
              {lang}
            </button>
            <button 
              onClick={handleBookingClick}
              className="bg-orange-500 text-black px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-orange-400 transition-colors"
            >
              {t.bookNow}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleLang} className="p-2 border border-white/20 rounded-full text-xs uppercase">{lang}</button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black pt-24 px-6 flex flex-col gap-8 md:hidden"
          >
            {navItems.map((item) => (
              <a 
                key={item.name} 
                href={item.href} 
                onClick={() => setIsMenuOpen(false)}
                className="text-3xl font-bold uppercase italic tracking-tighter border-b border-white/10 pb-4"
              >
                {item.name}
              </a>
            ))}
            <button 
              onClick={handleBookingClick}
              className="w-full bg-orange-500 text-black py-4 rounded-xl font-bold uppercase tracking-widest"
            >
              {t.bookNow}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2070" 
            alt="Barber shop interior" 
            className="w-full h-full object-cover opacity-20 scale-105 grayscale hover:grayscale-0 transition-all duration-[3s]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[#0A0A0A]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-xs font-bold uppercase tracking-[0.3em] mb-6">
              Est. 2024
            </span>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8">
              {t.heroTitle.split(' ').map((word, i) => (
                <span key={i} className={i % 2 === 1 ? 'text-orange-500' : ''}>{word} </span>
              ))}
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 font-light">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleBookingClick}
                className="bg-orange-500 text-black px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-orange-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20"
              >
                {t.bookNow}
              </button>
              <a 
                href="#virtual-mirror"
                className="bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white/20 transition-all text-center flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5 text-orange-500" />
                {t.virtualMirror}
              </a>
              <a 
                href="#services"
                className="bg-transparent border border-white/10 px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white/5 transition-all text-center"
              >
                {t.services}
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
        >
          <div className="w-px h-12 bg-gradient-to-b from-orange-500 to-transparent" />
        </motion.div>
      </section>

      <Weather title={t.weatherTitle} />
      <Marquee title={t.currencyRates} promoText={t.promoText} />
      <LiveQueue title={t.liveQueue} bookings={bookings} />
      <VirtualMirror t={t} />

      {/* Services Section */}
      <section id="services" className="py-24 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">{t.services}</h2>
              <div className="w-24 h-1 bg-orange-500" />
            </div>
            <p className="text-white/40 max-w-md text-right uppercase text-xs tracking-widest font-bold">
              Professional grooming services for the modern gentleman of Uzgen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {t.serviceList.map((service, index) => (
              <motion.div 
                key={service.name}
                whileHover={{ x: 10 }}
                className="group flex justify-between items-center p-8 border-b border-white/10 hover:bg-white/5 transition-colors cursor-default"
              >
                <div className="flex items-center gap-6">
                  <span className="text-orange-500 font-mono text-sm opacity-50">0{index + 1}</span>
                  <h3 className="text-2xl font-bold uppercase tracking-tight group-hover:text-orange-500 transition-colors">{service.name}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-mono font-bold">{service.price}</span>
                  <ChevronRight className="w-5 h-5 text-orange-500 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Haircut Styles Section */}
      <section id="styles" className="py-24 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">{t.stylesTitle}</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.haircutStyles.map((style, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-white/5 border border-white/10"
              >
                <img 
                  src={style.image} 
                  alt={style.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-orange-500 mb-2">{style.name}</h3>
                  <div className="w-12 h-1 bg-white rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After Section */}
      <section id="before-after" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">{t.beforeAfter}</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="space-y-4">
              <BeforeAfterSlider 
                before="https://images.unsplash.com/photo-1599351431247-f10b21ce53e2?auto=format&fit=crop&q=80&w=800" 
                after="https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80&w=800" 
                tBefore={t.before}
                tAfter={t.after}
              />
              <p className="text-center text-orange-500 font-bold uppercase text-[10px] tracking-widest">Classic Transformation</p>
            </div>
            <div className="space-y-4">
              <BeforeAfterSlider 
                before="https://images.unsplash.com/photo-1621605815841-2df4727bc6a2?auto=format&fit=crop&q=80&w=800" 
                after="https://images.unsplash.com/photo-1593702295094-aec3e5975a13?auto=format&fit=crop&q=80&w=800" 
                tBefore={t.before}
                tAfter={t.after}
              />
              <p className="text-center text-orange-500 font-bold uppercase text-[10px] tracking-widest">Sharp Style Refresh</p>
            </div>
            <div className="space-y-4">
              <BeforeAfterSlider 
                before="https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80&w=800" 
                after="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=800" 
                tBefore={t.before}
                tAfter={t.after}
              />
              <p className="text-center text-orange-500 font-bold uppercase text-[10px] tracking-widest">Modern Skin Fade Update</p>
            </div>
            <div className="space-y-4">
              <BeforeAfterSlider 
                before="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=800" 
                after="https://images.unsplash.com/photo-1512690196162-7c9c91f701b7?auto=format&fit=crop&q=80&w=800" 
                tBefore={t.before}
                tAfter={t.after}
              />
              <p className="text-center text-orange-500 font-bold uppercase text-[10px] tracking-widest">Stylish Top Knot Transition</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 border-t-2 border-l-2 border-orange-500/30" />
            <img 
              src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1000" 
              alt="Barber working" 
              className="rounded-2xl shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 border-b-2 border-r-2 border-orange-500/30" />
          </div>
          <div>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-8">{t.about}</h2>
            <p className="text-xl text-white/70 leading-relaxed mb-8 italic">
              "{t.aboutText}"
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-orange-500 font-bold uppercase text-xs tracking-[0.2em] mb-2">Experience</h4>
                <p className="text-3xl font-black italic">10+ YEARS</p>
              </div>
              <div>
                <h4 className="text-orange-500 font-bold uppercase text-xs tracking-[0.2em] mb-2">Satisfied Clients</h4>
                <p className="text-3xl font-black italic">5000+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-16 text-center">{t.gallery}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { url: "https://images.unsplash.com/photo-1621605815841-2df4727bc6a2?auto=format&fit=crop&q=80&w=600", label: "Skin Fade" },
              { url: "https://images.unsplash.com/photo-1599351431247-f10b21ce53e2?auto=format&fit=crop&q=80&w=600", label: "Side Part" },
              { url: "https://images.unsplash.com/photo-1512690196162-7c9c91f701b7?auto=format&fit=crop&q=80&w=600", label: "Top Knot" },
              { url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=600", label: "Buzz Cut" },
              { url: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80&w=600", label: "Modern Taper" },
              { url: "https://images.unsplash.com/photo-1593702295094-aec3e5975a13?auto=format&fit=crop&q=80&w=600", label: "Undercut" },
              { url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600", label: "Beard Sculpture" },
              { url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600", label: "Pompadour" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-white/5 border border-white/10"
              >
                <img src={item.url} alt={item.label} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500 text-center">{item.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-orange-500 text-black rounded-[2rem] p-12 md:p-20 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-8 leading-none">
                Get in <br /> <span className="text-white">Touch</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-black/10 rounded-full"><MapPin className="w-6 h-6" /></div>
                  <span className="text-lg font-bold uppercase tracking-tight">{t.address}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-black/10 rounded-full"><Clock className="w-6 h-6" /></div>
                  <span className="text-lg font-bold uppercase tracking-tight">{t.workingHours}</span>
                </div>
                <a href="https://wa.me/996990358545" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group hover:text-white transition-colors">
                  <div className="p-3 bg-black/10 rounded-full group-hover:bg-black/20 transition-colors"><Phone className="w-6 h-6" /></div>
                  <span className="text-lg font-bold uppercase tracking-tight">0990358545</span>
                </a>
              </div>
              
              {/* Google Map Embed */}
              <div className="mt-10 w-full h-64 rounded-2xl overflow-hidden border-2 border-black/10 shadow-inner">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3025.432109876543!2d73.3000!3d40.7686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38bd900000000001%3A0x0!2zNDDCsDQ2JzA3LjAiTiA3M8KwMTgnMDAuMCJF!5e0!3m2!1sen!2skg!4v1711950000000!5m2!1sen!2skg" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Uzgen Barbershop Location"
                ></iframe>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <a href="#" className="flex-1 bg-black text-white p-6 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                  <Instagram className="w-8 h-8" />
                  <span className="text-xs font-bold uppercase tracking-widest">Instagram</span>
                </a>
                <a href="#" className="flex-1 bg-black text-white p-6 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                  <Facebook className="w-8 h-8" />
                  <span className="text-xs font-bold uppercase tracking-widest">Facebook</span>
                </a>
              </div>
              <button 
                onClick={handleBookingClick}
                className="w-full bg-white text-black py-8 rounded-2xl font-black text-2xl uppercase italic tracking-tighter hover:bg-black hover:text-white transition-all"
              >
                {t.bookNow}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-bold uppercase tracking-widest italic text-orange-500">Барбершоп</span>
          </div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-medium">
            {t.footer}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-orange-500 transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-white/40 hover:text-orange-500 transition-colors"><Facebook className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>

      {/* Assistant Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => !isAssistantOpen && setIsAssistantOpen(true)}
        onDoubleClick={() => setIsAssistantOpen(false)}
        className="fixed bottom-8 right-8 z-50 bg-orange-500 text-black p-4 rounded-full shadow-2xl shadow-orange-500/40 flex items-center gap-2 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold uppercase text-xs tracking-widest">
          {t.assistantTitle}
        </span>
      </motion.button>

      {/* Assistant Chat Window */}
      <AnimatePresence>
        {isAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-8 z-50 w-[90vw] md:w-[400px] h-[600px] bg-[#151515] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div 
              onDoubleClick={() => setIsAssistantOpen(false)}
              className="p-6 bg-orange-500 text-black flex justify-between items-center cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6" />
                <h3 className="font-black uppercase italic tracking-tighter">{t.assistantTitle}</h3>
              </div>
              <button onClick={() => setIsAssistantOpen(false)} className="p-1 hover:bg-black/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl flex gap-3 ${msg.role === 'user' ? 'bg-orange-500 text-black rounded-tr-none' : 'bg-white/5 text-white rounded-tl-none border border-white/10'}`}>
                    {msg.role === 'assistant' && <Bot className="w-5 h-5 shrink-0 mt-1" />}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {msg.role === 'user' && <User className="w-5 h-5 shrink-0 mt-1" />}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-2 items-center">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                    <span className="text-xs text-white/40 uppercase tracking-widest font-bold italic">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-6 border-t border-white/10 bg-black/50 backdrop-blur-md">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.assistantPlaceholder}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-orange-500 text-black rounded-xl hover:bg-orange-400 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
