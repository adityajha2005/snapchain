"use client";

import * as Blockly from "blockly";
import { defineCustomBlocks } from "./blocklyConfig";

// Create a custom Rust generator
export const rustGenerator = new Blockly.Generator("Rust");

// Define basic generator properties
rustGenerator.INDENT = "    ";

// Define custom order constants for expressions
const ORDER_NONE = 99;
const ORDER_ATOMIC = 0;
// Only run block definitions in browser environment
if (typeof window !== "undefined") {
	// Initialize custom blocks
	defineCustomBlocks();

	// Generator for Solana program block
	rustGenerator.forBlock["solana_program"] = function (block: any) {
		const programName = block.getFieldValue("NAME");
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

// Program entrypoint implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("${programName}: begin processing");
    
    // Add your instruction processing logic here
    
    msg!("${programName}: processing complete");
    Ok(())
}`;

		return code;
	};

	// Generator for Rust struct block
	rustGenerator.forBlock["rust_struct"] = function (block: any) {
		const structName = block.getFieldValue("NAME");
		const fields = rustGenerator.statementToCode(block, "FIELDS");

		const code = `#[derive(BorshSerialize, BorshDeserialize)]
pub struct ${structName} {
${fields}}

`;
		return code;
	};

	// Generator for struct field block
	rustGenerator.forBlock["struct_field"] = function (block: any) {
		const fieldName = block.getFieldValue("NAME");
		const fieldType = block.getFieldValue("TYPE");

		return `${rustGenerator.INDENT}pub ${fieldName}: ${fieldType},\n`;
	};

	// Generator for instruction processing block
	rustGenerator.forBlock["process_instruction"] = function (block: any) {
		const funcName = block.getFieldValue("NAME");
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
		const paramName = block.getFieldValue("NAME");
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

		const code = `#[derive(BorshSerialize, BorshDeserialize)]
pub enum ${enumName} {
${variants}}

`;
		return code;
	};

	// Generator for enum variant block
	rustGenerator.forBlock["enum_variant"] = function (block: any) {
		const variantName = block.getFieldValue("NAME");
		const variantType = block.getFieldValue("TYPE");
		const fields = rustGenerator.statementToCode(block, "FIELDS");

		let code = "";
		switch (variantType) {
			case "SIMPLE":
				code = `${rustGenerator.INDENT}${variantName},\n`;
				break;
			case "TUPLE":
				code = `${rustGenerator.INDENT}${variantName}(${fields.trim()}),\n`;
				break;
			case "STRUCT":
				code = `${rustGenerator.INDENT}${variantName} {\n${fields}${rustGenerator.INDENT}},\n`;
				break;
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
}
