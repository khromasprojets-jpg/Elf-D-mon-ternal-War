import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";


// ─── CONFIG SUPABASE ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://fgzulqopyxtfmtlfctxx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PU9sf0pSZA6d0eqZDs8Xgg_gNp2LsSQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── DONNÉES DU JEU ───────────────────────────────────────────────────────────
const CLASSES = [
  { id: 1, nom: "Guerrier", emoji: "⚔️", couleur: "#e74c3c", desc: "Maître du combat rapproché", stats: { force: 20, armure: 18, vitalité: 22, critique: 8 } },
  { id: 2, nom: "Mage", emoji: "🔮", couleur: "#9b59b6", desc: "Destructeur magique à distance", stats: { force: 22, armure: 8, vitalité: 12, critique: 16 } },
  { id: 3, nom: "Archer", emoji: "🏹", couleur: "#27ae60", desc: "Tireur d'élite, précision maximale", stats: { force: 17, armure: 12, vitalité: 14, critique: 22 } },
];

const DONJONS = [
  { id: 1, nom: "Forêt des Esprits", icone: "🌲", difficulte: "Facile", niveauReq: 1, ennemis: ["Esprit Sauvage Lv.1", "Golem de Terre Lv.2"], butin: ["Épée Rouillée", "Potion de Vie", "Gemme Verte"], xp: 120, or: 80, couleur: "#27ae60" },
  { id: 2, nom: "Grotte des Ombres", icone: "🪨", difficulte: "Normal", niveauReq: 5, ennemis: ["Guerrier Fantôme Lv.8", "Sorcier Maudit Lv.10"], butin: ["Bouclier d'Acier", "Rune de Feu", "Parchemin Doré"], xp: 320, or: 200, couleur: "#f39c12" },
  { id: 3, nom: "Ruines Maudites", icone: "🏚️", difficulte: "Normal", niveauReq: 10, ennemis: ["Champion Maudit Lv.15", "Archimage Lv.18"], butin: ["Lame du Crépuscule", "Armure de Cristal", "Pierre d'Âme"], xp: 580, or: 380, couleur: "#f39c12" },
  { id: 4, nom: "Tour du Dragon", icone: "🐲", difficulte: "Difficile", niveauReq: 20, ennemis: ["Dragon de Glace Lv.25", "Gardien Céleste Lv.28"], butin: ["Écailles du Dragon", "Aile de Phénix", "Cristal Légendaire"], xp: 1200, or: 850, couleur: "#e74c3c" },
  { id: 5, nom: "Abîme Démoniaque", icone: "💀", difficulte: "Expert", niveauReq: 35, ennemis: ["Démon Ancien Lv.40", "Seigneur des Ténèbres Lv.45"], butin: ["Lame des Abysses", "Couronne Obscure", "Essence Divine"], xp: 2800, or: 2100, couleur: "#9b59b6" },
  { id: 6, nom: "Palais Céleste", icone: "⭐", difficulte: "Légendaire", niveauReq: 50, ennemis: ["Gardien Divin Lv.60", "Dieu de la Guerre Lv.70"], butin: ["Arme Divine", "Armure Céleste", "Cœur du Cosmos"], xp: 8000, or: 6000, couleur: "#f1c40f" },
];

const BOUTIQUE = [
  { id: 101, nom: "Pierre de Renforcement", icon: "💎", prix: 200, devise: "yuanbao", desc: "+1 niveau équipement", qualite: "Normal" },
  { id: 201, nom: "Pilule d'Expérience", icon: "🟡", prix: 100, devise: "or_joueur", desc: "+500 XP immédiatement", qualite: "Commun" },
  { id: 202, nom: "Élixir de Force", icon: "🔴", prix: 500, devise: "or_joueur", desc: "+10 Force pendant 24h", qualite: "Rare" },
  { id: 301, nom: "Épée du Brave", icon: "⚔️", prix: 8000, devise: "or_joueur", desc: "+45 Force, +10 Critique", qualite: "Rare" },
  { id: 302, nom: "Armure du Crépuscule", icon: "🦺", prix: 15000, devise: "or_joueur", desc: "+80 Défense, +20 Vitalité", qualite: "Épique" },
  { id: 401, nom: "Dragon de Glace", icon: "🐉", prix: 8000, devise: "yuanbao", desc: "Monture légendaire +30% vitesse", qualite: "Légendaire" },
  { id: 402, nom: "Fée Gardienne", icon: "🧚", prix: 3000, devise: "or_joueur", desc: "Compagnon: guérit 5% PV/s", qualite: "Rare" },
  { id: 601, nom: "Rubis", icon: "🔴", prix: 300, devise: "or_joueur", desc: "+Force selon niveau", qualite: "Normal" },
  { id: 602, nom: "Diamant Céleste", icon: "💎", prix: 2000, devise: "yuanbao", desc: "+Toutes stats", qualite: "Légendaire" },
];

const QUALITE_COULEURS = { "Légendaire": "#f1c40f", "Épique": "#9b59b6", "Rare": "#3498db", "Normal": "#7f8c8d", "Commun": "#95a5a6" };

