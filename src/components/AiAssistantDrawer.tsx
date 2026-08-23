import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { sendChatMessageToGemini, ChatMessage } from '../services/geminiService';
import { 
  Sparkles, 
  X, 
  Send, 
  RotateCcw, 
  Bot, 
  User as UserIcon, 
  Copy, 
  Check, 
  Key, 
  ChevronRight, 
  HelpCircle, 
  ShieldCheck, 
  MessageSquare
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "Combien de points vaut la Bible ?",
  "Versets pour la promotion Sergent ?",
  "Aide-moi à rédiger le rapport mensuel",
  "Critères de qualification recrue",
  "Barème complet des 8 critères",
  "Verset de la Coupe de Timothée"
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-init',
    role: 'model',
    text: `Bonjour ! 🚀 Je suis l'**Assistant Virtuel Officiel des Astronautes** pour le ministère des enfants.\n\nJe suis à votre disposition pour vous aider dans :\n- 📊 **Le barème de points** et les 8 critères d'évaluation quotidienne\n- 🎖️ **Les 18 rangs et versets bibliques de promotion**\n- 🎯 **Les 4 étapes de qualification des nouvelles recrues**\n- 📝 **La rédaction de vos rapports mensuels de groupe**\n\n*Cliquez sur une suggestion ci-dessous ou posez-moi directement votre question !*`,
    timestamp: 'À l\'instant'
  }
];

