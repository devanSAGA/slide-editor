interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
}

export default function Skeleton({
  width = '100%',
  height = '100%',
  className = '',
  rounded = true,
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`animate-pulse bg-zinc-800 ${rounded ? 'rounded-lg' : ''} ${className}`}
      style={style}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
