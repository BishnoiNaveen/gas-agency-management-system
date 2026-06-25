window.GAMS_UTILS = (() => {
  const { TRACKING_STEPS, TRACKING_ORDER } = window.GAMS_CONFIG;

  function today() {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  }

  function typeLabel(t) { return `${t} KG`; }
  function typeClass(t) { return t === 5 ? 'type-5' : t === 14 ? 'type-14' : 'type-19'; }

  function getTrackingStatus(b) {
    if (b.status === 2) return 'cancelled';
    if (b.status === 1) return 'delivered';
    return b.trackingStatus || 'confirmed';
  }

  function amountInWords(num) {
    const n = Math.round(num);
    if (n === 0) return 'Zero Rupees Only';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const two = x => x < 20 ? ones[x] : tens[Math.floor(x / 10)] + (x % 10 ? ` ${ones[x % 10]}` : '');
    const three = x => {
      if (x < 100) return two(x);
      return `${ones[Math.floor(x / 100)]} Hundred${x % 100 ? ` ${two(x % 100)}` : ''}`;
    };
    let str = '';
    let rem = n;
    if (rem >= 10000000) { str += `${three(Math.floor(rem / 10000000))} Crore `; rem %= 10000000; }
    if (rem >= 100000) { str += `${three(Math.floor(rem / 100000))} Lakh `; rem %= 100000; }
    if (rem >= 1000) { str += `${three(Math.floor(rem / 1000))} Thousand `; rem %= 1000; }
    if (rem > 0) str += three(rem);
    return `${str.trim()} Rupees Only`;
  }

  function calcGstBreakdown(totalAmount, gstRate = 0.05) {
    const total = Math.round(totalAmount * 100) / 100;
    const subtotal = Math.round((total / (1 + gstRate)) * 100) / 100;
    const gst = Math.round((total - subtotal) * 100) / 100;
    const cgst = Math.round((gst / 2) * 100) / 100;
    const sgst = Math.round((gst - cgst) * 100) / 100;
    return { total, subtotal, gst, cgst, sgst };
  }

  function genTxnId() {
    return `BGS${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  function agencyLogoSvg(size = 72) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
      <defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#E85D04"/><stop offset="100%" style="stop-color:#C44D03"/>
      </linearGradient></defs>
      <rect width="100" height="100" rx="18" fill="url(#lg)"/>
      <path d="M50 18 L62 42 L88 46 L68 64 L74 90 L50 76 L26 90 L32 64 L12 46 L38 42 Z" fill="white" opacity="0.95"/>
      <ellipse cx="50" cy="58" rx="14" ry="18" fill="#0B1D3A" opacity="0.85"/>
      <rect x="44" y="28" width="12" height="22" rx="4" fill="white"/>
    </svg>`;
  }

  function authorizedStampSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r="65" fill="none" stroke="#B91C1C" stroke-width="3" stroke-dasharray="4 2"/>
      <circle cx="70" cy="70" r="55" fill="none" stroke="#B91C1C" stroke-width="2"/>
      <text x="70" y="38" text-anchor="middle" fill="#B91C1C" font-size="9" font-weight="700" font-family="Arial">BISHNOI GAS SERVICES</text>
      <text x="70" y="52" text-anchor="middle" fill="#B91C1C" font-size="8" font-weight="600" font-family="Arial">LPG AUTHORISED DEALER</text>
      <text x="70" y="78" text-anchor="middle" fill="#B91C1C" font-size="22" font-weight="800" font-family="Arial">&#10003;</text>
      <text x="70" y="98" text-anchor="middle" fill="#B91C1C" font-size="8" font-weight="700" font-family="Arial">AUTHORISED</text>
      <text x="70" y="110" text-anchor="middle" fill="#B91C1C" font-size="7" font-family="Arial">GOVT. APPROVED</text>
    </svg>`;
  }

  return {
    today, typeLabel, typeClass, getTrackingStatus, amountInWords,
    calcGstBreakdown, genTxnId, agencyLogoSvg, authorizedStampSvg,
    TRACKING_STEPS, TRACKING_ORDER,
  };
})();
