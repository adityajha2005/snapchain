import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);
// Minimum SOL required for deployment (2 SOL for safety)
const MIN_SOL_REQUIRED = 2;
async function verifyKeypairAndBalance(keypairPath: string, network: string): Promise<{ 
    isValid: boolean; 
    balance: number;
    address: string;
    error?: string;
}> {
    try {
        // Verify keypair by trying to get its public key
        const { stdout: pubkeyOutput } = await execAsync(
            `solana-keygen pubkey ${keypairPath}`
        );
        const address = pubkeyOutput.trim();

        // Get account balance
        const { stdout: balanceOutput } = await execAsync(
            `solana balance ${address} --url ${network}`
        );
        const balance = parseFloat(balanceOutput.split(' ')[0]);

        return {
            isValid: true,
            balance,
            address
        };
    } catch (error: any) {
        return {
            isValid: false,
            balance: 0,
            address: '',
            error: error.message
        };
    }
}

export async function POST(request: Request) {
    try {
        // Parse the multipart form data
        const formData = await request.formData();
        const code = formData.get('code') as string;
        const network = formData.get('network') as string;
        const keypairFile = formData.get('keypair') as File;
        
        if (!code || !network || !keypairFile) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (network !== 'devnet' && network !== 'testnet') {
            return NextResponse.json(
                { error: 'Invalid network specified' },
                { status: 400 }
            );
        }

        // Create a temporary directory for the contract
        const tempDir = path.join(process.cwd(), 'temp', uuidv4());
        await fs.mkdir(tempDir, { recursive: true });

        try {
            // Save the keypair file
            const keypairPath = path.join(tempDir, 'deploy-keypair.json');
            const keypairBuffer = Buffer.from(await keypairFile.arrayBuffer());
            await fs.writeFile(keypairPath, keypairBuffer);

            // Verify keypair and check balance
            const { isValid, balance, address, error } = await verifyKeypairAndBalance(keypairPath, network);
            
            if (!isValid) {
                return NextResponse.json({
                    success: false,
                    error: `Invalid keypair file: ${error}`
                }, { status: 400 });
            }

            if (balance < MIN_SOL_REQUIRED) {
                return NextResponse.json({
                    success: false,
                    error: `Insufficient balance. You have ${balance} SOL but ${MIN_SOL_REQUIRED} SOL is required for safe deployment.`,
                    balance,
                    address,
                    minRequired: MIN_SOL_REQUIRED
                }, { status: 400 });
            }

            // Create Cargo.toml
            const cargoToml = `[package]
name = "solana-program"
version = "0.1.0"
edition = "2021"

[dependencies]
solana-program = "1.16"
thiserror = "1.0"

[lib]
crate-type = ["cdylib", "lib"]`;

            await fs.writeFile(path.join(tempDir, 'Cargo.toml'), cargoToml);

            // Create src directory and write the contract code
            const srcDir = path.join(tempDir, 'src');
            await fs.mkdir(srcDir, { recursive: true });
            await fs.writeFile(path.join(srcDir, 'lib.rs'), code);

            // Build the program
            const buildResult = await execAsync('cargo build-bpf', { cwd: tempDir });
            console.log('Build output:', buildResult.stdout);

            // Deploy the program using the provided keypair
            const { stdout } = await execAsync(
                `solana program deploy ${path.join(tempDir, 'target/deploy/solana_program.so')} --url ${network} --keypair ${keypairPath}`,
                { cwd: tempDir }
            );

            // Extract program ID from deployment output
            const programId = stdout.match(/Program Id: (.+)/)?.[1];

            return NextResponse.json({
                success: true,
                programId,
                message: `Successfully deployed to ${network}`,
                deployerAddress: address,
                balance
            });
        } catch (error: any) {
            return NextResponse.json({
                success: false,
                error: `Deployment failed: ${error.message}. Make sure you have sufficient SOL in your account for deployment.`
            }, { status: 500 });
        } finally {
            // Clean up
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    } catch (error: any) {
        console.error('Deployment error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Failed to deploy contract' 
            },
            { status: 500 }
        );
    }
} 