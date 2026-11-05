import React from 'react';
import LogoLoop from './LogoLoop';
import './LogoLoop.css';

/**
 * M1Creative Brand Partner & Technology Stack Configuration
 * Clean white aesthetic matching the calendar booking card,
 * with 100% authentic brand logos (Shopify, WordPress, Yoco, PayFast, etc.)
 */
export const m1creativeLogos = [
  {
    src: '/images/shopify.svg',
    alt: 'Shopify',
    title: 'Shopify E-Commerce',
    href: 'https://www.shopify.com',
    hoverColor: '#95BF47'
  },
  {
    src: '/images/wordpress.svg',
    alt: 'WordPress',
    title: 'Custom WordPress Builds',
    href: 'https://wordpress.org',
    hoverColor: '#21759B'
  },
  {
    src: '/images/yoco-logo.svg',
    alt: 'Yoco',
    title: 'Yoco • 50% Upfront Deposit',
    href: 'https://www.yoco.com/za/',
    hoverColor: '#005BFF'
  },
  {
    src: '/images/payfast-logo.svg',
    alt: 'PayFast',
    title: 'PayFast • Final 50% & Monthly Retainer',
    href: 'https://payfast.io',
    hoverColor: '#E54360'
  },
  {
    title: 'HostAfrica Cloud Hosting',
    href: 'https://www.hostafrica.co.za',
    hoverColor: '#FF8C00',
    node: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, letterSpacing: '0.8px', color: '#111827' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
        <span>HOSTAFRICA</span>
      </div>
    )
  },
  {
    title: 'Three.js 3D Web Graphics',
    href: 'https://threejs.org',
    hoverColor: '#111827',
    node: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#111827' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#111827">
          <path d="M12 1.5L2 20.5h20L12 1.5zm0 4.2l6.5 12.3H5.5L12 5.7z"/>
        </svg>
        <span>Three.js</span>
      </div>
    )
  },
  {
    title: 'GSAP Motion Engine',
    href: 'https://gsap.com',
    hoverColor: '#0ae448',
    node: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#111827' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#0ae448" stroke="#0ae448" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        <span>GSAP</span>
      </div>
    )
  },
  {
    title: 'Lenis Smooth Momentum Scroll',
    href: 'https://lenis.darkroom.engineering',
    hoverColor: '#111827',
    node: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#111827' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12c4-8 8-8 12 0s8 8 12 0"></path>
        </svg>
        <span>Lenis</span>
      </div>
    )
  }
];

export default function LogoLoopDemo() {
  return (
    <div style={{ width: '100%', padding: '40px 0', background: 'transparent' }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '24px',
        padding: '36px 24px',
        boxShadow: '0 16px 50px rgba(0, 0, 0, 0.06)'
      }}>
        <LogoLoop
          logos={m1creativeLogos}
          speed={45}
          direction="left"
          logoHeight={24}
          gap={28}
          hoverSpeed={0}
          scaleOnHover={true}
          draggable={true}
          fadeOut={true}
          fadeOutWidth={0.12}
          labels="hover"
          className="light-card-theme"
          ariaLabel="Technologies and verified South African payment partners"
        />
      </div>
    </div>
  );
}
