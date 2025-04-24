"use client";
import React, { useRef, useState, useEffect } from "react";
import { BlocklyWorkspace as ReactBlockly } from "react-blockly";
import * as Blockly from "blockly";
import { rustGenerator } from "@/utils/rustGenerator";
import { initialToolbox } from "@/utils/blocklyConfig";

interface BlocklyWorkspaceProps {
	onCodeChange: (code: string) => void;
}

const BlocklyWorkspace: React.FC<BlocklyWorkspaceProps> = ({
	onCodeChange,
}) => {
	const blocklyDiv = useRef<HTMLDivElement>(null);
	const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	const [xml, setXml] = useState<string>("");

	// Generate Rust code when blocks change
	const handleChange = (workspace: Blockly.WorkspaceSvg) => {
		workspaceRef.current = workspace;
		const code = rustGenerator.workspaceToCode(workspace);
		onCodeChange(code);
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
			<div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm z-10">
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
