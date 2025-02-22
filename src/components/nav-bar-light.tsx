'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function NavBarLight() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'H' },
        { href: '/example-1', label: 'E.1' },
        { href: '/example-2', label: 'E.2' },
        // { href: '/example-3', label: 'E.3' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50  bg-linear-gradient bg-gradient-to-t from-ui-gradient-bottom/90  to-ui-gradient-top/100  backdrop-blur-sm md:backdrop-blur-none md:bg-none md:mix-blend-difference overflow-hidden">
            {/* bg-linear-gradient bg-gradient-to-t from-black-washed/70  to-black-washed/100 */}
            <div
                className="absolute right-0 -bottom-1/2 w-full h-full opacity-20 md:hidden"
                style={{
                    background: 'radial-gradient(ellipse at center, #414795 0%, transparent 70%)',
                }}
            />
            <div className="  ">
                <div className="relative flex items-center justify-between px-4 md:px-16 py-6 md:py-8 ">
                    <Link href="/">
                        <Image src="/logo_triangle.svg" width={160} height={30} alt="logo" />
                    </Link>

                    <div className="flex gap-2 sm:gap-4 md:gap-8">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={` transition-colors text-xs uppercase p-2  ${
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
