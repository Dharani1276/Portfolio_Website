import { useState, useRef, useCallback, useEffect } from "react";
import "./App.css";

const DEFAULTS = {
  name: "Alexandra Chen",
  title: "Creative Director & Visual Storyteller",
  bio: "I craft digital experiences that merge bold aesthetics with functional design. Specializing in brand identity, UI/UX, and visual systems that leave a lasting impression on every touchpoint.",
  email: "hello@alexchen.com",
  location: "San Francisco, CA",
  available: true,
  skills: ["Brand Identity", "UI/UX Design", "Motion Graphics", "Typography", "Illustration", "Art Direction", "Editorial Design", "Visual Systems"],
  instagram: "@alexchen.design",
  linkedin: "alexchendesign",
};

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

const ChevronLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15,18 9,12 15,6"/></svg>;
const ChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9,18 15,12 9,6"/></svg>;
const CloseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default function App() {
  const [profile, setProfile] = useState(DEFAULTS);
  const [profilePic, setProfilePic] = useState(null);
  const [images, setImages] = useState([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(DEFAULTS);
  const [skillInput, setSkillInput] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [lbIdx, setLbIdx] = useState(0);
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [loaded, setLoaded] = useState(false);

  const picRef = useRef();
  const galleryRef = useRef();
  const toastRef = useRef();

  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  const showToast = (msg, err = false) => {
    clearTimeout(toastRef.current);
    setToast({ msg, err });
    toastRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handlePic = (e) => {
    const f = e.target.files[0];
    if (!f || !f.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = ev => { setProfilePic(ev.target.result); showToast("Profile photo updated"); };
    r.readAsDataURL(f);
  };

  const addImages = useCallback((files) => {
    const space = 50 - images.length;
    if (space <= 0) return showToast("Maximum 50 images reached", true);
    const valid = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, space);
    if (!valid.length) return showToast("No valid images found", true);
    Promise.all(valid.map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = ev => res({ src: ev.target.result, name: f.name, id: Math.random().toString(36).slice(2) });
      r.readAsDataURL(f);
    }))).then(imgs => {
      setImages(prev => [...prev, ...imgs]);
      showToast(`${imgs.length} image${imgs.length > 1 ? "s" : ""} added`);
    });
  }, [images.length]);

  const removeImage = (id) => { setImages(prev => prev.filter(i => i.id !== id)); setLightbox(null); showToast("Image removed"); };
  const openLb = (img, idx) => { setLightbox(img); setLbIdx(idx); };
  const lbNav = (dir) => { const next = (lbIdx + dir + images.length) % images.length; setLightbox(images[next]); setLbIdx(next); };

  useEffect(() => {
    const fn = (e) => {
      if (!lightbox) return;
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft") lbNav(-1);
      if (e.key === "ArrowRight") lbNav(1);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [lightbox, lbIdx, images]);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
    }, { threshold: 0.3 });
    ["hero", "work", "about", "contact"].forEach(id => {
      const el = document.getElementById(id); if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setActiveSection(id); };
  const saveEdit = () => { setProfile(draft); setEditing(false); showToast("Changes saved"); };

  return (
    <div className="root">

      {toast && <div className={`toast${toast.err ? " err" : ""}`}>{toast.msg}</div>}

      {/* Lightbox */}
      {lightbox && (
        <div className="lbov" onClick={() => setLightbox(null)}>
          <button className="lbbtn" style={{ top: 18, right: 18 }} onClick={() => setLightbox(null)}><CloseIcon /></button>
          {images.length > 1 && <>
            <button className="lbbtn" style={{ left: 16 }} onClick={e => { e.stopPropagation(); lbNav(-1); }}><ChevronLeft /></button>
            <button className="lbbtn" style={{ right: 16 }} onClick={e => { e.stopPropagation(); lbNav(1); }}><ChevronRight /></button>
          </>}
          <div className="lb-inner" onClick={e => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.name} className="lb-img" />
            <div className="lb-footer">
              <span className="lb-count">{lbIdx + 1} / {images.length}</span>
              <button className="dangerbtn" onClick={() => removeImage(lightbox.id)}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="mover" onClick={() => setEditing(false)}>
          <div className="mbox" onClick={e => e.stopPropagation()}>
            <div className="mbox-header">
              <h2 className="mbox-title">Edit Profile</h2>
              <button className="ghostbtn" onClick={() => setEditing(false)}>✕ Close</button>
            </div>
            <div className="mbox-body">
              <div className="grid2">
                {[["Name", "name"], ["Title / Role", "title"]].map(([l, k]) => (
                  <div key={k}><span className="lbl">{l}</span>
                    <input className="field" value={draft[k]} onChange={e => setDraft(p => ({ ...p, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div><span className="lbl">Bio</span>
                <textarea className="field" value={draft.bio} onChange={e => setDraft(p => ({ ...p, bio: e.target.value }))} />
              </div>
              <div className="grid2">
                {[["Email", "email"], ["Location", "location"]].map(([l, k]) => (
                  <div key={k}><span className="lbl">{l}</span>
                    <input className="field" value={draft[k]} onChange={e => setDraft(p => ({ ...p, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="grid2">
                <div><span className="lbl">Instagram</span>
                  <input className="field" value={draft.instagram} placeholder="@handle" onChange={e => setDraft(p => ({ ...p, instagram: e.target.value }))} />
                </div>
                <div><span className="lbl">LinkedIn</span>
                  <input className="field" value={draft.linkedin} placeholder="username" onChange={e => setDraft(p => ({ ...p, linkedin: e.target.value }))} />
                </div>
              </div>
              <div>
                <span className="lbl">Skills</span>
                <div className="skill-chips">
                  {draft.skills.map((s, i) => (
                    <span key={i} className="schip">{s}
                      <button className="rmsk" onClick={() => setDraft(p => ({ ...p, skills: p.skills.filter((_, j) => j !== i) }))}>×</button>
                    </span>
                  ))}
                </div>
                <div className="skill-add-row">
                  <input className="field" style={{ flex: 1 }} placeholder="New skill…" value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && skillInput.trim()) { setDraft(p => ({ ...p, skills: [...p.skills, skillInput.trim()] })); setSkillInput(""); } }} />
                  <button className="ghostbtn" onClick={() => { if (skillInput.trim()) { setDraft(p => ({ ...p, skills: [...p.skills, skillInput.trim()] })); setSkillInput(""); } }}>Add</button>
                </div>
              </div>
              <div className="avail-row">
                <input type="checkbox" id="avail" checked={draft.available} onChange={e => setDraft(p => ({ ...p, available: e.target.checked }))} />
                <label htmlFor="avail">Available for new projects</label>
              </div>
            </div>
            <div className="mbox-footer">
              <button className="ghostbtn" onClick={() => setEditing(false)}>Cancel</button>
              <button className="gbtn" onClick={saveEdit}><span className="gbtn-t">Save Changes</span></button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => scrollTo("hero")}>
          {profile.name.split(" ")[0]}<span className="gold">.</span>
        </div>
        <div className="nav-links">
          {[["hero", "Home"], ["work", "Work"], ["about", "About"], ["contact", "Contact"]].map(([id, label]) => (
            <span key={id} className={`npill${activeSection === id ? " act" : ""}`} onClick={() => scrollTo(id)}>{label}</span>
          ))}
        </div>
        <button className="gbtn" style={{ fontSize: 10, padding: "8px 18px" }} onClick={() => { setDraft({ ...profile }); setEditing(true); }}>
          <span className="gbtn-t">Edit Profile</span>
        </button>
      </nav>

      {/* HERO */}
      <section id="hero" className="section hero-section">
        <div className="hero-glow" />
        <div className="hero-line" />
        <div className="hero-grid" style={{ opacity: loaded ? 1 : 0, transition: "opacity .9s ease" }}>
          <div className="hero-text">
            {profile.available && (
              <div className="avail-badge">
                <span className="avdot" />
                <span>AVAILABLE FOR WORK</span>
              </div>
            )}
            <div className="sec-lbl">Creative Portfolio</div>
            <h1 className="hero-name">
              {profile.name.split(" ").map((w, i) => (
                <div key={i} style={{ fontStyle: i === 1 ? "italic" : "normal", color: i === 1 ? "#c4a06e" : "#e8e4dc" }}>{w}</div>
              ))}
            </h1>
            <div className="la" />
            <p className="hero-title">{profile.title}</p>
            <p className="hero-bio">{profile.bio}</p>
            <div className="hero-btns">
              <button className="gbtn" onClick={() => scrollTo("work")}><span className="gbtn-t">View My Work</span></button>
              <button className="ghostbtn" onClick={() => scrollTo("contact")}>Contact Me</button>
            </div>
          </div>

          <div className="hero-right">
            <div className="pic-wrap">
              {profilePic
                ? <img src={profilePic} alt="Profile" className="profile-img" />
                : <div className="profile-placeholder">
                    <div className="placeholder-icon">◎</div>
                    <span className="placeholder-text">NO PHOTO YET</span>
                  </div>
              }
              <div className="pic-hover" onClick={() => picRef.current.click()}>
                <div className="upload-arrow">↑</div>
                <span className="upload-text">UPLOAD PHOTO</span>
              </div>
            </div>
            <input ref={picRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePic} />
            <button className="ghostbtn" onClick={() => picRef.current.click()}>Change Photo</button>
            <div className="stats-grid">
              {[[images.length, "Gallery"], ["50+", "Designs"]].map(([n, l]) => (
                <div key={l} className="sbox"><div className="snum">{n}</div><div className="slbl">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WORK / GALLERY */}
      <section id="work" className="section work-section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="sec-lbl">Selected Work</div>
              <h2 className="section-title">Design <span className="italic-gold">Gallery</span></h2>
              <div className="gallery-meta">{images.length} / 50 · click to expand · keyboard arrows to navigate</div>
            </div>
            {images.length < 50 && (
              <button className="gbtn" onClick={() => galleryRef.current.click()}><span className="gbtn-t">+ Add Images</span></button>
            )}
          </div>
          <input ref={galleryRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => addImages(e.target.files)} />

          {images.length === 0 ? (
            <div className={`dzone${dragOver ? " ov" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addImages(e.dataTransfer.files); }}
              onClick={() => galleryRef.current.click()}>
              <div className="dzone-icon">⬡</div>
              <p className="dzone-title">Drop your designs here</p>
              <p className="dzone-sub">or click to browse · max 50 images</p>
            </div>
          ) : (
            <div className="gallery-grid"
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addImages(e.dataTransfer.files); }}>
              {images.map((img, idx) => (
                <div key={img.id} className="gcrd" onClick={() => openLb(img, idx)}>
                  <img src={img.src} alt={img.name} />
                  <div className="gcrd-ov">
                    <div className="gcrd-row">
                      <button className="mini-row-btn" onClick={e => { e.stopPropagation(); openLb(img, idx); }}>Expand</button>
                      <button className="mini-row-btn rm" onClick={e => { e.stopPropagation(); removeImage(img.id); }}>✕</button>
                    </div>
                  </div>
                </div>
              ))}
              {images.length < 50 && (
                <div className="addcrd" onClick={() => galleryRef.current.click()}>
                  <span style={{ fontSize: 28, marginBottom: 6 }}>+</span>
                  <span style={{ fontSize: 9, letterSpacing: 3 }}>ADD MORE</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section about-section">
        <div className="container about-grid">
          <div>
            <div className="sec-lbl">About Me</div>
            <h2 className="section-title">Crafting Worlds<br /><span className="italic-gold">Through Design</span></h2>
            <div className="la" />
            <p className="about-bio">{profile.bio}</p>
            <div className="contact-details">
              {[["◎", profile.location], ["◉", profile.email]].map(([icon, val]) => (
                <div key={val} className="detail-row"><span className="gold">{icon}</span>{val}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="sec-lbl" style={{ marginBottom: 16 }}>Skills</div>
            <div className="skill-chips" style={{ marginBottom: 40 }}>
              {profile.skills.map((s, i) => <span key={i} className="schip">{s}</span>)}
            </div>
            {profile.available && (
              <div className="avail-box">
                <div className="avail-box-header">
                  <span className="avdot" />
                  <span className="avail-box-label">OPEN TO OPPORTUNITIES</span>
                </div>
                <p className="avail-box-text">Currently accepting freelance projects and full-time roles. Let's build something remarkable.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section contact-section">
        <div className="container contact-grid">
          <div>
            <div className="sec-lbl">Get In Touch</div>
            <h2 className="section-title contact-title">Let's Work<br /><span className="italic-gold">Together.</span></h2>
            <div className="la" />
            <p className="contact-text">Open to creative collaborations, brand projects, and meaningful work. Connect on social media.</p>
          </div>
          <div className="contact-cards">
            <div className="info-card"><div className="info-label">Email</div><div className="info-value gold">{profile.email}</div></div>
            <div className="info-card"><div className="info-label">Location</div><div className="info-value muted">{profile.location}</div></div>
            <button className="slink" onClick={() => window.open(`https://instagram.com/${profile.instagram.replace("@", "")}`, "_blank")}>
              <InstagramIcon /><span style={{ flex: 1 }}>Instagram</span><span className="slink-handle">{profile.instagram}</span>
            </button>
            <button className="slink" onClick={() => window.open(`https://linkedin.com/in/${profile.linkedin}`, "_blank")}>
              <LinkedInIcon /><span style={{ flex: 1 }}>LinkedIn</span><span className="slink-handle">{profile.linkedin}</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <span className="footer-logo">{profile.name.split(" ")[0]}<span className="gold">.</span></span>
        <span className="footer-copy">© {new Date().getFullYear()} {profile.name.toUpperCase()}</span>
        <div className="footer-socials">
          <button className="ghostbtn icon-btn" onClick={() => window.open(`https://instagram.com/${profile.instagram.replace("@", "")}`, "_blank")}><InstagramIcon /></button>
          <button className="ghostbtn icon-btn" onClick={() => window.open(`https://linkedin.com/in/${profile.linkedin}`, "_blank")}><LinkedInIcon /></button>
        </div>
      </footer>
    </div>
  );
}
