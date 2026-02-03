
'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean;
  strength?: 'weak' | 'medium' | 'strong';
}

export function PasswordInput({ 
  className, 
  showStrength = false, 
  strength = 'weak',
  ...props 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthWidth = () => {
    switch (strength) {
      case 'weak': return 'w-1/3';
      case 'medium': return 'w-2/3';
      case 'strong': return 'w-full';
      default: return 'w-0';
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          {...props}
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', className)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>
      
      {showStrength && (
        <div className="space-y-1">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={cn(
                'transition-all duration-300 ease-out',
                getStrengthColor(),
                getStrengthWidth()
              )}
            />
          </div>
          <p className={cn(
            'text-xs font-medium',
            strength === 'weak' && 'text-red-600',
            strength === 'medium' && 'text-yellow-600',
            strength === 'strong' && 'text-green-600'
          )}>
            Força da senha: {strength === 'weak' && 'Fraca'}
            {strength === 'medium' && 'Média'}
            {strength === 'strong' && 'Forte'}
          </p>
        </div>
      )}
    </div>
  );
}
