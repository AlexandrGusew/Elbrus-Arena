import type { Item } from '../../types/api';

interface ItemIconProps {
  item: Item;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showName?: boolean;
  enhancement?: number;
}

export function ItemIcon({ item, size = 'medium', className = '', showName = false, enhancement = 0 }: ItemIconProps) {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-32 h-32',
  };

  const textSizeClasses = {
    small: 'text-[8px]',
    medium: 'text-[10px]',
    large: 'text-sm',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-1 ${className}`}>
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className={`${sizeClasses[size]} object-contain`}
          onError={(e) => {
            // Fallback to text if image fails to load
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextElementSibling) {
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
            }
          }}
        />
      ) : null}
      {!item.imageUrl && (
        <span
          className={`text-amber-300 ${textSizeClasses[size]} text-center uppercase`}
          style={{ fontFamily: 'serif' }}
        >
          {item.name}
        </span>
      )}
      {showName && item.imageUrl && (
        <span
          className={`text-amber-300 ${textSizeClasses[size]} text-center`}
          style={{ fontFamily: 'serif' }}
        >
          {item.name}
        </span>
      )}
      {enhancement > 0 && (
        <span className="text-green-400 text-xs">+{enhancement}</span>
      )}
    </div>
  );
}
