interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionHeader({ title, subtitle, className = "" }: SectionHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-mono font-bold mb-2">{title}</h2>
      {subtitle && (
        <p className="text-gray-600 font-mono text-sm">{subtitle}</p>
      )}
    </div>
  );
}
