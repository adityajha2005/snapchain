'use client';
import React, { useRef, useState, useEffect } from 'react';
import { BlocklyWorkspace as ReactBlockly } from 'react-blockly';
import * as Blockly from 'blockly';
import { rustGenerator } from '@/utils/rustGenerator';
import { initialToolbox } from '@/utils/blocklyConfig';
import { Zap, Rocket, Key, X, AlertCircle, CheckCircle2, Loader2, Menu } from 'lucide-react';
import Logo from './shared/Logo';
import SmartContracts from './icons/smartContracts';

interface BlocklyWorkspaceProps {
	onCodeChange: (code: string) => void;
	onRefineContract: () => void;
}

interface DeploymentStatus {
	stage: 'idle' | 'verifying' | 'building' | 'deploying' | 'success' | 'error';
	message: string;
	address?: string;
	balance?: number;
	programId?: string;
}

const BlocklyWorkspace: React.FC<BlocklyWorkspaceProps> = ({ onCodeChange, onRefineContract }) => {
	const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [xml] = useState<string>('');
	const [isGenerating, setIsGenerating] = useState(false);
	const [isDeploying, setIsDeploying] = useState(false);
	const [network, setNetwork] = useState<'devnet' | 'testnet'>('devnet');
	const [showKeypairDialog, setShowKeypairDialog] = useState(false);
	const [selectedKeypair, setSelectedKeypair] = useState<File | null>(null);
	const [currentCode, setCurrentCode] = useState<string>('');
	const [isRefinedCode, setIsRefinedCode] = useState(false);
	const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
		stage: 'idle',
		message: '',
	});
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	// Generate Rust code when blocks change
	const handleChange = (workspace: Blockly.WorkspaceSvg) => {
		workspaceRef.current = workspace;

		// Only update code if we're not using refined code
		if (!isRefinedCode) {
			const code = rustGenerator.workspaceToCode(workspace);
			setCurrentCode(code);
			onCodeChange(code);
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
					userId: 'contract-refiner',
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
				onRefineContract();
			} else {
				const fallbackCode = data.content;
				setCurrentCode(fallbackCode);
				setIsRefinedCode(true);
				onCodeChange(fallbackCode);
				onRefineContract();
			}
		} catch (error) {
			console.error('Error refining contract:', error);
			alert('Failed to refine contract. Please try again.');
		} finally {
			setIsGenerating(false);
		}
	};

	// Reset workspace and code state
	const handleResetWorkspace = () => {
		if (workspaceRef.current) {
			workspaceRef.current.clear();
			setIsRefinedCode(false);
			setCurrentCode('');
			onCodeChange('');
		}
	};

	// Effect to sync code state on mount
	useEffect(() => {
		if (workspaceRef.current && !isRefinedCode) {
			const code = rustGenerator.workspaceToCode(workspaceRef.current);
			setCurrentCode(code);
			onCodeChange(code);
		}
	}, []);

	// Handle keypair file selection
	const handleKeypairSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedKeypair(file);
			setDeploymentStatus({
				stage: 'idle',
				message: '',
			});
		}
	};

	// Start deployment process
	const initiateDeployment = () => {
		setShowKeypairDialog(true);
		setDeploymentStatus({
			stage: 'idle',
			message: '',
		});
	};

	// Deploy contract to Solana network
	const handleDeploy = async () => {
		if (!workspaceRef.current || !selectedKeypair) return;

		setIsDeploying(true);
		setDeploymentStatus({
			stage: 'verifying',
			message: 'Verifying keypair and checking balance...',
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
				message: 'Building Solana program...',
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
					programId: data.programId,
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
						message: '',
					});
				}, 3000);
			} else {
				setDeploymentStatus({
					stage: 'error',
					message: data.error,
				});
			}
		} catch (error: any) {
			console.error('Error deploying contract:', error);
			setDeploymentStatus({
				stage: 'error',
				message: `Failed to deploy contract to ${network}. Please try again.`,
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
				return <Loader2 className='h-5 w-5 animate-spin text-primary' />;
			case 'success':
				return <CheckCircle2 className='h-5 w-5 text-emerald-500' />;
			case 'error':
				return <AlertCircle className='h-5 w-5 text-red-500' />;
			default:
				return null;
		}
	};

	// Set up workspace event listeners
	useEffect(() => {
		if (workspaceRef.current) {
			// Close flyout when a block is created
			workspaceRef.current.addChangeListener((event: Blockly.Events.Abstract) => {
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
			});
		}
	}, []);

	// Handle window resize for responsiveness
	useEffect(() => {
		const handleResize = () => {
			if (workspaceRef.current) {
				Blockly.svgResize(workspaceRef.current);
			}
		};

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return (
		<>
			<div className='relative h-full w-full overflow-hidden bg-background'>
				{/* Header with subtle gradient - responsive */}
				<div className='fixed bg-transparent top-0 left-0 right-0 h-fit z-10 flex justify-between items-center p-2'>
					{/* Logo and title - visible on all screens */}
					<div className='flex items-center h-full px-2 sm:px-4 rounded-2xl bg-white/10 backdrop-blur-md p-2 gap-1 sm:gap-2'>
						<Logo iconOnly />
						<div className='hidden sm:block mx-2 h-6 w-px rounded bg-black'></div>
						<SmartContracts className='size-4 sm:size-5 mr-1 sm:mr-2' />
						<div className='text-xs sm:text-sm font-medium text-slate-700'>New Contract</div>
						<div className='hidden sm:block mx-2 h-6 w-px rounded bg-black'></div>
						<h2 className='hidden sm:block text-sm font-medium text-slate-700'>
							Solana Program Builder
						</h2>
					</div>

					{/* Mobile menu button */}
					<button
						className='md:hidden flex items-center justify-center p-2 rounded-md bg-white/20 backdrop-blur-md'
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						<Menu className='h-5 w-5 text-slate-700' />
					</button>

					{/* Desktop controls */}
					<div className='hidden md:flex items-center gap-2 mr-4 bg-white/20 backdrop-blur-md rounded-2xl p-2'>
						<select
							value={network}
							onChange={(e) => setNetwork(e.target.value as 'devnet' | 'testnet')}
							className='px-2 py-1 text-xs bg-white/10 backdrop-blur-md text-slate-800 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary'
						>
							<option value='devnet'>Devnet</option>
							<option value='testnet'>Testnet</option>
						</select>
						<button
							onClick={handleResetWorkspace}
							className='flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md text-slate-700 text-xs font-medium rounded-md hover:bg-white/20 transition-colors'
						>
							Reset
						</button>
						<button
							onClick={initiateDeployment}
							disabled={isDeploying}
							className='flex items-center gap-2 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-medium rounded-md hover:bg-emerald-600/90 transition-colors disabled:opacity-50'
						>
							<Rocket className='h-3.5 w-3.5' />
							Deploy
						</button>
						<button
							onClick={handleRefineContract}
							disabled={isGenerating}
							className='flex items-center gap-2 px-3 py-1.5 bg-primary/90 backdrop-blur-md text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50'
						>
							<Zap className='h-3.5 w-3.5' />
							{isGenerating ? 'Refining...' : 'Refine Contract'}
						</button>
					</div>
				</div>

				{/* Mobile menu dropdown */}
				{mobileMenuOpen && (
					<div className='fixed top-14 right-2 z-20 bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-3 md:hidden'>
						<div className='flex flex-col gap-2'>
							<select
								value={network}
								onChange={(e) => setNetwork(e.target.value as 'devnet' | 'testnet')}
								className='px-2 py-1.5 text-xs bg-white/10 text-slate-800 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary'
							>
								<option value='devnet'>Devnet</option>
								<option value='testnet'>Testnet</option>
							</select>
							<button
								onClick={handleResetWorkspace}
								className='flex items-center justify-center gap-2 px-3 py-1.5 bg-white/10 text-slate-700 text-xs font-medium rounded-md hover:bg-white/20 transition-colors w-full'
							>
								Reset
							</button>
							<button
								onClick={initiateDeployment}
								disabled={isDeploying}
								className='flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-500/90 text-white text-xs font-medium rounded-md hover:bg-emerald-600/90 transition-colors disabled:opacity-50 w-full'
							>
								<Rocket className='h-3.5 w-3.5' />
								Deploy
							</button>
							<button
								onClick={handleRefineContract}
								disabled={isGenerating}
								className='flex items-center justify-center gap-2 px-3 py-1.5 bg-primary/90 text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50 w-full'
							>
								<Zap className='h-3.5 w-3.5' />
								{isGenerating ? 'Refining...' : 'Refine Contract'}
							</button>
						</div>
					</div>
				)}

				{/* Main Blockly workspace with enhanced styling */}
				<div className='h-full w-full bg-background'>
					<style
						jsx
						global
					>{`
						.blocklyMainBackground {
							stroke: 1px black !important;
						}
						.blocklyToolboxDiv {
							border-right: none !important;
							box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
							background-color: #f8fafc !important;
							width: 200px !important;
							max-width: 40vw !important;
							margin: 60px 10px 10px 10px !important;
							border-radius: 0 12px !important;
						}
						@media (min-width: 768px) {
							.blocklyToolboxDiv {
								width: 240px !important;
								margin: 60px 0px 0px 0px !important;
							}
						}
						.blocklyFlyout {
							border-right: 1px solid rgba(0, 0, 0, 0.1) !important;
							box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
							background-color: #f8fafc !important;
							margin: 60px 10px 10px 10px !important;
							border-radius: 12px !important;
						}
						@media (min-width: 768px) {
							.blocklyFlyout {
								margin: 60px 15px 15px 15px !important;
							}
						}
						.blocklyFlyoutBackground {
							fill: #f8fafc !important;
							fill-opacity: 1 !important;
						}

						.blocklyTreeRow {
							height: 36px !important;
							line-height: 36px !important;
							padding: 0 6px !important;
							margin: 0 !important;
						}
						@media (min-width: 768px) {
							.blocklyTreeRow {
								height: 40px !important;
								line-height: 40px !important;
								padding: 0 8px !important;
							}
						}
						.blocklyTreeLabel {
							font-family: ui-sans-serif, system-ui, -apple-system !important;
							font-size: 13px !important;
							padding: 0 6px !important;
						}
						@media (min-width: 768px) {
							.blocklyTreeLabel {
								font-size: 14px !important;
								padding: 0 8px !important;
							}
						}
						.blocklyTreeSelected {
							background: rgba(59, 130, 246, 0.4) !important;
						}
						.blocklyTreeRow:hover {
							background: rgba(0, 0, 0, 0.02) !important;
						}
						.blocklyFlyoutButton {
							fill: #94a3b8 !important;
						}
						.blocklyFlyoutButtonBackground {
							stroke: #f8fafc !important;
						}
						.blocklyFlyoutButton:hover {
							fill: #64748b !important;
						}
						.blocklyFlyoutButtonShadow {
							display: none;
						}
						.blocklyTooltipDiv {
							background-color: #ffffff !important;
							border: 2px solid #e2e8f0 !important;
							box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
							border-radius: 6px !important;
							padding: 8px 12px !important;
							font-family: ui-sans-serif, system-ui, -apple-system !important;
							font-size: 13px !important;
							color: #334155 !important;
							max-width: 300px !important;
							z-index: 100 !important;
							transition: opacity 0.1s !important; /* Fast transition */
							opacity: 1 !important;
						}
						/* Override Blockly's default tooltip delay */
						.blockly-tooltip-div-show {
							opacity: 1 !important;
							transition-delay: 0.1s !important; /* Reduced delay before showing */
						}
						@media (min-width: 768px) {
							.blocklyTooltipDiv {
								font-size: 14px !important;
								padding: 10px 14px !important;
							}
						}
						.blocklyScrollbarVertical,
						.blocklyFlyoutScrollbar {
							display: none !important;
						}
					`}</style>
					<ReactBlockly
						toolboxConfiguration={initialToolbox}
						workspaceConfiguration={{
							grid: {
								spacing: 25,
								length: 3,
								colour: '#94a3b820',
								snap: true,
							},
							zoom: {
								controls: true,
								wheel: true,
								startScale: 0.75,
								maxScale: 3,
								minScale: 0.3,
								scaleSpeed: 1.2,
								pinch: true,
							},
							trashcan: true,
							theme: {
								name: 'custom',
								base: 'classic',
								componentStyles: {
									workspaceBackgroundColour: '#f1f5f9',
									toolboxBackgroundColour: '#f8fafc',
									toolboxForegroundColour: '#334155',
									flyoutBackgroundColour: '#f8fafc',
									flyoutForegroundColour: '#334155',
									flyoutOpacity: 1,
									scrollbarColour: '#94a3b8',
									insertionMarkerColour: '#3b82f6',
									insertionMarkerOpacity: 0.3,
									scrollbarOpacity: 0.4,
									cursorColour: '#3b82f6',
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
							renderer: 'zelos',
							sounds: true,
						}}
						initialXml={xml}
						onWorkspaceChange={handleChange}
						className='h-full w-full'
					/>
				</div>

				{/* Decorative elements */}
				<div className='absolute bottom-4 right-4 flex items-center space-x-2 text-xs text-slate-600'>
					<div className='w-2 h-2 rounded-full bg-primary animate-pulse'></div>
					<span>Ready</span>
				</div>
			</div>

			{/* Enhanced Keypair Selection Dialog - Responsive */}
			{showKeypairDialog && (
				<div className='fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-auto shadow-xl border border-slate-200'>
						<div className='flex justify-between items-center mb-4'>
							<h3 className='text-base sm:text-lg font-medium text-slate-800 flex items-center gap-2'>
								<Key className='h-4 w-4 sm:h-5 sm:w-5' />
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
										message: '',
									});
								}}
								className='text-slate-500 hover:text-slate-800'
								disabled={isDeploying}
							>
								<X className='h-5 w-5' />
							</button>
						</div>

						<div className='relative'>
							{/* Blurred original content */}
							<div className='blur-sm opacity-30'>
								<div className='space-y-4'>
									<div>
										<label className='block text-sm font-medium text-slate-700 mb-2'>
											Select Keypair File
										</label>
										<input
											ref={fileInputRef}
											type='file'
											accept='.json,.keypair'
											onChange={handleKeypairSelect}
											disabled={true}
											className='block w-full text-sm text-slate-500
												file:mr-4 file:py-2 file:px-4
												file:rounded-md file:border-0
												file:text-sm file:font-medium
												file:bg-primary file:text-white
												hover:file:bg-primary/90
												file:cursor-pointer cursor-pointer
												focus:outline-none
												disabled:opacity-50 disabled:cursor-not-allowed'
										/>
										<p className='mt-2 text-xs text-slate-500'>
											Your keypair file is typically located at ~/.config/solana/id.json
										</p>
									</div>

									<div className='bg-slate-100 rounded-md p-3 border border-slate-200'>
										<h4 className='text-xs font-medium text-slate-700 mb-2'>Requirements:</h4>
										<ul className='text-xs text-slate-600 space-y-1'>
											<li>• Valid Solana keypair file</li>
											<li>• Minimum 2 SOL for deployment</li>
											<li>• Solana CLI installed and configured</li>
										</ul>
									</div>
								</div>
							</div>

							<div className='absolute inset-0 flex items-center justify-center'>
								<div className='text-xl sm:text-2xl font-bold text-slate-800'>Coming Soon</div>
							</div>
						</div>

						<div className='flex justify-end gap-3 pt-2'>
							<button
								onClick={() => {
									setShowKeypairDialog(false);
									setSelectedKeypair(null);
									if (fileInputRef.current) {
										fileInputRef.current.value = '';
									}
									setDeploymentStatus({
										stage: 'idle',
										message: '',
									});
								}}
								className='px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors'
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
