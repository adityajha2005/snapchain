"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { BlocklyWorkspace as ReactBlockly } from "react-blockly";
import * as Blockly from "blockly";
import { rustGenerator } from "@/utils/rustGenerator";
import { initialToolbox } from "@/utils/blocklyConfig";
import { Zap, Rocket, Key, X, AlertCircle, CheckCircle2, Loader2, Code, Terminal, ChevronLeft, ChevronRight } from "lucide-react";
import BlocklyErrorDisplay from "./BlocklyErrorDisplay";
import BlocklySuggestions from './BlocklySuggestions';
import debounce from 'lodash/debounce';

interface BlocklyWorkspaceProps {
	onCodeChange: (code: string) => void;
}

interface DeploymentStatus {
	stage: 'idle' | 'verifying' | 'building' | 'deploying' | 'success' | 'error';
	message: string;
	address?: string;
	balance?: number;
	programId?: string;
}

interface CodeGenerationError {
	message: string;
	blockId?: string;
}

const BlocklyWorkspace: React.FC<BlocklyWorkspaceProps> = ({
	onCodeChange,
}) => {
	const blocklyDiv = useRef<HTMLDivElement>(null);
	const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [xml, setXml] = useState<string>("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [isDeploying, setIsDeploying] = useState(false);
	const [network, setNetwork] = useState<"devnet" | "testnet">("devnet");
	const [showKeypairDialog, setShowKeypairDialog] = useState(false);
	const [selectedKeypair, setSelectedKeypair] = useState<File | null>(null);
	const [currentCode, setCurrentCode] = useState<string>("");
	const [isRefinedCode, setIsRefinedCode] = useState(false);
	const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
		stage: 'idle',
		message: ''
	});
	const [codegenError, setCodegenError] = useState<CodeGenerationError | null>(null);
	const [showRustCode, setShowRustCode] = useState(false);
	const [showAssistant, setShowAssistant] = useState(false);
	const [panelWidth, setPanelWidth] = useState(384); // 96 * 4 = 384px
	const [isGeneratingCode, setIsGeneratingCode] = useState(false);

	// Debounced code generation
	const debouncedCodeGeneration = useCallback(
		debounce(async (workspace: Blockly.WorkspaceSvg) => {
			try {
				setIsGeneratingCode(true);
				const code = await rustGenerator.workspaceToCode(workspace);
				setCurrentCode(code);
				onCodeChange(code);
				setCodegenError(null);
			} catch (err: any) {
				console.error("Code generation error:", err);
				setCodegenError({
					message: err.message || "Unknown error during code generation",
					blockId: err.blockId,
				});
				onCodeChange(currentCode);
			} finally {
				setIsGeneratingCode(false);
			}
		}, 300),
		[]
	);

	// Handle workspace changes
	const handleChange = (workspace: Blockly.WorkspaceSvg) => {
		workspaceRef.current = workspace;
		if (!isRefinedCode) {
			debouncedCodeGeneration(workspace);
		}
	};

	// Refine contract using LLM
	const handleRefineContract = async () => {
		if (!workspaceRef.current) return;
		
		setIsGenerating(true);
		try {
			// Use the current code, whether it's from blocks or previously refined
			const codeToRefine = currentCode || rustGenerator.workspaceToCode(workspaceRef.current);
			
			// Send to API with refinement instruction
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: `You are a senior Rust developer. This project is your life's work — you cannot afford a single mistake. Every line of code must be precise, clean, and exactly as the user specifies. No hallucinations, no assumptions, no improvisation. Your only mission is to understand the user's instructions perfectly and implement them with complete accuracy. Your reputation and everything you stand for depends on delivering exactly what the user asks, nothing more, nothing less.

Task: Please analyze this Solana smart contract with extreme attention to detail. Focus on:
1. Compilation correctness - ensure the code compiles without any errors
2. Security vulnerabilities - identify and fix any potential security issues
3. Gas optimization - optimize for minimal gas usage without compromising security
4. Best practices - ensure code follows Rust and Solana best practices
5. Error handling - verify all error cases are properly handled

Here's the current code:

\`\`\`rust
${codeToRefine}
\`\`\`

Please provide:
1. A thorough analysis of any issues found
2. The refined code with necessary improvements
3. Confirmation that the code will compile successfully
4. A detailed explanation of all changes made

Return the improved code in a code block using \`\`\`rust\`\`\` format.`,
					userId: "contract-refiner",
				}),
			});
			
			if (!response.ok) {
				throw new Error(`API responded with status: ${response.status}`);
			}
			
			const data = await response.json();
			
			// Extract code from response and update
			const codeBlockRegex = /```(?:rust)?([\s\S]*?)```/g;
			const matches = [...data.content.matchAll(codeBlockRegex)];
			
			if (matches.length > 0) {
				const refinedCode = matches[0][1].trim();
				setCurrentCode(refinedCode);
				setIsRefinedCode(true);
				onCodeChange(refinedCode);
			} else {
				const fallbackCode = data.content;
				setCurrentCode(fallbackCode);
				setIsRefinedCode(true);
				onCodeChange(fallbackCode);
			}
		} catch (error) {
			console.error("Error refining contract:", error);
			alert("Failed to refine contract. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	// Reset workspace and code state
	const handleResetWorkspace = () => {
		if (workspaceRef.current) {
			workspaceRef.current.clear();
			setIsRefinedCode(false);
			setCurrentCode("");
			onCodeChange("");
			setCodegenError(null);
		}
	};

	// Effect to sync code state on mount
	useEffect(() => {
		if (workspaceRef.current && !isRefinedCode) {
			try {
				const code = rustGenerator.workspaceToCode(workspaceRef.current);
				setCurrentCode(code);
				onCodeChange(code);
			} catch (err: any) {
				console.error("Initial code generation error:", err);
				setCodegenError({
					message: err.message || "Unknown error during code generation",
					blockId: err.blockId,
				});
			}
		}
	}, []);

	// Handle keypair file selection
	const handleKeypairSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedKeypair(file);
			setDeploymentStatus({
				stage: 'idle',
				message: ''
			});
		}
	};

	// Start deployment process
	const initiateDeployment = () => {
		setShowKeypairDialog(true);
		setDeploymentStatus({
			stage: 'idle',
			message: 'deployment in progress...'
		});
	};

	// Deploy contract to Solana network
	const handleDeploy = async () => {
		if (!workspaceRef.current || !selectedKeypair) return;
		
		setIsDeploying(true);
		setDeploymentStatus({
			stage: 'verifying',
			message: 'Verifying keypair and checking balance...'
		});

		try {
			// Get current Rust code
			const currentCode = rustGenerator.workspaceToCode(workspaceRef.current);
			
			// Create form data to send both code and keypair file
			const formData = new FormData();
			formData.append('code', currentCode);
			formData.append('network', network);
			formData.append('keypair', selectedKeypair);
			
			// Send to API for deployment
			setDeploymentStatus({
				stage: 'building',
				message: 'Building Solana program...'
			});

			const response = await fetch('/api/deploy', {
				method: 'POST',
				body: formData,
			});
			
			const data = await response.json();
			
			if (data.success) {
				setDeploymentStatus({
					stage: 'success',
					message: `Successfully deployed to ${network}!`,
					address: data.deployerAddress,
					balance: data.balance,
					programId: data.programId
				});

				// Wait 3 seconds before closing the dialog
				setTimeout(() => {
					setShowKeypairDialog(false);
					setSelectedKeypair(null);
					if (fileInputRef.current) {
						fileInputRef.current.value = '';
					}
					setDeploymentStatus({
						stage: 'idle',
						message: ''
					});
				}, 3000);
			} else {
				setDeploymentStatus({
					stage: 'error',
					message: data.error
				});
			}
		} catch (error: any) {
			console.error("Error deploying contract:", error);
			setDeploymentStatus({
				stage: 'error',
				message: `Failed to deploy contract to ${network}. Please try again.`
			});
		} finally {
			setIsDeploying(false);
		}
	};

	const getStatusIcon = () => {
		switch (deploymentStatus.stage) {
			case 'verifying':
			case 'building':
			case 'deploying':
				return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
			case 'success':
				return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
			case 'error':
				return <AlertCircle className="h-5 w-5 text-red-500" />;
			default:
				return null;
		}
	};

	// Highlight a problematic block in the workspace
	const highlightProblemBlock = (blockId: string) => {
		if (!workspaceRef.current) return;
		
		// Find the block by ID
		const block = workspaceRef.current.getBlockById(blockId);
		if (block) {
			// Center the workspace on this block
			workspaceRef.current.centerOnBlock(blockId);
			
			// Flash the block to draw attention to it
			if (block.select) {
				block.select();
			}
			
			// Add a visual indicator by adding a temporary warning
			if (block.setWarningText) {
				block.setWarningText("This block caused an error");
				
				// Clear the warning after a few seconds
				setTimeout(() => {
					if (block && block.setWarningText) {
						block.setWarningText(null);
					}
				}, 5000);
			}
		}
	};

	// Set up workspace event listeners
	useEffect(() => {
		if (workspaceRef.current) {
			// Close flyout when a block is created
			workspaceRef.current.addChangeListener(
				(event: Blockly.Events.Abstract) => {
					if (
						event.type === Blockly.Events.BLOCK_CREATE ||
						event.type === Blockly.Events.BLOCK_DRAG
					) {
						const toolbox = workspaceRef.current?.getToolbox();
						if (toolbox) {
							setTimeout(() => {
								toolbox.clearSelection();
							}, 100);
						}
					}
				},
			);
		}
	}, []);

	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.key === 'c') setShowRustCode(prev => !prev);
			if (e.ctrlKey && e.key === 'a') setShowAssistant(prev => !prev);
		};
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			debouncedCodeGeneration.cancel();
		};
	}, [debouncedCodeGeneration]);

	return (
		<>
			<div className="relative h-full w-full">
				{/* Main workspace */}
				<div className="h-full w-full bg-[#f8f9fc] rounded-lg shadow-sm border border-gray-200 overflow-hidden">
					{/* Header with subtle gradient */}
					<div className="absolute top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 z-10 flex justify-between items-center">
						<div className="flex items-center h-full px-4">
							<div className="flex space-x-2">
								<div className="w-3 h-3 rounded-full bg-red-400"></div>
								<div className="w-3 h-3 rounded-full bg-yellow-400"></div>
								<div className="w-3 h-3 rounded-full bg-green-400"></div>
							</div>
							<h2 className="ml-4 text-sm font-medium text-gray-700">
								Solana Program Builder
							</h2>
						</div>
						<div className="flex items-center gap-2 mr-4">
							<select
								value={network}
								onChange={(e) => setNetwork(e.target.value as "devnet" | "testnet")}
								className="px-2 py-1 text-xs bg-white text-gray-700 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
							>
								<option value="devnet">Devnet</option>
								<option value="testnet">Testnet</option>
							</select>
							<button
								onClick={handleResetWorkspace}
								className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors"
							>
								Reset
							</button>
							<button
								onClick={initiateDeployment}
								disabled={isDeploying}
								className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
							>
								<Rocket className="h-3.5 w-3.5" />
								Deploy
							</button>
							<button
								onClick={handleRefineContract}
								disabled={isGenerating}
								className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
							>
								<Zap className="h-3.5 w-3.5" />
								{isGenerating ? "Refining..." : "Refine Contract"}
							</button>
						</div>
					</div>

					{/* Loading indicator */}
					<div className={`absolute top-16 right-4 flex items-center space-x-2 bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-200 z-50 transition-all duration-300 ${isGeneratingCode ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
						<Loader2 className="h-4 w-4 animate-spin text-primary" />
						<span className="text-xs text-gray-700">Generating code...</span>
					</div>

					{/* Main Blockly workspace with enhanced styling */}
					<div className="h-full w-full pt-12">
						<style jsx global>{`
							.blocklyMainBackground {
								stroke: none !important;
							}
							.blocklyToolboxDiv {
								border-right: 1px solid #e5e7eb !important;
								background-color: white !important;
								width: 240px !important;
							}
							.blocklyFlyout {
								border-right: 1px solid #e5e7eb !important;
							}
							.blocklyFlyoutBackground {
								fill: white !important;
								fill-opacity: 1 !important;
							}
							
							.blocklyTreeRow {
								height: 40px !important;
								line-height: 40px !important;
								padding: 0 8px !important;
								margin: 0 !important;
							}
							.blocklyTreeLabel {
								font-family: ui-sans-serif, system-ui, -apple-system !important;
								font-size: 14px !important;
								padding: 0 8px !important;
								color: #374151 !important;
							}
							.blocklyTreeSelected {
								background: #f3f4f6 !important;
							}
							.blocklyTreeRow:hover {
								background: #f9fafb !important;
							}
							.blocklyFlyoutButton {
								fill: #f3f4f6 !important;
							}
							.blocklyFlyoutButtonBackground {
								stroke: #e5e7eb !important;
							}
							.blocklyFlyoutButton:hover {
								fill: #e5e7eb !important;
							}
							.blocklyFlyoutButtonShadow {
								display: none;
							}
							.blocklyScrollbarVertical,
							.blocklyFlyoutScrollbar {
								display: none !important;
							}
							
							/* Error styling */
							.blocklyError {
								fill: rgba(239, 68, 68, 0.1) !important;
								stroke: #ef4444 !important;
							}
							
							.blocklyErrorText {
								fill: #ef4444 !important;
								font-weight: bold !important;
							}
						`}</style>
						<ReactBlockly
							toolboxConfiguration={initialToolbox}
							workspaceConfiguration={{
								grid: {
									spacing: 25,
									length: 3,
									colour: "#e5e7eb",
									snap: true,
								},
								zoom: {
									controls: true,
									wheel: true,
									startScale: 0.85,
									maxScale: 3,
									minScale: 0.3,
									scaleSpeed: 1.2,
									pinch: true,
								},
								trashcan: true,
								theme: {
									name: "custom",
									base: "classic",
									componentStyles: {
										workspaceBackgroundColour: "#f8f9fc",
										toolboxBackgroundColour: "#ffffff",
										toolboxForegroundColour: "#374151",
										flyoutBackgroundColour: "#ffffff",
										flyoutForegroundColour: "#374151",
										flyoutOpacity: 1,
										scrollbarColour: "#e5e7eb",
										insertionMarkerColour: "#3b82f6",
										insertionMarkerOpacity: 0.3,
										scrollbarOpacity: 0.4,
										cursorColour: "#3b82f6",
									},
								},
								move: {
									scrollbars: {
										horizontal: true,
										vertical: true,
									},
									drag: true,
									wheel: true,
								},
								renderer: "zelos",
								sounds: true,
							}}
							initialXml={xml}
							onWorkspaceChange={handleChange}
							className="h-full w-full"
						/>
					</div>

					{/* Status indicator */}
					<div className="absolute bottom-4 right-4 flex items-center space-x-2 text-xs text-gray-500">
						<div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
						<span>Ready</span>
					</div>
				</div>

				{/* Floating panels */}
				<div 
					className={`fixed top-20 right-0 bottom-20 transform transition-all duration-300 ease-in-out ${showRustCode ? 'translate-x-0' : 'translate-x-full'}`}
					style={{ 
						width: panelWidth,
						willChange: 'transform',
						backfaceVisibility: 'hidden',
						perspective: '1000px'
					}}
				>
					<button
						onClick={() => setShowRustCode(!showRustCode)}
						className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-l-lg shadow-sm border border-gray-200 border-r-0"
					>
						{showRustCode ? <ChevronRight className="h-4 w-4" /> : <Code className="h-4 w-4" />}
					</button>
					<div className="h-full rounded-l-lg shadow-sm border border-gray-200 border-r-0 overflow-hidden bg-white">
						<div className="flex items-center justify-between p-4 border-b border-gray-200">
							<h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
								<Code className="h-4 w-4" />
								Generated Rust Code
							</h3>
							<button
								onClick={() => setShowRustCode(false)}
								className="text-gray-400 hover:text-gray-600"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
						<div className="p-4 h-[calc(100%-4rem)] overflow-auto bg-[#f8f9fc]">
							<pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap">
								{currentCode || '// Drag blocks to generate Rust code'}
							</pre>
						</div>
					</div>
				</div>

				{/* Smart Contract Assistant Panel */}
				<div 
					className={`fixed top-20 right-0 bottom-20 transform transition-all duration-300 ease-in-out ${showAssistant ? 'translate-x-0' : 'translate-x-full'} ${showRustCode ? `mr-[${panelWidth}px]` : ''}`}
					style={{ 
						width: panelWidth,
						willChange: 'transform',
						backfaceVisibility: 'hidden',
						perspective: '1000px'
					}}
				>
					<button
						onClick={() => setShowAssistant(!showAssistant)}
						className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-l-lg shadow-sm border border-gray-200 border-r-0"
					>
						{showAssistant ? <ChevronRight className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
					</button>
					<div className="h-full rounded-l-lg shadow-sm border border-gray-200 border-r-0 overflow-hidden bg-white">
						<div className="flex items-center justify-between p-4 border-b border-gray-200">
							<h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
								<Terminal className="h-4 w-4" />
								Smart Contract Assistant
							</h3>
							<button
								onClick={() => setShowAssistant(false)}
								className="text-gray-400 hover:text-gray-600"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
						<div className="p-4 space-y-4 h-[calc(100%-4rem)] overflow-auto bg-[#f8f9fc]">
							<BlocklySuggestions 
								workspace={workspaceRef.current}
								currentCode={currentCode}
							/>
							<BlocklyErrorDisplay 
								error={codegenError}
								onDismiss={() => setCodegenError(null)}
								onHighlightBlock={highlightProblemBlock}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Keypair Selection Dialog */}
			{showKeypairDialog && (
				<div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg border border-gray-200">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
								<Key className="h-5 w-5" />
								Deploy to {network}
							</h3>
							<button
								onClick={() => {
									setShowKeypairDialog(false);
									setSelectedKeypair(null);
									if (fileInputRef.current) {
										fileInputRef.current.value = '';
									}
									setDeploymentStatus({
										stage: 'idle',
										message: ''
									});
								}}
								className="text-gray-400 hover:text-gray-600"
								disabled={isDeploying}
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						<div className="relative">
							{/* Blurred original content */}
							<div className="blur-sm opacity-30">
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-zinc-300 mb-2">
											Select Keypair File
										</label>
										<input
											ref={fileInputRef}
											type="file"
											accept=".json,.keypair"
											onChange={handleKeypairSelect}
											disabled={true}
											className="block w-full text-sm text-zinc-400
												file:mr-4 file:py-2 file:px-4
												file:rounded-md file:border-0
												file:text-sm file:font-medium
												file:bg-primary file:text-white
												hover:file:bg-primary/90
												file:cursor-pointer cursor-pointer
												focus:outline-none
												disabled:opacity-50 disabled:cursor-not-allowed"
										/>
										<p className="mt-2 text-xs text-zinc-500">
											Your keypair file is typically located at ~/.config/solana/id.json
										</p>
									</div>

									<div className="bg-zinc-800/50 rounded-md p-3 border border-zinc-700/50">
										<h4 className="text-xs font-medium text-zinc-300 mb-2">Requirements:</h4>
										<ul className="text-xs text-zinc-400 space-y-1">
											<li>• Valid Solana keypair file</li>
											<li>• Minimum 2 SOL for deployment</li>
											<li>• Solana CLI installed and configured</li>
										</ul>
									</div>
								</div>
							</div>

							<div className="absolute inset-0 flex items-center justify-center">
								<div className="text-2xl font-bold text-white">Coming Soon</div>
							</div>
						</div>
							
						<div className="flex justify-end gap-3 pt-2">
							<button
								onClick={() => {
									setShowKeypairDialog(false);
									setSelectedKeypair(null);
									if (fileInputRef.current) {
										fileInputRef.current.value = '';
									}
									setDeploymentStatus({
										stage: 'idle',
										message: ''
									});
								}}
								className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default BlocklyWorkspace;
