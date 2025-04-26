"use client";
import React, { useRef, useState, useEffect } from "react";
import { BlocklyWorkspace as ReactBlockly } from "react-blockly";
import * as Blockly from "blockly";
import { rustGenerator } from "@/utils/rustGenerator";
import { initialToolbox } from "@/utils/blocklyConfig";
import { Zap } from "lucide-react";

interface BlocklyWorkspaceProps {
	onCodeChange: (code: string) => void;
}

const BlocklyWorkspace: React.FC<BlocklyWorkspaceProps> = ({
	onCodeChange,
}) => {
	const blocklyDiv = useRef<HTMLDivElement>(null);
	const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	const [xml, setXml] = useState<string>("");
	const [isGenerating, setIsGenerating] = useState(false);

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
				<button
					onClick={handleRefineContract}
					disabled={isGenerating}
					className="mr-4 flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
				>
					<Zap className="h-3.5 w-3.5" />
					{isGenerating ? "Refining..." : "Refine Contract"}
				</button>
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
	);
};

export default BlocklyWorkspace;
