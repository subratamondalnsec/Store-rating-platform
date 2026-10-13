import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  showValue = false,
  totalReviews = null
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7'
  };

  const starSize = sizeClasses[size] || sizeClasses.md;

  const handleClick = (starValue) => {
    if (!readOnly && onChange) {
      onChange(starValue);
    }
  };

  const handleMouseEnter = (starValue) => {
    if (!readOnly) {
      setHoverValue(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(0);
    }
  };

  const activeValue = hoverValue || value;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeValue;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              className={`transition-transform duration-100 ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-110 active:scale-95 focus:outline-none'
              }`}
              aria-label={`${star} Star`}
            >
              <Star
                className={`${starSize} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                    : 'text-slate-300 fill-slate-100'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-semibold text-slate-700 ml-1">
          {value > 0 ? Number(value).toFixed(1) : 'No ratings'}
        </span>
      )}

      {totalReviews !== null && (
        <span className="text-xs text-slate-500">
          ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default StarRating;
