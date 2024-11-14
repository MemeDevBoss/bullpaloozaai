import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'default', 
  ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors"
  const variantStyles = {
    default: "bg-green-500 text-white hover:bg-green-600",
    outline: "bg-transparent text-white border border-white hover:bg-white hover:text-green-900"
  }

  return (
    <button 
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}