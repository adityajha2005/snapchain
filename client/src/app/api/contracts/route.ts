import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import SmartContract from '@/lib/models/SmartContract';
import mongoose from 'mongoose';

// GET: Fetch all contracts for the authenticated user
export async function GET(req: NextRequest) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Get user from session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Find all contracts created by this user
    const contracts = await SmartContract.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ contracts });
  } catch (error: any) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}

// POST: Create a new smart contract
export async function POST(req: NextRequest) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Get user from session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { name, description, network, metadata } = body;
    
    // Validate input
    if (!name) {
      return NextResponse.json(
        { message: 'Contract name is required' },
        { status: 400 }
      );
    }
    
    // Generate basic Rust code template based on the contract type
    const templateCode = generateContractTemplate(name, metadata);
    
    // Create new smart contract
    const contract = new SmartContract({
      name,
      description,
      network,
      code: templateCode,
      language: 'rust',
      createdBy: session.user.id,
      metadata: JSON.stringify(metadata),
    });
    
    // Save to database
    await contract.save();
    
    // Return success response
    return NextResponse.json(
      { message: 'Contract created successfully', contract },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create contract' },
      { status: 500 }
    );
  }
}

// Helper function to generate basic contract template
function generateContractTemplate(name: string, metadata: any): string {
  const contractName = name.replace(/\s+/g, '');
  const { symbol = 'TKN', totalSupply = '1000000', decimals = '9' } = metadata || {};
  
  return `use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

// Declare the program entrypoint
entrypoint!(process_instruction);

// Program entrypoint implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("${contractName} program entrypoint");
    
    // Create iterator for accounts
    let accounts_iter = &mut accounts.iter();
    
    // Get accounts
    let authority = next_account_info(accounts_iter)?;
    
    // Ensure the authority signed the transaction
    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Process based on instruction
    let instruction = instruction_data[0];
    match instruction {
        0 => {
            msg!("Instruction: Initialize");
            // Implementation for initializing the token
        }
        1 => {
            msg!("Instruction: Transfer");
            // Implementation for token transfer
        }
        2 => {
            msg!("Instruction: Mint");
            // Implementation for minting tokens
        }
        _ => {
            msg!("Error: Invalid instruction");
            return Err(ProgramError::InvalidInstructionData);
        }
    }
    
    Ok(())
}

// Unit tests
#[cfg(test)]
mod test {
    use super::*;
    
    #[test]
    fn test_initialize() {
        // Test initialization
    }
}`;
}