const fs = require('fs')
let c = fs.readFileSync('src/main.js', 'utf8')

// ── FIX 1: KYC banner on profile page ────────────────────────────────────────
c = c.replace(
  `(!isVerified?"<div style='background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.25);border-radius:16px;padding:18px;margin-bottom:14px;'><p style='color:#fbbf24;font-size:14px;font-weight:700;margin:0 0 6px;'>&#9888; KYC Verification Required</p><p style='color:#fde68a;font-size:13px;margin:0 0 14px;line-height:1.5;'>You must verify your identity before "+(profile.role==="owner"?"posting jobs":"accepting jobs")+". Upload a valid ID and a selfie.</p>"+(!kycSubmitted?"<button id='startKycBtn' style='width:100%;padding:12px;background:#d97706;color:#fff;font-size:14px;font-weight:700;border:none;border-radius:10px;cursor:pointer;min-height:44px;'>Start KYC Verification</button>":"<p style='color:#fbbf24;font-size:13px;text-align:center;margin:0;'>&#128336; Your documents are under review.</p>")+"</div>":"")`,
  `(!isVerified?"<div style='background:var(--bg-card);border:1.5px solid var(--border-active);border-radius:16px;overflow:hidden;margin-bottom:14px;'>" +
    "<div style='background:var(--primary);padding:14px 16px;display:flex;align-items:center;gap:10px;'>" +
      "<span style='font-size:20px;'>&#128274;</span>" +
      "<p style='color:#FFFFFF;font-size:14px;font-weight:700;margin:0;'>Identity Verification Required</p>" +
    "</div>" +
    "<div style='padding:16px;'>" +
      "<p style='color:var(--text-secondary);font-size:13px;margin:0 0 14px;line-height:1.6;'>Verify your identity to "+(profile.role==="owner"?"post jobs and hire professionals":"apply for jobs and get hired")+". It only takes 2 minutes.</p>" +
      (!kycSubmitted?
        "<button id='startKycBtn' style='width:100%;padding:13px;background:var(--primary);color:#FFFFFF;font-size:14px;font-weight:700;border:none;border-radius:10px;cursor:pointer;min-height:46px;'>Verify Identity Now</button>" :
        "<div style='display:flex;align-items:center;gap:10px;background:rgba(0,194,89,0.07);border:1px solid rgba(0,194,89,0.2);border-radius:10px;padding:12px;'>" +
          "<span style='font-size:18px;'>&#128336;</span>" +
          "<p style='color:var(--primary);font-size:13px;font-weight:600;margin:0;'>Documents submitted — under review</p>" +
        "</div>"
      ) +
    "</div>" +
  "</div>":"")`
)

// ── FIX 2: Full KYC page — professional OPay design ──────────────────────────
const OLD_KYC_PAGE = `app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);'>" + navBar("KYC Verification") + "<div style='flex:1;padding:16px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'><div style='background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);border-radius:14px;padding:16px;margin-bottom:20px;'><p style='color:#c7d2fe;font-size:14px;font-weight:600;margin:0 0 6px;'>&#128274; Why we need this</p><p style='color:#a5b4fc;font-size:13px;margin:0;line-height:1.5;'>KYC verification protects both owners and workers. Required before posting or accepting jobs.</p></div><div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:18px;margin-bottom:14px;'><p style='color:#e0e7ff;font-size:14px;font-weight:600;margin:0 0 10px;'>Step 1 - Government ID</p><p style='color:#a5b4fc;font-size:12px;margin:0 0 10px;'>National ID, Driver License, Voter Card or Passport</p><div id='idZone' style='border:2px dashed rgba(255,255,255,0.2);border-radius:12px;padding:24px;text-align:center;cursor:pointer;background:rgba(255,255,255,0.03);'><span style='font-size:28px;'>&#128196;</span><p style='color:#a5b4fc;font-size:14px;font-weight:500;margin:8px 0 0;'>Click to upload ID</p><input id='idInput' type='file' accept='image/*' style='display:none;' /></div><p id='idName' style='color:#34d399;font-size:12px;margin:8px 0 0;display:none;'></p></div><div style='background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:18px;margin-bottom:14px;'><p style='color:#e0e7ff;font-size:14px;font-weight:600;margin:0 0 10px;'>Step 2 - Selfie</p><div id='selfieZone' style='border:2px dashed rgba(255,255,255,0.2);border-radius:12px;padding:24px;text-align:center;cursor:pointer;background:rgba(255,255,255,0.03);'><span style='font-size:28px;'>&#129381;</span><p style='color:#a5b4fc;font-size:14px;font-weight:500;margin:8px 0 0;'>Click to upload selfie</p><input id='selfieInput' type='file' accept='image/*' capture='user' style='display:none;' /></div><p id='selfieName' style='color:#34d399;font-size:12px;margin:8px 0 0;display:none;'></p></div><p id='kycErr' style='color:#f87171;font-size:13px;margin:0 0 14px;display:none;background:rgba(239,68,68,0.1);padding:12px;border-radius:10px;'></p><div id='kycProgress' style='display:none;margin-bottom:14px;'><p style='color:#a5b4fc;font-size:13px;margin:0 0 7px;'>Uploading documents...</p><div style='background:rgba(255,255,255,0.1);border-radius:6px;height:5px;'><div id='kycBar' style='background:#4f46e5;height:5px;border-radius:6px;width:0%;transition:width 0.3s;'></div></div></div><button id='submitKycBtn' style='width:100%;padding:14px;background:#4f46e5;color:#fff;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;min-height:50px;'>Submit for Verification</button></div></div>"`

