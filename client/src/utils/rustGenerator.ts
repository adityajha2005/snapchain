"use client";

import * as Blockly from "blockly";
import { defineCustomBlocks } from "./blocklyConfig";

// Create a custom Rust generator
export const rustGenerator = new Blockly.Generator("Rust");

// Define basic generator properties
rustGenerator.INDENT = "    ";

// Add generation queue management
let generationQueue: any[] = [];
const CHUNK_SIZE = 25;
let isProcessingQueue = false;

// Process blocks in chunks
async function processGenerationQueue() {
	if (isProcessingQueue || generationQueue.length === 0) return;
	
	isProcessingQueue = true;
	let code = '';
	
	try {
		while (generationQueue.length > 0) {
			const chunk = generationQueue.splice(0, CHUNK_SIZE);
			for (const block of chunk) {
				if (block && rustGenerator.forBlock[block.type]) {
					const blockCode = rustGenerator.forBlock[block.type](block, rustGenerator);
					code += blockCode;
				}
			}
			// Small delay between chunks to prevent blocking
			await new Promise(resolve => setTimeout(resolve, 10));
		}
	} finally {
		isProcessingQueue = false;
	}
	
	return code;
}

// Override the workspaceToCode method
const originalWorkspaceToCode = rustGenerator.workspaceToCode;

rustGenerator.workspaceToCode = function(workspace: Blockly.Workspace | undefined): Promise<string> {
	if (!workspace) return Promise.resolve('');

	// Get all blocks in the workspace
	const blocks = workspace.getTopBlocks(true);
	let allBlocks: any[] = [];
	
	// Collect all blocks including nested ones
	blocks.forEach(block => {
		allBlocks.push(block);
		let child = block.getChildren(true);
		while (child.length > 0) {
			const nextChild: any[] = [];
			child.forEach((b: any) => {
				allBlocks.push(b);
				nextChild.push(...b.getChildren(true));
			});
			child = nextChild;
		}
	});
	
	// Clear previous queue and add new blocks
	generationQueue = allBlocks;
	
	// Process the queue
	return processGenerationQueue()
		.then(generatedCode => {
			if (!generatedCode) {
				return originalWorkspaceToCode.call(rustGenerator, workspace);
			}
			return generatedCode;
		})
		.catch(err => {
			console.error('Error in code generation:', err);
			return originalWorkspaceToCode.call(rustGenerator, workspace);
		});
};

// Define custom order constants for expressions
const ORDER_NONE = 99;
const ORDER_ATOMIC = 0;
const ORDER_HIGH = 1;
const ORDER_MULTIPLICATIVE = 2;
const ORDER_ADDITIVE = 3;
const ORDER_RELATIONAL = 4;
const ORDER_AND = 5;
const ORDER_OR = 6;
const ORDER_ASSIGNMENT = 7;

