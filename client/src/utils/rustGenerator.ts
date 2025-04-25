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
}
