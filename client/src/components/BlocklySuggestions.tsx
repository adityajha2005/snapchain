import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface SecurityCheck {
    id: string;
    title: string;
    description: string;
    status: 'missing' | 'present' | 'warning';
}

interface BlocklySuggestionsProps {
    workspace: any; // Replace with proper Blockly type
    currentCode: string;
}

const BlocklySuggestions: React.FC<BlocklySuggestionsProps> = ({
    workspace,
    currentCode
}) => {
    const [securityChecks, setSecurityChecks] = React.useState<SecurityCheck[]>([
        {
            id: 'account-validation',
            title: 'Account Validation',
            description: 'Validate all accounts before processing',
            status: 'missing'
        },
        {
            id: 'owner-checks',
            title: 'Owner Checks',
            description: 'Verify account ownership',
            status: 'missing'
        },
        {
            id: 'signer-verification',
            title: 'Signer Verification',
            description: 'Verify required signers',
            status: 'missing'
        },
        {
            id: 'error-handling',
            title: 'Error Handling',
            description: 'Implement comprehensive error handling',
            status: 'missing'
        },
        {
            id: 'pda-validation',
            title: 'PDA Validation',
            description: 'Validate PDA derivation and ownership',
            status: 'missing'
        }
    ]);

    // Update security checks based on workspace content
    React.useEffect(() => {
        if (!workspace) return;

        const updatedChecks = securityChecks.map(check => {
            const newCheck = { ...check };
            
            // Check for account validation blocks
            if (check.id === 'account-validation') {
                const hasValidation = workspace.getBlocksByType('validate_accounts').length > 0;
                newCheck.status = hasValidation ? 'present' : 'missing';
            }
            
            // Check for owner verification blocks
            if (check.id === 'owner-checks') {
                const hasOwnerChecks = workspace.getBlocksByType('check_account_owner').length > 0;
                newCheck.status = hasOwnerChecks ? 'present' : 'missing';
            }
            
            // Check for signer verification
            if (check.id === 'signer-verification') {
                const hasSignerChecks = workspace.getBlocksByType('account_constraint')
                    .some((block: any) => block.getFieldValue('CONSTRAINT') === 'IS_SIGNER');
                newCheck.status = hasSignerChecks ? 'present' : 'missing';
            }
            
            // Check for error handling
            if (check.id === 'error-handling') {
                const hasErrorBlocks = workspace.getBlocksByType('program_error').length > 0;
                newCheck.status = hasErrorBlocks ? 'present' : 'warning';
            }
            
            // Check for PDA validation
            if (check.id === 'pda-validation') {
                const hasPDABlocks = workspace.getBlocksByType('create_pda').length > 0;
                const hasValidation = workspace.getBlocksByType('check_account_owner')
                    .some((block: any) => block.getFieldValue('OWNER') === 'program_id');
                newCheck.status = hasPDABlocks && hasValidation ? 'present' : 
                    (hasPDABlocks ? 'warning' : 'missing');
            }
            
            return newCheck;
        });

        setSecurityChecks(updatedChecks);
    }, [workspace, currentCode]);

    return (
        <div className="bg-gray-800 rounded-lg p-4 space-y-1">
            <h3 className="text-sm font-medium text-white mb-4">Security Suggestions</h3>
            <div className="space-y-2">
                {securityChecks.map(check => (
                    <div 
                        key={check.id}
                        className={`flex items-start gap-2 p-2 rounded ${
                            check.status === 'present' ? 'bg-emerald-500/10' :
                            check.status === 'warning' ? 'bg-yellow-500/10' :
                            'bg-red-500/10'
                        }`}
                    >
                        {check.status === 'present' ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        ) : (
                            <AlertCircle className={`h-5 w-5 ${
                                check.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                            } flex-shrink-0`} />
                        )}
                        <div>
                            <h4 className="text-sm font-medium text-zinc-200">{check.title}</h4>
                            <p className="text-xs text-zinc-400">{check.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlocklySuggestions; 