import React from 'react';
import LogoLoop from './LogoLoop';
import './LogoLoop.css';

/**
 * M1Creative Brand Partner & Technology Stack Configuration
 * Clean monochrome white aesthetic matching the contact & booking form.
 */
export const m1creativeLogos = [
  {
    src: '/images/shopify.svg',
    alt: 'Shopify',
    title: 'Shopify E-Commerce',
    href: 'https://www.shopify.com',
    hoverColor: '#a6ff00'
  },
  {
    src: '/images/wordpress.svg',
    alt: 'WordPress',
    title: 'Custom WordPress Builds',
    href: 'https://wordpress.org',
    hoverColor: '#a6ff00'
  },
  {
    src: '/images/yoco-logo.svg',
    alt: 'Yoco',
    title: 'Yoco • 50% Upfront Deposit',
    href: 'https://www.yoco.com/za/',
    hoverColor: '#a6ff00'
  },
  {
    src: '/images/payfast-logo.svg',
    alt: 'PayFast',
    title: 'PayFast • Final 50% & Monthly Retainer',
    href: 'https://payfast.io',
    hoverColor: '#a6ff00'
  },
  {
    title: 'HostAfrica Cloud Hosting',
    href: 'https://www.hostafrica.co.za',
    hoverColor: '#a6ff00',
    node: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, letterSpacing: '0.8px', color: '#ffffff' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    hoverColor: '#a6ff00',
    node: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#ffffff' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M12 1.5L2 20.5h20L12 1.5zm0 4.2l6.5 12.3H5.5L12 5.7z"/>
        </svg>
        <span>Three.js</span>
      </div>
    )
  },
  {
    title: 'GSAP Motion Engine',
    href: 'https://gsap.com',
    hoverColor: '#a6ff00',
    node: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#ffffff' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        <span>GSAP</span>
      </div>
    )
  },
  {
    title: 'Lenis Smooth Momentum Scroll',
    href: 'https://lenis.darkroom.engineering',
    hoverColor: '#a6ff00',
    node: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#ffffff' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
      <LogoLoop
        logos={m1creativeLogos}
        speed={45}
        direction="left"
        logoHeight={22}
        gap={30}
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
