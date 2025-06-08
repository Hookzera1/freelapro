import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = '', width = 120, height = 40 }: LogoProps) {
  return (
    <Link href="/" className={`block ${className}`}>
      <Image
        src="/logo.png"
        alt="Freela Conect"
        width={width}
        height={height}
        className="h-auto w-auto"
        priority
      />
    </Link>
  );
} 