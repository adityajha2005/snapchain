'use client';

import {
	ArrowLeft,
	ChevronDown,
	ChevronUp,
	Send,
	User,
	Bot as BotIcon,
	Lightbulb,
	Zap,
	X,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

interface Message {
	id: string;
	content: string;
	role: 'user' | 'assistant';
	timestamp: Date;
}

const AIChatPage = () => {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: '1',
			content: "Hello! I'm your Web3 assistant. How can I help you today?",
			role: 'assistant',
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(true);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	// Sample prompts that users might want to try
	const samplePrompts = [
		'How do I create an ERC-20 token?',
		'Explain gas fees in Ethereum',
		'What are smart contract security best practices?',
		'How do I connect my dApp to a wallet?',
		'Explain layer 2 scaling solutions',
		'How does staking work?',
	];

	// Scroll to bottom of messages
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	const handleSendMessage = () => {
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

		// Simulate AI response (in a real app, this would be an API call)
		setTimeout(() => {
			setIsTyping(false);
			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: `I understand you're asking about "${input}". This is a simulated response - in the actual implementation, this would come from a real AI model with Web3 knowledge.`,
				role: 'assistant',
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, aiMessage]);
		}, 1500);
	};

	// Format timestamp
	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	return (
		<div className='h-[calc(100vh-4rem)] flex flex-col bg-background'>
			{/* Header */}
			<div className='flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm'>
				<div className='flex items-center gap-3'>
					<Link
						href='/dashboard'
						className='flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors'
					>
						<ArrowLeft className='h-4 w-4 mr-1' />
						Back
					</Link>
					<div className='flex items-center gap-2'>
						<div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center'>
							<BotIcon className='h-4 w-4 text-primary' />
						</div>
						<div>
							<h1 className='text-sm font-medium'>Web3 AI Assistant</h1>
							<div className='flex items-center text-xs text-muted-foreground'>
								<span className='relative flex h-2 w-2 mr-1.5'>
									<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
									<span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500'></span>
								</span>
								Online
							</div>
						</div>
					</div>
				</div>

				<button
					onClick={() => setShowSuggestions(!showSuggestions)}
					className='text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-accent/10 transition-colors'
					title={showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
				>
					{showSuggestions ? (
						<ChevronUp className='h-4 w-4' />
					) : (
						<ChevronDown className='h-4 w-4' />
					)}
				</button>
			</div>

			{/* Chat area */}
			<div
				ref={chatContainerRef}
				className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent'
			>
				<div className='max-w-3xl mx-auto'>
					{/* Welcome message */}
					{messages.length === 1 && (
						<div className='p-6 mx-auto max-w-2xl text-center'>
							<h2 className='text-2xl font-bold mb-2'>Welcome to SnapChain AI</h2>
							<p className='text-muted-foreground mb-6'>
								Ask anything about Web3, smart contracts, blockchain development, or
								cryptocurrencies.
							</p>
						</div>
					)}

					{/* Messages */}
					<div className='p-4 space-y-6'>
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${
									message.role === 'user' ? 'justify-end' : 'justify-start'
								} animate-in slide-in-from-${
									message.role === 'user' ? 'right' : 'left'
								}-5 fade-in-50 duration-300`}
							>
								<div
									className={`max-w-[85%] md:max-w-[75%] p-4 rounded-lg ${
										message.role === 'user'
											? 'bg-primary text-primary-foreground rounded-br-none'
											: 'bg-card border border-border rounded-bl-none'
									}`}
								>
									<div className='flex items-center justify-between gap-2 mb-1.5'>
										<div className='flex items-center gap-1.5'>
											{message.role === 'user' ? (
												<User className='h-3.5 w-3.5' />
											) : (
												<BotIcon className='h-3.5 w-3.5' />
											)}
											<span className='text-xs font-medium opacity-90'>
												{message.role === 'user' ? 'You' : 'AI Assistant'}
											</span>
										</div>
										<span className='text-[10px] opacity-60'>{formatTime(message.timestamp)}</span>
									</div>
									<p className='text-sm whitespace-pre-wrap'>{message.content}</p>
								</div>
							</div>
						))}

						{/* Typing indicator */}
						{isTyping && (
							<div className='flex justify-start animate-in fade-in-50'>
								<div className='max-w-[85%] md:max-w-[75%] p-4 rounded-lg bg-card border border-border rounded-bl-none'>
									<div className='flex items-center gap-1.5 mb-1'>
										<BotIcon className='h-3.5 w-3.5' />
										<span className='text-xs font-medium opacity-90'>AI Assistant</span>
									</div>
									<div className='flex items-center space-x-1'>
										<div
											className='h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce'
											style={{ animationDelay: '0ms' }}
										></div>
										<div
											className='h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce'
											style={{ animationDelay: '150ms' }}
										></div>
										<div
											className='h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce'
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
			</div>

			{/* Sample prompts */}
			{showSuggestions && (
				<div className='p-4 border-t border-border bg-card/50 backdrop-blur-sm animate-in slide-in-from-bottom-5 fade-in-50'>
					<div className='max-w-3xl mx-auto'>
						<div className='flex items-center justify-between mb-3'>
							<p className='text-sm text-muted-foreground flex items-center'>
								<Lightbulb className='h-3.5 w-3.5 mr-1.5' />
								Suggested questions
							</p>
							<button
								onClick={() => setShowSuggestions(false)}
								className='text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent/10 transition-colors'
							>
								<X className='h-3.5 w-3.5' />
							</button>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
							{samplePrompts.map((prompt) => (
								<button
									key={prompt}
									onClick={() => setInput(prompt)}
									className='text-sm px-3 py-2 bg-card border border-border rounded-md hover:bg-accent/10 transition-colors text-left flex items-center'
								>
									<Zap className='h-3 w-3 text-primary mr-2 flex-shrink-0' />
									<span className='truncate'>{prompt}</span>
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Message input */}
			<div className='p-4 border-t border-border bg-card/50 backdrop-blur-sm'>
				<div className='max-w-3xl mx-auto'>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSendMessage();
						}}
						className='relative'
					>
						<input
							type='text'
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder='Ask anything about Web3, smart contracts, or blockchain...'
							className='w-full p-3 pr-12 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none'
						/>
						<button
							type='submit'
							disabled={!input.trim() || isTyping}
							className='absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-primary-foreground rounded-md disabled:opacity-50 hover:bg-primary/90 transition-colors'
						>
							<Send className='h-4 w-4' />
						</button>
					</form>
					<p className='text-xs text-muted-foreground mt-2 text-center'>
						AI responses are simulated. In production, this would connect to a real AI service.
					</p>
				</div>
			</div>
		</div>
	);
};

export default AIChatPage;
