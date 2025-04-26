"use client";
import React, { useRef, useState, useEffect } from "react";
import { BlocklyWorkspace as ReactBlockly } from "react-blockly";
import * as Blockly from "blockly";
import { rustGenerator } from "@/utils/rustGenerator";
import { initialToolbox } from "@/utils/blocklyConfig";
import { Zap, Rocket, Key, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

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
	const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
		stage: 'idle',
		message: ''
	});

	// Generate Rust code when blocks change
	const handleChange = (workspace: Blockly.WorkspaceSvg) => {
		workspaceRef.current = workspace;
		const code = rustGenerator.workspaceToCode(workspace);
		onCodeChange(code);
	};

	// Refine contract using LLM
	const handleRefineContract = async () => {
		if (!workspaceRef.current) return;
		
		setIsGenerating(true);
		try {
			// Get current Rust code
			const currentCode = rustGenerator.workspaceToCode(workspaceRef.current);
			
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
${currentCode}
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
				const extractedCode = matches[0][1].trim();
				onCodeChange(extractedCode);
			} else {
				onCodeChange(data.content);
			}
		} catch (error) {
			console.error("Error refining contract:", error);
			alert("Failed to refine contract. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

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
			message: ''
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

	return (
		<>
			<div className="relative h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg shadow-2xl overflow-hidden">
				{/* Header with subtle gradient */}
				<div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm z-10 flex justify-between items-center">
					<div className="flex items-center h-full px-4">
						<div className="flex space-x-2">
							<div className="w-3 h-3 rounded-full bg-red-500"></div>
							<div className="w-3 h-3 rounded-full bg-yellow-500"></div>
							<div className="w-3 h-3 rounded-full bg-green-500"></div>
						</div>
						<h2 className="ml-4 text-sm font-medium text-slate-300">
							Solana Program Builder
						</h2>
					</div>
					<div className="flex items-center gap-2 mr-4">
						<select
							value={network}
							onChange={(e) => setNetwork(e.target.value as "devnet" | "testnet")}
							className="px-2 py-1 text-xs bg-zinc-800 text-zinc-200 rounded-md border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary"
						>
							<option value="devnet">Devnet</option>
							<option value="testnet">Testnet</option>
						</select>
						<button
							onClick={initiateDeployment}
							disabled={isDeploying}
							className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
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

				{/* Main Blockly workspace with enhanced styling */}
				<div className="h-full w-full pt-12">
					<style jsx global>{`
						.blocklyMainBackground {
							stroke: none !important;
						}
						.blocklyToolboxDiv {
							border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
							box-shadow: 4px 0 8px rgba(0, 0, 0, 0.2);
							background-color: #1e293b !important;
							width: 240px !important;
						}
						.blocklyFlyout {
							border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
						}
						.blocklyFlyoutBackground {
							fill: #1e293b !important;
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
						}
						.blocklyTreeSelected {
							background: rgba(255, 255, 255, 0.1) !important;
						}
						.blocklyTreeRow:hover {
							background: rgba(255, 255, 255, 0.05) !important;
						}
						.blocklyFlyoutButton {
							fill: #475569 !important;
						}
						.blocklyFlyoutButtonBackground {
							stroke: #1e293b !important;
						}
						.blocklyFlyoutButton:hover {
							fill: #64748b !important;

						}
						.blocklyFlyoutButtonShadow {
							display: none;
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
								colour: "#1e293b40",
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
								base: "dark",
								componentStyles: {
									workspaceBackgroundColour: "#0f172a",
									toolboxBackgroundColour: "#1e293b",
									toolboxForegroundColour: "#e2e8f0",
									flyoutBackgroundColour: "#1e293b",
									flyoutForegroundColour: "#e2e8f0",
									flyoutOpacity: 1,
									scrollbarColour: "#475569",
									insertionMarkerColour: "#2563eb",
									insertionMarkerOpacity: 0.3,
									scrollbarOpacity: 0.4,
									cursorColour: "#60a5fa",
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

				{/* Decorative elements */}
				<div className="absolute bottom-4 right-4 flex items-center space-x-2 text-xs text-slate-500">
					<div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
					<span>Ready</span>
				</div>
			</div>

			{/* Enhanced Keypair Selection Dialog */}
			{showKeypairDialog && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-zinc-800">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
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
								className="text-zinc-400 hover:text-zinc-100"
								disabled={isDeploying}
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Status Display */}
						{deploymentStatus.stage !== 'idle' && (
							<div className={`mb-4 p-4 rounded-md ${
								deploymentStatus.stage === 'error' ? 'bg-red-950/50 border border-red-900' :
								deploymentStatus.stage === 'success' ? 'bg-emerald-950/50 border border-emerald-900' :
								'bg-zinc-800/50 border border-zinc-700'
							}`}>
								<div className="flex items-center gap-3">
									{getStatusIcon()}
									<div className="flex-1">
										<p className="text-sm font-medium text-zinc-100">
											{deploymentStatus.message}
										</p>
										{deploymentStatus.stage === 'success' && (
											<div className="mt-2 text-xs text-zinc-400">
												<p>Program ID: <span className="font-mono text-emerald-400">{deploymentStatus.programId}</span></p>
												<p>Deployer: <span className="font-mono text-zinc-300">{deploymentStatus.address}</span></p>
												<p>Balance: <span className="text-zinc-300">{deploymentStatus.balance} SOL</span></p>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
						
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
									disabled={isDeploying}
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
									className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
									disabled={isDeploying}
								>
									Cancel
								</button>
								<button
									onClick={handleDeploy}
									disabled={!selectedKeypair || isDeploying || deploymentStatus.stage === 'success'}
									className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isDeploying && <Loader2 className="h-4 w-4 animate-spin" />}
									{deploymentStatus.stage === 'success' ? 'Deployed!' : isDeploying ? 'Deploying...' : 'Deploy Contract'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default BlocklyWorkspace;
