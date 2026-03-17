import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, X } from "lucide-react";

const aiResponses: Record<string, string> = {
  default: "I can help you explain concepts, suggest activities, or simplify content for your students. Try asking me something specific about today's topic!",
  explain: "The Laws of Reflection state that: 1) The angle of incidence equals the angle of reflection (∠i = ∠r). 2) The incident ray, the reflected ray, and the normal to the surface at the point of incidence all lie in the same plane. Think of it like a ball bouncing off a wall - it bounces away at the same angle it came in!",
  simpler: "When light hits a mirror, it bounces back. The angle it comes in at equals the angle it goes out at. Like throwing a ball at a wall - it bounces back at the same angle! 🏀",
  activity: "Here's a fun activity: Give students a flashlight and a small mirror. Have them shine the light at different angles and measure the incident and reflected angles with a protractor. They'll discover the law themselves! You can also use a laser pointer for more precision.",
  quiz: "Here are some additional quiz questions: 1) What device uses reflection? (Periscope) 2) What happens when light hits a rough surface? (Diffuse reflection) 3) Can you see your image in a rough wall? Why not?",
};

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant = ({ isOpen, onClose }: AIAssistantProps) => {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hello! I'm your AI Teaching Assistant. How can I help you with today's lesson on Laws of Reflection?" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.toLowerCase();
    setMessages(prev => [...prev, { role: "user", text: input }]);
    setInput("");

    setTimeout(() => {
      let response = aiResponses.default;
      if (userMsg.includes("explain") || userMsg.includes("law")) response = aiResponses.explain;
      else if (userMsg.includes("simpl") || userMsg.includes("easy")) response = aiResponses.simpler;
      else if (userMsg.includes("activit") || userMsg.includes("experiment")) response = aiResponses.activity;
      else if (userMsg.includes("quiz") || userMsg.includes("question")) response = aiResponses.quiz;
      setMessages(prev => [...prev, { role: "ai", text: response }]);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-hover border border-border flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold text-foreground">AI Teaching Assistant</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="p-4 border-t border-border flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask about the lesson..."
          />
          <Button onClick={handleSend} size="icon"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
