
import { Mail, User } from 'lucide-react';
import Image from 'next/image';
import { auth } from '@/auth';

const ProfilePage = async () => {
	const session = await auth();
	const user = session?.user;

	return (
		<div className='container mx-auto py-8 space-y-6 px-5 flex justify-center items-center'>
			<div className=' p-6'>
				<div className='flex flex-col md:flex-row gap-6 items-center'>
					{/* Avatar section */}
					<div className='relative'>
						<div className='h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-background shadow-lg bg-card'>
							{user?.image ? (
								<Image
									src={user.image}
									alt={user?.name || 'User'}
									width={128}
									height={128}
									className='object-cover w-full h-full'
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center bg-primary/10'>
									<User className='h-12 w-12 text-primary/60' />
								</div>
							)}
						</div>
					</div>

					{/* Profile info */}
					<div className='flex-1 space-y-4'>
						<div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
							<div>
								<h1 className='text-2xl md:text-3xl font-bold'>{user?.name || 'User'}</h1>
							</div>
						</div>

						{/* Contact info */}
						<div className='flex flex-col sm:flex-row gap-4'>
							<div className='flex items-center gap-2 text-sm'>
								<Mail className='h-4 w-4 text-muted-foreground' />
								<span>{user?.email || 'No email provided'}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