// Only run block definitions in browser environment
if (typeof window !== "undefined") {
	// Initialize custom blocks
	defineCustomBlocks();

	// Generator for Solana program block
	rustGenerator.forBlock["solana_program"] = function (block: any) {
		const programName = block.getFieldValue("NAME");
		
		// Validate required fields
		if (!programName) {
			throw codegenError(block, "Program name is required");
		}
		
		const programBody = rustGenerator.statementToCode(block, "BODY");

		const code = `use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

// Define program entrypoint
entrypoint!(process_instruction);

${programBody}
`;
		return code;
	};

	// Generator for Rust struct block
	rustGenerator.forBlock["rust_struct"] = function (block: any) {
		const structName = block.getFieldValue("NAME");
		// Validate that the name is provided
		if (!structName) {
			throw codegenError(block, "Struct name is required");
		}
		
		const fields = rustGenerator.statementToCode(block, "FIELDS");

		const code = `#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ${structName} {
${fields}}

`;
		return code;
	};

	// Generator for struct field block
	rustGenerator.forBlock["struct_field"] = function (block: any) {
		const fieldName = block.getFieldValue("NAME");
		const fieldType = block.getFieldValue("TYPE");
		if (!fieldName) {
			throw codegenError(block, "Field name is required");
		}

		return `${rustGenerator.INDENT}pub ${fieldName}: ${fieldType},\n`;
	};

	// Generator for instruction processing block
	rustGenerator.forBlock["process_instruction"] = function (block: any) {
		const funcName = block.getFieldValue("NAME");
		
		// Validate that the name is provided
		if (!funcName) {
			throw codegenError(block, "Function name is required");
		}
		
		const params = rustGenerator.statementToCode(block, "PARAMS");
		const body = rustGenerator.statementToCode(block, "BODY");

		const code = `pub fn ${funcName}(
${params}) -> ProgramResult {
${body}    Ok(())
}

`;
		return code;
	};

	// Generator for function parameter block
	rustGenerator.forBlock["function_param"] = function (block: any) {
		const paramType = block.getFieldValue("TYPE");

		return `${rustGenerator.INDENT}${paramType},\n`;
	};

	// Generator for account validation block
	rustGenerator.forBlock["validate_accounts"] = function (block: any) {
		const minAccounts =
			rustGenerator.valueToCode(block, "MIN_ACCOUNTS", ORDER_ATOMIC) || "2";

		return `${rustGenerator.INDENT}let account_iter = &mut accounts.iter();
${rustGenerator.INDENT}if accounts.len() < ${minAccounts} {
${rustGenerator.INDENT}${rustGenerator.INDENT}return Err(ProgramError::NotEnoughAccountKeys);
${rustGenerator.INDENT}}\n`;
	};

	// Generator for get account block
	rustGenerator.forBlock["get_account"] = function (block: any) {
		const index = block.getFieldValue("INDEX");
		const accountName = block.getFieldValue("NAME");

		return `${rustGenerator.INDENT}let ${accountName} = next_account_info(account_iter)?;\n`;
	};

	// Generator for check account owner block
	rustGenerator.forBlock["check_account_owner"] = function (block: any) {
		const account = block.getFieldValue("ACCOUNT");
		const owner = block.getFieldValue("OWNER");

		return `${rustGenerator.INDENT}if ${account}.owner != ${owner} {
${rustGenerator.INDENT}${rustGenerator.INDENT}return Err(ProgramError::IncorrectProgramId);
${rustGenerator.INDENT}}\n`;
	};

	// Generator for deserialize account block
	rustGenerator.forBlock["deserialize_account"] = function (block: any) {
		const account = block.getFieldValue("ACCOUNT");
		const accountType = block.getFieldValue("TYPE");
		const lowerType = accountType.toLowerCase();

		return `${rustGenerator.INDENT}let ${lowerType} = ${accountType}::try_from_slice(&${account}.data.borrow())?;\n`;
	};

	// Generator for PDA creation block
	rustGenerator.forBlock["create_pda"] = function (block: any) {
		const pdaName = block.getFieldValue("NAME");
		const seeds = rustGenerator.statementToCode(block, "SEEDS");

		const seedsCode = seeds
			.split("\n")
			.filter(Boolean)
			.map(
				(seed: string) =>
					`${rustGenerator.INDENT}${rustGenerator.INDENT}${seed}`,
			)
			.join(",\n");

		return `${rustGenerator.INDENT}let ${pdaName}_seeds = [
${seedsCode}
${rustGenerator.INDENT}];
${rustGenerator.INDENT}let (${pdaName}, ${pdaName}_bump) = Pubkey::find_program_address(&${pdaName}_seeds, program_id);\n`;
	};

	// Generator for PDA seed block
	rustGenerator.forBlock["pda_seed"] = function (block: any) {
		const value = block.getFieldValue("VALUE");

		if (value.startsWith('"') || value.startsWith("'")) {
			return `b${value}`;
		} else {
			return `&${value}.to_le_bytes()`;
		}
	};

	// Generator for program error block
	rustGenerator.forBlock["program_error"] = function (block: any) {
		const errorType = block.getFieldValue("ERROR");

		return `${rustGenerator.INDENT}return Err(${errorType});\n`;
	};

	// Generator for Rust enum block
	rustGenerator.forBlock["rust_enum"] = function (block: any) {
		const enumName = block.getFieldValue("NAME");
		const variants = rustGenerator.statementToCode(block, "VARIANTS");

		const code = `#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum ${enumName} {
${variants}}

`;
		return code;
	};

	// Generator for enum variant block
	rustGenerator.forBlock["enum_variant"] = function (block: any) {
		const variantName = block.getFieldValue("NAME");
		const variantType = block.getFieldValue("TYPE");

		let code = "";
		if (variantType === "SIMPLE") {
			code = `${rustGenerator.INDENT}${variantName},\n`;
		} else if (variantType === "TUPLE") {
			code = `${rustGenerator.INDENT}${variantName}(u64),\n`;
		} else if (variantType === "STRUCT") {
			code = `${rustGenerator.INDENT}${variantName} {\n${rustGenerator.INDENT}${rustGenerator.INDENT}value: u64,\n${rustGenerator.INDENT}},\n`;
		}

		return code;
	};

	// Generator for event emission block
	rustGenerator.forBlock["emit_event"] = function (block: any) {
		const eventName = block.getFieldValue("NAME");
		const fields = rustGenerator.statementToCode(block, "FIELDS");

		return `${rustGenerator.INDENT}msg!("${eventName}: {}", ${fields.trim()});\n`;
	};

	// Generator for CPI call block
	rustGenerator.forBlock["cpi_call"] = function (block: any) {
		const programId = block.getFieldValue("PROGRAM_ID");
		const accounts = rustGenerator.statementToCode(block, "ACCOUNTS");
		const data = rustGenerator.valueToCode(block, "DATA", ORDER_NONE) || "[]";

		return `${rustGenerator.INDENT}invoke(
${rustGenerator.INDENT}${rustGenerator.INDENT}&Instruction::new_with_bytes(
${rustGenerator.INDENT}${rustGenerator.INDENT}${rustGenerator.INDENT}${programId},
${rustGenerator.INDENT}${rustGenerator.INDENT}${rustGenerator.INDENT}${data},
${rustGenerator.INDENT}${rustGenerator.INDENT}${rustGenerator.INDENT}&[${accounts.trim()}]
${rustGenerator.INDENT}${rustGenerator.INDENT}),
${rustGenerator.INDENT}${rustGenerator.INDENT}&[${accounts.trim()}]
${rustGenerator.INDENT})?;\n`;
	};

	// Generator for account initialization block
	rustGenerator.forBlock["init_account"] = function (block: any) {
		const accountName = block.getFieldValue("NAME");
		const accountType = block.getFieldValue("TYPE");
		const space = rustGenerator.valueToCode(block, "SPACE", ORDER_ATOMIC) || "0";

		return `${rustGenerator.INDENT}let rent = Rent::get()?;
${rustGenerator.INDENT}let space = ${space};
${rustGenerator.INDENT}let lamports = rent.minimum_balance(space as usize);
${rustGenerator.INDENT}invoke(
${rustGenerator.INDENT}${rustGenerator.INDENT}&system_instruction::create_account(
${rustGenerator.INDENT}${rustGenerator.INDENT}${rustGenerator.INDENT}&${accountName}.key(),
${rustGenerator.INDENT}${rustGenerator.INDENT}${rustGenerator.INDENT}&program_id,
${rustGenerator.INDENT}${rustGenerator.INDENT}${rustGenerator.INDENT}lamports,
${rustGenerator.INDENT}${rustGenerator.INDENT}${rustGenerator.INDENT}space,
${rustGenerator.INDENT}${rustGenerator.INDENT}${rustGenerator.INDENT}&program_id,
${rustGenerator.INDENT}${rustGenerator.INDENT}),
${rustGenerator.INDENT}${rustGenerator.INDENT}&[${accountName}.clone(), system_program.clone()]
${rustGenerator.INDENT})?;\n`;
	};

	// Generator for token operation block
	rustGenerator.forBlock["token_operation"] = function (block: any) {
		const operation = block.getFieldValue("OPERATION");
		const amount = rustGenerator.valueToCode(block, "AMOUNT", ORDER_ATOMIC) || "0";
		const accounts = rustGenerator.statementToCode(block, "ACCOUNTS");

		let instruction = "";
		switch (operation) {
			case "MINT":
				instruction = "mint_to";
				break;
			case "TRANSFER":
				instruction = "transfer";
				break;
			case "BURN":
				instruction = "burn";
				break;
			case "APPROVE":
				instruction = "approve";
				break;
		}

		return `${rustGenerator.INDENT}spl_token::instruction::${instruction}(
${rustGenerator.INDENT}${rustGenerator.INDENT}&spl_token::id(),
${rustGenerator.INDENT}${rustGenerator.INDENT}&[${accounts.trim()}],
${rustGenerator.INDENT}${rustGenerator.INDENT}${amount}
${rustGenerator.INDENT})?;\n`;
	};

	// Generator for account constraint block
	rustGenerator.forBlock["account_constraint"] = function (block: any) {
		const account = block.getFieldValue("ACCOUNT");
		const constraint = block.getFieldValue("CONSTRAINT");

		let code = "";
		switch (constraint) {
			case "IS_INITIALIZED":
				code = `${rustGenerator.INDENT}if !${account}.is_initialized() {
${rustGenerator.INDENT}${rustGenerator.INDENT}return Err(ProgramError::UninitializedAccount);
${rustGenerator.INDENT}}\n`;
				break;
			case "IS_SIGNER":
				code = `${rustGenerator.INDENT}if !${account}.is_signer {
${rustGenerator.INDENT}${rustGenerator.INDENT}return Err(ProgramError::MissingRequiredSignature);
${rustGenerator.INDENT}}\n`;
				break;
			case "IS_WRITABLE":
				code = `${rustGenerator.INDENT}if !${account}.is_writable {
${rustGenerator.INDENT}${rustGenerator.INDENT}return Err(ProgramError::InvalidAccountData);
${rustGenerator.INDENT}}\n`;
				break;
			case "HAS_FUNDS":
				code = `${rustGenerator.INDENT}if ${account}.lamports() < required_lamports {
${rustGenerator.INDENT}${rustGenerator.INDENT}return Err(ProgramError::InsufficientFunds);
${rustGenerator.INDENT}}\n`;
				break;
		}
		return code;
	};

	// Generator for math operation block
	rustGenerator.forBlock["math_operation"] = function (block: any) {
		const operation = block.getFieldValue("OPERATION");
		const a = rustGenerator.valueToCode(block, "A", ORDER_ATOMIC) || "0";
		const b = rustGenerator.valueToCode(block, "B", ORDER_ATOMIC) || "0";

		let operator = "";
		switch (operation) {
			case "ADD":
				operator = "+";
				break;
			case "SUB":
				operator = "-";
				break;
			case "MUL":
				operator = "*";
				break;
			case "DIV":
				operator = "/";
				break;
		}

		return [`${a} ${operator} ${b}`, ORDER_ATOMIC];
	};

	// Generator for controls_if block
	rustGenerator.forBlock["controls_if"] = function (block: any) {
		// Count the number of elseif and else parts
		let n = 0;
		let code = "";
		let branchCode, conditionCode;
		
		// Generate if/else if statements
		do {
			conditionCode = rustGenerator.valueToCode(block, "IF" + n, ORDER_NONE) || "false";
			branchCode = rustGenerator.statementToCode(block, "DO" + n);
			
			// The first condition needs 'if', subsequent ones need 'else if'
			code += (n === 0 ? `${rustGenerator.INDENT}if ${conditionCode} {\n` : 
				`${rustGenerator.INDENT}} else if ${conditionCode} {\n`);
			
			code += branchCode;
			n++;
		} while (block.getInput("IF" + n));
		
		// Generate the else statement
		if (block.getInput("ELSE")) {
			branchCode = rustGenerator.statementToCode(block, "ELSE");
			code += `${rustGenerator.INDENT}} else {\n${branchCode}`;
		}
		
		// Close the final bracket
		code += `${rustGenerator.INDENT}}\n`;
		
		return code;
	};

	// Generator for controls_for block
	rustGenerator.forBlock["controls_for"] = function (block: any) {
		const variable = block.getFieldValue("VAR");
		const startValue = rustGenerator.valueToCode(block, "START", ORDER_NONE) || "0";
		const endValue = rustGenerator.valueToCode(block, "END", ORDER_NONE) || "0";
		const stepValue = rustGenerator.valueToCode(block, "STEP", ORDER_NONE) || "1";
		const branch = rustGenerator.statementToCode(block, "DO");
		
		// Range in Rust uses exclusive upper bound, so we need to add 1 if step is positive
		let rangeEnd = endValue;
		if (Number(stepValue) > 0) {
			// Try to detect if stepValue is a literal number
			if (!isNaN(Number(endValue))) {
				rangeEnd = (Number(endValue) + 1).toString();
			} else {
				rangeEnd = `${endValue} + 1`;
			}
		}

		// Create the for loop with a range
		const code = `${rustGenerator.INDENT}for ${variable} in (${startValue}..${rangeEnd}).step_by(${stepValue} as usize) {\n${branch}${rustGenerator.INDENT}}\n`;
		return code;
	};

	// Generator for controls_while block
	rustGenerator.forBlock["controls_while"] = function (block: any) {
		const condition = rustGenerator.valueToCode(block, "BOOL", ORDER_NONE) || "false";
		const branch = rustGenerator.statementToCode(block, "DO");
		
		const code = `${rustGenerator.INDENT}while ${condition} {\n${branch}${rustGenerator.INDENT}}\n`;
		return code;
	};

	// Generator for logic_boolean block
	rustGenerator.forBlock["logic_boolean"] = function (block: any) {
		const value = block.getFieldValue("BOOL");
		return [value.toLowerCase(), ORDER_ATOMIC];
	};

	// Generator for logic_compare block
	rustGenerator.forBlock["logic_compare"] = function (block: any) {
		const operators: {[key: string]: string} = {
			'EQ': '==',
			'NEQ': '!=',
			'LT': '<',
			'LTE': '<=',
			'GT': '>',
			'GTE': '>='
		};
		
		const operator = operators[block.getFieldValue('OP')];
		const valueA = rustGenerator.valueToCode(block, 'A', ORDER_RELATIONAL) || '0';
		const valueB = rustGenerator.valueToCode(block, 'B', ORDER_RELATIONAL) || '0';
		
		const code = `${valueA} ${operator} ${valueB}`;
		return [code, ORDER_RELATIONAL];
	};

	// Generator for logic_operation block (AND, OR)
	rustGenerator.forBlock["logic_operation"] = function (block: any) {
		const operators: {[key: string]: string} = {
			'AND': '&&',
			'OR': '||'
		};
		
		const operator = operators[block.getFieldValue('OP')];
		const valueA = rustGenerator.valueToCode(block, 'A', ORDER_AND) || 'false';
		const valueB = rustGenerator.valueToCode(block, 'B', ORDER_AND) || 'false';
		
		const code = `${valueA} ${operator} ${valueB}`;
		const order = operator === '&&' ? ORDER_AND : ORDER_OR;
		return [code, order];
	};

	// Generator for logic_negate block (NOT)
	rustGenerator.forBlock["logic_negate"] = function (block: any) {
		const value = rustGenerator.valueToCode(block, 'BOOL', ORDER_HIGH) || 'false';
		const code = `!${value}`;
		return [code, ORDER_HIGH];
	};
	
	// Generator for text block
	rustGenerator.forBlock["text"] = function (block: any) {
		const text = block.getFieldValue('TEXT');
		const code = `"${text.replace(/"/g, '\\"')}"`;
		return [code, ORDER_ATOMIC];
	};

	// Generator for math_number block
	rustGenerator.forBlock["math_number"] = function (block: any) {
		const number = Number(block.getFieldValue('NUM'));
		return [String(number), ORDER_ATOMIC];
	};
}

// Function to report code generation errors with more context
export function codegenError(block: any, message: string) {
	const id = block?.id || "unknown";
	return {
		message: message,
		blockId: id,
		block: block,
		toString: function() { return `Code generation error at block #${id}: ${message}`; }
	};
}
