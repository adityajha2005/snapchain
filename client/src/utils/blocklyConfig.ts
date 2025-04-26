"use client";

import * as Blockly from "blockly";

// Custom block definitions for Rust and Solana
export const defineCustomBlocks = () => {
	// Only run in browser environment
	if (typeof window === "undefined") return;

	// Program Definition block
	Blockly.Blocks["solana_program"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Solana Program")
				.appendField(new Blockly.FieldTextInput("my_program"), "NAME");
			this.appendStatementInput("BODY").setCheck(null);
			this.setColour(230);
			this.setTooltip("Define a Solana program");
			this.setHelpUrl(
				"https://docs.solana.com/developing/programming-model/overview",
			);
		},
	};

	// Struct Definition block
	Blockly.Blocks["rust_struct"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Define Struct")
				.appendField(new Blockly.FieldTextInput("MyStruct"), "NAME");
			this.appendStatementInput("FIELDS").setCheck(null);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(160);
			this.setTooltip("Define a Rust struct");
			this.setHelpUrl("");
		},
	};

	// Struct Field block
	Blockly.Blocks["struct_field"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Field")
				.appendField(new Blockly.FieldTextInput("field_name"), "NAME")
				.appendField(":")
				.appendField(
					new Blockly.FieldDropdown([
						["u8", "u8"],
						["u16", "u16"],
						["u32", "u32"],
						["u64", "u64"],
						["i8", "i8"],
						["i16", "i16"],
						["i32", "i32"],
						["i64", "i64"],
						["String", "String"],
						["bool", "bool"],
						["PublicKey", "Pubkey"],
						["AccountInfo", "AccountInfo"],
					]),
					"TYPE",
				);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(160);
			this.setTooltip("Add a field to a struct");
			this.setHelpUrl("");
		},
	};

	// Instruction Processing block
	Blockly.Blocks["process_instruction"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Process Instruction")
				.appendField(new Blockly.FieldTextInput("process_instruction"), "NAME");
			this.appendStatementInput("PARAMS")
				.setCheck(null)
				.appendField("Parameters");
			this.appendStatementInput("BODY").setCheck(null);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(290);
			this.setTooltip("Define a function to process an instruction");
			this.setHelpUrl("");
		},
	};

	// Function Parameter block
	Blockly.Blocks["function_param"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Parameter")
				.appendField(new Blockly.FieldTextInput("param_name"), "NAME")
				.appendField(":")
				.appendField(
					new Blockly.FieldDropdown([
						["Program ID", "program_id: &Pubkey"],
						["Accounts", "accounts: &[AccountInfo]"],
						["Instruction Data", "instruction_data: &[u8]"],
					]),
					"TYPE",
				);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(290);
			this.setTooltip("Add a parameter to a function");
			this.setHelpUrl("");
		},
	};

	// Account Validation block
	Blockly.Blocks["validate_accounts"] = {
		init: function () {
			this.appendDummyInput().appendField("Validate accounts");
			this.appendValueInput("MIN_ACCOUNTS")
				.setCheck("Number")
				.appendField("require minimum");
			this.appendDummyInput().appendField("accounts");
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(0);
			this.setTooltip("Validate the number of accounts");
			this.setHelpUrl("");
		},
	};

	// Get Account block
	Blockly.Blocks["get_account"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Get account at index")
				.appendField(new Blockly.FieldNumber(0), "INDEX")
				.appendField("as")
				.appendField(new Blockly.FieldTextInput("account_name"), "NAME");
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(0);
			this.setTooltip("Get an account from the accounts array");
			this.setHelpUrl("");
		},
	};

	// Check Account Owner block
	Blockly.Blocks["check_account_owner"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Check if")
				.appendField(new Blockly.FieldTextInput("account"), "ACCOUNT")
				.appendField("is owned by")
				.appendField(
					new Blockly.FieldDropdown([
						["program", "program_id"],
						["system program", "system_program::ID"],
					]),
					"OWNER",
				);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(0);
			this.setTooltip("Check if an account is owned by a specific program");
			this.setHelpUrl("");
		},
	};

	// Deserialize Account Data block
	Blockly.Blocks["deserialize_account"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Deserialize")
				.appendField(new Blockly.FieldTextInput("account"), "ACCOUNT")
				.appendField("data as")
				.appendField(new Blockly.FieldTextInput("AccountType"), "TYPE");
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(0);
			this.setTooltip("Deserialize account data into a specific type");
			this.setHelpUrl("");
		},
	};

	// PDA Creation block
	Blockly.Blocks["create_pda"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Create PDA")
				.appendField(new Blockly.FieldTextInput("pda_name"), "NAME");
			this.appendStatementInput("SEEDS").setCheck(null).appendField("Seeds");
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(60);
			this.setTooltip("Create a Program Derived Address (PDA)");
			this.setHelpUrl("");
		},
	};

	// PDA Seed block
	Blockly.Blocks["pda_seed"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Seed")
				.appendField(new Blockly.FieldTextInput("seed_value"), "VALUE");
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(60);
			this.setTooltip("Add a seed for PDA creation");
			this.setHelpUrl("");
		},
	};

	// Error block
	Blockly.Blocks["program_error"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Return Error")
				.appendField(
					new Blockly.FieldDropdown([
						["InvalidInstruction", "ProgramError::InvalidInstructionData"],
						["NotEnoughAccountKeys", "ProgramError::NotEnoughAccountKeys"],
						["InvalidAccountData", "ProgramError::InvalidAccountData"],
						["Custom", "ProgramError::Custom(1)"],
					]),
					"ERROR",
				);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(360);
			this.setTooltip("Return a program error");
			this.setHelpUrl("");
		},
	};

	// Enum Definition block
	Blockly.Blocks["rust_enum"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Define Enum")
				.appendField(new Blockly.FieldTextInput("MyEnum"), "NAME");
			this.appendStatementInput("VARIANTS").setCheck(null);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(160);
			this.setTooltip("Define a Rust enum");
			this.setHelpUrl("");
		},
	};

	// Enum Variant block
	Blockly.Blocks["enum_variant"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Variant")
				.appendField(new Blockly.FieldTextInput("Variant"), "NAME")
				.appendField(
					new Blockly.FieldDropdown([
						["Simple", "SIMPLE"],
						["Tuple", "TUPLE"],
						["Struct", "STRUCT"],
					]),
					"TYPE",
				);
			this.appendStatementInput("FIELDS").setCheck(null);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(160);
			this.setTooltip("Add a variant to an enum");
			this.setHelpUrl("");
		},
	};

	// Event Definition block
	Blockly.Blocks["emit_event"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Emit Event")
				.appendField(new Blockly.FieldTextInput("MyEvent"), "NAME");
			this.appendStatementInput("FIELDS").setCheck(null);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(120);
			this.setTooltip("Emit a program event");
			this.setHelpUrl("");
		},
	};

	// Cross Program Invocation block
	Blockly.Blocks["cpi_call"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Call External Program")
				.appendField(new Blockly.FieldTextInput("program_id"), "PROGRAM_ID");
			this.appendStatementInput("ACCOUNTS").setCheck(null);
			this.appendValueInput("DATA")
				.setCheck("Array")
				.appendField("with data");
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(90);
			this.setTooltip("Make a cross-program invocation");
			this.setHelpUrl("");
		},
	};

	// Account Initialization block
	Blockly.Blocks["init_account"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Initialize Account")
				.appendField(new Blockly.FieldTextInput("account"), "NAME")
				.appendField("as")
				.appendField(new Blockly.FieldTextInput("AccountType"), "TYPE");
			this.appendValueInput("SPACE")
				.setCheck("Number")
				.appendField("with space");
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(30);
			this.setTooltip("Initialize a new program account");
			this.setHelpUrl("");
		},
	};

	// Token Operation block
	Blockly.Blocks["token_operation"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Token Operation")
				.appendField(
					new Blockly.FieldDropdown([
						["Mint", "MINT"],
						["Transfer", "TRANSFER"],
						["Burn", "BURN"],
						["Approve", "APPROVE"],
					]),
					"OPERATION",
				);
			this.appendValueInput("AMOUNT")
				.setCheck("Number")
				.appendField("amount");
			this.appendStatementInput("ACCOUNTS").setCheck(null);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(180);
			this.setTooltip("Perform a token operation");
			this.setHelpUrl("");
		},
	};

	// Account Constraint block
	Blockly.Blocks["account_constraint"] = {
		init: function () {
			this.appendDummyInput()
				.appendField("Check if")
				.appendField(new Blockly.FieldTextInput("account"), "ACCOUNT")
				.appendField(
					new Blockly.FieldDropdown([
						["is initialized", "IS_INITIALIZED"],
						["is signer", "IS_SIGNER"],
						["is writable", "IS_WRITABLE"],
						["has sufficient funds", "HAS_FUNDS"],
					]),
					"CONSTRAINT",
				);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(0);
			this.setTooltip("Add a constraint check for an account");
			this.setHelpUrl("");
		},
	};

	// Math Operation block
	Blockly.Blocks["math_operation"] = {
		init: function () {
			this.appendValueInput("A")
				.setCheck("Number");
			this.appendDummyInput()
				.appendField(
					new Blockly.FieldDropdown([
						["+", "ADD"],
						["-", "SUB"],
						["*", "MUL"],
						["/", "DIV"],
					]),
					"OPERATION",
				);
			this.appendValueInput("B")
				.setCheck("Number");
			this.setOutput(true, "Number");
			this.setColour(230);
			this.setTooltip("Perform a math operation");
			this.setHelpUrl("");
		},
	};
};

