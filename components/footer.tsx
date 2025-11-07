import Link from 'next/link'

const links = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Services',
    href: '/#services',
  },
  {
    title: 'Pricing',
    href: '/#pricing',
  },
  {
    title: 'About Us',
    href: '/#about',
  },
]

export default function FooterSection() {
  return (
    <footer className="border-t bg-white py-12 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap justify-between gap-6">
          {/* Copyright */}
          <span className="text-muted-foreground order-last block text-center text-sm md:order-first">
            © {new Date().getFullYear()} MediAssist AI — All rights reserved
          </span>

          {/* Navigation Links */}
          <div className="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-muted-foreground hover:text-primary block duration-150"
              >
                <span>{link.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Optional tagline */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          Empowering healthcare with self-learning AI — bridging conversations between doctors and patients.
        </div>
      </div>
    </footer>
  )
}
