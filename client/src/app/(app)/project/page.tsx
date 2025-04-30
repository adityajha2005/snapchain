'use client';
import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import BlocklyWorkspace from '@/components/BlocklyWorkspace';
import CodePanel from '@/components/CodePanel';
import SmartContractChat from '@/components/SmartContractChat';
import { Button } from '@/components/ui/button';

const ProjectPage = () => {
	const [generatedCode, setGeneratedCode] = useState<string>('');
	const [isCodeBlurred, setIsCodeBlurred] = useState(false);
	const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);

	const handleCodeChange = (code: string) => {
		setGeneratedCode(code);
		// Reset blur when code changes
		setIsCodeBlurred(false);
	};

	// Function to handle code updates from the chat component
	const handleCodeUpdateFromChat = (newCode: string) => {
		setGeneratedCode(newCode);
		setIsCodeBlurred(false);
	};

	const handleRefineContract = () => {
		setIsChatPanelOpen(true);
		setIsCodeBlurred(false);
	};

	const toggleChatPanel = () => {
		setIsChatPanelOpen(!isChatPanelOpen);
	};

	return (
		<div className='flex flex-col h-screen bg-white text-slate-800 relative overflow-hidden'>
			{/* Chat Button */}
			<div className=''>
				<Button
					onClick={toggleChatPanel}
					variant='outline'
					size='icon'
					className='fixed z-40 right-6 top-1/2 -translate-y-1/2 rounded-full h-12 w-12 bg-white border border-slate-200 shadow-md'
				>
					<Bot className='h-5 w-5 text-slate-600' />
					<span className='sr-only'>Chat Assistant</span>
				</Button>
			</div>

			<div className='w-screen h-full relative'>
				{/* Blockly Workspace */}
				<div className='w-full overflow-hidden h-full'>
					<BlocklyWorkspace
						onCodeChange={handleCodeChange}
						onRefineContract={handleRefineContract}
					/>
				</div>
			</div>
				<div
					className='absolute top-0 mt-[60px] overflow-hidden right-0 w-2/5 z-50 h-[calc(100%-60px)] bg-white border rounded-2xl border-border shadow-md transition-transform duration-300 ease-in-out'
					style={{ opacity: isChatPanelOpen ? 1 : 0, display: isChatPanelOpen ? '' : 'none' }}
				>
					{/* Close button */}
					<div>
						<Button
							onClick={toggleChatPanel}
							variant='ghost'
							size='icon'
							className='absolute right-0 top-0 z-[100] bg-black/70 rounded-full h-8 w-8 hover:bg-black'
						>
							<X className='h-4 w-4 text-white' />
							<span className='sr-only'>Close</span>
						</Button>
					</div>

					{/* Code Panel */}
					<div className='h-1/2 border-b border-slate-200 p-4 '>
						<CodePanel
							code={generatedCode}
							isBlurred={isCodeBlurred}
						/>
					</div>
					{/* Smart Contract Chat Assistant */}
					<div className='h-1/2 overflow-hidden '>
						<SmartContractChat
							currentCode={generatedCode}
							onUpdateCode={handleCodeUpdateFromChat}
						/>
					</div>
				</div>
	
		</div>
	);
};

export default ProjectPage;
