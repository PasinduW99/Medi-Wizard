import React, { useState } from 'react';
import { Send, ExternalLink, Bot } from 'lucide-react';
import { Message, UserInfo } from './types';
import { SymptomMatcher } from './utils/symptomMatcher';

function App() {
  const [messages, setMessages] = useState<Message[]>([{
    text: "Hi! I'm Medi Wizard, your AI health assistant. Before we begin, could you please tell me your name?",
    sender: 'bot'
  }]);
  const [input, setInput] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', age: '', gender: '' });
  const [currentQuestion, setCurrentQuestion] = useState<'name' | 'age' | 'gender' | 'symptoms' | 'additional_symptoms'>('name');
  const [allSymptoms, setAllSymptoms] = useState<string[]>([]);

  const handleUserInfo = (input: string) => {
    const userInput = input.toLowerCase().trim();
    let response = '';

    switch (currentQuestion) {
      case 'name':
        const greetingWords = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
        const isOnlyGreeting = greetingWords.some(greeting => 
          userInput === greeting || 
          userInput.startsWith(greeting + ' ') ||
          userInput.endsWith(' ' + greeting) ||
          userInput === greeting.replace(' ', '')
        );

        if (isOnlyGreeting) {
          response = "Could you please tell me your name?";
          return response;
        }

        let extractedName = input.trim();
        
        const greetingPattern = /^(hi|hello|hey|good morning|good afternoon|good evening)[,\s]*/i;
        extractedName = extractedName.replace(greetingPattern, '');
        
        const iAmPattern = /^(i am|i'm|my name is|this is|it's|its)\s+/i;
        extractedName = extractedName.replace(iAmPattern, '');
        
        const trailingGreetingPattern = /[,\s]*(hi|hello|hey|good morning|good afternoon|good evening)$/i;
        extractedName = extractedName.replace(trailingGreetingPattern, '');
        
        extractedName = extractedName.replace(/[.,!?]+$/, '').trim();
        
        if (!extractedName || extractedName.length < 2) {
          response = "Could you please tell me your name?";
          return response;
        }
        
        extractedName = extractedName.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        setUserInfo(prev => ({ ...prev, name: extractedName }));
        response = `Nice to meet you, ${extractedName}! Could you please tell me your age?`;
        setCurrentQuestion('age');
        break;
        
      case 'age':
        if (isNaN(Number(input))) {
          response = "I'm sorry, I didn't catch that. Could you please enter your age as a number?";
          return response;
        }
        setUserInfo(prev => ({ ...prev, age: input }));
        response = "Thank you! And what is your gender? Please enter 'Male' or 'Female'.";
        setCurrentQuestion('gender');
        break;
        
      case 'gender':
        if (!['male', 'female'].includes(userInput)) {
          response = "I'm sorry, I didn't understand that. Please enter either 'Male' or 'Female' for your gender.";
          return response;
        }
        setUserInfo(prev => ({ ...prev, gender: userInput }));
        response = `Thank you ${userInfo.name}! Now, please describe your symptoms in detail. I'll analyze them and recommend the most appropriate specialist for you.`;
        setCurrentQuestion('symptoms');
        break;
        
      default:
        return null;
    }
    return response;
  };

  const analyzeSymptoms = (symptoms: string): string => {
    const matchedSpecialist = SymptomMatcher.matchSymptoms(symptoms);
    
    if (matchedSpecialist) {
      return `Based on your symptoms, I recommend consulting a **${matchedSpecialist}**.\n\nThis recommendation is based on matching your symptoms with our medical database. The specialist(s) mentioned are best equipped to diagnose and treat your specific condition.`;
    } else {
      return `Based on your symptoms, I recommend starting with a **General Physician**. They can provide an initial assessment and refer you to a specialist if needed.\n\nIf your symptoms are severe or worsening, please seek immediate medical attention.`;
    }
  };

  const handleSymptomAnalysis = (symptomInput: string) => {
    const updatedSymptoms = [...allSymptoms, symptomInput];
    setAllSymptoms(updatedSymptoms);
    
    const combinedSymptoms = updatedSymptoms.join('. ');
    
    let response = analyzeSymptoms(combinedSymptoms);
    
    response += `\n\n**Important:** This is not a substitute for professional medical advice. Always consult with healthcare professionals for proper diagnosis and treatment.\n\nFor additional symptom information, you can visit:\nhttps://symptoms.webmd.com/\n\n**What would you like to do next?**\n• Tell me about **additional symptoms** you're experiencing\n• Type **'new'** to start a fresh consultation`;
    
    return response;
  };

  const startNewConsultation = () => {
    setUserInfo({ name: '', age: '', gender: '' });
    setCurrentQuestion('name');
    setAllSymptoms([]);
    return "Starting a new consultation. Could you please tell me your name?";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: 'user' as const }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      let response: string;

      if (currentQuestion !== 'symptoms' && currentQuestion !== 'additional_symptoms') {
        response = handleUserInfo(input) || '';
        if (response) {
          setMessages([...newMessages, { text: response, sender: 'bot' as const }]);
          return;
        }
      }

      const userInput = input.toLowerCase();

      if (userInput.includes('new')) {
        response = startNewConsultation();
      }
      else if (userInput.includes('hi') || userInput.includes('hello')) {
        if (userInfo.name) {
          response = `Hello ${userInfo.name}! How can I help you today? You can tell me about additional symptoms or type 'new' to start a fresh consultation.`;
        } else {
          response = "Hello! Could you please tell me your name to get started?";
        }
      } 
      else if (currentQuestion === 'symptoms' || currentQuestion === 'additional_symptoms') {
        response = handleSymptomAnalysis(input);
        setCurrentQuestion('additional_symptoms');
      }
      else {
        response = `I'm sorry, I didn't understand that. ${
          currentQuestion === 'name' ? "Could you please tell me your name?" :
          currentQuestion === 'age' ? "Could you please tell me your age?" :
          currentQuestion === 'gender' ? "Could you please tell me your gender (Male or Female)?" :
          "Could you please provide more details about your symptoms?"
        }\n\nFor more detailed information, you can visit:\nhttps://symptoms.webmd.com/`;
      }

      setMessages([...newMessages, { text: response, sender: 'bot' as const }]);
    }, 1000);
  };

  const MedicalCrossWithHat = ({ size = 32 }: { size?: number }) => (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Red Cross */}
      <svg width={size} height={size} viewBox="0 0 32 32" className="absolute inset-0">
        {/* Cross Background Circle */}
        <circle cx="16" cy="16" r="15" fill="white" stroke="#E5E7EB" strokeWidth="1" />
        
        {/* Red Cross */}
        <rect x="12" y="6" width="8" height="20" fill="#DC2626" rx="2" />
        <rect x="6" y="12" width="20" height="8" fill="#DC2626" rx="2" />
        
        {/* Cross Highlight */}
        <rect x="13" y="7" width="2" height="18" fill="#EF4444" opacity="0.8" />
        <rect x="7" y="13" width="18" height="2" fill="#EF4444" opacity="0.8" />
        
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.1"/>
          </filter>
        </defs>
      </svg>
      
      {/* Wizard Hat on top */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <svg width={size/2} height={size/2} viewBox="0 0 16 16">
          {/* Hat Base */}
          <ellipse cx="8" cy="14" rx="6" ry="1.5" fill="url(#hatBase)" />
          {/* Hat Cone */}
          <path d="M4 14 L8 2 L12 14 Z" fill="url(#hatCone)" />
          {/* Hat Band */}
          <ellipse cx="8" cy="12" rx="4" ry="1" fill="url(#hatBand)" />
          {/* Stars */}
          <circle cx="7" cy="8" r="0.5" fill="#FFD700" opacity="0.8" />
          <circle cx="9" cy="6" r="0.4" fill="#FFD700" opacity="0.6" />
          
          <defs>
            <linearGradient id="hatCone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4C1D95" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="hatBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="hatBand" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-green-200/50 p-6 shadow-sm">
        <div className="container mx-auto flex items-center gap-6">
          {/* Medical Cross with Wizard Hat Logo */}
          <div className="relative">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl shadow-lg border border-green-200/50">
              <MedicalCrossWithHat size={48} />
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Medi Wizard
            </h1>
            <p className="text-green-700 text-lg font-medium flex items-center gap-2">
              <Bot size={16} />
              AI-Powered Medical Assistant
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-4xl">
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-green-200/30 h-[calc(100vh-14rem)] flex flex-col overflow-hidden">
          {/* Chat Interface */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mr-4 border border-green-200/50 shadow-md">
                    <MedicalCrossWithHat size={24} />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl p-6 shadow-lg ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border border-green-400/30'
                      : 'bg-white/80 backdrop-blur-sm border border-green-200/50 text-gray-800'
                  }`}
                >
                  {message.text.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {line.includes('**') ? (
                        <span dangerouslySetInnerHTML={{
                          __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-600 font-bold">$1</strong>')
                        }} />
                      ) : line.includes('https://symptoms.webmd.com/') ? (
                        <a
                          href="https://symptoms.webmd.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline font-medium transition-colors"
                        >
                          <ExternalLink size={16} />
                          WebMD Symptom Checker
                        </a>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>


          <form onSubmit={handleSubmit} className="p-8 border-t border-green-200/30 bg-white/40 backdrop-blur-sm">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  currentQuestion === 'name' ? "Enter your name..." :
                  currentQuestion === 'age' ? "Enter your age..." :
                  currentQuestion === 'gender' ? "Enter your gender (Male/Female)..." :
                  currentQuestion === 'symptoms' ? "Describe your symptoms in detail..." :
                  "Tell me about additional symptoms or type 'new' for fresh consultation..."
                }
                className="flex-1 rounded-2xl border-2 border-green-200/50 bg-white/60 backdrop-blur-sm p-4 focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-400/20 text-gray-800 placeholder-gray-500 transition-all"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl hover:from-green-400 hover:to-emerald-500 transition-all duration-300 shadow-lg hover:shadow-green-500/25 transform hover:scale-105 border border-green-400/30"
              >
                <Send size={24} />
              </button>
            </div>
          </form>
        </div>
      </main>


      <div className="container mx-auto px-6 pb-6 max-w-4xl">
        <div className="bg-amber-50/80 border border-amber-200/50 rounded-2xl p-4 text-sm text-amber-800 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <strong>Medical Disclaimer</strong>
          </div>
          <p>This AI assistant provides preliminary guidance only. Always consult qualified healthcare professionals for proper medical diagnosis and treatment.</p>
        </div>
      </div>
    </div>
  );
}

export default App;