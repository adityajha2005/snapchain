"use client";

import { Send, User, Bot as BotIcon, Lightbulb, Code, Copy, CheckCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github.css';

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

const SmartContractChat: React.FC<SmartContractChatProps> = ({ currentCode, onUpdateCode }) => {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			content: "Ask for modifications to your smart contract...",
			role: "assistant",
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(true);
	const [showCopyToast, setShowCopyToast] = useState(false);
	const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	// Sample prompts for smart contract improvement
	const samplePrompts = [
		{
			icon: "✨",
			text: "Add validation for this input parameter",
			category: "Validation"
		},
		{
			icon: "⚡",
			text: "Optimize this function for gas efficiency",
			category: "Performance"
		},
		{
			icon: "📝",
			text: "Add comments to explain this code",
			category: "Documentation"
		},
		{
			icon: "🔒",
			text: "Make this contract more secure",
			category: "Security"
		},
		{
			icon: "🔍",
			text: "Check for potential vulnerabilities",
			category: "Security"
		},
		{
			icon: "⚠️",
			text: "Implement error handling",
			category: "Reliability"
		}
	];

	// Improved scroll to bottom function with smooth behavior
	const scrollToBottom = () => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ 
				behavior: "smooth", 
				block: "end" 
			});
		}
	};

	// Scroll to bottom when messages change
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Handle message submission
	const handleSendMessage = async () => {
		if (!input.trim()) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			content: input,
			role: "user",
			timestamp: new Date(),
		};

		setMessages(prev => [...prev, userMessage]);
		setInput("");
		setShowSuggestions(false);
		setIsTyping(true);
		scrollToBottom();

		try {
			const fullMessage = `Current Smart Contract:\n\`\`\`rust\n${currentCode}\n\`\`\`\n\nRequest: ${input}`;
			
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: fullMessage,
					userId: "user1",
				}),
			});
			
			if (!response.ok) {
				throw new Error(`API responded with status: ${response.status}`);
			}
			
			const data = await response.json();
			const aiResponse = data.content;
			
			// Extract and update code if present
			const codeBlockRegex = /```(?:rust)?([\s\S]*?)```/g;
			const matches = [...aiResponse.matchAll(codeBlockRegex)];
			
			if (matches.length > 0 && onUpdateCode) {
				const extractedCode = matches[0][1].trim();
				onUpdateCode(extractedCode);
			}

			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: aiResponse,
				role: "assistant",
				timestamp: new Date(),
			};
			
			setMessages(prev => [...prev, aiMessage]);
		} catch (error) {
			console.error("Error getting chat response:", error);
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: "Sorry, there was an error processing your request. Please try again.",
				role: "assistant",
				timestamp: new Date(),
			};
			setMessages(prev => [...prev, errorMessage]);
		} finally {
			setIsTyping(false);
			scrollToBottom();
		}
	};

	// Format timestamp
	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	// Handle code copy
	const handleCopyCode = (code: string, blockId: string) => {
		navigator.clipboard.writeText(code).then(() => {
			setCopiedBlockId(blockId);
			setShowCopyToast(true);
			setTimeout(() => {
				setShowCopyToast(false);
				setCopiedBlockId(null);
			}, 2000);
		});
	};

	// Custom code block renderer
	const CodeBlock = ({ language, value, blockId }: { language: string, value: string, blockId: string }) => (
		<div className="relative mt-4 mb-4 rounded-lg overflow-hidden border border-gray-200">
			<div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
				<div className="flex items-center gap-2">
					<Code className="h-4 w-4 text-gray-500" />
					<span className="text-sm font-medium text-gray-600">{language}</span>
				</div>
				<button
					onClick={() => handleCopyCode(value, blockId)}
					className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
				>
					{copiedBlockId === blockId ? (
						<CheckCheck className="h-3.5 w-3.5 text-green-500" />
					) : (
						<Copy className="h-3.5 w-3.5" />
					)}
					{copiedBlockId === blockId ? "Copied!" : "Copy"}
				</button>
			</div>
			<pre className="p-4 bg-gray-50 overflow-x-auto">
				<code className={`language-${language}`}>{value}</code>
			</pre>
		</div>
	);

	// Custom components for ReactMarkdown
	const components = {
		code({ node, inline, className, children, ...props }: any) {
			const match = /language-(\w+)/.exec(className || '');
			const blockId = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			
			if (!inline && match) {
				return (
					<CodeBlock
						language={match[1]}
						value={String(children).replace(/\n$/, '')}
						blockId={blockId}
						{...props}
					/>
				);
			}
			return <code className={className} {...props}>{children}</code>;
		}
	};

	return (
		<div className="flex flex-col h-full bg-white overflow-hidden">
			{/* Toast Notification */}
			<div
				className={`fixed top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 flex items-center gap-2 ${
					showCopyToast ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
				}`}
			>
				<CheckCheck className="h-4 w-4" />
				Code copied to clipboard!
			</div>

			{/* Header */}
			<div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
				<span className="text-sm font-medium text-gray-700 flex items-center gap-2">
					<Code className="h-4 w-4" />
					Smart Contract Assistant
				</span>
			</div>

			{/* Main content area with improved layout */}
			<div className="flex-1 flex overflow-hidden">
				{/* Suggestions sidebar with proper scrolling */}
				<div className="hidden md:block w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
					<div className="p-4 space-y-4">
						<h3 className="text-xs font-medium text-gray-500 flex items-center gap-2">
							<Lightbulb className="h-3.5 w-3.5" />
							Suggested Prompts
						</h3>
						<div className="space-y-2">
							{samplePrompts.map((prompt, index) => (
								<button
									key={index}
									onClick={() => setInput(prompt.text)}
									className="w-full text-left px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors group"
								>
									<div className="flex items-start gap-2">
										<span className="text-lg">{prompt.icon}</span>
										<div className="flex-1 min-w-0">
											<p className="text-sm text-gray-700 font-medium truncate">
												{prompt.text}
											</p>
											<p className="text-xs text-gray-500 mt-0.5">
												{prompt.category}
											</p>
										</div>
									</div>
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Chat area with improved scrolling */}
				<div className="flex-1 flex flex-col overflow-hidden">
					<div
						ref={chatContainerRef}
						className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth"
					>
						<div className="space-y-6">
							{messages.map((message) => (
								<div
									key={message.id}
									className={`flex ${
										message.role === "user" ? "justify-end" : "justify-start"
									}`}
								>
									<div
										className={`max-w-[80%] rounded-2xl p-4 ${
											message.role === "user"
												? "bg-primary text-primary-foreground"
												: "bg-gray-100 text-gray-700"
										}`}
									>
										<div className="flex items-center justify-between gap-4 mb-2">
											<div className="flex items-center gap-2">
												{message.role === "user" ? (
													<User className="h-4 w-4" />
												) : (
													<BotIcon className="h-4 w-4" />
												)}
												<span className="text-sm font-medium">
													{message.role === "user" ? "You" : "AI Assistant"}
												</span>
											</div>
											<span className="text-xs opacity-70">
												{formatTime(message.timestamp)}
											</span>
										</div>
										<div className="prose prose-sm max-w-none overflow-x-auto">
											<ReactMarkdown 
												components={components}
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
									<div className="max-w-[80%] rounded-2xl p-4 bg-gray-100">
										<div className="flex items-center gap-2 mb-2">
											<BotIcon className="h-4 w-4" />
											<span className="text-sm font-medium text-gray-700">
												AI Assistant
											</span>
										</div>
										<div className="flex items-center gap-1">
											<div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
											<div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
											<div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
										</div>
									</div>
								</div>
							)}

							<div ref={messagesEndRef} />
						</div>
					</div>

					{/* Input area with improved styling */}
					<div className="p-4 border-t border-gray-200 bg-white">
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
								className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
							/>
							<button
								type="submit"
								disabled={!input.trim() || isTyping}
								className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
							>
								<Send className="h-4 w-4" />
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SmartContractChat;