// Define the initial toolbox configuration
export const initialToolbox = {
	kind: "categoryToolbox",
	contents: [
		{
			kind: "category",
			name: "Program",
			colour: "230",
			contents: [
				{
					kind: "block",
					type: "solana_program",
				},
			],
		},
		{
			kind: "category",
			name: "Data Structures",
			colour: "160",
			contents: [
				{
					kind: "block",
					type: "rust_struct",
				},
				{
					kind: "block",
					type: "struct_field",
				},
				{
					kind: "block",
					type: "rust_enum",
				},
				{
					kind: "block",
					type: "enum_variant",
				},
			],
		},
		{
			kind: "category",
			name: "Instructions",
			colour: "290",
			contents: [
				{
					kind: "block",
					type: "process_instruction",
				},
				{
					kind: "block",
					type: "function_param",
				},
			],
		},
		{
			kind: "category",
			name: "Accounts",
			colour: "0",
			contents: [
				{
					kind: "block",
					type: "validate_accounts",
				},
				{
					kind: "block",
					type: "get_account",
				},
				{
					kind: "block",
					type: "check_account_owner",
				},
				{
					kind: "block",
					type: "deserialize_account",
				},
				{
					kind: "block",
					type: "init_account",
				},
				{
					kind: "block",
					type: "account_constraint",
				},
			],
		},
		{
			kind: "category",
			name: "PDAs",
			colour: "60",
			contents: [
				{
					kind: "block",
					type: "create_pda",
				},
				{
					kind: "block",
					type: "pda_seed",
				},
			],
		},
		{
			kind: "category",
			name: "Tokens",
			colour: "180",
			contents: [
				{
					kind: "block",
					type: "token_operation",
				},
			],
		},
		{
			kind: "category",
			name: "Events",
			colour: "120",
			contents: [
				{
					kind: "block",
					type: "emit_event",
				},
			],
		},
		{
			kind: "category",
			name: "External Calls",
			colour: "90",
			contents: [
				{
					kind: "block",
					type: "cpi_call",
				},
			],
		},
		{
			kind: "category",
			name: "Math",
			colour: "230",
			contents: [
				{
					kind: "block",
					type: "math_operation",
				},
			],
		},
		{
			kind: "category",
			name: "Errors",
			colour: "330",
			contents: [
				{
					kind: "block",
					type: "program_error",
				},
			],
		},
	],
};
