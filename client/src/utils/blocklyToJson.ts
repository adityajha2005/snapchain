"use client";

/**
 * Interface representing the JSON structure of a Blockly block
 */
export interface BlockJson {
  id: string;
  type: string;
  fields: Record<string, any>;
  inputs: Record<string, BlockJson | BlockJson[] | null>;
  next: BlockJson | null;
  children?: BlockJson[];
}

/**
 * Extract comprehensive JSON structure from a Blockly workspace
 * Supports nested blocks and captures complete hierarchy
 */
export function extractBlocksAsJson(workspace: any): BlockJson[] {
  const topBlocks = workspace.getTopBlocks(false);
  return topBlocks.map((block: any) => blockToJson(block));
}

/**
 * Convert a single Blockly block to JSON with all nested blocks
 */
function blockToJson(block: any): BlockJson {
  const blockData: BlockJson = {
    id: block.id,
    type: block.type,
    fields: {},
    inputs: {},
    next: null,
    children: [],
  };

  // Extract all field values
  const fieldNames = block.inputList.flatMap((input: any) =>
    input.fieldRow.map((field: any) => field.name)
  ).filter((name: any): name is string => name !== null && name !== undefined);

  for (const fieldName of fieldNames) {
    try {
      const field = block.getField(fieldName);
      if (field) {
        blockData.fields[fieldName] = field.getValue();
      }
    } catch (e) {
      // Skip fields that cannot be accessed
    }
  }

  // Extract all inputs (value and statement inputs)
  for (const input of block.inputList) {
    if (input.name) {
      const connection = input.connection;
      if (connection && connection.targetBlock()) {
        const targetBlock = connection.targetBlock();
        
        if (input.type === 2) { // STATEMENT input type
          // Statement input - can have multiple blocks chained
          const statementBlocks: BlockJson[] = [];
          let currentBlock: any = targetBlock;
          
          while (currentBlock) {
            statementBlocks.push(blockToJson(currentBlock));
            currentBlock = currentBlock.getNextBlock();
          }
          
          blockData.inputs[input.name] = statementBlocks.length > 0 ? statementBlocks : null;
        } else if (input.type === 1) { // VALUE input type
          // Value input - single block
          blockData.inputs[input.name] = blockToJson(targetBlock!);
        }
      } else {
        blockData.inputs[input.name] = null;
      }
    }
  }

  // Get next block in chain
  const nextBlock = block.getNextBlock();
  if (nextBlock) {
    blockData.next = blockToJson(nextBlock);
  }

  // Get all child blocks recursively
  const children = block.getChildren(false);
  if (children.length > 0) {
    blockData.children = children.map((child: any) => blockToJson(child));
  }

  return blockData;
}

/**
 * Generate a readable summary of the blocks structure
 */
export function generateBlocksSummary(blocks: BlockJson[]): string {
  let summary = "Blockly Workspace Structure:\n\n";
  
  blocks.forEach((block, index) => {
    summary += `Top-level Block ${index + 1}:\n`;
    summary += generateBlockSummary(block, 1);
    summary += "\n";
  });
  
  return summary;
}

/**
 * Generate summary for a single block recursively
 */
function generateBlockSummary(block: BlockJson, depth: number): string {
  const indent = "  ".repeat(depth);
  let summary = `${indent}Type: ${block.type}\n`;
  
  // Add fields
  if (Object.keys(block.fields).length > 0) {
    summary += `${indent}Fields:\n`;
    for (const [key, value] of Object.entries(block.fields)) {
      summary += `${indent}  - ${key}: ${value}\n`;
    }
  }
  
  // Add inputs
  if (Object.keys(block.inputs).length > 0) {
    summary += `${indent}Inputs:\n`;
    for (const [key, value] of Object.entries(block.inputs)) {
      if (value === null) {
        summary += `${indent}  - ${key}: (empty)\n`;
      } else if (Array.isArray(value)) {
        summary += `${indent}  - ${key}: [${value.length} blocks]\n`;
        value.forEach((childBlock, idx) => {
          summary += `${indent}    Block ${idx + 1}:\n`;
          summary += generateBlockSummary(childBlock, depth + 3);
        });
      } else {
        summary += `${indent}  - ${key}:\n`;
        summary += generateBlockSummary(value, depth + 2);
      }
    }
  }
  
  // Add next block
  if (block.next) {
    summary += `${indent}Next Block:\n`;
    summary += generateBlockSummary(block.next, depth + 1);
  }
  
  return summary;
}

/**
 * Create a structured prompt for the LLM with block information
 */
export function createLLMPrompt(blocks: BlockJson[], additionalContext?: string): string {
  const jsonString = JSON.stringify(blocks, null, 2);
  const summary = generateBlocksSummary(blocks);
  
  let prompt = `You are a senior Rust and Solana blockchain developer. I have a visual programming interface using Blockly where users drag and drop blocks to create smart contracts.

BLOCK STRUCTURE (JSON):
\`\`\`json
${jsonString}
\`\`\`

HUMAN-READABLE SUMMARY:
${summary}

${additionalContext || ""}

Please analyze this block structure carefully and generate a complete, production-ready Solana smart contract in Rust. The contract should:

1. Be fully functional and compilable without errors
2. Follow Rust and Solana best practices
3. Include proper error handling
4. Be optimized for gas efficiency
5. Include security checks and validations
6. Have proper account validations
7. Use appropriate Solana program patterns
8. Include comprehensive comments explaining the logic

The blocks represent the logical structure the user wants. Each block type has specific meaning:
- "solana_program": Main program wrapper
- "rust_struct": Data structure definition
- "process_instruction": Instruction handler function
- "validate_accounts": Account validation logic
- "get_account": Account extraction
- And other block types as defined in the structure

Please return ONLY the Rust code wrapped in \`\`\`rust code blocks. Make sure the code is complete and ready to deploy.`;

  return prompt;
}
