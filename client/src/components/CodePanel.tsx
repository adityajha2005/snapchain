import React, { useEffect, useRef } from "react";
import { Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodePanelProps {
	code: string;
}

const CodePanel: React.FC<CodePanelProps> = ({ code }) => {
	const codeRef = useRef<string>(code);
	const highlighterRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Only update if the code has actually changed
		if (code !== codeRef.current) {
			codeRef.current = code;
			
			// Ensure the scroll position is maintained
			const scrollContainer = highlighterRef.current?.querySelector('pre');
			const currentScroll = scrollContainer?.scrollTop || 0;
			
			// Update after a brief delay to ensure proper rendering
			setTimeout(() => {
				if (scrollContainer) {
					scrollContainer.scrollTop = currentScroll;
				}
			}, 0);
		}
	}, [code]);

	const copyToClipboard = () => {
		if (code) {
			navigator.clipboard.writeText(code);
		}
	};

	return (
		<div className="flex flex-col h-full bg-white rounded-md shadow-sm">
			<div className="flex justify-between items-center p-3 border-b border-gray-100">
				<span className="text-sm font-medium text-gray-700">
					Generated Rust Code
				</span>
				<Button
					size="sm"
					variant="ghost"
					className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
					onClick={copyToClipboard}
				>
					<Clipboard size={16} />
					
				</Button>
				
			</div>
			<div className="flex-grow overflow-auto bg-[#f8f9fc]" ref={highlighterRef}>
				<SyntaxHighlighter
					language="rust"
					style={oneLight}
					customStyle={{
						margin: 0,
						borderRadius: 0,
						minHeight: '100%',
						background: '#f8f9fc',
						fontSize: '0.875rem',
					}}
					showLineNumbers={true}
					wrapLines={true}
					wrapLongLines={false}
					preserveWhitespace={true}
					lineNumberStyle={{
						color: '#94a3b8',
						opacity: 0.5,
						paddingRight: '1em',
						borderRight: '1px solid #e2e8f0',
						marginRight: '1em'
					}}
				>
					{code || "// Drag blocks to generate Rust code"}
				</SyntaxHighlighter>
			</div>
		</div>
	);
};

export default CodePanel;
