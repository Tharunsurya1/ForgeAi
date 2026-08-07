import * as React from "react"
import Link from "next/link"
import { Share2, MessageSquare } from "lucide-react"

export function Footer() {
  const navigation = {
    resources: [
      { name: 'Product', href: '#' },
      { name: 'Documentation', href: '#' },
      { name: 'API Reference', href: '#' },
    ],
    company: [
      { name: 'Status', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
    ],
    social: [
      { name: 'Share', href: '#', icon: Share2 },
      { name: 'Discord', href: '#', icon: MessageSquare },
    ],
  }

  return (
    <footer className="bg-transparent border-t border-white/5 pt-16 pb-8" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="md:grid md:grid-cols-4 md:gap-8">
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="sr-only">ForgeAI</span>
              <div className="h-5 w-5 relative text-indigo-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">ForgeAI</span>
            </Link>
            <p className="text-xs leading-5 text-gray-400 max-w-xs">
              Building the foundational layer for the next generation of artificial intelligence applications.
            </p>
          </div>
          
          <div className="mt-10 md:mt-0 col-span-1">
            <h3 className="text-xs font-semibold leading-6 text-white">Resources</h3>
            <ul role="list" className="mt-4 space-y-3">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-xs leading-6 text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-10 md:mt-0 col-span-1">
            <h3 className="text-xs font-semibold leading-6 text-white">Company</h3>
            <ul role="list" className="mt-4 space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-xs leading-6 text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-16 flex items-center justify-between border-t border-white/5 pt-8">
          <p className="text-xs leading-5 text-gray-400">&copy; {new Date().getFullYear()} ForgeAI Inc. All rights reserved.</p>
          <div className="flex space-x-4">
            {navigation.social.map((item) => {
              const Icon = item.icon
              return (
                <a key={item.name} href={item.href} className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">{item.name}</span>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
