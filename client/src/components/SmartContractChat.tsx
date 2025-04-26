"use client";

import { Send, User, Bot as BotIcon, Lightbulb, Zap, X, Code } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/atom-one-dark.css'; // Import a syntax highlighting theme

interface Message {
	id: string;
	content: string;
	role: "user" | "assistant";
	timestamp: Date;
}

interface SmartContractChatProps {
  currentCode: string;
  onUpdateCode?: (newCode: string) => void;
}

const SmartContractChat = ({ currentCode, onUpdateCode }: SmartContractChatProps) => {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			content: "I'll help you improve your smart contract. What would you like to change?",
			role: "assistant",
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(true);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	// Sample prompts specific to smart contract improvement
	const samplePrompts = [
		"Add validation for this input parameter",
		"Optimize this function for gas efficiency",
		"Add comments to explain this code section",
		"Make this contract more secure",
		"Check for potential vulnerabilities",
		"Implement error handling",
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

		try {
			// Prepare message context with the current code
			const fullMessage = `Current Smart Contract:\n\`\`\`rust\n${currentCode}\n\`\`\`\n\nRequest: ${input}`;
			
			// Call the API endpoint
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: fullMessage,
					userId: "user1", // Use actual user ID in production
				}),
			});
			
			if (!response.ok) {
				throw new Error(`API responded with status: ${response.status}`);
			}
			
			const data = await response.json();
			const aiResponse = data.content;
			
			// Check if response contains code
			const codeBlockRegex = /```(?:rust)?([\s\S]*?)```/g;
			const matches = [...aiResponse.matchAll(codeBlockRegex)];
			
			if (matches.length > 0 && onUpdateCode) {
				// Extract code from response
				const extractedCode = matches[0][1].trim();
				// Update the code in parent component
				onUpdateCode(extractedCode);
			}

			// Add AI response to messages
			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: aiResponse,
				role: "assistant",
				timestamp: new Date(),
			};
			
			setMessages((prev) => [...prev, aiMessage]);
		} catch (error) {
			// Handle error
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: "Sorry, there was an error processing your request. Please try again.",
				role: "assistant",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
			console.error("Error getting chat response:", error);
		} finally {
			setIsTyping(false);
		}
	};

	// Format timestamp
	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	return (
		<div className="flex flex-col h-full bg-zinc-900 overflow-hidden">
			{/* Header */}
			<div className="flex justify-between items-center p-2 bg-zinc-800">
				<span className="text-sm font-medium text-zinc-200 flex items-center">
					<Code className="h-4 w-4 mr-1.5" />
					Smart Contract Assistant
				</span>
			</div>

			{/* Chat area */}
			<div
				ref={chatContainerRef}
				className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent px-3"
			>
				<div className="space-y-4 py-3">
					{messages.map((message) => (
						<div
							key={message.id}
							className={`flex ${
								message.role === "user" ? "justify-end" : "justify-start"
							}`}
						>
							<div
								className={`max-w-[85%] p-2 rounded-lg text-sm ${
									message.role === "user"
										? "bg-primary text-primary-foreground rounded-br-none"
										: "bg-zinc-800 text-zinc-100 rounded-bl-none"
								}`}
							>
								<div className="flex items-center justify-between gap-2 mb-1">
									<div className="flex items-center gap-1.5">
										{message.role === "user" ? (
											<User className="h-3 w-3" />
										) : (
											<BotIcon className="h-3 w-3" />
										)}
										<span className="text-xs font-medium">
											{message.role === "user" ? "You" : "AI"}
										</span>
									</div>
									<span className="text-[10px] opacity-60">
										{formatTime(message.timestamp)}
									</span>
								</div>
								<div className="whitespace-pre-wrap">
									<ReactMarkdown 
										rehypePlugins={[rehypeHighlight, rehypeRaw]} 
										remarkPlugins={[remarkGfm]}
									>
										{message.content}
									</ReactMarkdown>
								</div>
							</div>
						</div>
					))}

					{/* Typing indicator */}
					{isTyping && (
						<div className="flex justify-start">
							<div className="max-w-[85%] p-2 rounded-lg bg-zinc-800 text-zinc-100 rounded-bl-none">
								<div className="flex items-center gap-1.5 mb-1">
									<BotIcon className="h-3 w-3" />
									<span className="text-xs font-medium">
										AI
									</span>
								</div>
								<div className="flex items-center space-x-1">
									<div
										className="h-1 w-1 bg-primary/50 rounded-full animate-bounce"
										style={{ animationDelay: "0ms" }}
									></div>
									<div
										className="h-1 w-1 bg-primary/50 rounded-full animate-bounce"
										style={{ animationDelay: "150ms" }}
									></div>
									<div
										className="h-1 w-1 bg-primary/50 rounded-full animate-bounce"
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

			{/* Sample prompts */}
			{showSuggestions && (
				<div className="p-2 border-t border-zinc-700 bg-zinc-800/50">
					<div>
						<div className="flex items-center justify-between mb-2">
							<p className="text-xs text-zinc-400 flex items-center">
								<Lightbulb className="h-3 w-3 mr-1" />
								Suggestions
							</p>
							<button
								onClick={() => setShowSuggestions(false)}
								className="text-zinc-400 hover:text-zinc-200 p-1"
							>
								<X className="h-3 w-3" />
							</button>
						</div>
						<div className="grid grid-cols-1 gap-1">
							{samplePrompts.map((prompt) => (
								<button
									key={prompt}
									onClick={() => setInput(prompt)}
									className="text-xs px-2 py-1 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 transition-colors text-left flex items-center"
								>
									<Zap className="h-2.5 w-2.5 text-primary mr-1 flex-shrink-0" />
									<span className="truncate text-zinc-200">{prompt}</span>
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Message input */}
			<div className="p-2 border-t border-zinc-700 bg-zinc-800/50">
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
						placeholder="Ask for modifications to your smart contract..."
						className="w-full py-2 px-3 pr-10 rounded bg-zinc-700 border border-zinc-600 text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
					/>
					<button
						type="submit"
						disabled={!input.trim() || isTyping}
						className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 bg-primary text-primary-foreground rounded disabled:opacity-50 hover:bg-primary/90 transition-colors"
					>
						<Send className="h-3 w-3" />
					</button>
				</form>
				<p className="text-[10px] text-zinc-500 mt-1 text-center">
					AI will help optimize and improve your smart contract code
				</p>
			</div>
		</div>
	);
};

export default SmartContractChat;