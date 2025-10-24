interface TagListProps {
  tags: string[];
  className?: string;
}

export default function TagList({ tags, className = "" }: TagListProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-mono border border-gray-200 hover-invert"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
