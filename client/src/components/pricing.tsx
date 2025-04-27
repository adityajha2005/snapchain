import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Check } from 'lucide-react';

export default function Pricing() {
	return (
		<section className='py-16 md:py-32'>
			<div className='mx-auto max-w-6xl px-6'>
				<div className='mx-auto max-w-2xl space-y-6 text-center'>
					<h1 className='text-center text-4xl font-semibold lg:text-5xl'>Pricing</h1>
					<p>Choose the plan that best fits your needs and start building today.</p>
				</div>

				<div className='mt-8 grid gap-6 md:mt-20 md:grid-cols-2 '>
					<Card className='flex flex-col '>
						<CardHeader>
							<CardTitle className='font-medium'>Free</CardTitle>
							<span className='my-3 block text-2xl font-semibold'>$0 / mo</span>
							<CardDescription className='text-sm'>Per editor</CardDescription>
						</CardHeader>

						<CardContent className='space-y-4'>
							<hr className='border-dashed' />

							<ul className='list-outside space-y-3 text-sm'>
								{[
									'Basic Drag & Drop builder',
									'Upto 3 Smart Contracts a week',
									'Email and Chat Support',
								].map((item, index) => (
									<li
										key={index}
										className='flex items-center gap-2'
									>
										<Check className='size-3' />
										{item}
									</li>
								))}
							</ul>
						</CardContent>

						<CardFooter className='mt-auto'>
							<Button
								asChild
								variant='outline'
								className='w-full'
							>
								<Link href=''>Get Started</Link>
							</Button>
						</CardFooter>
					</Card>

					<Card className='relative'>
						<span className='bg-linear-to-br/increasing absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full from-purple-400 to-amber-300 px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-inset ring-white/20 ring-offset-1 ring-offset-gray-950/5'>
							Popular
						</span>

						<div className='flex flex-col'>
							<CardHeader>
								<CardTitle className='font-medium'>Pro</CardTitle>
								<span className='my-3 block text-2xl font-semibold'>$19 / mo</span>
								<CardDescription className='text-sm'>Per editor</CardDescription>
							</CardHeader>

							<CardContent className='space-y-4'>
								<hr className='border-dashed' />
								<ul className='list-outside space-y-3 text-sm'>
									{[
										'Everything in Free Plan',
										'Advanced Drag and Drop Builder',
										'Access to Basic Templates',
										'5GB Cloud Storage',
										'Access to Community Forum',
										'Single User Access',
										'Monthly Product Updates',
										'Standard Security Features',
									].map((item, index) => (
										<li
											key={index}
											className='flex items-center gap-2'
										>
											<Check className='size-3' />
											{item}
										</li>
									))}
								</ul>
							</CardContent>

							<CardFooter>
								<Button
									asChild
									className='w-full'
								>
									<Link href=''>Get Started</Link>
								</Button>
							</CardFooter>
						</div>
					</Card>

					{/* <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-medium">Startup</CardTitle>
                            <span className="my-3 block text-2xl font-semibold">$29 / mo</span>
                            <CardDescription className="text-sm">Per editor</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <hr className="border-dashed" />

                            <ul className="list-outside space-y-3 text-sm">
                                {['Everything in Pro Plan', '5GB Cloud Storage', 'Email and Chat Support'].map((item, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Check className="size-3" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent> */}
					{/* 
                        <CardFooter className="mt-auto">
                            <Button asChild variant="outline" className="w-full">
                                <Link href="">Get Started</Link>
                            </Button>
                        </CardFooter>
                    </Card> */}
				</div>
			</div>
		</section>
	);
}
