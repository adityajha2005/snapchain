"use client";
import React, { useState, useEffect } from "react";
import * as Blockly from "blockly";
import { initialToolbox } from "@/utils/blocklyConfig";
import { rustGenerator } from "@/utils/rustGenerator";
import BlocklyWorkspace from "@/components/BlocklyWorkspace";
import CodePanel from "@/components/CodePanel";
import SmartContractChat from "@/components/SmartContractChat";

const ProjectPage = () => {
	const [generatedCode, setGeneratedCode] = useState<string>("");
	const handleCodeChange = (code: string) => {
		setGeneratedCode(code);
	};

	// Function to handle code updates from the chat component
	const handleCodeUpdateFromChat = (newCode: string) => {
		setGeneratedCode(newCode);
	};

	return (
		<div className="flex flex-col h-screen bg-[#f8f9fc]">
			<div className="flex-grow flex flex-col lg:flex-row overflow-hidden p-4 gap-4">
				{/* Blockly Workspace */}
				<div className="w-full lg:w-3/5 h-1/2 lg:h-full bg-white rounded-lg shadow-sm border border-gray-200">
					<BlocklyWorkspace onCodeChange={handleCodeChange} />
				</div>
				
				{/* Right Panel */}
				<div className="w-full lg:w-2/5 h-1/2 lg:h-full flex flex-col gap-4">
					{/* Code Panel */}
					<div className="h-1/2 bg-white rounded-lg shadow-sm border border-gray-200">
						<CodePanel code={generatedCode} />
					</div>
					{/* Smart Contract Chat Assistant */}
					<div className="h-1/2 bg-white rounded-lg shadow-sm border border-gray-200">
						<SmartContractChat 
							currentCode={generatedCode} 
							onUpdateCode={handleCodeUpdateFromChat}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProjectPage;
