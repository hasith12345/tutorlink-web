interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullPage?: boolean
}

export function LoadingSpinner({ size = 'md', fullPage = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const spinner = (
    <div
      className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`}
      aria-label="Loading"
    />
  )

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
