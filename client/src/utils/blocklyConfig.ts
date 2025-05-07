"use client";

import * as Blockly from "blockly";
import type { Block, Workspace, Connection } from "blockly";
import "blockly/blocks";

interface CustomBlock extends Block {
	elseifCount_: number;
	elseCount_: number;
	rebuildShape_: () => void;
}

interface MutatorBlock extends Block {
	valueConnection_: Connection | null;
	statementConnection_: Connection | null;
}

// Custom block definitions for Rust and Solana
export const defineCustomBlocks = () => {
	// Only run in browser environment
	if (typeof window === "undefined") return;

	// Program Definition block
	Blockly.Blocks["solana_program"] = {
		init: function (this: Block) {
			this.appendDummyInput()
				.appendField("Solana Program")
				.appendField(new Blockly.FieldTextInput("my_program"), "NAME");
			this.appendStatementInput("BODY").setCheck(null);
			this.setColour(230);
			this.setTooltip(`Creates a new Solana program with basic setup.
			
Tips:
• Start with defining program instructions
• Add account validation
• Consider adding error handling
• Don't forget to implement security checks

Next steps:
1. Add Process Instruction block
2. Add Account Validation block
3. Add Error Handling block`);
			this.setHelpUrl("https://docs.solana.com/developing/programming-model/overview");
		},
		onchange: function(this: Block) {
				// Check program name
				const programName = this.getFieldValue("NAME");
				if (!programName || programName === "") {
					this.setWarningText("Program name is required");
				} else if (!/^[a-z][a-z0-9_]*$/.test(programName)) {
					this.setWarningText("Program name should be lowercase, start with a letter, and contain only letters, numbers, and underscores");
				} else {
					this.setWarningText(null);
				}
			}
	};

	// Use the built-in if block with modifications
	const originalIfBlock = Blockly.Blocks["controls_if"];
	Blockly.Blocks["controls_if"] = {
		...originalIfBlock,
		init: function(this: Block) {
			originalIfBlock.init.call(this);
			this.setColour(210);
			this.setHelpUrl("https://docs.rs/solana-program/latest/solana_program/");
		}
	};

	// Register the mutator extension
	Blockly.Extensions.registerMutator('controls_if_mutator', {
		mutationToDom: function(this: CustomBlock) {
			if (!this.elseifCount_ && !this.elseCount_) {
				return null;
			}
			const container = document.createElement('mutation');
			if (this.elseifCount_) {
				container.setAttribute('elseif', this.elseifCount_.toString());
			}
			if (this.elseCount_) {
				container.setAttribute('else', '1');
			}
			return container;
		},
		
		domToMutation: function(this: CustomBlock, xmlElement: Element) {
			this.elseifCount_ = parseInt(xmlElement.getAttribute('elseif') || '0', 10);
			this.elseCount_ = parseInt(xmlElement.getAttribute('else') || '0', 10);
			this.rebuildShape_();
		},
		
		decompose: function(this: CustomBlock, workspace: Workspace) {
			const containerBlock = workspace.newBlock('controls_if_if');
			(containerBlock as any).render();
			let connection = containerBlock.nextConnection;
			for (let i = 1; i <= this.elseifCount_; i++) {
				const elseifBlock = workspace.newBlock('controls_if_elseif');
				(elseifBlock as any).render();
				if (connection && elseifBlock.previousConnection) {
					connection.connect(elseifBlock.previousConnection);
				}
				connection = elseifBlock.nextConnection;
			}
			if (this.elseCount_) {
				const elseBlock = workspace.newBlock('controls_if_else');
				(elseBlock as any).render();
				if (connection && elseBlock.previousConnection) {
					connection.connect(elseBlock.previousConnection);
				}
			}
			return containerBlock;
		},
		
		compose: function(this: CustomBlock, containerBlock: Block) {
			let clauseBlock = containerBlock.nextConnection?.targetBlock();
			this.elseifCount_ = 0;
			this.elseCount_ = 0;
			const valueConnections: (Connection | null)[] = [null];
			const statementConnections: (Connection | null)[] = [null];
			let elseStatementConnection: Connection | null = null;
			
			while (clauseBlock && !clauseBlock.isInsertionMarker()) {
				const mutatorBlock = clauseBlock as MutatorBlock;
				switch (clauseBlock.type) {
					case 'controls_if_elseif':
						this.elseifCount_++;
						valueConnections.push(mutatorBlock.valueConnection_);
						statementConnections.push(mutatorBlock.statementConnection_);
						break;
					case 'controls_if_else':
						this.elseCount_++;
						elseStatementConnection = mutatorBlock.statementConnection_;
						break;
					default:
						throw new Error('Unknown block type: ' + clauseBlock.type);
				}
				clauseBlock = clauseBlock.nextConnection?.targetBlock() || null;
			}
			
			this.rebuildShape_();
			for (let i = 1; i <= this.elseifCount_; i++) {
				const ifInput = this.getInput('IF' + i);
				const doInput = this.getInput('DO' + i);
				if (valueConnections[i] && ifInput?.connection) {
					ifInput.connection.connect(valueConnections[i]);
				}
				if (statementConnections[i] && doInput?.connection) {
					doInput.connection.connect(statementConnections[i]);
				}
			}
			const elseInput = this.getInput('ELSE');
			if (elseStatementConnection && elseInput?.connection) {
				elseInput.connection.connect(elseStatementConnection);
			}
		},
		
		saveConnections: function(this: CustomBlock, containerBlock: Block) {
			let clauseBlock = containerBlock.nextConnection?.targetBlock();
			let i = 1;
			while (clauseBlock) {
				if (clauseBlock.isInsertionMarker()) {
					clauseBlock = clauseBlock.nextConnection?.targetBlock() || null;
					continue;
				}
				const mutatorBlock = clauseBlock as MutatorBlock;
				switch (clauseBlock.type) {
					case 'controls_if_elseif': {
						const inputIf = this.getInput('IF' + i);
						const inputDo = this.getInput('DO' + i);
						mutatorBlock.valueConnection_ = 
							inputIf?.connection?.targetConnection || null;
						mutatorBlock.statementConnection_ = 
							inputDo?.connection?.targetConnection || null;
						i++;
						break;
					}
					case 'controls_if_else': {
						const inputDo = this.getInput('ELSE');
						mutatorBlock.statementConnection_ = 
							inputDo?.connection?.targetConnection || null;
						break;
					}
					default:
						throw new Error('Unknown block type: ' + clauseBlock.type);
				}
				clauseBlock = clauseBlock.nextConnection?.targetBlock() || null;
			}
		}
	}, function() {
		return ['controls_if_elseif', 'controls_if_else'];
	});

	// For loop control block
	Blockly.Blocks["controls_for"] = {
		init: function() {
			this.appendDummyInput()
				.appendField("for")
				.appendField(new Blockly.FieldTextInput("i"), "VAR")
				.appendField("in range");
			this.appendValueInput("START")
				.setCheck("Number")
				.appendField("from");
			this.appendValueInput("END")
				.setCheck("Number")
				.appendField("to");
			this.appendValueInput("STEP")
				.setCheck("Number")
				.appendField("by");
			this.appendStatementInput("DO")
				.appendField("do");
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(210);
			this.setTooltip("Create a for loop iterating over a range");
			this.setHelpUrl("https://docs.rs/solana-program/latest/solana_program/");
		},
		
		onchange: function() {
			// Validate variable name
			const varName = this.getFieldValue("VAR");
			if (!varName || varName === "") {
				this.setWarningText("Variable name is required");
				return;
			} else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(varName)) {
				this.setWarningText("Variable name should start with a letter and contain only letters, numbers, and underscores");
				return;
			}
			
			// Validate numerical inputs
			const validateInput = (inputName: string, errorMsg: string) => {
				const input = this.getInput(inputName);
				if (!input.connection.targetBlock()) {
					return errorMsg;
				}
				return null;
			};
			
			const warnings = [];
			const startError = validateInput("START", "Start value is required");
			const endError = validateInput("END", "End value is required");
			const stepError = validateInput("STEP", "Step value is required");
			
			if (startError) warnings.push(startError);
			if (endError) warnings.push(endError);
			if (stepError) warnings.push(stepError);
			
			if (warnings.length > 0) {
				this.setWarningText(warnings.join("\n"));
			} else {
				this.setWarningText(null);
			}
		}
	};

	// While loop control block
	Blockly.Blocks["controls_while"] = {
		init: function() {
			this.appendValueInput("BOOL")
				.setCheck("Boolean")
				.appendField("while");
			this.appendStatementInput("DO")
				.appendField("do");
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(210);
			this.setTooltip("Create a while loop");
			this.setHelpUrl("https://docs.rs/solana-program/latest/solana_program/");
		},
		
		onchange: function() {
			// Validate condition
			if (!this.getInput("BOOL").connection.targetBlock()) {
				this.setWarningText("While condition is required");
			} else {
				this.setWarningText(null);
			}
		}
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
		onchange: function() {
			// Check struct name
			const structName = this.getFieldValue("NAME");
			if (!structName || structName === "") {
				this.setWarningText("Struct name is required");
			} else if (!/^[A-Z][A-Za-z0-9]*$/.test(structName)) {
				this.setWarningText("Struct name should start with an uppercase letter and use CamelCase");
			} else {
				this.setWarningText(null);
			}
			
			// Check if fields are defined
			const fieldsConnection = this.getInput("FIELDS").connection;
			if (!fieldsConnection.targetBlock()) {
				this.setWarningText("Add at least one field to the struct");
			}
		}
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
		onchange: function() {
			// Check field name
			const fieldName = this.getFieldValue("NAME");
			if (!fieldName || fieldName === "") {
				this.setWarningText("Field name is required");
			} else if (!/^[a-z][a-z0-9_]*$/.test(fieldName)) {
				this.setWarningText("Field name should be snake_case (lowercase with underscores)");
			} else {
				this.setWarningText(null);
			}
			
			// Check parent block
			let parent = this.getParent();
			if (!parent || parent.type !== "rust_struct") {
				this.setWarningText("Field must be inside a struct");
			}
		}
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
			this.setTooltip(`Defines how your program processes incoming instructions.
			
Tips:
• Always validate input parameters
• Check account permissions
• Handle all possible error cases
• Consider adding logging

Next steps:
1. Add Account Validation blocks
2. Add PDA Creation if needed
3. Add Token Operations if handling tokens
4. Add Error blocks for validation`);
			this.setHelpUrl("");
		},
		onchange: function() {
			// Check function name
			const funcName = this.getFieldValue("NAME");
			if (!funcName || funcName === "") {
				this.setWarningText("Function name is required");
			} else if (!/^[a-z][a-z0-9_]*$/.test(funcName)) {
				this.setWarningText("Function name should be snake_case (lowercase with underscores)");
			} else {
				this.setWarningText(null);
			}
			
			// Check parent block 
			let parent = this.getParent();
			if (!parent || parent.type !== "solana_program") {
				this.setWarningText("Instruction processor must be inside a Solana program");
			}
		}
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
		onchange: function() {
			// Check param name
			const paramName = this.getFieldValue("NAME");
			if (!paramName || paramName === "") {
				this.setWarningText("Parameter name is required");
			} else if (!/^[a-z][a-z0-9_]*$/.test(paramName)) {
				this.setWarningText("Parameter name should be snake_case (lowercase with underscores)");
			} else {
				this.setWarningText(null);
			}
			
			// Check parent
			let parent = this.getParent();
			if (!parent || parent.type !== "process_instruction") {
				this.setWarningText("Parameter must be inside a process instruction block");
			}
		}
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
			this.setTooltip(`Validates the number and type of accounts passed to the program.
			
Tips:
• Always check account owners
• Verify account permissions (signer/writable)
• Validate account data structure
• Check for required accounts

Next steps:
1. Add Account Owner Check block
2. Add Account Constraint block
3. Add Deserialize Account block
4. Add Error blocks for invalid cases`);
			this.setHelpUrl("");
		},
		onchange: function() {
			// Check min accounts value
			const minAccountsInput = this.getInput("MIN_ACCOUNTS");
			if (!minAccountsInput.connection.targetBlock()) {
				this.setWarningText("Minimum number of accounts is required");
			} else {
				this.setWarningText(null);
			}
		}
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
		onchange: function() {
			// Check account name
			const accountName = this.getFieldValue("NAME");
			if (!accountName || accountName === "") {
				this.setWarningText("Account name is required");
			} else if (!/^[a-z][a-z0-9_]*$/.test(accountName)) {
				this.setWarningText("Account name should be snake_case (lowercase with underscores)");
			} else {
				this.setWarningText(null);
			}
			
			// Check index
			const index = this.getFieldValue("INDEX");
			if (index < 0) {
				this.setWarningText("Account index must be non-negative");
			}
		}
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
		onchange: function() {
			// Check account name
			const accountName = this.getFieldValue("ACCOUNT");
			if (!accountName || accountName === "") {
				this.setWarningText("Account name is required");
			} else if (!/^[a-z][a-z0-9_]*$/.test(accountName)) {
				this.setWarningText("Account name should be snake_case (lowercase with underscores)");
			} else {
				this.setWarningText(null);
			}
		}
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
		onchange: function() {
			// Check account name
			const accountName = this.getFieldValue("ACCOUNT");
			if (!accountName || accountName === "") {
				this.setWarningText("Account name is required");
			} else if (!/^[a-z][a-z0-9_]*$/.test(accountName)) {
				this.setWarningText("Account name should be snake_case (lowercase with underscores)");
			} else {
				this.setWarningText(null);
			}
			
			// Check type name
			const typeName = this.getFieldValue("TYPE");
			if (!typeName || typeName === "") {
				this.setWarningText("Type name is required");
			} else if (!/^[A-Z][A-Za-z0-9]*$/.test(typeName)) {
				this.setWarningText("Type name should start with an uppercase letter and use CamelCase");
			}
		}
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
			this.setTooltip(`Creates a Program Derived Address (PDA) for storing program data.
			
Tips:
• Use unique seed combinations
• Include program ID in seeds
• Consider adding a bump seed
• Validate PDA ownership

Next steps:
1. Add PDA Seeds
2. Add Account Initialization
3. Add Owner Validation
4. Add Data Serialization`);
			this.setHelpUrl("");
		},
		onchange: function() {
			// Check PDA name
			const pdaName = this.getFieldValue("NAME");
			if (!pdaName || pdaName === "") {
				this.setWarningText("PDA name is required");
			} else if (!/^[a-z][a-z0-9_]*$/.test(pdaName)) {
				this.setWarningText("PDA name should be snake_case (lowercase with underscores)");
			} else {
				this.setWarningText(null);
			}
			
			// Check seeds
			const seedsConnection = this.getInput("SEEDS").connection;
			if (!seedsConnection.targetBlock()) {
				this.setWarningText("At least one seed is required for a PDA");
			}
		}
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
		onchange: function() {
			// Check seed value
			const seedValue = this.getFieldValue("VALUE");
			if (!seedValue || seedValue === "") {
				this.setWarningText("Seed value is required");
			} else {
				this.setWarningText(null);
			}
			
			// Check parent
			let parent = this.getParent();
			if (!parent || parent.type !== "create_pda") {
				this.setWarningText("Seed must be inside a PDA block");
			}
		}
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
		}
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
		onchange: function() {
			// Check enum name
			const enumName = this.getFieldValue("NAME");
			if (!enumName || enumName === "") {
				this.setWarningText("Enum name is required");
			} else if (!/^[A-Z][A-Za-z0-9]*$/.test(enumName)) {
				this.setWarningText("Enum name should start with an uppercase letter and use CamelCase");
			} else {
				this.setWarningText(null);
			}
			
			// Check variants
			const variantsConnection = this.getInput("VARIANTS").connection;
			if (!variantsConnection.targetBlock()) {
				this.setWarningText("Add at least one variant to the enum");
			}
		}
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
		onchange: function() {
			// Check variant name
			const variantName = this.getFieldValue("NAME");
			if (!variantName || variantName === "") {
				this.setWarningText("Variant name is required");
			} else if (!/^[A-Z][A-Za-z0-9]*$/.test(variantName)) {
				this.setWarningText("Variant name should start with an uppercase letter and use CamelCase");
			} else {
				this.setWarningText(null);
			}
			
			// Check parent
			let parent = this.getParent();
			if (!parent || parent.type !== "rust_enum") {
				this.setWarningText("Variant must be inside an enum");
			}
		}
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
		onchange: function() {
			// Check event name
			const eventName = this.getFieldValue("NAME");
			if (!eventName || eventName === "") {
				this.setWarningText("Event name is required");
			} else {
				this.setWarningText(null);
			}
		}
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
		onchange: function() {
			// Check program ID
			const programId = this.getFieldValue("PROGRAM_ID");
			if (!programId || programId === "") {
				this.setWarningText("Program ID is required");
			} else {
				this.setWarningText(null);
			}
			
			// Check data
			const dataInput = this.getInput("DATA");
			if (!dataInput.connection.targetBlock()) {
				this.setWarningText("Instruction data is required");
			}
		}
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
		onchange: function() {
			// Check account name
			const accountName = this.getFieldValue("NAME");
			if (!accountName || accountName === "") {
				this.setWarningText("Account name is required");
			} else if (!/^[a-z][a-z0-9_]*$/.test(accountName)) {
				this.setWarningText("Account name should be snake_case (lowercase with underscores)");
			} else {
				this.setWarningText(null);
			}
			
			// Check account type
			const typeName = this.getFieldValue("TYPE");
			if (!typeName || typeName === "") {
				this.setWarningText("Account type is required");
			} else if (!/^[A-Z][A-Za-z0-9]*$/.test(typeName)) {
				this.setWarningText("Account type should start with an uppercase letter and use CamelCase");
			}
			
			// Check space value
			const spaceInput = this.getInput("SPACE");
			if (!spaceInput.connection.targetBlock()) {
				this.setWarningText("Space size is required");
			}
		}
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
			this.setTooltip(`Performs SPL Token operations safely.
			
Tips:
• Always validate token accounts
• Check token mint authority
• Verify sufficient token balance
• Handle decimal precision correctly

Next steps:
1. Add Account Validation for token accounts
2. Add Authority Check block
3. Add Balance Check block
4. Add Error Handling for token operations`);
			this.setHelpUrl("");
		},
		onchange: function() {
			// Check amount
			const amountInput = this.getInput("AMOUNT");
			if (!amountInput.connection.targetBlock()) {
				this.setWarningText("Amount is required");
			} else {
				this.setWarningText(null);
			}
			
			// Check accounts
			const accountsConnection = this.getInput("ACCOUNTS").connection;
			if (!accountsConnection.targetBlock()) {
				this.setWarningText("At least one account is required for token operation");
			}
		}
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
			this.setTooltip(`Adds security constraints to account validation.
			
Tips:
• Always check signer authority
• Verify account writability
• Check account initialization
• Validate fund sufficiency

Next steps:
1. Add Multiple Constraints
2. Add Custom Error Handling
3. Add Ownership Validation
4. Add Balance Checks`);
			this.setHelpUrl("");
		},
		onchange: function() {
			// Check account name
			const accountName = this.getFieldValue("ACCOUNT");
			if (!accountName || accountName === "") {
				this.setWarningText("Account name is required");
			} else if (!/^[a-z][a-z0-9_]*$/.test(accountName)) {
				this.setWarningText("Account name should be snake_case (lowercase with underscores)");
			} else {
				this.setWarningText(null);
			}
		}
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
		onchange: function() {
			// Check both inputs
			const inputA = this.getInput("A");
			const inputB = this.getInput("B");
			
			if (!inputA.connection.targetBlock() || !inputB.connection.targetBlock()) {
				this.setWarningText("Both operands are required");
			} else {
				this.setWarningText(null);
			}
			
			// Check for division by zero
			const operation = this.getFieldValue("OPERATION");
			if (operation === "DIV") {
				const blockB = inputB.connection.targetBlock();
				if (blockB && blockB.type === "math_number" && blockB.getFieldValue("NUM") === "0") {
					this.setWarningText("Division by zero is not allowed");
				}
			}
		}
	};

	// Boolean blocks for control structures
	Blockly.Blocks["logic_boolean"] = {
		init: function() {
			this.appendDummyInput()
				.appendField(new Blockly.FieldDropdown([
					["true", "TRUE"],
					["false", "FALSE"]
				]), "BOOL");
			this.setOutput(true, "Boolean");
			this.setColour(210);
			this.setTooltip("Returns either true or false");
			this.setHelpUrl("");
		}
	};

	Blockly.Blocks["logic_compare"] = {
		init: function() {
			this.appendValueInput("A");
			this.appendDummyInput()
				.appendField(new Blockly.FieldDropdown([
					["=", "EQ"],
					["\u2260", "NEQ"],
					[">", "GT"],
					["\u2265", "GTE"],
					["<", "LT"],
					["\u2264", "LTE"],
				]), "OP");
			this.appendValueInput("B");
			this.setInputsInline(true);
			this.setOutput(true, "Boolean");
			this.setColour(210);
			this.setTooltip("Compare two values with the selected operation");
			this.setHelpUrl("");
		},
		onchange: function() {
			// Check both inputs
			const inputA = this.getInput("A");
			const inputB = this.getInput("B");
			
			if (!inputA.connection.targetBlock() || !inputB.connection.targetBlock()) {
				this.setWarningText("Both comparison values are required");
			} else {
				this.setWarningText(null);
			}
		}
	};

	// Logic Operation block (AND, OR)
	Blockly.Blocks["logic_operation"] = {
		init: function() {
			this.appendValueInput("A")
				.setCheck("Boolean");
			this.appendDummyInput()
				.appendField(new Blockly.FieldDropdown([
					["AND", "AND"],
					["OR", "OR"]
				]), "OP");
			this.appendValueInput("B")
				.setCheck("Boolean");
			this.setInputsInline(true);
			this.setOutput(true, "Boolean");
			this.setColour(210);
			this.setTooltip("Returns true if both inputs have the same value");
			this.setHelpUrl("");
		},
		onchange: function() {
			// Check both inputs
			const inputA = this.getInput("A");
			const inputB = this.getInput("B");
			
			if (!inputA.connection.targetBlock() || !inputB.connection.targetBlock()) {
				this.setWarningText("Both operands are required");
			} else {
				this.setWarningText(null);
			}
		}
	};

	// Logic Negate block (NOT)
	Blockly.Blocks["logic_negate"] = {
		init: function() {
			this.appendValueInput("BOOL")
				.setCheck("Boolean")
				.appendField("NOT");
			this.setOutput(true, "Boolean");
			this.setColour(210);
			this.setTooltip("Returns true if the input is false, and false if the input is true");
			this.setHelpUrl("");
		},
		onchange: function() {
			// Check input
			const input = this.getInput("BOOL");
			if (!input.connection.targetBlock()) {
				this.setWarningText("Input is required");
			} else {
				this.setWarningText(null);
			}
		}
	};

	// Text block for string values
	Blockly.Blocks["text"] = {
		init: function() {
			this.appendDummyInput()
				.appendField(new Blockly.FieldTextInput(""), "TEXT");
			this.setOutput(true, "String");
			this.setColour(160);
			this.setTooltip("A text string");
			this.setHelpUrl("");
		}
	};

	// Helper blocks for if mutator
	Blockly.Blocks["controls_if_if"] = {
		init: function() {
			this.appendDummyInput().appendField("if");
			this.setNextStatement(true);
			this.setColour(210);
			this.setTooltip("If block container for mutator");
			this.contextMenu = false;
		}
	};

	Blockly.Blocks["controls_if_elseif"] = {
		init: function() {
			this.appendDummyInput().appendField("else if");
			this.setPreviousStatement(true);
			this.setNextStatement(true);
			this.setColour(210);
			this.setTooltip("Else-if condition for if block");
			this.contextMenu = false;
		}
	};

	Blockly.Blocks["controls_if_else"] = {
		init: function() {
			this.appendDummyInput().appendField("else");
			this.setPreviousStatement(true);
			this.setColour(210);
			this.setTooltip("Else condition for if block");
			this.contextMenu = false;
		}
	};

	// Number block
	Blockly.Blocks["math_number"] = {
		init: function() {
			this.appendDummyInput()
				.appendField(new Blockly.FieldNumber(0), "NUM");
			this.setOutput(true, "Number");
			this.setColour(230);
			this.setTooltip("A number");
			this.setHelpUrl("");
		}
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
			name: "Control",
			colour: "210",
			contents: [
				{
					kind: "block",
					type: "controls_if",
				},
				{
					kind: "block",
					type: "controls_for",
				},
				{
					kind: "block",
					type: "controls_while",
				},
				{
					kind: "block",
					type: "logic_boolean",
				},
				{
					kind: "block",
					type: "logic_compare",
					},
					{
						kind: "block",
						type: "logic_operation",
					},
					{
						kind: "block",
						type: "logic_negate",
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
					type: "account_constraint",
				},
			],
		},
		{
			kind: "category",
			name: "PDA",
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
				{
					kind: "block",
					type: "init_account",
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
				{
					kind: "block",
					type: "math_number",
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

// Helper function to check if a block is nested within a specific parent type
export function isBlockInParent(block: Block | null, parentType: string) {
	let parent = block?.getSurroundParent();
	while (parent) {
		if (parent.type === parentType) {
			return true;
		}
		parent = parent.getSurroundParent();
	}
	return false;
}

// Error handling helper for codegen
export function codegenError(block: Block | null, message: string) {
	const id = block?.id;
	throw {
		message: message,
		blockId: id,
		block: block,
		toString: function() { return `Code generation error at block #${id}: ${message}`; }
	};
}

