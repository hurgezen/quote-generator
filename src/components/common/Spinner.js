export default function Spinner({ size = 'md' }) {
    const sizes = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    }
  
    return (
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-gray-300 border-t-sky-900`} />
    )
  }