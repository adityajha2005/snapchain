"use client";
import React, { useState, useEffect } from 'react';
import * as Blockly from 'blockly';
import { initialToolbox } from '@/utils/blocklyConfig';
import { rustGenerator } from '@/utils/rustGenerator';
import BlocklyWorkspace from '@/components/BlocklyWorkspace';
import CodePanel from '@/components/CodePanel';

const ProjectPage = () => {
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const handleCodeChange = (code: string) => {
        setGeneratedCode(code);
    };
    return(
            <div className="flex flex-col h-screen bg-zinc-950 text-zinc-50">
                  <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        {/* Blockly Workspace */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full border-r border-zinc-800 overflow-hidden">
          <BlocklyWorkspace onCodeChange={handleCodeChange} />
        </div> 
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col">
          {/* Code Panel */}
          <div className="h-1/2 border-b border-zinc-800 p-4">
            <CodePanel code={generatedCode} />
          </div>
        </div>
            </div>
            </div>
    )
}

export default ProjectPage;