// ─── UTILITAIRES ──────────────────────────────────────────────────────────────
function Barre({ val, max, couleur, h = 8 }) {
  return (
    <div style={{ background: "#0d1117", borderRadius: 4, height: h, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${Math.min(100, Math.round(((val||0) / (max||1)) * 100))}%`, background: couleur, borderRadius: 4, transition: "width 0.5s" }} />
    </div>
  );
}

function Badge({ texte, couleur = "#7f8c8d" }) {
  return <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: couleur + "22", color: couleur, border: `1px solid ${couleur}44`, fontWeight: 600 }}>{texte}</span>;
}

function Notif({ texte, type = "succes", onFin }) {
  useEffect(() => { const t = setTimeout(onFin, 3000); return () => clearTimeout(t); }, [onFin]);
  const c = type === "succes" ? "#27ae60" : type === "erreur" ? "#e74c3c" : "#f39c12";
  return (
    <div style={{ position: "fixed", top: 80, right: 20, zIndex: 9999, background: "#0d1117", border: `1px solid ${c}55`, borderRadius: 10, padding: "12px 18px", color: c, fontSize: 14, fontWeight: 600, boxShadow: `0 8px 32px ${c}22` }}>
      {type === "succes" ? "✅ " : type === "erreur" ? "❌ " : "⚠️ "}{texte}
    </div>
  );
}

// ─── PAGE CONNEXION ───────────────────────────────────────────────────────────
function PageConnexion({ onConnecte }) {
  const [identifiant, setIdentifiant] = useState("");
  const [mdp, setMdp] = useState("");
  const [mode, setMode] = useState("connexion");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const entrer = async () => {
    if (!identifiant.trim() || !mdp.trim()) { setErreur("Remplissez tous les champs."); return; }
    if (mdp.length < 4) { setErreur("Mot de passe trop court (min. 4 caractères)."); return; }
    setChargement(true); setErreur("");
    const id = identifiant.trim().toLowerCase();
    const hash = btoa(unescape(encodeURIComponent(mdp)));
    try {
      if (mode === "connexion") {
        const { data, error } = await supabase.from("comptes").select("*").eq("identifiant", id).single();
        if (error || !data) { setErreur("Compte introuvable."); setChargement(false); return; }
        if (data.mot_de_passe !== hash) { setErreur("Mot de passe incorrect."); setChargement(false); return; }
        localStorage.setItem("elf_session", JSON.stringify({ id: data.id, identifiant: data.identifiant }));
        onConnecte({ id: data.id, identifiant: data.identifiant });
      } else {
        const { data: exist } = await supabase.from("comptes").select("id").eq("identifiant", id).single();
        if (exist) { setErreur("Ce nom de compte existe déjà."); setChargement(false); return; }
        const { data, error } = await supabase.from("comptes").insert({ identifiant: id, mot_de_passe: hash }).select().single();
        if (error) { setErreur("Erreur création compte : " + error.message); setChargement(false); return; }
        localStorage.setItem("elf_session", JSON.stringify({ id: data.id, identifiant: data.identifiant }));
        onConnecte({ id: data.id, identifiant: data.identifiant });
      }
    } catch (e) { setErreur("Erreur serveur : " + e.message); }
    setChargement(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060612", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 30%, #1a0a3a44 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, #0a1a3a44 0%, transparent 55%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 70, marginBottom: 12 }}>⚔️🔮</div>
        <h1 style={{ fontSize: 42, fontWeight: 700, color: "#f39c12", margin: "0 0 6px", letterSpacing: 3 }}>Elf&Démon : Éternal War</h1>
        <p style={{ color: "#8892b0", fontSize: 14, margin: "0 0 16px" }}>MMORPG Elfs vs Démons — Guerre Éternelle</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {["⚔️ Combat épique", "🐉 Donjons légendaires", "👑 Classement mondial", "💾 Sauvegarde cloud"].map(t => (
            <span key={t} style={{ fontSize: 11, color: "#64ffda", background: "#64ffda0d", border: "1px solid #64ffda2a", padding: "4px 10px", borderRadius: 12 }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ background: "#0d1117ee", backdropFilter: "blur(24px)", border: "1px solid #21262d", borderRadius: 18, padding: "36px 40px", width: 400, position: "relative", zIndex: 1, boxShadow: "0 32px 100px #000c" }}>
        <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", marginBottom: 28, border: "1px solid #21262d" }}>
          {[["connexion", "Connexion"], ["inscription", "Inscription"]].map(([m, l]) => (
            <button key={m} onClick={() => { setMode(m); setErreur(""); }} style={{ flex: 1, padding: "11px 0", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, background: mode === m ? "#f39c12" : "transparent", color: mode === m ? "#000" : "#8892b0", transition: "all 0.2s" }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input value={identifiant} onChange={e => setIdentifiant(e.target.value)} placeholder={mode === "connexion" ? "Nom de compte ou email" : "Choisissez un nom de compte"} style={{ padding: "12px 16px", borderRadius: 9, border: "1px solid #30363d", background: "#161b22", color: "#e6edf3", fontSize: 15, outline: "none" }} />
          <input value={mdp} onChange={e => setMdp(e.target.value)} type="password" placeholder="Mot de passe (min. 4 caractères)" onKeyDown={e => e.key === "Enter" && entrer()} style={{ padding: "12px 16px", borderRadius: 9, border: "1px solid #30363d", background: "#161b22", color: "#e6edf3", fontSize: 15, outline: "none" }} />
          {erreur && <p style={{ color: "#ff6b6b", fontSize: 13, margin: 0, padding: "8px 12px", background: "#ff6b6b11", borderRadius: 7, border: "1px solid #ff6b6b22" }}>{erreur}</p>}
          <button onClick={entrer} disabled={chargement} style={{ padding: "13px", borderRadius: 9, border: "none", cursor: chargement ? "wait" : "pointer", background: chargement ? "#30363d" : "linear-gradient(135deg, #f39c12, #e67e22)", color: chargement ? "#8892b0" : "#000", fontSize: 15, fontWeight: 700 }}>
            {chargement ? "⏳ Connexion..." : mode === "connexion" ? "⚡ Entrer dans le Royaume" : "🌟 Créer mon Compte"}
          </button>
        </div>
        <p style={{ color: "#8892b0", fontSize: 11, margin: "14px 0 0", textAlign: "center" }}>🔒 Vos données sont sécurisées</p>
      </div>
    </div>
  );
}

// ─── CHOIX PERSONNAGE ─────────────────────────────────────────────────────────
function PageChoixPersonnage({ compte, onPersonnage }) {
  const [cls, setCls] = useState(null);
  const [nom, setNom] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const creer = async () => {
    if (!cls || !nom.trim()) return;
    setChargement(true);
    const { data: exist } = await supabase.from("personnages").select("id").eq("nom", nom.trim()).single();
    if (exist) { setErreur("Ce nom de héros est déjà pris."); setChargement(false); return; }
    const { data, error } = await supabase.from("personnages").insert({
      compte_id: compte.id, nom: nom.trim(),
      classe_id: cls.id, classe_nom: cls.nom, classe_emoji: cls.emoji,
      niveau: 1, xp: 0, xp_max: 1000, hp: 1000, hp_max: 1000,
      mp: 500, mp_max: 500, or_joueur: 5000, yuanbao: 100, puissance: 5000, vip: 0, guilde: "",
    }).select().single();
    if (error) { setErreur("Erreur : " + error.message); setChargement(false); return; }
    onPersonnage({ ...data, classe: cls });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060612", display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", fontFamily: "Georgia, serif" }}>
      <h1 style={{ color: "#f39c12", fontSize: 32, marginBottom: 6 }}>⚔️ Choisissez votre Classe</h1>
      <p style={{ color: "#8892b0", marginBottom: 36, fontSize: 14 }}>Compte : <strong style={{ color: "#64ffda" }}>{compte.identifiant}</strong></p>
      <div style={{ display: "flex", gap: 20, marginBottom: 40, flexWrap: "wrap", justifyContent: "center" }}>
        {CLASSES.map(c => (
          <div key={c.id} onClick={() => setCls(c)} style={{ width: 220, padding: 24, borderRadius: 16, cursor: "pointer", background: cls?.id === c.id ? c.couleur + "1a" : "#161b22", border: `2px solid ${cls?.id === c.id ? c.couleur : "#21262d"}`, transition: "all 0.25s", transform: cls?.id === c.id ? "translateY(-5px)" : "none" }}>
            <div style={{ fontSize: 54, textAlign: "center", marginBottom: 12 }}>{c.emoji}</div>
            <h3 style={{ color: c.couleur, textAlign: "center", margin: "0 0 6px", fontSize: 18 }}>{c.nom}</h3>
            <p style={{ color: "#8892b0", textAlign: "center", fontSize: 12, margin: "0 0 16px" }}>{c.desc}</p>
            {Object.entries(c.stats).map(([s, v]) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ color: "#8892b0", fontSize: 11, width: 55, textTransform: "capitalize" }}>{s}</span>
                <div style={{ flex: 1, background: "#0d1117", borderRadius: 3, height: 5, overflow: "hidden" }}>
                  <div style={{ width: `${v * 4}%`, height: "100%", background: c.couleur }} />
                </div>
                <span style={{ color: "#e6edf3", fontSize: 11, width: 18 }}>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {cls && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom de votre héros..." style={{ padding: "13px 22px", borderRadius: 10, border: `2px solid ${cls.couleur}55`, background: "#161b22", color: "#e6edf3", fontSize: 16, outline: "none", width: 290, textAlign: "center" }} />
          {erreur && <p style={{ color: "#ff6b6b", fontSize: 13 }}>{erreur}</p>}
          <button onClick={creer} disabled={!nom.trim() || chargement} style={{ padding: "13px 32px", borderRadius: 10, border: "none", cursor: nom.trim() && !chargement ? "pointer" : "not-allowed", background: nom.trim() ? `linear-gradient(135deg, ${cls.couleur}, ${cls.couleur}bb)` : "#21262d", color: "#fff", fontSize: 15, fontWeight: 700 }}>
            {chargement ? "⏳ Création..." : "🌟 Commencer l'Aventure"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function NavBar({ perso, sousPage, setSousPage, onDeconnexion }) {
  const onglets = [
    { id: "village", l: "Village", i: "🏘️" }, { id: "donjon", l: "Donjons", i: "⚔️" },
    { id: "personnage", l: "Personnage", i: "👤" }, { id: "boutique", l: "Boutique", i: "🛒" },
    { id: "classement", l: "Classement", i: "🏆" }, { id: "guilde", l: "Guilde", i: "⚜️" },
  ];
  return (
    <div style={{ background: "#0d1117", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", padding: "0 14px", height: 54, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 16 }}>
        <span style={{ fontSize: 18 }}>⚔️🔮</span>
        <span style={{ color: "#f39c12", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>Elf&Démon</span>
      </div>
      <div style={{ display: "flex", flex: 1, gap: 1, overflowX: "auto" }}>
        {onglets.map(o => (
          <button key={o.id} onClick={() => setSousPage(o.id)} style={{ padding: "6px 11px", borderRadius: 7, border: "none", cursor: "pointer", background: sousPage === o.id ? "#21262d" : "transparent", color: sousPage === o.id ? "#f39c12" : "#8892b0", fontSize: 12, fontWeight: sousPage === o.id ? 700 : 400, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
            <span>{o.i}</span><span>{o.l}</span>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 8 }}>
        <span style={{ color: "#f1c40f", fontSize: 12, fontWeight: 600 }}>🪙 {(perso?.or_joueur || 0).toLocaleString()}</span>
        <span style={{ color: "#9b59b6", fontSize: 12, fontWeight: 600 }}>💎 {perso?.yuanbao || 0}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#21262d", border: "2px solid #f39c12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{perso?.classe_emoji}</div>
          <div>
            <div style={{ color: "#e6edf3", fontSize: 11, fontWeight: 600 }}>{perso?.nom}</div>
            <div style={{ color: "#8892b0", fontSize: 10 }}>Lv.{perso?.niveau}</div>
          </div>
        </div>
        <button onClick={onDeconnexion} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #30363d", background: "transparent", color: "#8892b0", cursor: "pointer", fontSize: 11 }}>Déco.</button>
      </div>
    </div>
  );
}

function StatBar({ perso }) {
  return (
    <div style={{ background: "#0d1117", borderBottom: "1px solid #21262d", padding: "5px 18px", display: "flex", gap: 18, alignItems: "center" }}>
      {[["❤️", "PV", perso.hp, perso.hp_max, "#e74c3c"], ["💙", "PM", perso.mp, perso.mp_max, "#3498db"], ["✨", "XP", perso.xp, perso.xp_max, "#f39c12"]].map(([ic, l, v, m, c]) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
          <span style={{ color: c, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{ic} {l}</span>
          <Barre val={v || 0} max={m || 1000} couleur={c} h={6} />
          <span style={{ color: "#8892b0", fontSize: 10, whiteSpace: "nowrap" }}>{v}/{m}</span>
        </div>
      ))}
      <div style={{ display: "flex", gap: 12, whiteSpace: "nowrap" }}>
        <span style={{ color: "#e6edf3", fontSize: 11 }}>⚡ <strong style={{ color: "#f39c12" }}>{(perso.puissance || 0).toLocaleString()}</strong></span>
        {perso.guilde && <span style={{ color: "#e6edf3", fontSize: 11 }}>⚜️ <strong style={{ color: "#64ffda" }}>{perso.guilde}</strong></span>}
      </div>
    </div>
  );
}

// ─── SAUVEGARDE HELPER ────────────────────────────────────────────────────────
async function sauvegarder(compteId, champs) {
  await supabase.from("personnages").update(champs).eq("compte_id", compteId);
}

// ─── PAGE VILLAGE ─────────────────────────────────────────────────────────────
function PageVillage({ perso, setPerso, setNotif }) {
  const activites = [
    { nom: "Arène PvP", icon: "⚔️", desc: "Affrontez d'autres joueurs", bonus: "+50 Gloire/victoire", action: async () => setNotif({ msg: "Recherche d'adversaire...", type: "info" }) },
    { nom: "Quêtes Journalières", icon: "📜", desc: "3 quêtes disponibles", bonus: "+2 000 XP total", action: async () => { const nxp = Math.min(perso.xp_max, perso.xp + 200); await sauvegarder(perso.compte_id, { xp: nxp }); setPerso(p => ({ ...p, xp: nxp })); setNotif({ msg: "Quête terminée ! +200 XP", type: "succes" }); } },
    { nom: "Entraînement", icon: "🏋️", desc: "Améliorez vos statistiques", bonus: "+Stats permanentes", action: async () => { const np = perso.puissance + 100; await sauvegarder(perso.compte_id, { puissance: np }); setPerso(p => ({ ...p, puissance: np })); setNotif({ msg: "Entraînement terminé ! +100 Puissance", type: "succes" }); } },
    { nom: "Marché des Joueurs", icon: "🏪", desc: "Échangez avec les autres héros", bonus: "Vente & Achat libre", action: async () => setNotif({ msg: "Marché : 1 247 objets disponibles !", type: "info" }) },
    { nom: "Temple des Fées", icon: "🧚", desc: "Invoquez vos compagnons", bonus: "Fée rare possible", action: async () => setNotif({ msg: "✨ Azura la Fée Crystaline vous rejoint !", type: "succes" }) },
    { nom: "Ferme Céleste", icon: "🌾", desc: "Cultivez des ressources", bonus: "Ressources toutes 4h", action: async () => { const nor = perso.or_joueur + 500; await sauvegarder(perso.compte_id, { or_joueur: nor }); setPerso(p => ({ ...p, or_joueur: nor })); setNotif({ msg: "Récolte ! +500 Or", type: "succes" }); } },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: "#f39c12", margin: "0 0 4px", fontSize: 20 }}>🏘️ Village de Départ</h2>
      <p style={{ color: "#8892b0", margin: "0 0 20px", fontSize: 13 }}>Bienvenue, <strong style={{ color: "#64ffda" }}>{perso.nom}</strong> ! Choisissez une activité.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {activites.map(a => (
          <div key={a.nom} onClick={a.action} style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: 18, cursor: "pointer", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#30363d"; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#21262d"; e.currentTarget.style.transform = "none"; }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{a.icon}</div>
            <h3 style={{ color: "#e6edf3", margin: "0 0 5px", fontSize: 14, fontWeight: 600 }}>{a.nom}</h3>
            <p style={{ color: "#8892b0", fontSize: 12, margin: "0 0 10px" }}>{a.desc}</p>
            <span style={{ fontSize: 11, color: "#f39c12", background: "#f39c1211", padding: "3px 8px", borderRadius: 8, border: "1px solid #f39c1222" }}>{a.bonus}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: 18 }}>
          <h3 style={{ color: "#e6edf3", margin: "0 0 12px", fontSize: 14 }}>📢 Annonces</h3>
          {["🎉 Nouveau donjon 'Palais Céleste' disponible !", "⚔️ Tournoi inter-guildes vendredi 20h", "🎁 Double XP ce week-end !", "🐉 Boss mondial 'Drakon' apparu Zone Nord"].map((a, i) => (
            <div key={i} style={{ padding: "7px 0", borderBottom: i < 3 ? "1px solid #21262d" : "none", color: "#8892b0", fontSize: 12 }}>{a}</div>
          ))}
        </div>
        <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: 18 }}>
          <h3 style={{ color: "#e6edf3", margin: "0 0 12px", fontSize: 14 }}>💬 Chat Monde</h3>
          <ChatMonde perso={perso} />
        </div>
      </div>
    </div>
  );
}

// ─── CHAT MONDE ───────────────────────────────────────────────────────────────
function ChatMonde({ perso }) {
  const [messages, setMessages] = useState([]);
  const [texte, setTexte] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    supabase.from("chat_monde").select("*").order("created_at", { ascending: false }).limit(30)
      .then(({ data }) => { if (data) setMessages(data.reverse()); });
    const channel = supabase.channel("chat_monde_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_monde" },
        payload => setMessages(prev => [...prev.slice(-29), payload.new]))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);

  const envoyer = async () => {
    if (!texte.trim()) return;
    await supabase.from("chat_monde").insert({ nom_joueur: perso.nom, classe_emoji: perso.classe_emoji || "⚔️", message: texte.trim() });
    setTexte("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 200 }}>
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", marginBottom: 8 }}>
        {messages.length === 0 && <p style={{ color: "#8892b0", fontSize: 12, textAlign: "center" }}>Aucun message — soyez le premier !</p>}
        {messages.map((m, i) => (
          <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: "#f39c12" }}>{m.classe_emoji} {m.nom_joueur}</span>
            <span style={{ color: "#8892b0" }}> : {m.message}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={texte} onChange={e => setTexte(e.target.value)} onKeyDown={e => e.key === "Enter" && envoyer()} placeholder="Message..." style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #30363d", background: "#0d1117", color: "#e6edf3", fontSize: 12, outline: "none" }} />
        <button onClick={envoyer} style={{ padding: "7px 12px", borderRadius: 7, border: "none", background: "#f39c12", color: "#000", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>↵</button>
      </div>
    </div>
  );
}

// ─── PAGE DONJON ──────────────────────────────────────────────────────────────
function PageDonjon({ perso, setPerso }) {
  const [sel, setSel] = useState(null);
  const [combat, setCombat] = useState(false);
  const [log, setLog] = useState([]);
  const [resultat, setResultat] = useState(null);
  const logRef = useRef(null);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const lancerCombat = useCallback(async (donjon) => {
    setCombat(true); setLog([]); setResultat(null);
    const msgs = [
      `⚔️ Vous pénétrez dans ${donjon.nom}...`,
      `👾 ${donjon.ennemis[0]} apparaît !`,
      `💥 Attaque ! Vous infligez ${120 + Math.floor(Math.random() * 180)} dégâts`,
      `🗡️ ${donjon.ennemis[0]} riposte pour ${40 + Math.floor(Math.random() * 80)} dégâts`,
      `⚡ Coup Critique ! Dégâts ×2 !`,
      `❤️ Votre fée lance un sort de guérison !`,
      `🌀 Tempête de Lames — tous les ennemis touchés !`,
      perso.niveau < donjon.niveauReq - 5 ? `💀 Trop puissant... défaite !` : `🏆 Victoire ! Tous les ennemis vaincus !`,
    ];
    let i = 0;
    const suivant = async () => {
      if (i >= msgs.length) {
        const victoire = perso.niveau >= donjon.niveauReq - 5;
        setResultat(victoire ? "victoire" : "defaite");
        setCombat(false);
        if (victoire) {
          const nxp = Math.min(perso.xp_max, perso.xp + donjon.xp);
          const nor = perso.or_joueur + donjon.or;
          const np = perso.puissance + Math.floor(donjon.xp / 8);
          await sauvegarder(perso.compte_id, { xp: nxp, or_joueur: nor, puissance: np });
          await supabase.from("historique_combats").insert({ nom_joueur: perso.nom, donjon_nom: donjon.nom, victoire: true, xp_gagne: donjon.xp, or_gagne: donjon.or });
          setPerso(p => ({ ...p, xp: nxp, or_joueur: nor, puissance: np }));
        }
        return;
      }
      setLog(l => [...l, msgs[i++]]);
      setTimeout(suivant, 650);
    };
    setTimeout(suivant, 200);
  }, [perso, setPerso]);

  const coulDiff = { "Facile": "#27ae60", "Normal": "#f39c12", "Difficile": "#e74c3c", "Expert": "#9b59b6", "Légendaire": "#f1c40f" };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: "#f39c12", margin: "0 0 4px", fontSize: 20 }}>⚔️ Donjons</h2>
      <p style={{ color: "#8892b0", margin: "0 0 20px", fontSize: 13 }}>XP, or et équipements rares vous attendent</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DONJONS.map(d => (
            <div key={d.id} onClick={() => setSel(d)} style={{ background: sel?.id === d.id ? "#1a1428" : "#161b22", border: `1px solid ${sel?.id === d.id ? "#f39c12" : "#21262d"}`, borderRadius: 12, padding: "13px 16px", cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{d.icone}</span>
                  <div>
                    <h3 style={{ color: "#e6edf3", margin: "0 0 4px", fontSize: 13 }}>{d.nom}</h3>
                    <div style={{ display: "flex", gap: 5 }}>
                      <Badge texte={d.difficulte} couleur={coulDiff[d.difficulte]} />
                      <Badge texte={`Niv. ${d.niveauReq}+`} couleur="#8892b0" />
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#f39c12", fontSize: 12, fontWeight: 700 }}>+{d.xp} XP</div>
                  <div style={{ color: "#f1c40f", fontSize: 11 }}>+{d.or} 🪙</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: 20 }}>
          {sel ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 36 }}>{sel.icone}</span>
                <div><h3 style={{ color: "#f39c12", margin: 0, fontSize: 17 }}>{sel.nom}</h3><Badge texte={sel.difficulte} couleur={coulDiff[sel.difficulte]} /></div>
              </div>
              <p style={{ color: "#8892b0", fontSize: 12, margin: "0 0 8px", fontWeight: 600 }}>👾 ENNEMIS</p>
              {sel.ennemis.map((e, i) => <div key={i} style={{ padding: "5px 10px", background: "#0d1117", borderRadius: 6, marginBottom: 5, color: "#e6edf3", fontSize: 12 }}>⚔️ {e}</div>)}
              <p style={{ color: "#8892b0", fontSize: 12, margin: "14px 0 8px", fontWeight: 600 }}>🎁 BUTIN POSSIBLE</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 18 }}>
                {sel.butin.map((b, i) => <span key={i} style={{ fontSize: 11, color: "#64ffda", background: "#64ffda0d", border: "1px solid #64ffda2a", padding: "2px 7px", borderRadius: 7 }}>✨ {b}</span>)}
              </div>
              {combat ? (
                <div>
                  <div ref={logRef} style={{ background: "#0d1117", borderRadius: 8, padding: 10, height: 150, overflowY: "auto", marginBottom: 10 }}>
                    {log.map((l, i) => <div key={i} style={{ color: l.includes("Victoire") ? "#27ae60" : l.includes("💀") ? "#e74c3c" : l.includes("❤️") ? "#3498db" : i % 2 ? "#ff9f43" : "#64ffda", fontSize: 12, marginBottom: 4 }}>{l}</div>)}
                  </div>
                  <div style={{ textAlign: "center", color: "#f39c12", fontSize: 13 }}>⚡ Combat en cours...</div>
                </div>
              ) : resultat ? (
                <div style={{ textAlign: "center", padding: 20, background: resultat === "victoire" ? "#27ae6018" : "#e74c3c18", border: `1px solid ${resultat === "victoire" ? "#27ae6044" : "#e74c3c44"}`, borderRadius: 12 }}>
                  <div style={{ fontSize: 44, marginBottom: 6 }}>{resultat === "victoire" ? "🏆" : "💀"}</div>
                  <div style={{ color: resultat === "victoire" ? "#27ae60" : "#e74c3c", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{resultat === "victoire" ? "Victoire !" : "Défaite..."}</div>
                  {resultat === "victoire" && <div style={{ color: "#8892b0", fontSize: 13, marginBottom: 12 }}>+{sel.xp} XP • +{sel.or} 🪙</div>}
                  <button onClick={() => { setResultat(null); setLog([]); }} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#f39c12", color: "#000", cursor: "pointer", fontWeight: 700 }}>Recommencer</button>
                </div>
              ) : (
                <button onClick={() => lancerCombat(sel)} style={{ width: "100%", padding: "13px", borderRadius: 9, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #e74c3c, #c0392b)", color: "#fff", fontSize: 15, fontWeight: 700 }}>⚔️ Lancer l'Attaque !</button>
              )}
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 280, color: "#8892b0", gap: 10 }}>
              <span style={{ fontSize: 50 }}>🗺️</span><p style={{ fontSize: 14 }}>Sélectionnez un donjon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PERSONNAGE ──────────────────────────────────────────────────────────
function PagePersonnage({ perso }) {
  const [inventaire, setInventaire] = useState([]);
  useEffect(() => {
    supabase.from("inventaires").select("*").eq("compte_id", perso.compte_id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setInventaire(data); });
  }, [perso.compte_id]);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: "#f39c12", margin: "0 0 20px", fontSize: 20 }}>👤 Personnage</h2>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 18 }}>
        <div>
          <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 66, marginBottom: 8 }}>{perso.classe_emoji}</div>
            <h3 style={{ color: "#e6edf3", margin: "0 0 4px", fontSize: 18 }}>{perso.nom}</h3>
            <p style={{ color: CLASSES.find(c => c.id === perso.classe_id)?.couleur || "#f39c12", margin: "0 0 14px", fontWeight: 700 }}>{perso.classe_nom}</p>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
              <Badge texte={`Lv.${perso.niveau}`} couleur="#f39c12" />
              {perso.guilde && <Badge texte={perso.guilde} couleur="#64ffda" />}
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#8892b0", fontSize: 12 }}>Expérience</span>
                <span style={{ color: "#f39c12", fontSize: 12 }}>{perso.xp}/{perso.xp_max}</span>
              </div>
              <Barre val={perso.xp} max={perso.xp_max} couleur="#f39c12" h={7} />
            </div>
          </div>
          <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: 16 }}>
            <h4 style={{ color: "#e6edf3", margin: "0 0 12px", fontSize: 13 }}>📊 Statistiques</h4>
            {[["❤️ PV", `${perso.hp}/${perso.hp_max}`, "#e74c3c"], ["💙 PM", `${perso.mp}/${perso.mp_max}`, "#3498db"], ["⚡ Puissance", (perso.puissance||0).toLocaleString(), "#f39c12"], ["🪙 Or", (perso.or_joueur||0).toLocaleString(), "#f1c40f"], ["💎 Yuanbaos", perso.yuanbao, "#9b59b6"]].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #21262d" }}>
                <span style={{ color: "#8892b0", fontSize: 12 }}>{l}</span>
                <span style={{ color: c, fontSize: 12, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{ color: "#e6edf3", margin: "0 0 14px", fontSize: 15 }}>🎒 Inventaire ({inventaire.length} objets)</h3>
          {inventaire.length === 0 ? (
            <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: 40, textAlign: "center", color: "#8892b0" }}>
              <span style={{ fontSize: 40 }}>🎒</span>
              <p>Votre inventaire est vide.<br />Achetez des objets en boutique ou gagnez des combats !</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {inventaire.map((item, i) => (
                <div key={i} style={{ background: "#161b22", border: `1px solid ${QUALITE_COULEURS[item.item_qualite] || "#21262d"}33`, borderRadius: 10, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 5 }}>{item.item_icon}</div>
                  <div style={{ color: "#e6edf3", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{item.item_nom}</div>
                  <Badge texte={item.item_qualite} couleur={QUALITE_COULEURS[item.item_qualite]} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE BOUTIQUE ────────────────────────────────────────────────────────────
function PageBoutique({ perso, setPerso, setNotif }) {
  const acheter = async (item) => {
    const champ = item.devise;
    const solde = perso[champ] || 0;
    if (solde < item.prix) { setNotif({ msg: `Pas assez de ${champ === "yuanbao" ? "Yuanbaos 💎" : "pièces d'or 🪙"} !`, type: "erreur" }); return; }
    const nouvelleValeur = solde - item.prix;
    await sauvegarder(perso.compte_id, { [champ]: nouvelleValeur });
    await supabase.from("inventaires").insert({ compte_id: perso.compte_id, nom_joueur: perso.nom, item_id: item.id, item_nom: item.nom, item_icon: item.icon, item_qualite: item.qualite });
    setPerso(p => ({ ...p, [champ]: nouvelleValeur }));
    setNotif({ msg: `${item.nom} acheté ! -${item.prix.toLocaleString()} ${champ === "yuanbao" ? "💎" : "🪙"}`, type: "succes" });
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ color: "#f39c12", margin: "0 0 4px", fontSize: 20 }}>🛒 Boutique</h2>
          <p style={{ color: "#8892b0", margin: 0, fontSize: 13 }}>Équipements et consommables</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ background: "#161b22", border: "1px solid #f39c1244", borderRadius: 10, padding: "8px 16px", textAlign: "center" }}>
            <div style={{ color: "#8892b0", fontSize: 10 }}>Or</div>
            <div style={{ color: "#f1c40f", fontSize: 16, fontWeight: 700 }}>{(perso.or_joueur||0).toLocaleString()} 🪙</div>
          </div>
          <div style={{ background: "#161b22", border: "1px solid #9b59b644", borderRadius: 10, padding: "8px 16px", textAlign: "center" }}>
            <div style={{ color: "#8892b0", fontSize: 10 }}>Yuanbaos</div>
            <div style={{ color: "#9b59b6", fontSize: 16, fontWeight: 700 }}>{perso.yuanbao||0} 💎</div>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 13 }}>
        {BOUTIQUE.map(item => {
          const solde = perso[item.devise] || 0;
          const peutAcheter = solde >= item.prix;
          return (
            <div key={item.id} style={{ background: "#161b22", border: `1px solid ${QUALITE_COULEURS[item.qualite]}33`, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 34 }}>{item.icon}</span>
                <Badge texte={item.qualite} couleur={QUALITE_COULEURS[item.qualite]} />
              </div>
              <h4 style={{ color: "#e6edf3", margin: "0 0 4px", fontSize: 13 }}>{item.nom}</h4>
              <p style={{ color: "#8892b0", fontSize: 11, margin: "0 0 12px", flex: 1 }}>{item.desc}</p>
              <button onClick={() => acheter(item)} style={{ width: "100%", padding: "9px", borderRadius: 7, border: "none", cursor: peutAcheter ? "pointer" : "not-allowed", background: peutAcheter ? (item.devise === "yuanbao" ? "linear-gradient(135deg, #9b59b6, #8e44ad)" : "linear-gradient(135deg, #f39c12, #e67e22)") : "#21262d", color: peutAcheter ? (item.devise === "yuanbao" ? "#fff" : "#000") : "#8892b0", fontSize: 12, fontWeight: 700 }}>
                {item.prix.toLocaleString()} {item.devise === "yuanbao" ? "💎" : "🪙"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PAGE CLASSEMENT ──────────────────────────────────────────────────────────
function PageClassement() {
  const [joueurs, setJoueurs] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    supabase.from("personnages").select("nom, classe_emoji, classe_nom, niveau, puissance, guilde")
      .order("puissance", { ascending: false }).limit(50)
      .then(({ data }) => { if (data) setJoueurs(data); setChargement(false); });
    const ch = supabase.channel("classement_live")
      .on("postgres_changes", { event: "*", schema: "public", table: "personnages" }, () => {
        supabase.from("personnages").select("nom, classe_emoji, classe_nom, niveau, puissance, guilde")
          .order("puissance", { ascending: false }).limit(50)
          .then(({ data }) => { if (data) setJoueurs(data); });
      }).subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: "#f39c12", margin: "0 0 4px", fontSize: 20 }}>🏆 Classement Mondial</h2>
      <p style={{ color: "#8892b0", margin: "0 0 20px", fontSize: 13 }}>Temps réel — {joueurs.length} héros enregistrés</p>
      {chargement ? <div style={{ textAlign: "center", color: "#8892b0", padding: 40 }}>⏳ Chargement...</div> : (
        <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "52px 1fr 90px 90px 130px 150px", padding: "10px 18px", background: "#0d1117", borderBottom: "1px solid #21262d" }}>
            {["Rang", "Joueur", "Classe", "Niveau", "Puissance", "Guilde"].map(h => <span key={h} style={{ color: "#8892b0", fontSize: 11, fontWeight: 700 }}>{h}</span>)}
          </div>
          {joueurs.length === 0 && <div style={{ textAlign: "center", color: "#8892b0", padding: 32 }}>Aucun héros encore — soyez le premier !</div>}
          {joueurs.map((j, i) => (
            <div key={j.nom} style={{ display: "grid", gridTemplateColumns: "52px 1fr 90px 90px 130px 150px", padding: "12px 18px", borderBottom: "1px solid #21262d", background: i % 2 ? "#0d111715" : "transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f39c1208"}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 ? "#0d111715" : "transparent"}>
              <span style={{ fontSize: 14, fontWeight: 700, color: i < 3 ? "#f1c40f" : "#8892b0" }}>{i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}</span>
              <span style={{ color: "#e6edf3", fontSize: 13, fontWeight: i < 3 ? 700 : 400 }}>{j.nom}</span>
              <span style={{ color: "#8892b0", fontSize: 12 }}>{j.classe_emoji} {j.classe_nom}</span>
              <span style={{ color: "#64ffda", fontSize: 13 }}>Lv.{j.niveau}</span>
              <span style={{ color: "#f39c12", fontSize: 13, fontWeight: 600 }}>{(j.puissance||0).toLocaleString()}</span>
              <span style={{ color: "#9b59b6", fontSize: 12 }}>{j.guilde ? `⚜️ ${j.guilde}` : "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PAGE GUILDE ──────────────────────────────────────────────────────────────
function PageGuilde({ perso, setPerso, setNotif }) {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: "#f39c12", margin: "0 0 4px", fontSize: 20 }}>⚜️ Guilde</h2>
      <p style={{ color: "#8892b0", margin: "0 0 20px", fontSize: 13 }}>{perso.guilde ? `Membre de : ${perso.guilde}` : "Vous n'appartenez à aucune guilde"}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: "#e6edf3", margin: "0 0 16px", fontSize: 15 }}>⚔️ Événements</h3>
          {[{ nom: "Raid de Donjon", heure: "Aujourd'hui 20h", icon: "🐉" }, { nom: "Guerre de Territoire", heure: "Demain 21h30", icon: "🏰" }, { nom: "Chasse au Trésor", heure: "Sam. 18h", icon: "💰" }].map(a => (
            <div key={a.nom} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #21262d", alignItems: "center" }}>
              <span style={{ fontSize: 24 }}>{a.icon}</span>
              <div style={{ flex: 1 }}><div style={{ color: "#e6edf3", fontSize: 13, fontWeight: 600 }}>{a.nom}</div></div>
              <Badge texte={a.heure} couleur="#64ffda" />
            </div>
          ))}
        </div>
        <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: "#e6edf3", margin: "0 0 16px", fontSize: 15 }}>🏰 Rejoindre une Guilde</h3>
          {["Gardiens Célestes", "Mages de l'Aube", "Flèches d'Argent", "Ordre du Soleil"].map(g => (
            <div key={g} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #21262d" }}>
              <span style={{ color: "#e6edf3", fontSize: 13 }}>⚜️ {g}</span>
              <button onClick={async () => { await sauvegarder(perso.compte_id, { guilde: g }); setPerso(p => ({ ...p, guilde: g })); setNotif({ msg: `Vous avez rejoint ${g} !`, type: "succes" }); }} style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid #f39c1244", background: "#f39c1211", color: "#f39c12", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Rejoindre</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────────
export default function App() {
  const [compte, setCompte] = useState(null);
  const [perso, setPerso] = useState(null);
  const [sousPage, setSousPage] = useState("village");
  const [chargement, setChargement] = useState(true);
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("elf_session");
    if (saved) {
      try {
        const c = JSON.parse(saved);
        setCompte(c);
        supabase.from("personnages").select("*").eq("compte_id", c.id).single()
          .then(({ data }) => { if (data) setPerso(data); setChargement(false); });
      } catch { setChargement(false); }
    } else { setChargement(false); }
  }, []);

  const deconnecter = () => { localStorage.removeItem("elf_session"); setCompte(null); setPerso(null); };

  if (chargement) return (
    <div style={{ minHeight: "100vh", background: "#060612", display: "flex", alignItems: "center", justifyContent: "center", color: "#f39c12", fontSize: 18, fontFamily: "Georgia, serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 60, marginBottom: 16 }}>⚔️🔮</div><p>Chargement du Royaume...</p></div>
    </div>
  );

  if (!compte) return <PageConnexion onConnecte={c => { setCompte(c); supabase.from("personnages").select("*").eq("compte_id", c.id).single().then(({ data }) => { if (data) setPerso(data); }); }} />;
  if (!perso) return <PageChoixPersonnage compte={compte} onPersonnage={p => setPerso(p)} />;

  const pages = {
    village: <PageVillage perso={perso} setPerso={setPerso} setNotif={setNotif} />,
    donjon: <PageDonjon perso={perso} setPerso={setPerso} />,
    personnage: <PagePersonnage perso={perso} />,
    boutique: <PageBoutique perso={perso} setPerso={setPerso} setNotif={setNotif} />,
    classement: <PageClassement />,
    guilde: <PageGuilde perso={perso} setPerso={setPerso} setNotif={setNotif} />,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060612", color: "#e6edf3", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {notif && <Notif texte={notif.msg} type={notif.type} onFin={() => setNotif(null)} />}
      <NavBar perso={perso} sousPage={sousPage} setSousPage={setSousPage} onDeconnexion={deconnecter} />
      <StatBar perso={perso} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 0 48px" }}>
        {pages[sousPage] || <PageVillage perso={perso} setPerso={setPerso} setNotif={setNotif} />}
      </div>
    </div>
  );
}
