import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Home">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-between gap-4">
                        <span className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                            iterum system
                        </span>
                        
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <main className="flex flex-1 flex-col items-center justify-center p-6">
                    <div className="text-center">
                        <h1 className="mb-4 text-6xl font-bold text-[#f53003] dark:text-[#FF4433]">
                            Formedical
                        </h1>
                        <p className="mb-8 text-xl text-[#706f6c] dark:text-[#A1A09A]">
                            The leading medical platform for all your needs
                        </p>
                        
                        <div className="flex justify-center">
                            <Link
                                href={auth.user ? route('store.index') : route('login')}
                                className="inline-block rounded-sm border border-[#f53003] bg-[#f53003] px-8 py-3 text-white hover:bg-[#ff4433] dark:border-[#FF4433] dark:bg-[#FF4433] dark:hover:bg-[#ff5544]"
                            >
                                {auth.user ? 'Shop Now' : 'Shop Now'}
                            </Link>
                        </div>
                    </div>
                </main>

                <footer className="w-full p-6 text-center text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    <p>© {new Date().getFullYear()} Formedical. All rights reserved.</p>
                </footer>
            </div>
        </>
    );
}