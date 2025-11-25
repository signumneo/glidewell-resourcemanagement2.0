import { Cube } from '@phosphor-icons/react';

interface MESLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Minimal MES Logo - Cube Icon with MES Letters
 * Simple, classy, professional
 */
export function MESLogo({ size = 'md', className = '' }: MESLogoProps) {
  const sizes = {
    sm: { container: 'w-10 h-10', icon: 'w-10 h-10' },
    md: { container: 'w-12 h-12', icon: 'w-12 h-12' },
    lg: { container: 'w-14 h-14', icon: 'w-14 h-14' },
    xl: { container: 'w-20 h-20', icon: 'w-20 h-20' },
  };

  return (
    <div className={`relative flex items-center justify-center ${sizes[size].container} ${className}`}>
      {/* Cube icon */}
      <Cube 
        className={`${sizes[size].icon} text-gray-900 transition-transform duration-200 hover:scale-105`}
        weight="duotone" 
      />
      
      {/* MES letters overlay */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          {/* M on top face - no transform, facing up */}
          <text
            x="50"
            y="32"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="22"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            className="fill-gray-800"
          >
            M
          </text>
          
          {/* E on left face - skewed to match left perspective */}
          <text
            x="32"
            y="60"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="22"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            transform="matrix(0.85, 0.5, 0, 1, 5, -15)"
            opacity="0.85"
            className="fill-gray-700"
          >
            E
          </text>
          
          {/* S on right face - skewed to match right perspective */}
          <text
            x="68"
            y="60"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="22"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            transform="matrix(0.85, -0.5, 0, 1, 10, 35)"
            opacity="0.9"
            className="fill-gray-700"
          >
            S
          </text>
        </g>
      </svg>
    </div>
  );
}