export default function AiAssistantDrawer() {
  const { 
    isAiAssistantOpen, 
    setIsAiAssistantOpen, 
    geminiApiKey, 
    setGeminiApiKey,
    addToast
  } = useAppContext();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState(geminiApiKey || '');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isAiAssistantOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isAiAssistantOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isAiAssistantOpen && !showKeyConfig) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isAiAssistantOpen, showKeyConfig]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const replyText = await sendChatMessageToGemini(newHistory, geminiApiKey);
      const modelMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: "Désolé, une erreur est survenue lors de la communication avec l'assistant. Veuillez réessayer.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('info', 'Texte Copié', 'Le message a été copié dans le presse-papier.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    addToast('info', 'Discussion Réinitialisée', 'La conversation a été remise à zéro.');
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(tempKeyInput);
    setShowKeyConfig(false);
    addToast('success', 'Clé API Enregistrée', tempKeyInput ? 'Clé Gemini configurée avec succès.' : 'Clé réinitialisée (mode local par défaut).');
  };

  // Helper to format text with bold, bullet points and paragraphs
  const renderFormattedMessage = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-xs">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          if (line.startsWith('---')) {
            return <hr key={idx} className="my-2 border-zinc-200" />;
          }

          // Bullet points
          const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ');
          const isNumbered = /^\d+\.\s/.test(line.trim());

          let content = line;
          if (isBullet) {
            content = line.trim().replace(/^[-•]\s*/, '');
          }

          // Simple parser for bold **text** and italic *text*
          const parts = [];
          const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
          let lastIndex = 0;
          let match;

          while ((match = regex.exec(content)) !== null) {
            if (match.index > lastIndex) {
              parts.push(content.substring(lastIndex, match.index));
            }
            const matchText = match[0];
            if (matchText.startsWith('**') && matchText.endsWith('**')) {
              parts.push(
                <strong key={match.index} className="font-semibold text-zinc-950">
                  {matchText.slice(2, -2)}
                </strong>
              );
            } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
              parts.push(
                <em key={match.index} className="italic text-zinc-700">
                  {matchText.slice(1, -1)}
                </em>
              );
            }
            lastIndex = match.index + matchText.length;
          }
          if (lastIndex < content.length) {
            parts.push(content.substring(lastIndex));
          }

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1.5">
                <span className="text-zinc-400 select-none mt-0.5">•</span>
                <div className="flex-1">{parts.length > 0 ? parts : content}</div>
              </div>
            );
          }

          if (isNumbered) {
            return (
              <div key={idx} className="pl-1 text-zinc-800">
                {parts.length > 0 ? parts : content}
              </div>
            );
          }

          return (
            <p key={idx} className="text-zinc-800">
              {parts.length > 0 ? parts : content}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* 1. FLOATING CHAT BUTTON */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
        <button
          id="btn-open-ai-assistant"
          type="button"
          onClick={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
          className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full shadow-xl border transition-all duration-200 cursor-pointer ${
            isAiAssistantOpen
              ? 'bg-zinc-900 text-white border-zinc-700 shadow-zinc-900/20'
              : 'bg-zinc-950 hover:bg-zinc-900 text-white border-zinc-800 shadow-zinc-950/25 hover:scale-[1.02] active:scale-[0.98]'
          }`}
          aria-label="Ouvrir l'Assistant Astronautes"
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30">
            <Sparkles size={15} className="animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
          </div>
          <span className="text-xs font-semibold tracking-tight pr-1 hidden xs:inline">Assistant Astronautes</span>
        </button>
      </div>

      {/* 2. CHAT DRAWER / SLIDE-OVER MODAL */}
      {isAiAssistantOpen && (
        <div 
          id="ai-assistant-drawer-container"
          className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[440px] h-[580px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-zinc-300/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="bg-zinc-950 text-white px-4 py-3 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Bot size={17} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-white">Assistant Astronautes</h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Gemini AI
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">Guide officiel des règles & versets du ministère</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                title="Paramètres Clé API Gemini"
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  showKeyConfig ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                }`}
              >
                <Key size={14} />
              </button>
              <button
                type="button"
                onClick={handleResetChat}
                title="Effacer la discussion"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-850 rounded-md text-xs transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsAiAssistantOpen(false)}
                title="Fermer"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-850 rounded-md text-xs transition-colors cursor-pointer ml-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Optional API Key inline config panel */}
          {showKeyConfig && (
            <div className="bg-zinc-900 text-zinc-100 p-3.5 border-b border-zinc-800 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[11px] text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} />
                  Configuration Clé API Gemini
                </span>
                <button 
                  type="button"
                  onClick={() => setShowKeyConfig(false)}
                  className="text-zinc-400 hover:text-white text-[10px]"
                >
                  Fermer
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 mb-2.5">
                Une clé API Gemini permet la génération dynamique. Si aucune clé n'est fournie, l'assistant utilise le moteur intelligent des règles embarqué.
              </p>
              <form onSubmit={handleSaveApiKey} className="flex gap-2">
                <input
                  type="password"
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  placeholder="Collez votre clé API Gemini (AIza...)"
                  className="flex-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-[11px] text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded text-[11px] transition-colors cursor-pointer"
                >
                  Valider
                </button>
              </form>
            </div>
          )}

          {/* Quick Prompt Pills Bar */}
          <div className="bg-zinc-50 px-3 py-2 border-b border-zinc-200/80 overflow-x-auto no-scrollbar shrink-0 flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap pl-0.5">
              Suggestions :
            </span>
            {SUGGESTED_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium bg-white text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message History */}
          <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto bg-zinc-100/60">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isUser
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-950 text-amber-400 border border-zinc-800'
                    }`}
                  >
                    {isUser ? <UserIcon size={12} /> : <Sparkles size={12} />}
                  </div>

                  <div className={`relative max-w-[84%] group`}>
                    <div
                      className={`p-3 rounded-xl shadow-2xs ${
                        isUser
                          ? 'bg-zinc-900 text-zinc-100 rounded-tr-xs'
                          : 'bg-white border border-zinc-200 text-zinc-900 rounded-tl-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        renderFormattedMessage(msg.text)
                      )}
                    </div>

                    <div className={`flex items-center gap-1.5 mt-1 px-1 text-[9px] text-zinc-500 ${isUser ? 'justify-end' : 'justify-between'}`}>
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                          title="Copier le texte"
                        >
                          {copiedId === msg.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5 animate-in fade-in duration-150">
                <div className="w-6 h-6 rounded-md bg-zinc-950 text-amber-400 border border-zinc-800 flex items-center justify-center shrink-0">
                  <Sparkles size={12} className="animate-spin" />
                </div>
                <div className="bg-white border border-zinc-200 px-3.5 py-2.5 rounded-xl rounded-tl-xs shadow-2xs flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] text-zinc-500 font-medium pl-1">Recherche dans les règles...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="bg-white p-3 border-t border-zinc-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Posez une question sur les règles, versets, rapports..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 disabled:opacity-60 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-3 py-2 bg-zinc-950 hover:bg-zinc-850 disabled:bg-zinc-200 text-white disabled:text-zinc-400 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                title="Envoyer"
              >
                <Send size={14} />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[9px] text-zinc-500 px-0.5">
              <span>Règles & Barème 250 pts • 18 Rangs • 4 Groupes</span>
              <span>Entrée pour envoyer</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
