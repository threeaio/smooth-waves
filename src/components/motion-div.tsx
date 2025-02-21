'use client';
import { motion } from 'motion/react';

export const MotionDiv = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0, transition: { duration: 0.7 } }}
        >
            {children}
        </motion.div>
    );
};
