'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

function NavIcon({ name, color }: { name: string; color: string }) {
  const s = { width:18, height:18, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth:'1.75', strokeLinecap:'round' as const, strokeLinejoin:'round' as const }
  if (name === 'grid')     return <svg {...s}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  if (name === 'users')    return <svg {...s}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
  if (name === 'file')     return <svg {...s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  if (name === 'chip')     return <svg {...s}><rect x="7" y="7" width="10" height="10" rx="1"/><path d="M7 9H4M7 12H4M7 15H4M17 9h3M17 12h3M17 15h3M9 7V4M12 7V4M15 7V4M9 17v3M12 17v3M15 17v3"/></svg>
  if (name === 'star')     return <svg {...s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  if (name === 'link')     return <svg {...s}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
  if (name === 'bar')      return <svg {...s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
  if (name === 'settings') return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
  return null
}

const NAV = [
  { label: 'Dashboard',         href: '/clinic',              icon: 'grid'     },
  { label: 'Patients',          href: '/clinic/patients',     icon: 'users'    },
  { label: 'Records',           href: '/clinic/records',      icon: 'file'     },
  { label: 'Chip Registration', href: '/clinic/register',     icon: 'chip'     },
  { label: 'AI Summaries',      href: '/clinic/summaries',    icon: 'star'     },
  { label: 'PIMS Integrations', href: '/clinic/integrations', icon: 'link',    badge: 'New' },
  { label: 'Reports',           href: '/clinic/reports',      icon: 'bar'      },
  { label: 'Settings',          href: '/clinic/settings',     icon: 'settings' },
]

export function ClinicSidebar({ user, orgName }: { user: any; orgName: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [hovered, setHovered] = useState<string | null>(null)
  const initials = (user?.full_name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase()

  return (
    <aside style={{ width:240, flexShrink:0, background:'#FFFFFF', borderRight:'1px solid #EBEBEB', display:'flex', flexDirection:'column', minHeight:'100vh', position:'sticky', top:0 }}>
      <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid #EBEBEB' }}>
        <Link href="/clinic" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
          <span style={{ fontSize:20 }}>🐝</span>
          <span style={{ fontSize:15, fontWeight:700, color:'#E8820C', letterSpacing:'-0.01em' }}>honeybee</span>
        </Link>
      </div>
      <nav style={{ flex:1, padding:'4px 10px' }}>
        {NAV.map(({ label, href, icon, badge }) => {
          const active = href === '/clinic' ? pathname === '/clinic' : pathname.startsWith(href)
          const isHovered = hovered === label
          return (
            <div key={label}
              onMouseEnter={() => setHovered(label)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => router.push(href)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, marginBottom:2, color: active ? '#E8820C' : isHovered ? '#0A0A0A' : '#6B7280', fontSize:14, fontWeight: active ? 500 : 400, cursor:'pointer', background: active ? '#FEF3E2' : isHovered ? '#F4F4F5' : 'transparent', transition:'background 0.15s ease-out, color 0.15s ease-out' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <NavIcon name={icon} color={active ? '#E8820C' : isHovered ? '#0A0A0A' : '#9CA3AF'} />
                <span>{label}</span>
              </div>
              {badge && <span style={{ fontSize:10, fontWeight:600, color:'#E8820C', background:'#FEF3E2', borderRadius:999, padding:'2px 6px' }}>{badge}</span>}
            </div>
          )
        })}
      </nav>
      <div style={{ padding:'12px 10px', borderTop:'1px solid #EBEBEB' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'#FEF3E2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#E8820C', flexShrink:0 }}>{initials}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.full_name || 'Clinic Staff'}</div>
            {orgName && <div style={{ fontSize:11, color:'#9CA3AF' }}>{orgName}</div>}
          </div>
        </div>
      </div>
    </aside>
  )
}