const NEW_KYC_PAGE = `app.innerHTML =
    "<div style='min-height:100vh;display:flex;flex-direction:column;background:var(--bg-page);'>" +
    navBar("Identity Verification") +
    "<div style='flex:1;padding:16px 16px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;'>" +

      // Progress indicator
      "<div style='display:flex;align-items:center;gap:0;margin-bottom:24px;'>" +
        "<div style='flex:1;height:4px;background:var(--primary);border-radius:4px;'></div>" +
        "<div style='flex:1;height:4px;background:var(--border);border-radius:4px;margin-left:4px;'></div>" +
      "</div>" +

      // Info banner
      "<div style='background:rgba(0,194,89,0.07);border:1px solid rgba(0,194,89,0.2);border-radius:14px;padding:14px 16px;margin-bottom:20px;display:flex;align-items:flex-start;gap:12px;'>" +
        "<span style='font-size:20px;flex-shrink:0;margin-top:1px;'>&#128274;</span>" +
        "<div>" +
          "<p style='color:var(--primary);font-size:13px;font-weight:700;margin:0 0 3px;'>Your data is secure</p>" +
          "<p style='color:var(--text-secondary);font-size:12px;margin:0;line-height:1.5;'>Documents are encrypted and only used for identity verification. Never shared with third parties.</p>" +
        "</div>" +
      "</div>" +

      // Step 1 - ID card
      "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:18px;margin-bottom:12px;'>" +
        "<div style='display:flex;align-items:center;gap:12px;margin-bottom:14px;'>" +
          "<div style='width:36px;height:36px;background:var(--primary);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;'>" +
            "<span style='color:#FFFFFF;font-size:16px;font-weight:700;'>1</span>" +
          "</div>" +
          "<div>" +
            "<p style='color:var(--text-primary);font-size:14px;font-weight:700;margin:0 0 2px;'>Government-issued ID</p>" +
            "<p style='color:var(--text-muted);font-size:12px;margin:0;'>NIN, Driver License, Voter Card or Int. Passport</p>" +
          "</div>" +
        "</div>" +
        "<div id='idZone' style='border:2px dashed var(--border-active);border-radius:12px;padding:28px 16px;text-align:center;cursor:pointer;background:var(--bg-card-subtle);transition:border-color 0.2s;'>" +
          "<div style='width:52px;height:52px;background:rgba(0,194,89,0.08);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;'>" +
            "<span style='font-size:24px;'>&#128196;</span>" +
          "</div>" +
          "<p style='color:var(--text-primary);font-size:14px;font-weight:600;margin:0 0 4px;'>Tap to upload ID photo</p>" +
          "<p style='color:var(--text-muted);font-size:12px;margin:0;'>JPG or PNG, max 5MB</p>" +
          "<input id='idInput' type='file' accept='image/*' style='display:none;' />" +
        "</div>" +
        "<p id='idName' style='color:var(--primary);font-size:12px;font-weight:600;margin:8px 0 0;display:none;'></p>" +
      "</div>" +

      // Step 2 - Selfie
      "<div style='background:var(--bg-card);border:1.5px solid var(--border);border-radius:16px;padding:18px;margin-bottom:20px;'>" +
        "<div style='display:flex;align-items:center;gap:12px;margin-bottom:14px;'>" +
          "<div style='width:36px;height:36px;background:var(--border);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;'>" +
            "<span style='color:var(--text-muted);font-size:16px;font-weight:700;'>2</span>" +
          "</div>" +
          "<div>" +
            "<p style='color:var(--text-primary);font-size:14px;font-weight:700;margin:0 0 2px;'>Selfie photo</p>" +
            "<p style='color:var(--text-muted);font-size:12px;margin:0;'>Clear photo of your face in good lighting</p>" +
          "</div>" +
        "</div>" +
        "<div id='selfieZone' style='border:2px dashed var(--border);border-radius:12px;padding:28px 16px;text-align:center;cursor:pointer;background:var(--bg-card-subtle);transition:border-color 0.2s;'>" +
          "<div style='width:52px;height:52px;background:var(--bg-card-subtle);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;border:2px solid var(--border);'>" +
            "<span style='font-size:24px;'>&#129381;</span>" +
          "</div>" +
          "<p style='color:var(--text-primary);font-size:14px;font-weight:600;margin:0 0 4px;'>Tap to take selfie</p>" +
          "<p style='color:var(--text-muted);font-size:12px;margin:0;'>Front camera recommended</p>" +
          "<input id='selfieInput' type='file' accept='image/*' capture='user' style='display:none;' />" +
        "</div>" +
        "<p id='selfieName' style='color:var(--primary);font-size:12px;font-weight:600;margin:8px 0 0;display:none;'></p>" +
      "</div>" +

      // Error
      "<p id='kycErr' style='color:var(--danger);font-size:13px;margin:0 0 14px;display:none;background:rgba(224,49,49,0.07);padding:12px 14px;border-radius:10px;border:1px solid rgba(224,49,49,0.15);'></p>" +

      // Progress bar
      "<div id='kycProgress' style='display:none;margin-bottom:16px;'>" +
        "<div style='display:flex;justify-content:space-between;margin-bottom:6px;'>" +
          "<p style='color:var(--text-secondary);font-size:13px;margin:0;'>Uploading securely...</p>" +
          "<p id='kycPct' style='color:var(--primary);font-size:13px;font-weight:600;margin:0;'>0%</p>" +
        "</div>" +
        "<div style='background:var(--border);border-radius:6px;height:6px;overflow:hidden;'>" +
          "<div id='kycBar' style='background:var(--primary);height:6px;border-radius:6px;width:0%;transition:width 0.4s ease;'></div>" +
        "</div>" +
      "</div>" +

      // Submit button
      "<button id='submitKycBtn' style='width:100%;padding:15px;background:var(--primary);color:#FFFFFF;font-size:15px;font-weight:700;border:none;border-radius:14px;cursor:pointer;min-height:52px;box-shadow:var(--shadow-green);'>Submit for Verification</button>" +

      // Terms note
      "<p style='color:var(--text-muted);font-size:11px;text-align:center;margin:12px 0 0;line-height:1.5;'>By submitting, you agree to our identity verification terms. Data is processed securely.</p>" +

    "</div></div>"`

