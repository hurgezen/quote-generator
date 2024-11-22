'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MainLayout({ children }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar - 20% width with dark background */}
      <div className="w-1/5 min-w-[200px] max-w-[300px] bg-gray-800 fixed h-full flex flex-col">
        {/* Logo Container */}
        <div className="w-full p-4 border-b border-gray-700">
          {/* Placeholder for logo - replace src with your logo */}
          <div className="aspect-video bg-gray-700 rounded-lg mb-2 flex items-center justify-center">
            <span className="text-blue-400 font-bold text-xl">QuoteGen</span>
          </div>
        </div>

        {/* Navigation Container - Fills space between logo and settings */}
        <div className="flex-1 flex flex-col p-2 gap-2">
          <NavButton href="/customers" active={pathname === '/customers'}>
            Customers
          </NavButton>
          <NavButton href="/quotes" active={pathname === '/quotes'}>
            Quotes
          </NavButton>
          <NavButton href="/quote-history" active={pathname === '/quote-history'}>
            Quote History
          </NavButton>
          <NavButton href="/parts-list" active={pathname === '/parts-list'}>
            Parts List
          </NavButton>
          <NavButton href="/company-info" active={pathname === '/company-info'}>
            Company Info
          </NavButton>
          <NavButton href="/users" active={pathname === '/users'}>
            Users
          </NavButton>
        </div>

        {/* Settings - Fixed at bottom */}
        <div className="p-2">
          <NavButton href="/settings" active={pathname === '/settings'}>
            Settings
          </NavButton>
        </div>
      </div>

      {/* Main Content - Takes remaining width */}
      <div className="flex-1 ml-[20%] min-w-0 p-8">
        {children}
      </div>
    </div>
  )
}

// NavButton Component for consistent styling
function NavButton({ children, href, active }) {
  return (
    <Link 
      href={href}
      className={`
        w-full px-4 py-2 
        text-center
        transition-colors
        rounded
        ${active 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }
        cursor-pointer
        no-underline
      `}
    >
      {children}
    </Link>
  )
}