'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="fade-up" style={{ textAlign: 'center', marginBottom: 56 }}>
        <Image src="/logo.svg" alt="Honeybee" width={64} height={64} style={{ borderRadius: 16, marginBottom: 16 }} />
        <h1 style={{ fontSize: 34, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Honeybee</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 17 }}>Smart microchip platform for pets, owners &amp; veterinarians</p>
      </div>

      <div className="fade-up delay-1" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { href: '/scan', emoji: '📡', title: 'NFC Scan', sub: 'Simulate scanning a lost pet chip', dark: false },
          { href: '/owner', emoji: '🐾', title: 'Pet Owner Portal', sub: 'View records, chip status & wallet pass', dark: false },
          { href: '/clinic', emoji: '🏥', title: 'Clinic Dashboard', sub: 'Manage patients, chips & records', dark: true },
        ].map(({ href, emoji, title, sub, dark }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              width: 220, padding: '28px 24px', textAlign: 'center', cursor: 'pointer',
              background: dark ? 'var(--text-primary)' : 'var(--surface)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{emoji}</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: dark ? 'white' : 'var(--text-primary)' }}>{title}</div>
              <div style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)', lineHeight: 1.4 }}>{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      <p className="fade-up delay-2" style={{ marginTop: 48, fontSize: 13, color: 'var(--text-tertiary)' }}>
        Demo environment · seehoneybee.com
      </p>
    </main>
  )
}
