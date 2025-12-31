import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Loader2, Plus, AlertCircle } from "lucide-react";

// Types
type Message = {
  id: string;
  requestId?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  materialSuggestions?: MaterialSuggestion[];
};

interface MaterialSuggestion {
  material_name: string;
  quantity: number;
  unit: string;
  priority: "low" | "medium" | "high" | "urgent";
  notes?: string;
}

interface AIChatAssistantProps {
  onFillForm?: (material: MaterialSuggestion) => void;
}

function AIChatAssistant({ onFillForm }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your AI Material Assistant. I can help you with:\n\n• Material recommendations for your projects\n• Analyzing your request history\n• Creating multiple material requests at once\n• Providing priority suggestions\n\nWhat would you like help with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getSystemPrompt = () => {
    return `You are an AI assistant for a Material Request Tracker system used in construction projects. Your role is to help users:

    1. Recommend materials and quantities for construction projects
    2. Analyze historical material request data
    3. Suggest appropriate priority levels
    4. Generate Bill of Quantities (BOQ) from project descriptions
    5. Provide construction industry insights

    When suggesting materials, ALWAYS respond in this JSON format (and ONLY this format, no other text):
    {
    "response": "Your helpful explanation here",
    "materials": [
        {
        "material_name": "Material name",
        "quantity": number,
        "unit": "kg/m/bags/pieces/liters/etc",
        "priority": "low/medium/high/urgent",
        "notes": "Brief explanation"
        }
    ]
    }

    Guidelines:
    - Use realistic construction quantities and units
    - Consider standard construction ratios (e.g., 1:2:3 for concrete)
    - Be specific about material grades (e.g., "Grade 43 Cement" not just "Cement")
    - Provide helpful context in notes
    - Use appropriate priorities based on project urgency

    If the user is just asking questions without needing material suggestions, respond in this format:
    {
    "response": "Your answer here",
    "materials": []
    }`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const requestId = crypto.randomUUID();

    const userMessage: Message = {
      id: crypto.randomUUID(),
      requestId,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://tkkguhgvuaxercugawxx.supabase.co/functions/v1/quick-handler",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `${getSystemPrompt()}

User Query: ${userMessage.content}

Return ONLY raw JSON.`,
          }),
        }
      );

      if (!response.ok) throw new Error();

      const data = await response.json();
      const aiText = data.text ?? "";

      let parsed = { response: aiText, materials: [] };

      try {
        parsed = JSON.parse(aiText.replace(/```json\n?|\n?```/g, "").trim());
      } catch {}

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        requestId,
        role: "assistant",
        content: parsed.response,
        timestamp: new Date(),
        materialSuggestions: parsed.materials?.length
          ? parsed.materials
          : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => {
        if (
          prev.some((m) => m.requestId === requestId && m.role === "assistant")
        )
          return prev;

        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            requestId,
            role: "assistant",
            content:
              "I'm having trouble connecting right now. Please try again.",
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillFormWithMaterial = (material: MaterialSuggestion) => {
    if (onFillForm) {
      onFillForm(material);
      setIsOpen(false);
    }
  };

  const quickPrompts = [
    "What materials do I need for a 500 sq ft concrete slab?",
    "Show me all high priority pending requests"
  ];

  return (
    <>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AI Help</span>
        </button>
      ) : (
        <div className=" fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col">
            <div className=" bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Assistant</h3>
                 
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-600">
                          AI Assistant
                        </span>
                      </div>
                    )}

                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>

                    {message.materialSuggestions &&
                      message.materialSuggestions.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-purple-600 font-medium text-sm mb-3">
                            <AlertCircle className="w-4 h-4" />
                            Suggested Materials
                          </div>

                          {message.materialSuggestions.map((material, idx) => (
                            <div
                              key={idx}
                              className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-200"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className="font-semibold text-gray-800 text-sm">
                                  {material.material_name}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    material.priority === "urgent"
                                      ? "bg-red-100 text-red-700"
                                      : material.priority === "high"
                                      ? "bg-orange-100 text-orange-700"
                                      : material.priority === "medium"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {material.priority}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">
                                  {material.quantity}
                                </span>{" "}
                                {material.unit}
                              </div>
                              {material.notes && (
                                <p className="text-xs text-gray-500 mt-2 italic">
                                  {material.notes}
                                </p>
                              )}
                              <button
                                onClick={() => handleFillFormWithMaterial(material)}
                                className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs py-2 rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2 font-medium"
                              >
                                <Plus className="w-3 h-3" />
                                Use This Material
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                    <p className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      <span className="text-sm text-gray-600">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
              <div className="px-4 py-2 border-t border-gray-200 bg-white">
                <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(prompt)}
                      className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about materials, quantities, or priorities..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-xl hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Powered by AI • Press Enter to send
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AIChatAssistant;