const fs = require("fs")

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <!-- Background gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0A1628;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#0D3B6E;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0891B2;stop-opacity:1" />
    </linearGradient>

    <!-- P letter gradient -->
    <linearGradient id="pGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#67E8F9;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#38BDF8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0EA5E9;stop-opacity:1" />
    </linearGradient>

    <!-- P glossy overlay -->
    <linearGradient id="pGloss" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.45" />
      <stop offset="50%" style="stop-color:#FFFFFF;stop-opacity:0.05" />
      <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:0" />
    </linearGradient>

    <!-- Wrench metallic gradient -->
    <linearGradient id="wrenchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F1F5F9;stop-opacity:1" />
      <stop offset="30%" style="stop-color:#CBD5E1;stop-opacity:1" />
      <stop offset="60%" style="stop-color:#94A3B8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#64748B;stop-opacity:1" />
    </linearGradient>

    <!-- Wrench shine -->
    <linearGradient id="wrenchShine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.8" />
      <stop offset="40%" style="stop-color:#FFFFFF;stop-opacity:0.2" />
      <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:0" />
    </linearGradient>

    <!-- Background gloss -->
    <linearGradient id="bgGloss" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.08" />
      <stop offset="50%" style="stop-color:#FFFFFF;stop-opacity:0" />
    </linearGradient>

    <!-- Drop shadow filter -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="20" flood-color="#000000" flood-opacity="0.5"/>
    </filter>

    <!-- Glow filter for P -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Inner shadow for depth -->
    <filter id="innerShadow">
      <feOffset dx="2" dy="4"/>
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <!-- Rounded rect clip -->
    <clipPath id="roundedClip">
      <rect width="1024" height="1024" rx="220" ry="220"/>
    </clipPath>
  </defs>

  <!-- Rounded background -->
  <g clip-path="url(#roundedClip)">

    <!-- Base background -->
    <rect width="1024" height="1024" fill="url(#bgGrad)"/>

    <!-- Background gloss overlay -->
    <rect width="1024" height="1024" fill="url(#bgGloss)"/>

    <!-- Subtle background circle glow -->
    <circle cx="512" cy="400" r="380" fill="#0EA5E9" opacity="0.08"/>
    <circle cx="512" cy="400" r="250" fill="#38BDF8" opacity="0.06"/>

    <!-- ── LETTER P ── -->
    <!-- P shadow layer -->
    <g filter="url(#shadow)" opacity="0.6">
      <path d="M 280 220
               L 280 800
               L 370 800
               L 370 580
               L 520 580
               C 680 580 780 500 780 400
               C 780 300 680 220 520 220
               Z
               M 370 300
               L 510 300
               C 620 300 685 340 685 400
               C 685 460 620 500 510 500
               L 370 500
               Z"
            fill="#0A1628" opacity="0.8"/>
    </g>

    <!-- P main body -->
    <path d="M 275 215
             L 275 795
             L 365 795
             L 365 575
             L 515 575
             C 675 575 775 495 775 395
             C 775 295 675 215 515 215
             Z
             M 365 295
             L 505 295
             C 615 295 680 335 680 395
             C 680 455 615 495 505 495
             L 365 495
             Z"
          fill="url(#pGrad)"
          filter="url(#glow)"/>

    <!-- P glossy overlay -->
    <path d="M 275 215
             L 275 505
             L 365 505
             L 365 295
             L 505 295
             C 615 295 680 335 680 395
             C 680 430 660 460 625 478
             L 775 395
             C 775 295 675 215 515 215
             Z"
          fill="url(#pGloss)"/>

    <!-- P inner highlight edge -->
    <path d="M 285 225
             L 285 785"
          stroke="#FFFFFF" stroke-width="3" opacity="0.15" fill="none"
          stroke-linecap="round"/>

    <!-- ── WRENCH ── -->
    <!-- Wrench positioned overlapping bottom-right of P -->

    <!-- Wrench handle -->
    <g transform="rotate(-40, 620, 650)" filter="url(#shadow)">

      <!-- Handle body -->
      <rect x="560" y="580" width="80" height="280" rx="40" ry="40"
            fill="url(#wrenchGrad)"/>

      <!-- Handle shine -->
      <rect x="565" y="585" width="30" height="270" rx="15" ry="15"
            fill="url(#wrenchShine)" opacity="0.6"/>

      <!-- Top jaw (open end) -->
      <path d="M 540 575
               C 540 530 570 500 600 500
               C 630 500 660 530 660 575
               L 645 590
               C 645 555 625 535 600 535
               C 575 535 555 555 555 590
               Z"
            fill="url(#wrenchGrad)"/>

      <!-- Top jaw opening -->
      <path d="M 555 590
               L 555 615
               L 645 615
               L 645 590"
            fill="#0D3B6E" opacity="0.9"/>

      <!-- Top jaw shine -->
      <path d="M 542 540
               C 545 520 560 508 575 505"
            stroke="#FFFFFF" stroke-width="4" fill="none"
            stroke-linecap="round" opacity="0.7"/>

      <!-- Bottom knob -->
      <circle cx="600" cy="845" r="38" fill="url(#wrenchGrad)"/>
      <circle cx="590" cy="835" r="12" fill="#FFFFFF" opacity="0.3"/>

    </g>

    <!-- Wrench metallic edge highlight -->
    <g transform="rotate(-40, 620, 650)" opacity="0.4">
      <rect x="638" y="582" width="3" height="276" rx="2"
            fill="#FFFFFF"/>
    </g>

    <!-- ── DECORATIVE ELEMENTS ── -->

    <!-- Small dots pattern top right -->
    <circle cx="820" cy="180" r="6" fill="#38BDF8" opacity="0.4"/>
    <circle cx="855" cy="160" r="4" fill="#38BDF8" opacity="0.25"/>
    <circle cx="845" cy="210" r="3" fill="#38BDF8" opacity="0.2"/>

    <!-- Small dots bottom left -->
    <circle cx="180" cy="820" r="6" fill="#38BDF8" opacity="0.4"/>
    <circle cx="155" cy="850" r="4" fill="#38BDF8" opacity="0.25"/>
    <circle cx="200" cy="855" r="3" fill="#38BDF8" opacity="0.2"/>

    <!-- Subtle horizontal line accent -->
    <line x1="100" y1="950" x2="924" y2="950"
          stroke="#38BDF8" stroke-width="1.5" opacity="0.15"/>

  </g>

  <!-- Rounded border shine -->
  <rect width="1024" height="1024" rx="220" ry="220"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="3"
        opacity="0.1"/>

</svg>`

fs.writeFileSync("profix-icon.svg", svg, "utf8")
console.log("Icon saved as profix-icon.svg")
console.log("Convert to PNG at: https://svgtopng.com or https://cloudconvert.com/svg-to-png")
console.log("Set output size to 1024x1024")
