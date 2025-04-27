import React, { useEffect, useRef } from "react";
import { Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodePanelProps {
	code: string;
	isBlurred?: boolean;
}
const CodePanel: React.FC<CodePanelProps> = ({ code, isBlurred = true }) => {
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
		<div className="flex flex-col h-full bg-white rounded-md relative">
			{/* Blur overlay */}
			{isBlurred && (
				<div className="absolute inset-0 bg-slate-100/50 backdrop-blur-md z-10 rounded-md flex items-center justify-center">
					<span className="text-slate-600 text-sm">Click &quot;Refine Contract&quot; to view the optimized code</span>
				</div>
			)}
			
			{/* Content */}
			<div className="flex justify-between items-center p-2 bg-slate-100 rounded-t-md">
				<span className="text-sm font-medium text-slate-700">
					Generated Rust Code
				</span>
				<Button
					size="sm"
					variant="ghost"
					className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
					onClick={copyToClipboard}
					disabled={isBlurred}
				>
					<Clipboard size={16} />
				</Button>
			</div>
			<div className="flex-grow overflow-auto" ref={highlighterRef}>
				<SyntaxHighlighter
					language="rust"
					style={oneLight}
					customStyle={{
						margin: 0,
						borderRadius: 0,
						minHeight: '100%',
						background: '#ffffff',
						fontSize: '0.875rem',
					}}
					showLineNumbers={true}
					wrapLines={true}
					wrapLongLines={false}
					preserveWhitespace={true}
				>
					{code || "// Drag blocks to generate Rust code"}
				</SyntaxHighlighter>
			</div>
		</div>
	);
};

export default CodePanel;
