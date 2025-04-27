"use client";

import { Code, FileCode, PlusCircle, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SmartContract {
  _id: string;
  name: string;
  description: string;
  network: string;
  deployedAddress?: string;
  createdAt: string;
}

const SmartContractsPage = () => {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [contracts, setContracts] = useState<SmartContract[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		network: "solana",
		symbol: "",
		totalSupply: "1000000",
		decimals: "9",
		accessControl: "Ownable",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	
	const { data: session, status } = useSession();
	const router = useRouter();
	
	// Redirect if not authenticated
	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
		}
	}, [status, router]);
	
	// Fetch user's contracts
	useEffect(() => {
		const fetchContracts = async () => {
			if (status === "authenticated") {
				try {
					const response = await fetch("/api/contracts");
					
					if (response.ok) {
						const data = await response.json();
						setContracts(data.contracts);
					} else {
						console.error("Failed to fetch contracts");
					}
				} catch (err) {
					console.error("Error fetching contracts:", err);
				} finally {
					setIsLoading(false);
				}
			}
		};
		
		fetchContracts();
	}, [status]);
	
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};
	
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);
		
		try {
			const response = await fetch("/api/contracts", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formData.name,
					description: formData.description,
					network: formData.network,
					metadata: {
						symbol: formData.symbol,
						totalSupply: formData.totalSupply,
						decimals: formData.decimals,
						accessControl: formData.accessControl,
					},
				}),
			});
			
			const data = await response.json();
			
			if (response.ok) {
				// Redirect to project page with contract ID
				router.push(`/project?contractId=${data.contract._id}`);
			} else {
				setError(data.message || "Failed to create contract");
				setIsSubmitting(false);
			}
		} catch (err: any) {
			setError(err.message || "An error occurred");
			setIsSubmitting(false);
		}
	};

	// Show loading state
	if (status === "loading" || isLoading) {
		return (
			<div className="container mx-auto py-10 px-4 flex justify-center items-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10 px-4 md:px-6 lg:px-8 space-y-8">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Smart Contracts</h1>
					<p className="text-muted-foreground mt-1">
						Create and deploy blockchain smart contracts
					</p>
				</div>
				{!showCreateForm && (
					<button
						onClick={() => setShowCreateForm(true)}
						className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium md:w-auto w-full justify-center"
					>
						<PlusCircle className="h-4 w-4" />
						Create Contract
					</button>
				)}
			</div>

			{error && (
				<div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
					{error}
				</div>
			)}

			{showCreateForm ? (
				<div className="mt-6 p-6 bg-card border border-border rounded-lg animate-in fade-in-50 duration-300">
					<h2 className="text-xl font-semibold mb-6 pb-4 border-b border-border">
						Create Smart Contract
					</h2>

					<form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium mb-2" htmlFor="name">
									Contract Name
								</label>
								<input
									id="name"
									name="name"
									type="text"
									required
									className="w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none"
									placeholder="MyToken"
									value={formData.name}
									onChange={handleInputChange}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2" htmlFor="network">
									Network
								</label>
								<select
									id="network"
									name="network"
									className="w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none"
									value={formData.network}
									onChange={handleInputChange}
								>
									<option value="solana">Solana</option>
									<option value="ethereum">Ethereum</option>
									<option value="polygon">Polygon</option>
									<option value="arbitrum">Arbitrum</option>
									<option value="optimism">Optimism</option>
								</select>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2" htmlFor="description">
								Description
							</label>
							<textarea
								id="description"
								name="description"
								className="w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none"
								rows={3}
								placeholder="Describe your smart contract functionality"
								value={formData.description}
								onChange={handleInputChange}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
							<div>
								<label className="block text-sm font-medium mb-2" htmlFor="symbol">
									Token Symbol
								</label>
								<input
									id="symbol"
									name="symbol"
									type="text"
									className="w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none"
									placeholder="TKN"
									value={formData.symbol}
									onChange={handleInputChange}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-2" htmlFor="totalSupply">
									Total Supply
								</label>
								<input
									id="totalSupply"
									name="totalSupply"
									type="number"
									className="w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none"
									placeholder="1000000"
									value={formData.totalSupply}
									onChange={handleInputChange}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-2" htmlFor="decimals">
									Decimals
								</label>
								<input
									id="decimals"
									name="decimals"
									type="number"
									className="w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none"
									placeholder="9"
									value={formData.decimals}
									onChange={handleInputChange}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-2" htmlFor="accessControl">
									Access Control
								</label>
								<select
									id="accessControl"
									name="accessControl"
									className="w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none"
									value={formData.accessControl}
									onChange={handleInputChange}
								>
									<option>Ownable</option>
									<option>Role-based</option>
								</select>
							</div>
						</div>

						<div className="flex justify-end gap-3 pt-4">
							<button
								type="button"
								onClick={() => setShowCreateForm(false)}
								className="px-4 py-2 border border-border rounded-md hover:bg-accent/20 transition-colors"
							>
								Cancel
							</button>
							<button 
								type="submit"
								disabled={isSubmitting}
								className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
							>
								{isSubmitting ? (
									<>
										<div className="h-4 w-4 border-t-2 border-white rounded-full animate-spin"></div>
										Processing...
									</>
								) : (
									<>
										<Zap className="h-4 w-4" />
										Create Contract
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			) : contracts.length > 0 ? (
				<div className="mt-6 rounded-xl overflow-hidden border border-border">
					<div className="px-6 py-5 border-b border-border bg-card/50">
						<h2 className="text-xl font-semibold">My Contracts</h2>
					</div>
					<div className="bg-card/50">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
							{contracts.map(contract => (
								<div 
									key={contract._id}
									className="border border-border rounded-lg p-4 hover:bg-accent/10 transition-colors cursor-pointer"
									onClick={() => router.push(`/project?contractId=${contract._id}`)}
								>
									<h3 className="font-medium text-lg">{contract.name}</h3>
									<p className="text-sm text-muted-foreground line-clamp-2 mt-1">{contract.description}</p>
									<div className="flex items-center gap-2 mt-3">
										<span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
											{contract.network}
										</span>
										{contract.deployedAddress && (
											<span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full">
												Deployed
											</span>
										)}
									</div>
									<div className="text-xs text-muted-foreground mt-4">
										Created: {new Date(contract.createdAt).toLocaleDateString()}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			) : (
				<div className="mt-6 rounded-xl overflow-hidden border border-border bg-gradient-to-br from-primary/5 to-transparent">
					<div className="px-6 py-5 border-b border-border bg-card/50">
						<h2 className="text-xl font-semibold">My Contracts</h2>
					</div>
					<div className="bg-card/50 p-10 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-4 ring-primary/5">
							<Code className="h-7 w-7 text-primary" />
						</div>
						<h3 className="text-lg font-medium mb-2">No contracts yet</h3>
						<p className="text-muted-foreground text-sm max-w-sm mb-6">
							Start by creating your first smart contract with our simple
							interface.
						</p>
						<button
							onClick={() => setShowCreateForm(true)}
							className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-md"
						>
							<FileCode className="h-4 w-4" />
							Create Your First Contract
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default SmartContractsPage;
