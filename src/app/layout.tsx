import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/nav-bar';
import Lenis from '@/components/lenis';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
    weight: ['300', '500'],
    style: 'normal',
    display: 'swap',
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Smooth Waves',
    description: 'Check solutions for smooth waves for scroll based animations',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="bg-black-washed">
            <body className={`${geistSans.variable} ${geistMono.variable} font-sans font-normal antialiased`}>
                <Lenis>
                    <NavBar />
                    {children}
                </Lenis>
            </body>
        </html>
    );
}
