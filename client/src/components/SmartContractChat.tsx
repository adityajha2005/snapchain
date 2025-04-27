'use client';

import { Send, User, Bot as BotIcon, Lightbulb, Zap, X, Code, RefreshCw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github.css'; // Changed to a light theme

interface Message {
	id: string;
	content: string;
	role: 'user' | 'assistant';
	timestamp: Date;
}

interface SmartContractChatProps {
	currentCode: string;
	onUpdateCode?: (newCode: string) => void;
}

const SmartContractChat = ({ currentCode, onUpdateCode }: SmartContractChatProps) => {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: '1',
			content: "I'll help you improve your smart contract. What would you like to change?",
			role: 'assistant',
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(true);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Enhanced prompts for smart contract improvement
	const samplePrompts = [
		'Add validation for this input parameter',
		'Optimize this function for gas efficiency',
		'Add comments to explain this code section',
		'Make this contract more secure',
		'Check for potential vulnerabilities',
		'Implement error handling',
		'Refactor for better readability',
		'Add events for important state changes',
	];

	// Scroll to bottom of messages
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	// Focus input on load
	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	const handleSendMessage = async () => {
		if (!input.trim()) return;

		// Add user message
		const userMessage: Message = {
			id: Date.now().toString(),
			content: input,
			role: 'user',
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput('');
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
					userId: 'user1', // Use actual user ID in production
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
				role: 'assistant',
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, aiMessage]);
		} catch (error) {
			// Handle error
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: 'Sorry, there was an error processing your request. Please try again.',
				role: 'assistant',
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
			console.error('Error getting chat response:', error);
		} finally {
			setIsTyping(false);
			// Focus back on input after response
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}
	};

	// Format timestamp
	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	const clearChat = () => {
		setMessages([
			{
				id: '1',
				content: "I'll help you improve your smart contract. What would you like to change?",
				role: 'assistant',
				timestamp: new Date(),
			},
		]);
		setShowSuggestions(true);
	};

	return (
		<div className='flex flex-col h-full bg-white overflow-hidden border-l border-gray-200 shadow-sm'>
			{/* Header */}
			<div className='flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200'>
				<span className='text-sm font-medium text-gray-800 flex items-center'>
					<Code className='h-4 w-4 mr-1.5 text-gray-600' />
					Smart Contract Assistant
				</span>
				<button
					onClick={clearChat}
					className='text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors'
					title='Clear chat'
				>
					<RefreshCw className='h-3.5 w-3.5' />
				</button>
			</div>

			{/* Chat area */}
			<div
				ref={chatContainerRef}
				className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent px-4'
			>
				<div className='space-y-4 py-4'>
					{messages.map((message) => (
						<div
							key={message.id}
							className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
						>
							<div
								className={`max-w-[85%] p-3 rounded-lg text-sm shadow-sm ${
									message.role === 'user'
										? 'bg-gray-800 text-white rounded-br-none'
										: 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
								}`}
							>
								<div className='flex items-center justify-between gap-2 mb-1.5'>
									<div className='flex items-center gap-1.5'>
										{message.role === 'user' ? (
											<User className='h-3.5 w-3.5' />
										) : (
											<BotIcon className='h-3.5 w-3.5' />
										)}
										<span className='text-xs font-medium'>
											{message.role === 'user' ? 'You' : 'AI Assistant'}
										</span>
									</div>
									<span className='text-[10px] opacity-70'>{formatTime(message.timestamp)}</span>
								</div>
								<div className='whitespace-pre-wrap prose prose-sm max-w-none'>
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
						<div className='flex justify-start'>
							<div className='max-w-[85%] p-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200 shadow-sm'>
								<div className='flex items-center gap-1.5 mb-1.5'>
									<BotIcon className='h-3.5 w-3.5' />
									<span className='text-xs font-medium'>AI Assistant</span>
								</div>
								<div className='flex items-center space-x-1.5 py-1'>
									<div
										className='h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce'
										style={{ animationDelay: '0ms' }}
									></div>
									<div
										className='h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce'
										style={{ animationDelay: '150ms' }}
									></div>
									<div
										className='h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce'
										style={{ animationDelay: '300ms' }}
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
				<div className='p-3 border-t border-gray-200 bg-gray-50'>
					<div>
						<div className='flex items-center justify-between mb-2'>
							<p className='text-xs text-gray-600 flex items-center font-medium'>
								<Lightbulb className='h-3.5 w-3.5 mr-1.5 text-amber-500' />
								Suggested Prompts
							</p>
							<button
								onClick={() => setShowSuggestions(false)}
								className='text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors'
							>
								<X className='h-3.5 w-3.5' />
							</button>
						</div>
						<div className='grid grid-cols-2 gap-2'>
							{samplePrompts.map((prompt) => (
								<button
									key={prompt}
									onClick={() => setInput(prompt)}
									className='text-xs px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 transition-colors text-left flex items-center shadow-sm'
								>
									<Zap className='h-3 w-3 text-gray-600 mr-1.5 flex-shrink-0' />
									<span className='truncate text-gray-700'>{prompt}</span>
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Message input */}
			<div className='p-3 border-t border-gray-200 bg-white'>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSendMessage();
					}}
					className='relative'
				>
					<input
						ref={inputRef}
						type='text'
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder='Ask for modifications to your smart contract...'
						className='w-full py-2.5 px-4 pr-12 rounded-full bg-gray-100 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent placeholder:text-gray-400'
					/>
					<button
						type='submit'
						disabled={!input.trim() || isTyping}
						className='absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black text-white rounded-full flex item-center justify-center disabled:opacity-50 hover:bg-gray-700 transition-colors'
					>
						<Send className='h-4 w-4' />
					</button>
				</form>
				<p className='text-[10px] text-gray-500 mt-2 text-center'>
					AI will help optimize and improve your smart contract code
				</p>
			</div>
		</div>
	);
};

export default SmartContractChat;
