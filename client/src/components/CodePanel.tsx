import React from "react";
import { Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodePanelProps {
	code: string;
}

const CodePanel: React.FC<CodePanelProps> = ({ code }) => {
	const copyToClipboard = () => {
		if (code) {
			navigator.clipboard.writeText(code);
			// Could add a toast notification here
		}
	};

	return (
		<div className="flex flex-col h-full bg-zinc-900 rounded-md">
			<div className="flex justify-between items-center p-2 bg-zinc-800 rounded-t-md">
				<span className="text-sm font-medium text-zinc-200">
					Generated Rust Code
				</span>
				<Button
					size="sm"
					variant="ghost"
					className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
					onClick={copyToClipboard}
				>
					<Clipboard size={16} />
				</Button>
			</div>
			<div className="flex-grow overflow-auto">
				<SyntaxHighlighter
					language="rust"
					style={atomDark}
					customStyle={{
						margin: 0,
						borderRadius: 0,
						minHeight: '100%',
						background: '#18181b', // Match the background
						fontSize: '0.875rem',
					}}
					showLineNumbers={true}
					wrapLines={true}
				>
					{code || "// Drag blocks to generate Rust code"}
				</SyntaxHighlighter>
			</div>
		</div>
	);
};

export default CodePanel;
