'use client';

import * as Blockly from 'blockly';
import { defineCustomBlocks } from './blocklyConfig';

// Create a custom Rust generator
let rustGenerator: any = null;

// Only run in browser environment
if (typeof window !== 'undefined') {
  // Initialize custom blocks
  defineCustomBlocks();

  // Create the Rust generator
  rustGenerator = new Blockly.Generator('Rust');

  // Define basic generator properties
  rustGenerator.INDENT = '    ';

  // Define custom order constants for expressions
  const ORDER_NONE = 99;
  const ORDER_ATOMIC = 0;

  // Generator for Solana program block
  rustGenerator['solana_program'] = function (block: Blockly.Block) {
    const programName = block.getFieldValue('NAME');
    const programBody = rustGenerator.statementToCode(block, 'BODY');
    
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
    fn process_instruction(
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
  rustGenerator['rust_struct'] = function(block: Blockly.Block) {
    const structName = block.getFieldValue('NAME');
    const fields = rustGenerator.statementToCode(block, 'FIELDS');
    
    const code = `
    #[derive(BorshSerialize, BorshDeserialize)]
    pub struct ${structName} {
    ${fields}}

    `;
    return code;
  };

  // Generator for struct field block
  rustGenerator['struct_field'] = function(block: Blockly.Block) {
    const fieldName = block.getFieldValue('NAME');
    const fieldType = block.getFieldValue('TYPE');
    
    return `${rustGenerator.INDENT}pub ${fieldName}: ${fieldType},\n`;
  };

  // Generator for instruction processing block
  rustGenerator['process_instruction'] = function(block: Blockly.Block) {
    const funcName = block.getFieldValue('NAME');
    const params = rustGenerator.statementToCode(block, 'PARAMS');
    const body = rustGenerator.statementToCode(block, 'BODY');
    
    const code = `
    pub fn ${funcName}(\n${params}) -> ProgramResult {
    ${body}    Ok(())
    }

    `;
    return code;
  };

  // Generator for function parameter block
  rustGenerator['function_param'] = function(block: Blockly.Block) {
    const paramType = block.getFieldValue('TYPE');
    
    return `${rustGenerator.INDENT}${paramType},\n`;
  };

  // Generator for account validation block
  rustGenerator['validate_accounts'] = function(block: Blockly.Block) {
    // Using a fixed value instead of ORDER_ATOMIC
    const minAccounts = rustGenerator.valueToCode(block, 'MIN_ACCOUNTS', 0) || '2';
    
    return `${rustGenerator.INDENT}let account_iter = &mut accounts.iter();
    ${rustGenerator.INDENT}if accounts.len() < ${minAccounts} {
    ${rustGenerator.INDENT}${rustGenerator.INDENT}return Err(ProgramError::NotEnoughAccountKeys);
    ${rustGenerator.INDENT}}\n`;
  };

  // Generator for get account block
  rustGenerator['get_account'] = function(block: Blockly.Block) {
    const index = block.getFieldValue('INDEX');
    const accountName = block.getFieldValue('NAME');
    
    return `${rustGenerator.INDENT}let ${accountName} = next_account_info(account_iter)?;\n`;
  };

  // Generator for check account owner block
  rustGenerator['check_account_owner'] = function(block: Blockly.Block) {
    const account = block.getFieldValue('ACCOUNT');
    const owner = block.getFieldValue('OWNER');
    
    return `${rustGenerator.INDENT}if ${account}.owner != ${owner} {
    ${rustGenerator.INDENT}${rustGenerator.INDENT}return Err(ProgramError::IncorrectProgramId);
    ${rustGenerator.INDENT}}\n`;
  };

  // Generator for deserialize account block
  rustGenerator['deserialize_account'] = function(block: Blockly.Block) {
    const account = block.getFieldValue('ACCOUNT');
    const accountType = block.getFieldValue('TYPE');
    const lowerType = accountType.toLowerCase();
    
    return `${rustGenerator.INDENT}let ${lowerType} = ${accountType}::try_from_slice(&${account}.data.borrow())?;\n`;
  };

  // Generator for PDA creation block
  rustGenerator['create_pda'] = function(block: Blockly.Block) {
    const pdaName = block.getFieldValue('NAME');
    const seeds = rustGenerator.statementToCode(block, 'SEEDS');
    
    // Extract seed values
    const seedList = seeds.trim().split('\n').filter(Boolean);
    const seedsCode = seedList.map((seed: string) => `        ${seed}`).join(',\n');
    
    return `${rustGenerator.INDENT}let ${pdaName}_seeds = [
    ${seedsCode}
    ${rustGenerator.INDENT}];
    ${rustGenerator.INDENT}let (${pdaName}, ${pdaName}_bump) = Pubkey::find_program_address(&${pdaName}_seeds, program_id);\n`;
  };

  // Generator for PDA seed block
  rustGenerator['pda_seed'] = function(block: Blockly.Block) {
    const value = block.getFieldValue('VALUE');
    
    if (value.startsWith('"') || value.startsWith('\'')) {
      return `b${value}`;
    } else {
      return `&${value}.to_le_bytes()`;
    }
  };

  // Generator for program error block
  rustGenerator['program_error'] = function(block: Blockly.Block) {
    const errorType = block.getFieldValue('ERROR');
    
    return `${rustGenerator.INDENT}return Err(${errorType});\n`;
  };

  // For block chaining, we'll use the built-in functionality of Blockly
  // Instead of using a custom scrub function
}

export { rustGenerator };