c = c.replace(OLD_KYC_PAGE, NEW_KYC_PAGE)

// Fix kycBar progress percentage label
c = c.replace(
  `document.getElementById("kycProgress").style.display = "block"`,
  `document.getElementById("kycProgress").style.display = "block"
      const kycPct = document.getElementById("kycPct")`
)
c = c.replace(
  /kycBar\.style\.width = "50%"/g,
  'kycBar.style.width = "50%"; if(document.getElementById("kycPct")) document.getElementById("kycPct").textContent = "50%"'
)
c = c.replace(
  /kycBar\.style\.width = "90%"/g,
  'kycBar.style.width = "90%"; if(document.getElementById("kycPct")) document.getElementById("kycPct").textContent = "90%"'
)
c = c.replace(
  /kycBar\.style\.width = "100%"/g,
  'kycBar.style.width = "100%"; if(document.getElementById("kycPct")) document.getElementById("kycPct").textContent = "100%"'
)

// Fix idName and selfieName display text
c = c.replace(
  `idName.textContent = "&#10003; " + idFile.name`,
  `idName.textContent = "✅ " + idFile.name`
)
c = c.replace(
  `selfieName.textContent = "&#10003; " + selfieFile.name`,
  `selfieName.textContent = "✅ " + selfieFile.name`
)

fs.writeFileSync('src/main.js', c, 'utf8')
console.log('KYC redesigned. Lines:', c.split('\n').length)
