'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function NavBar() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'H' },
        { href: '/example-1', label: 'E.1' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            <div className="  border-b  absolute top-0 inset-x-2 grid border border-ui-border  bg-linear-gradient bg-gradient-to-t from-ui-gradient-bottom/90  to-ui-gradient-top/100 backdrop-blur  rounded-b-[48px] ">
                <div className="relative flex items-center justify-between px-16 py-8">
                    <Link href="/">
                        <Image src="/logo_triangle.svg" width={160} height={140} alt="logo" />
                    </Link>

                    <div className="flex gap-8">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-white-washed-dark hover:text-white transition-colors text-xs uppercase p-2 ${
                                    pathname === link.href ? 'text-3a-green' : ''
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
