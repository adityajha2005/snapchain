"use client";

import { Send, User, Bot as BotIcon, Lightbulb, Zap, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Message {
	id: string;
	content: string;
	role: "user" | "assistant";
	timestamp: Date;
}

const AIChatPage = () => {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			content: "Hello! I'm your Solana program assistant. How can I help you today?",
			role: "assistant",
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	// Sample prompts that users might want to try
	const samplePrompts = [
		"How do I create a Solana program?",
		"Explain rent exemption in Solana",
		"What are Solana program security best practices?",
		"How do I connect my dApp to a Solana wallet?",
		"Explain Solana's architecture and consensus",
		"How does staking work on Solana?",
	];

	// Scroll to bottom of messages
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	const handleSendMessage = async () => {
		if (!input.trim()) return;

		// Add user message
		const userMessage: Message = {
			id: Date.now().toString(),
			content: input,
			role: "user",
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setShowSuggestions(false);
		setIsTyping(true);
		setError(null);

		try {
			// Make a real API call to our chat endpoint
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: input,
					userId: "user-" + Math.random().toString(36).substring(2, 9), // Generate a simple user ID for testing
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to get AI response");
			}

			const data = await response.json();
			
			setIsTyping(false);
			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: data.content,
				role: "assistant",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, aiMessage]);
		} catch (err) {
			console.error("Error calling AI API:", err);
			setIsTyping(false);
			setError(err instanceof Error ? err.message : "Failed to get AI response");
		}
	};

	// Format timestamp
	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	return (
		<div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
			{/* Header */}

			{/* Chat area */}
			<div
				ref={chatContainerRef}
				className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
			>
				<div className="max-w-3xl mx-auto">
					{/* Welcome message */}
					{messages.length === 1 && (
						<div className="p-6 mx-auto max-w-2xl text-center">
							<h2 className="text-2xl font-bold mb-2">
								Welcome to SnapChain AI
							</h2>
							<p className="text-muted-foreground mb-6">
								Ask anything about Solana programs, SPL tokens, Anchor framework, or Solana development.
							</p>
						</div>
					)}

					{/* Messages */}
					<div className="p-4 space-y-6">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${
									message.role === "user" ? "justify-end" : "justify-start"
								} animate-in slide-in-from-${
									message.role === "user" ? "right" : "left"
								}-5 fade-in-50 duration-300`}
							>
								<div
									className={`max-w-[85%] md:max-w-[75%] p-4 rounded-lg ${
										message.role === "user"
											? "bg-primary text-primary-foreground rounded-br-none"
											: "bg-card border border-border rounded-bl-none"
									}`}
								>
									<div className="flex items-center justify-between gap-2 mb-1.5">
										<div className="flex items-center gap-1.5">
											{message.role === "user" ? (
												<User className="h-3.5 w-3.5" />
											) : (
												<BotIcon className="h-3.5 w-3.5" />
											)}
											<span className="text-xs font-medium opacity-90">
												{message.role === "user" ? "You" : "Solana Assistant"}
											</span>
										</div>
										<span className="text-[10px] opacity-60">
											{formatTime(message.timestamp)}
										</span>
									</div>
									<p className="text-sm whitespace-pre-wrap">
										{message.content}
									</p>
								</div>
							</div>
						))}

						{/* Error message */}
						{error && (
							<div className="flex justify-center animate-in fade-in-50">
								<div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
									Error: {error}
								</div>
							</div>
						)}

						{/* Typing indicator */}
						{isTyping && (
							<div className="flex justify-start animate-in fade-in-50">
								<div className="max-w-[85%] md:max-w-[75%] p-4 rounded-lg bg-card border border-border rounded-bl-none">
									<div className="flex items-center gap-1.5 mb-1">
										<BotIcon className="h-3.5 w-3.5" />
										<span className="text-xs font-medium opacity-90">
											Solana Assistant
										</span>
									</div>
									<div className="flex items-center space-x-1">
										<div
											className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce"
											style={{ animationDelay: "0ms" }}
										></div>
										<div
											className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce"
											style={{ animationDelay: "150ms" }}
										></div>
										<div
											className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce"
											style={{ animationDelay: "300ms" }}
										></div>
									</div>
								</div>
							</div>
						)}

						{/* Anchor for auto-scroll */}
						<div ref={messagesEndRef} />
					</div>
				</div>
			</div>

			{/* Sample prompts */}
			{showSuggestions && (
				<div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm animate-in slide-in-from-bottom-5 fade-in-50">
					<div className="max-w-3xl mx-auto">
						<div className="flex items-center justify-between mb-3">
							<p className="text-sm text-muted-foreground flex items-center">
								<Lightbulb className="h-3.5 w-3.5 mr-1.5" />
								Suggested questions
							</p>
							<button
								onClick={() => setShowSuggestions(false)}
								className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent/10 transition-colors"
							>
								<X className="h-3.5 w-3.5" />
							</button>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							{samplePrompts.map((prompt) => (
								<button
									key={prompt}
									onClick={() => setInput(prompt)}
									className="text-sm px-3 py-2 bg-card border border-border rounded-md hover:bg-accent/10 transition-colors text-left flex items-center"
								>
									<Zap className="h-3 w-3 text-primary mr-2 flex-shrink-0" />
									<span className="truncate">{prompt}</span>
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Message input */}
			<div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
				<div className="max-w-3xl mx-auto">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSendMessage();
						}}
						className="relative"
					>
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask anything about Solana programs, Anchor, or Solana development..."
							className="w-full p-3 pr-12 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none"
						/>
						<button
							type="submit"
							disabled={!input.trim() || isTyping}
							className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-primary-foreground rounded-md disabled:opacity-50 hover:bg-primary/90 transition-colors"
						>
							<Send className="h-4 w-4" />
						</button>
					</form>
					
				</div>
			</div>
		</div>
	);
};

export default AIChatPage;
