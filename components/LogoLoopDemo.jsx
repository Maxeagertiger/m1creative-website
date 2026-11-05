import React from 'react';
import LogoLoop from './LogoLoop';
import './LogoLoop.css';

/**
 * M1Creative Brand Partner & Technology Stack Configuration
 * Features verified South African payment gateways (Yoco, PayFast)
 * and core modern engineering technologies.
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
    hoverColor: '#00c3f8'
  },
  {
    src: '/images/payfast-logo.svg',
    alt: 'PayFast',
    title: 'PayFast • Final 50% & Monthly Retainer',
    href: 'https://payfast.io',
    hoverColor: '#e02424'
  },
  {
    title: 'HostAfrica Cloud Hosting',
    href: 'https://www.hostafrica.co.za',
    hoverColor: '#ff8c00',
    node: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, letterSpacing: '1px' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    hoverColor: '#ffffff',
    node: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
        <span style={{ color: '#0ae448', fontSize: '1.2rem', lineHeight: 1 }}>⚡</span>
        <span>GSAP</span>
      </div>
    )
  },
  {
    title: 'Lenis Smooth Momentum Scroll',
    href: 'https://lenis.darkroom.engineering',
    hoverColor: '#a6ff00',
    node: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
        <span style={{ color: '#a6ff00', fontWeight: 900 }}>~</span>
        <span>Lenis</span>
      </div>
    )
  }
];

export default function LogoLoopDemo() {
  return (
    <div style={{ width: '100%', padding: '40px 0', background: 'transparent' }}>
      <LogoLoop
        logos={m1creativeLogos}
        speed={60}
        direction="left"
        logoHeight={32}
        gap={48}
        hoverSpeed={0}
        scaleOnHover={true}
        draggable={true}
        fadeOut={true}
        fadeOutWidth={0.15}
        labels="hover"
        className="brand-theme"
        ariaLabel="Technologies and verified South African payment partners"
      />
    </div>
  );
}
