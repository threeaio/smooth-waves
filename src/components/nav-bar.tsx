'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function NavBar() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Home' },
        { href: '/example-1', label: 'Example 1' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            <div className="bg-gray-darkest-washed shadow-2xl shadow-gray-darkest-washed/40 border-b border-white-washed/20 absolute inset-0"></div>
            <div className="relative flex items-center justify-between px-24 py-6">
                <Link href="/">
                    <Image src="/logo_triangle.svg" width={160} height={140} alt="logo" />
                </Link>

                <div className="flex gap-8">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-white-washed-dark hover:text-white-washed transition-colors ${
                                pathname === link.href ? 'opacity-100' : 'opacity-70'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
