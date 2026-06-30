'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import styles from '@/styles/components/BrowseHeader.module.css';
import { MobileNav } from './MobileNav';
import { Ao4TurboToggle } from './Ao4TurboToggle';

const NAV_LINKS = [
  { href: '/', label: 'Stories' },
  { href: '/reading', label: 'Library' },
  { href: '/characters', label: 'Characters' },
];

interface Props {
  /** Search slot, rendered in the right zone. The browse home passes
      BrowseSearchBar here; results pages keep search in their toolbar. */
  search?: ReactNode;
}

export function BrowseHeader({ search }: Props = {}) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          {/* ── Left zone: logo ── */}
          <div className={styles.zoneLeft}>
            <a href="/" className={styles.wordmark} aria-label="fanfic — home">
            <svg
              width="104"
              height="17"
              viewBox="0 0 130 21"
              fill="none"
              className={styles.logoSvg}
              aria-hidden="true"
            >
              <path d="M11.5673 15.1534C9.68229 15.1534 8.55276 13.8702 8.55276 11.6894C8.55276 9.5085 9.66307 8.18502 11.5673 8.18502C13.0117 8.18502 13.8707 8.79641 14.1013 10.1415H16.3634C16.1534 7.88005 14.2699 6.35229 11.5688 6.35229C8.365 6.35229 6.18726 8.51158 6.18726 11.6908C6.18726 14.87 8.30291 16.9876 11.5688 16.9876C14.3749 16.9876 16.1963 15.4598 16.4683 13.1984H14.2063C13.8929 14.6039 13.0753 15.1549 11.5673 15.1549V15.1534Z" fill="currentColor"/>
              <path d="M3.09586 0.960571C1.28624 3.14431 0.0162628 6.63427 0 10.0336C0.0162628 13.4344 1.28624 16.9229 3.09586 19.1066L5.19672 19.098C3.33684 16.7272 2.42169 13.4372 2.40542 10.0336C2.42169 6.62995 3.33684 3.33995 5.19672 0.969203L3.09586 0.960571Z" fill="currentColor"/>
              <path d="M42.3367 0.960571C44.1478 3.14431 45.4178 6.63427 45.4326 10.0336C45.4163 13.4344 44.1463 16.9229 42.3367 19.1066L40.2358 19.098C42.0957 16.7272 43.0109 13.4372 43.0271 10.0336C43.0109 6.62995 42.0957 3.33995 40.2358 0.969203L42.3367 0.960571Z" fill="currentColor"/>
              <path d="M20.1882 13.7882C19.2464 13.7882 18.5752 14.46 18.5752 15.4181C18.5752 16.3762 19.2449 16.9876 20.1882 16.9876C21.1314 16.9876 21.779 16.3359 21.779 15.4181C21.779 14.5003 21.1299 13.7882 20.1882 13.7882Z" fill="currentColor"/>
              <path d="M36.5309 2.07263C35.6719 2.07263 35.0864 2.64374 35.0864 3.47811C35.0864 4.31248 35.6734 4.88358 36.5309 4.88358C37.3884 4.88358 37.9753 4.31248 37.9753 3.47811C37.9753 2.64374 37.3884 2.07263 36.5309 2.07263Z" fill="currentColor"/>
              <path d="M37.6825 6.47461H35.3584V16.8654H37.6825V6.47461Z" fill="currentColor"/>
              <path d="M28.9389 6.35229C26.2792 6.35229 24.6041 7.63549 24.4164 9.85663H26.6784C26.8041 8.79785 27.6202 8.18646 28.8768 8.18646C30.1335 8.18646 30.8668 8.75757 30.8668 9.79621C30.8668 10.3256 30.6998 10.468 29.9664 10.5903C28.2278 10.855 26.909 11.0176 26.0722 11.2837C24.7106 11.7109 23.9788 12.6489 23.9788 13.9939C23.9788 15.8483 25.2975 16.989 27.4753 16.989C28.9197 16.989 30.1557 16.3776 30.889 15.2771H30.9733V16.8668H33.1924V10.3673C33.1924 7.77935 31.6637 6.35373 28.9419 6.35373L28.9389 6.35229ZM30.8653 12.3425C30.8653 13.9522 29.6087 15.175 27.9129 15.175C26.8869 15.175 26.3221 14.7262 26.3221 13.9119C26.3221 13.2401 26.6577 12.8316 27.3481 12.6086C28.0386 12.3842 30.0492 12.2821 30.8653 12.0375V12.3425Z" fill="currentColor"/>
              <path d="M120.197 16.7297C116.982 16.7297 114.915 14.6395 114.915 11.4428C114.915 8.26652 117.044 6.11487 120.197 6.11487C122.786 6.11487 124.623 7.59029 124.873 9.72144H122.973C122.702 8.34849 121.721 7.67225 120.197 7.67225C118.13 7.67225 116.877 9.12718 116.877 11.4428C116.877 13.7788 118.151 15.1723 120.197 15.1723C121.783 15.1723 122.723 14.5575 123.078 13.1231H124.978C124.665 15.2748 122.869 16.7297 120.197 16.7297Z" fill="currentColor"/>
              <path d="M93.2819 5.2952C93.2819 3.08207 94.4928 1.87305 96.7684 1.87305H99.7956V3.38945H97.1025C95.8707 3.38945 95.2235 4.04519 95.2235 5.25421V6.21733H99.7956V7.73373H95.2235V15.1108H99.7956V16.6272H89.9624V15.1108H93.2819V7.73373H89.9624V6.21733H93.2819V5.2952ZM102.531 16.6272V15.1108H106.623V7.73373H102.531V6.21733H108.585V15.1108H112.322V16.6272H102.531ZM107.416 4.39355C106.664 4.39355 106.163 3.86076 106.163 3.14355C106.163 2.42633 106.685 1.91403 107.416 1.91403C108.167 1.91403 108.669 2.42633 108.669 3.14355C108.669 3.88125 108.167 4.39355 107.416 4.39355Z" fill="currentColor"/>
              <path d="M77.7991 16.6272V6.21733H79.6572V7.93865H79.7407C80.4922 6.77061 81.7449 6.11487 83.2898 6.11487C85.7951 6.11487 87.173 7.71324 87.173 10.7255V16.6272H85.2314V10.7255C85.2314 8.67636 84.3546 7.73373 82.5382 7.73373C80.6801 7.73373 79.7407 8.75833 79.7407 10.7255V16.6272H77.7991Z" fill="currentColor"/>
              <path d="M68.7464 16.7297C66.4082 16.7297 65.072 15.6436 65.072 13.7584C65.072 12.3854 65.8027 11.4633 67.2433 11.0534C68.0575 10.828 69.2057 10.7051 71.3979 10.3977C72.233 10.2747 72.4626 10.0698 72.4626 9.55751C72.4626 8.32799 71.5858 7.67225 70.0617 7.67225C68.5585 7.67225 67.5982 8.34849 67.4103 9.49603H65.5104C65.7401 7.34438 67.452 6.11487 70.1035 6.11487C72.8801 6.11487 74.4042 7.52881 74.4042 10.0288V16.6272H72.5461V14.8649H72.4835C71.7528 16.0534 70.3749 16.7297 68.7464 16.7297ZM69.1013 15.1928C71.0429 15.1928 72.4626 13.9223 72.4626 12.16V11.5452C71.5858 11.8936 69.164 11.9346 68.2871 12.1805C67.4312 12.4264 67.0345 12.9182 67.0345 13.6969C67.0345 14.6805 67.7443 15.1928 69.1013 15.1928Z" fill="currentColor"/>
              <path d="M55.727 5.2952C55.727 3.08207 56.9379 1.87305 59.2135 1.87305H62.2407V3.38945H59.5475C58.3158 3.38945 57.6686 4.04519 57.6686 5.25421V6.21733H62.2407V7.73373H57.6686V15.1108H62.2407V16.6272H52.4075V15.1108H55.727V7.73373H52.4075V6.21733H55.727V5.2952Z" fill="currentColor"/>
            </svg>
          </a>
        </div>

        {/* ── Center zone: nav links ── */}
        <nav className={styles.zoneCenter} aria-label="Main">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className={`${styles.navLink} ${pathname === href ? styles.navActive : ''}`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* ── Right zone: search slot + avatar (desktop) + hamburger (mobile) ── */}
        <div className={styles.zoneRight}>
          {search && <div className={styles.zoneSearch}>{search}</div>}
          <div className={styles.avatar} aria-hidden="true">
            P
          </div>
          <button
            className={styles.hamburgerBtn}
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={navOpen}
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
              <line x1="0" y1="1"  x2="20" y2="1"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="0" y1="7"  x2="14" y2="7"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="0" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        </div>
      </header>
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} pathname={pathname} navLinks={NAV_LINKS} />

      {/* Global mode switch: draggable AO4 turbo toggle, bottom-right */}
      <Ao4TurboToggle />
    </>
  );
}
