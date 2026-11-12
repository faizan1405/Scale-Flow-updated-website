import { useState, useRef, useEffect, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { MessageSquare, X, Send, Sparkles, ArrowRight, RotateCcw, Bot } from "lucide-react";
import { useDB } from "@/data/store";
import { whatsappLink } from "@/lib/quote";
import { WhatsAppIcon } from "@/components/site/WhatsApp";
import { cn } from "@/lib/utils";

interface ActionButton {
  label: string;
  href?: string;
  isExternal?: boolean;
  isWhatsApp?: boolean;
  prefill?: string;
  quickTopic?: string;
}

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  actions?: ActionButton[];
  timestamp: Date;
}

const QUICK_TOPICS = [
  { id: "pricing", label: "💰 Pricing & Packages" },
  { id: "services", label: "🚀 Services & Tech" },
  { id: "3d", label: "✨ 3D Interactive Web" },
  { id: "timeline", label: "⏱️ Delivery Timelines" },
  { id: "work", label: "📂 Featured Work" },
  { id: "contact", label: "📍 Office & Contact" },
];

export function Chatbot() {
  const { settings, packages } = useDB();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initialBotMessage: Message = {
    id: "init-1",
    sender: "bot",
    text: "Hello! 👋 Welcome to Scale Flow. We craft high-performance websites, 3D interactive experiences, and web apps with 100/100 Core Web Vitals.\n\nHow can I help you today?",
    actions: [
      { label: "View Packages & Pricing", quickTopic: "pricing" },
      { label: "Interactive 3D Portfolio", quickTopic: "3d" },
      { label: "Talk on WhatsApp", isWhatsApp: true, prefill: "Hi Scale Flow, I have a question about web development." },
    ],
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>([initialBotMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  // Handle closing on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const generateAnswer = (query: string): { text: string; actions?: ActionButton[] } => {
    const q = query.toLowerCase().trim();

    // 1. Pricing & Packages
    if (q.includes("price") || q.includes("cost") || q.includes("pack") || q.includes("charge") || q.includes("rate") || q.includes("how much") || q.includes("budget") || q.includes("pricing")) {
      const basicPkg = packages.find((p) => p.id === "basic");
      const bizPkg = packages.find((p) => p.id === "business");
      const premPkg = packages.find((p) => p.id === "premium");

      const basicPrice = basicPkg?.price ? `₹${basicPkg.price.toLocaleString("en-IN")}` : "₹15,000";
      const bizPrice = bizPkg?.price ? `₹${bizPkg.price.toLocaleString("en-IN")}` : "₹30,000";
      const premPrice = premPkg?.price ? `₹${premPkg.price.toLocaleString("en-IN")}` : "₹45,000";

      return {
        text: `Here is our transparent pricing structure:\n\n• Basic Website: from ${basicPrice} (Fast presence with WhatsApp integration)\n• Business Website: from ${bizPrice} (Multi-page, lead generation & inquiry forms)\n• Premium Brand: from ${premPrice} (Art-directed motion, custom animations & CMS)\n• 3D Interactive & E-Commerce: Custom tailored quotes.\n\nYou can also calculate an instant custom estimate with our online tool!`,
        actions: [
          { label: "Calculate Instant Quotation", href: "/build-your-website" },
          { label: "Discuss Your Budget on WhatsApp", isWhatsApp: true, prefill: "Hi Scale Flow, I'd like to get a quote for a website." },
        ],
      };
    }

    // 2. 3D Interactive
    if (q.includes("3d") || q.includes("three") || q.includes("spline") || q.includes("webgl") || q.includes("interactive") || q.includes("animation")) {
      return {
        text: "We specialize in cinematic, browser-based 3D storytelling using Three.js, Spline, and GSAP scroll physics. We've built interactive experiences for BMW, luxury skincare (VELORA), and real estate developers with zero-drift performance and 60 FPS fluidity.",
        actions: [
          { label: "Explore 3D Projects", href: "/work" },
          { label: "Discuss 3D Vision on WhatsApp", isWhatsApp: true, prefill: "Hi Scale Flow, I'm interested in building an interactive 3D website." },
        ],
      };
    }

    // 3. Services & Tech Stack
    if (q.includes("service") || q.includes("build") || q.includes("tech") || q.includes("stack") || q.includes("react") || q.includes("vite") || q.includes("seo") || q.includes("speed")) {
      return {
        text: "Our core services & tech stack:\n\n• High-Converting React / Vite Websites\n• 3D Product Showcases & Interactive Storytelling\n• Custom E-Commerce & Catalogue Stores\n• Admin CMS & Client Portals\n• Guaranteed 100/100 Google Core Web Vitals & Technical SEO\n\nEvery project is built clean without heavy bloat.",
        actions: [
          { label: "Browse Portfolio", href: "/work" },
          { label: "Build Your Website", href: "/build-your-website" },
          { label: "Chat on WhatsApp", isWhatsApp: true, prefill: "Hi Scale Flow, tell me more about your web development services." },
        ],
      };
    }

    // 4. Delivery Timelines
    if (q.includes("time") || q.includes("timeline") || q.includes("duration") || q.includes("days") || q.includes("weeks") || q.includes("how long") || q.includes("fast")) {
      return {
        text: "Our typical delivery timelines:\n\n• Basic / Landing Sites: 7 to 10 days\n• Multi-Page Business Websites: 2 to 3 weeks\n• Custom 3D & E-Commerce Platforms: 3 to 4 weeks\n\nWe work with clear sprint milestones so you can review live staging previews every step of the way.",
        actions: [
          { label: "Plan Your Project Timeline", isWhatsApp: true, prefill: "Hi Scale Flow, I have a specific project deadline I'd like to discuss." },
          { label: "View Pricing & Scope", href: "/build-your-website" },
        ],
      };
    }

    // 5. Portfolio & Featured Work
    if (q.includes("work") || q.includes("portfolio") || q.includes("project") || q.includes("client") || q.includes("example") || q.includes("case")) {
      return {
        text: "We have shipped over 25+ production websites across Automotive, Skincare, Architecture, Real Estate, Fashion, and Chartered Accountancy.\n\nFeatured showcases include BMW M4 Interactive Experience, VELORA Radiance Serum, and A&I Realty.",
        actions: [
          { label: "View Full Portfolio", href: "/work" },
          { label: "Book a Demo on WhatsApp", isWhatsApp: true, prefill: "Hi Scale Flow, I want to see relevant portfolio samples for my industry." },
        ],
      };
    }

    // 6. Location / Office
    if (q.includes("location") || q.includes("office") || q.includes("address") || q.includes("delhi") || q.includes("visit") || q.includes("where")) {
      return {
        text: `Our studio is located at:\n\n📍 ${settings.location || "3rd Floor, 44, Regal Building, 69, Connaught Cir, Connaught Place, New Delhi, Delhi 110001"}\n\nWe serve clients across India and globally.`,
        actions: [
          { label: "View Contact Page", href: "/contact" },
          { label: "Schedule a Meeting on WhatsApp", isWhatsApp: true, prefill: "Hi Scale Flow, I would like to schedule a call/meeting with your team." },
        ],
      };
    }

    // 7. Contact / Phone / Email / WhatsApp
    if (q.includes("contact") || q.includes("phone") || q.includes("email") || q.includes("call") || q.includes("whatsapp") || q.includes("number") || q.includes("talk")) {
      return {
        text: `You can reach our team directly via:\n\n• WhatsApp / Phone: ${settings.whatsapp || "+91 98737 21207"}\n• Email: ${settings.email || "business@joinscaleflow.in"}\n• Address: Connaught Place, New Delhi`,
        actions: [
          { label: "Chat on WhatsApp", isWhatsApp: true, prefill: "Hi Scale Flow, I want to discuss a project with your team." },
          { label: "Send an Email", href: `mailto:${settings.email || "business@joinscaleflow.in"}`, isExternal: true },
        ],
      };
    }

    // 8. Default fallback for other queries
    return {
      text: `Thanks for asking! I'd love to connect you directly with our lead web architect to discuss this in detail.\n\nYou can chat with us instantly on WhatsApp or check out our interactive quotation estimator:`,
      actions: [
        { label: "Chat with Us on WhatsApp", isWhatsApp: true, prefill: `Hi Scale Flow, I have a question: "${query}"` },
        { label: "Instant Price Estimator", href: "/build-your-website" },
      ],
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAnswer(text);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.text,
        actions: response.actions,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 450);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleQuickTopic = (topicId: string) => {
    switch (topicId) {
      case "pricing":
        handleSend("What are your website packages and pricing?");
        break;
      case "services":
        handleSend("What web development services and tech stack do you offer?");
        break;
      case "3d":
        handleSend("Can you tell me about your 3D interactive websites?");
        break;
      case "timeline":
        handleSend("What are your project delivery timelines?");
        break;
      case "work":
        handleSend("Can I see examples of your past work and portfolio?");
        break;
      case "contact":
        handleSend("Where is your office located and how can I contact you?");
        break;
      default:
        break;
    }
  };

  const resetChat = () => {
    setMessages([initialBotMessage]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-22 right-5 z-40 mb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close Scale Flow Assistant" : "Open Scale Flow Assistant"}
          className={cn(
            "group relative flex h-14 w-14 items-center justify-center rounded-full bg-midnight/90 border border-ivory/25 text-ivory shadow-deep backdrop-blur-md transition-all duration-300 hover:border-ivory/60 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-ivory",
            isOpen && "border-ivory/60 bg-midnight text-ivory",
          )}
        >
          {/* Pulsing online badge */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 border-2 border-midnight" />
          </span>

          {isOpen ? (
            <X className="h-6 w-6 transition-transform duration-200 group-hover:rotate-90" />
          ) : (
            <MessageSquare className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
          )}

          {/* Hover tooltip for desktop */}
          {!isOpen && (
            <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-md bg-midnight/95 border border-ivory/15 px-3 py-1.5 text-xs font-medium text-ivory shadow-md [@media(hover:hover)]:group-hover:inline-block">
              Ask Scale Flow
            </span>
          )}
        </button>
      </div>

      {/* Chat Window Drawer / Modal */}
      {isOpen && (
        <aside
          role="dialog"
          aria-label="Scale Flow Assistant"
          className="fixed bottom-22 right-4 z-50 flex w-[calc(100vw-2rem)] sm:w-[400px] h-[550px] max-h-[82vh] flex-col overflow-hidden rounded-2xl border border-ivory/20 bg-midnight/95 text-ivory shadow-2xl backdrop-blur-xl transition-all duration-300 mb-[env(safe-area-inset-bottom)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ivory/10 bg-ivory/[0.03] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-ivory/10 border border-ivory/20 text-ivory">
                <Bot className="h-5 w-5" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-midnight" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-ivory">Scale Flow Assistant</h3>
                  <span className="flex items-center gap-1 rounded bg-ivory/10 px-1.5 py-0.5 text-[10px] font-mono text-grey">
                    <Sparkles className="h-2.5 w-2.5 text-amber-300" /> Instant
                  </span>
                </div>
                <p className="text-[11px] text-grey">Online • Typical reply under 1 min</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                title="Restart conversation"
                className="rounded-lg p-1.5 text-grey transition-colors hover:bg-ivory/10 hover:text-ivory"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="sr-only">Reset chat</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="rounded-lg p-1.5 text-grey transition-colors hover:bg-ivory/10 hover:text-ivory"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close chat</span>
              </button>
            </div>
          </div>

          {/* Quick Category Chips bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-ivory/5 bg-midnight/50 px-3 py-2 scrollbar-none">
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleQuickTopic(topic.id)}
                className="shrink-0 rounded-full border border-ivory/15 bg-ivory/5 px-2.5 py-1 text-[11px] font-medium text-grey transition-all hover:border-ivory/40 hover:bg-ivory/10 hover:text-ivory"
              >
                {topic.label}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col max-w-[85%] space-y-2",
                  m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start",
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 whitespace-pre-line leading-relaxed",
                    m.sender === "user"
                      ? "bg-ivory text-midnight font-medium rounded-br-sm"
                      : "bg-ivory/10 text-ivory border border-ivory/15 rounded-bl-sm",
                  )}
                >
                  {m.text}
                </div>

                {/* Action buttons attached to bot messages */}
                {m.actions && m.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.actions.map((act, idx) => {
                      if (act.isWhatsApp) {
                        return (
                          <a
                            key={idx}
                            href={whatsappLink(settings.whatsapp, act.prefill || "Hi Scale Flow")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
                          >
                            <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-400" />
                            {act.label}
                          </a>
                        );
                      }

                      if (act.quickTopic) {
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleQuickTopic(act.quickTopic!)}
                            className="inline-flex items-center gap-1 rounded-lg border border-ivory/20 bg-ivory/5 px-2.5 py-1.5 text-xs text-ivory transition-colors hover:bg-ivory/15"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="h-3 w-3 text-grey" />
                          </button>
                        );
                      }

                      if (act.href && !act.isExternal) {
                        return (
                          <Link
                            key={idx}
                            to={act.href}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 rounded-lg border border-ivory/20 bg-ivory/5 px-2.5 py-1.5 text-xs text-ivory transition-colors hover:bg-ivory/15"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="h-3 w-3 text-grey" />
                          </Link>
                        );
                      }

                      if (act.href && act.isExternal) {
                        return (
                          <a
                            key={idx}
                            href={act.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-ivory/20 bg-ivory/5 px-2.5 py-1.5 text-xs text-ivory transition-colors hover:bg-ivory/15"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="h-3 w-3 text-grey" />
                          </a>
                        );
                      }

                      return null;
                    })}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 rounded-2xl bg-ivory/10 border border-ivory/15 px-3.5 py-2.5 w-16">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ivory/60 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ivory/60 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ivory/60" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Direct WhatsApp Quick-Bar */}
          <div className="border-t border-ivory/5 bg-ivory/[0.02] px-3 py-2 flex items-center justify-between text-xs text-grey">
            <span className="truncate">Need human assistance?</span>
            <a
              href={whatsappLink(settings.whatsapp, "Hi Scale Flow, I would like to speak directly with your team.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
            >
              <WhatsAppIcon className="h-3 w-3" />
              WhatsApp Studio
            </a>
          </div>

          {/* Input Form */}
          <form onSubmit={onSubmit} className="border-t border-ivory/10 bg-midnight p-3">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about pricing, 3D, timeline..."
                className="w-full rounded-xl border border-ivory/15 bg-ivory/5 pl-3.5 pr-11 py-2.5 text-sm text-ivory placeholder-grey focus:border-ivory/40 focus:bg-ivory/10 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                aria-label="Send message"
                className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-ivory text-midnight transition-opacity disabled:opacity-30 disabled:pointer-events-none hover:bg-white active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </aside>
      )}
    </>
  );
}
