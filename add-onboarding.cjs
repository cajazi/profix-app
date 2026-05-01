const fs = require("fs")
let code = fs.readFileSync("src/main.js", "utf8")

const onboardingFn = `
async function showOnboarding() {
  return new Promise((resolve) => {
    let currentSlide = 0
    const slides = [
      { icon: "&#128295;", title: "Welcome to ProFix", desc: "Nigeria's trusted home services marketplace. Connect with skilled professionals for any job." },
      { icon: "&#128203;", title: "Post a Job", desc: "Describe what you need, upload photos, and get applications from verified professionals near you." },
      { icon: "&#128274;", title: "Secure Payments", desc: "Pay into escrow. Money is only released when you confirm the job is complete. 100% safe." },
      { icon: "&#11088;", title: "Rated Professionals", desc: "Every worker is KYC verified and rated by real customers. Hire with confidence." },
    ]

    function renderSlide() {
      const s = slides[currentSlide]
      const dots = slides.map((_, i) => "<div style='width:" + (i===currentSlide?"24":"8") + "px;height:8px;border-radius:4px;background:" + (i===currentSlide?"#4f46e5":"rgba(255,255,255,0.3)") + ";transition:all 0.3s;'></div>").join("")
      app.innerHTML = "<div style='min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);padding:0 24px;'>" +
        "<div style='flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;'>" +
          "<div style='width:120px;height:120px;background:rgba(79,70,229,0.2);border-radius:30px;display:flex;align-items:center;justify-content:center;margin-bottom:32px;border:1px solid rgba(79,70,229,0.3);'>" +
            "<span style='font-size:60px;'>" + s.icon + "</span>" +
          "</div>" +
          "<h2 style='color:#fff;font-size:26px;font-weight:800;margin:0 0 16px;line-height:1.2;'>" + s.title + "</h2>" +
          "<p style='color:#a5b4fc;font-size:16px;margin:0;line-height:1.7;max-width:300px;'>" + s.desc + "</p>" +
        "</div>" +
        "<div style='padding-bottom:48px;'>" +
          "<div style='display:flex;justify-content:center;gap:8px;margin-bottom:32px;align-items:center;'>" + dots + "</div>" +
          "<button id='nextBtn' style='width:100%;padding:16px;background:#4f46e5;color:#fff;font-size:17px;font-weight:700;border:none;border-radius:16px;cursor:pointer;margin-bottom:12px;min-height:56px;box-shadow:0 8px 24px rgba(79,70,229,0.4);'>" +
            (currentSlide === slides.length - 1 ? "Get Started" : "Next") +
          "</button>" +
          (currentSlide < slides.length - 1 ? "<button id='skipBtn' style='width:100%;padding:12px;background:none;color:#6b7280;font-size:15px;font-weight:600;border:none;cursor:pointer;'>Skip</button>" : "") +
        "</div>" +
      "</div>"

      document.getElementById("nextBtn").addEventListener("click", () => {
        if (currentSlide < slides.length - 1) {
          currentSlide++
          renderSlide()
        } else {
          localStorage.setItem("profix_onboarded", "1")
          resolve()
        }
      })

      const skipBtn = document.getElementById("skipBtn")
      if (skipBtn) skipBtn.addEventListener("click", () => {
        localStorage.setItem("profix_onboarded", "1")
        resolve()
      })
    }

    renderSlide()
  })
}
`

// Add before boot function
code = code.replace(
  "async function boot() {",
  onboardingFn + "\nasync function boot() {"
)

// Update boot to show onboarding on first launch
code = code.replace(
  `async function boot() {
  setupAndroidBack()
  showLoading()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    currentEmail = session.user.email
    currentUser  = session.user
    showDashboard(session.user)
  } else {
    showLogin()
  }
}`,
  `async function boot() {
  setupAndroidBack()
  showLoading()
  const onboarded = localStorage.getItem("profix_onboarded")
  if (!onboarded) {
    await showOnboarding()
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    currentEmail = session.user.email
    currentUser  = session.user
    showDashboard(session.user)
  } else {
    showLogin()
  }
}`
)

fs.writeFileSync("src/main.js", code, "utf8")
console.log("Onboarding screen added")
