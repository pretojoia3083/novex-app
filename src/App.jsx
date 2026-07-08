import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Search, Droplets, X, Check, Sparkles, ArrowUpDown, Info, ChevronDown, TrendingUp, Wallet } from "lucide-react";

/* ---------------------------------------------------------
   NOVEX brand mark — hexagonal ribbon wrapping a liquidity drop
--------------------------------------------------------- */
function NovexMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="novexGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5B2EFF" />
          <stop offset="0.55" stopColor="#3D1FB0" />
          <stop offset="1" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      <path
        d="M24 3 L43 14 V34 L24 45 L5 34 V14 Z"
        stroke="url(#novexGrad)"
        strokeWidth="3.2"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M24 15 C24 15 32 24.5 32 30.5 C32 35.2 28.4 39 24 39 C19.6 39 16 35.2 16 30.5 C16 24.5 24 15 24 15 Z"
        fill="url(#novexGrad)"
      />
    </svg>
  );
}

/* ---------------------------------------------------------
   Token metadata (letter avatar colors, approximated)
--------------------------------------------------------- */
const TOKEN_COLORS = {
  ETH: "#627EEA", USDT: "#26A17B", POL: "#8247E5", BTC: "#F7931A",
  USDC: "#2775CA", WBTC: "#F7931A", ARB: "#28A0F0", OP: "#FF0420",
  SOL: "#14F195", AVAX: "#E84142", LINK: "#2A5ADA", UNI: "#FF3399",
  AAVE: "#B6509E", MKR: "#1AAB9B", LDO: "#F69988", PEPE: "#4CAF50",
  DOGE: "#C2A633", SUI: "#6FBCF0", APT: "#00D2FF", INJ: "#00B2FF",
  RNDR: "#7B4FFF", NEAR: "#00C08B", ATOM: "#2E3148", TIA: "#7C3AED",
  SEI: "#8B2FE0", WLD: "#E0E0E0", FTM: "#1969FF",
};

const PAIRS_RAW = [
  ["ETH","USDT",0.05, 68_400_000, 22_100_000, 6.4],
  ["POL","USDT",0.30,  9_200_000,  4_800_000, 18.7],
  ["BTC","USDT",0.05, 91_600_000, 31_400_000, 5.1],
  ["ETH","USDC",0.01, 54_300_000, 40_200_000, 3.2],
  ["WBTC","ETH",0.05, 22_800_000,  6_100_000, 4.9],
  ["ARB","USDT",0.30,  6_100_000,  2_900_000, 21.3],
  ["OP","USDT",0.30,   5_400_000,  2_300_000, 19.8],
  ["SOL","USDT",0.05, 33_700_000, 15_600_000, 9.6],
  ["AVAX","USDT",0.30, 7_800_000,  3_100_000, 16.2],
  ["LINK","USDT",0.30, 8_900_000,  3_600_000, 14.4],
  ["UNI","USDT",0.30,  6_700_000,  2_400_000, 15.9],
  ["AAVE","USDT",0.30, 5_100_000,  1_900_000, 17.1],
  ["MKR","USDT",0.30,  4_300_000,  1_200_000, 12.8],
  ["LDO","USDT",0.30,  3_600_000,  1_500_000, 20.4],
  ["PEPE","USDT",1.00, 11_200_000, 18_900_000, 42.6],
  ["DOGE","USDT",0.30, 9_800_000,  6_700_000, 13.5],
  ["SUI","USDT",0.30,  4_900_000,  2_600_000, 22.7],
  ["APT","USDT",0.30,  4_100_000,  2_000_000, 19.1],
  ["INJ","USDT",0.30,  3_200_000,  1_400_000, 23.9],
  ["RNDR","USDT",0.30, 2_800_000,  1_600_000, 25.3],
  ["NEAR","USDT",0.30, 3_900_000,  1_800_000, 16.6],
  ["ATOM","USDT",0.30, 4_600_000,  1_700_000, 11.9],
  ["TIA","USDT",0.30,  2_500_000,  1_300_000, 27.8],
  ["SEI","USDT",1.00,  1_900_000,  2_200_000, 31.4],
  ["WLD","USDT",1.00,  2_100_000,  2_800_000, 29.5],
  ["FTM","USDT",0.30,  2_300_000,  1_100_000, 18.9],
];

const PAIRS = PAIRS_RAW.map(([base, quote, fee, tvl, vol, apr], i) => ({
  id: `${base}-${quote}-${fee}`,
  base, quote, fee, tvl, vol, apr,
  idx: i,
}));

const maxTVL = Math.max(...PAIRS.map(p => p.tvl));

function fmtUSD(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

/* ---------------------------------------------------------
   Simulated pricing + earnings engine
   (reference prices only, used to size demo positions —
    not live market data)
--------------------------------------------------------- */
const TOKEN_PRICES = {
  ETH: 3400, USDT: 1, POL: 0.45, BTC: 62000, USDC: 1, WBTC: 62000,
  ARB: 0.55, OP: 1.6, SOL: 145, AVAX: 26, LINK: 14, UNI: 7.2,
  AAVE: 95, MKR: 1750, LDO: 1.1, PEPE: 0.0000105, DOGE: 0.11,
  SUI: 2.9, APT: 6.4, INJ: 19, RNDR: 5.2, NEAR: 4.1, ATOM: 6.8,
  TIA: 5.6, SEI: 0.32, WLD: 1.9, FTM: 0.55,
};
const DEFAULT_POSITION_USD = 1000;
// Demo time acceleration: makes APR yield visible in seconds instead of months.
const YIELD_ACCEL = 3000;
const YEAR_SECONDS = 365 * 24 * 3600;

function depositValueUSD(pool, config) {
  const a = parseFloat(config.amountBase) || 0;
  const b = parseFloat(config.amountQuote) || 0;
  const value = a * (TOKEN_PRICES[pool.base] || 0) + b * (TOKEN_PRICES[pool.quote] || 0);
  return value > 0 ? value : DEFAULT_POSITION_USD;
}

function earnedSince(pos, nowMs) {
  const elapsedSec = Math.max(0, (nowMs - pos.lastCollectAt) / 1000);
  return pos.depositUSD * (pos.pool.apr / 100) * (elapsedSec * YIELD_ACCEL) / YEAR_SECONDS;
}

function fmtMoney(n) {
  if (n >= 1) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(4)}`;
}

function TokenAvatar({ symbol, size = 26 }) {
  const color = TOKEN_COLORS[symbol] || "#5B7A99";
  return (
    <div
      className="token-avatar"
      style={{
        width: size, height: size, fontSize: size * 0.42,
        background: `linear-gradient(160deg, ${color}, ${color}99)`,
      }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}

function PairIcons({ base, quote }) {
  return (
    <div className="pair-icons">
      <TokenAvatar symbol={base} />
      <div style={{ marginLeft: -10, zIndex: 1 }}>
        <TokenAvatar symbol={quote} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Pool Card
--------------------------------------------------------- */
function PoolCard({ pool, selectionMode, selected, disabled, onOpen, onToggleSelect }) {
  const depthPct = Math.max(8, Math.round((pool.tvl / maxTVL) * 100));
  return (
    <div
      className={`pool-card ${selected ? "pool-card--selected" : ""} ${disabled ? "pool-card--disabled" : ""}`}
      onClick={() => (selectionMode ? !disabled && onToggleSelect(pool.id) : onOpen(pool))}
    >
      <div className="pool-card__top">
        <PairIcons base={pool.base} quote={pool.quote} />
        <div className="pool-card__title">
          <span className="pool-card__pair">{pool.base}/{pool.quote}</span>
          <span className="fee-badge">{pool.fee.toFixed(2)}%</span>
        </div>
        {selectionMode && (
          <div className={`select-check ${selected ? "select-check--on" : ""}`}>
            {selected && <Check size={13} strokeWidth={3} />}
          </div>
        )}
      </div>

      <div className="pool-card__stats">
        <div className="stat">
          <span className="stat__label">TVL</span>
          <span className="stat__value">{fmtUSD(pool.tvl)}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Vol. 24h</span>
          <span className="stat__value">{fmtUSD(pool.vol)}</span>
        </div>
        <div className="stat">
          <span className="stat__label">APR est.</span>
          <span className="stat__value stat__value--apr">{pool.apr.toFixed(1)}%</span>
        </div>
      </div>

      <div className="depth-bar" title={`Profundidade relativa: ${depthPct}%`}>
        <div className="depth-fill" style={{ width: `${depthPct}%` }} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Liquidity configurator (used in drawer + modal)
--------------------------------------------------------- */
function LiquidityConfigurator({ pool, config, onChange }) {
  const { rangeMode, min, max, amountBase, amountQuote } = config;

  const effectiveApr = pool.apr * (rangeMode === "narrow" ? 1.8 : rangeMode === "wide" ? 1.1 : 1);
  const depositUSD = depositValueUSD(pool, config);
  const usingDefaultDeposit = !((parseFloat(amountBase) || 0) > 0 || (parseFloat(amountQuote) || 0) > 0);
  const dailyRate = effectiveApr / 100 / 365;
  const projDay = depositUSD * dailyRate;
  const projWeek = projDay * 7;
  const projMonth = projDay * 30;

  const setRangeMode = (mode) => {
    const presets = {
      full: { min: 0, max: 999999 },
      wide: { min: -35, max: 35 },
      narrow: { min: -8, max: 8 },
    };
    onChange({ ...config, rangeMode: mode, ...presets[mode] });
  };

  return (
    <div className="configurator">
      <div className="config-section">
        <div className="config-label-row">
          <span className="config-label">Faixa de preço</span>
          <span className="config-hint"><Info size={12} /> concentrated liquidity</span>
        </div>
        <div className="range-presets">
          {[
            ["narrow", "Estreita"],
            ["wide", "Ampla"],
            ["full", "Faixa total"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`preset-btn ${rangeMode === key ? "preset-btn--on" : ""}`}
              onClick={() => setRangeMode(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {rangeMode !== "full" && (
          <div className="range-inputs">
            <div className="range-input">
              <span>Mín.</span>
              <input
                type="number"
                value={min}
                onChange={(e) => onChange({ ...config, min: Number(e.target.value) })}
              />
              <span className="range-unit">%</span>
            </div>
            <ArrowUpDown size={14} color="#5C7A99" />
            <div className="range-input">
              <span>Máx.</span>
              <input
                type="number"
                value={max}
                onChange={(e) => onChange({ ...config, max: Number(e.target.value) })}
              />
              <span className="range-unit">%</span>
            </div>
          </div>
        )}
      </div>

      <div className="config-section">
        <span className="config-label">Depositar</span>
        <div className="amount-row">
          <TokenAvatar symbol={pool.base} size={22} />
          <input
            type="number"
            placeholder="0.0"
            value={amountBase}
            onChange={(e) => onChange({ ...config, amountBase: e.target.value })}
          />
          <span className="amount-symbol">{pool.base}</span>
        </div>
        <div className="amount-row">
          <TokenAvatar symbol={pool.quote} size={22} />
          <input
            type="number"
            placeholder="0.0"
            value={amountQuote}
            onChange={(e) => onChange({ ...config, amountQuote: e.target.value })}
          />
          <span className="amount-symbol">{pool.quote}</span>
        </div>
      </div>

      <div className="apr-preview">
        <Sparkles size={14} color="#F2A93B" />
        <span>APR estimado nesta faixa: <b>{effectiveApr.toFixed(1)}%</b></span>
      </div>

      <div className="config-section">
        <div className="config-label-row">
          <span className="config-label">Projeção de rendimento</span>
          {usingDefaultDeposit && (
            <span className="config-hint">baseado em {fmtMoney(depositUSD)}</span>
          )}
        </div>
        <div className="projection-row">
          <div className="projection-card">
            <span className="projection-card__label">Dia</span>
            <span className="projection-card__value">{fmtMoney(projDay)}</span>
          </div>
          <div className="projection-card">
            <span className="projection-card__label">Semana</span>
            <span className="projection-card__value">{fmtMoney(projWeek)}</span>
          </div>
          <div className="projection-card">
            <span className="projection-card__label">Mês</span>
            <span className="projection-card__value">{fmtMoney(projMonth)}</span>
          </div>
        </div>
        {usingDefaultDeposit && (
          <span className="projection-note">Preencha os valores de depósito acima para personalizar essa estimativa.</span>
        )}
      </div>
    </div>
  );
}

const DEFAULT_CONFIG = { rangeMode: "wide", min: -35, max: 35, amountBase: "", amountQuote: "" };

/* ---------------------------------------------------------
   Main App
--------------------------------------------------------- */
export default function NovexApp() {
  const [query, setQuery] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [drawerPool, setDrawerPool] = useState(null);
  const [drawerConfig, setDrawerConfig] = useState(DEFAULT_CONFIG);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfigs, setModalConfigs] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [positions, setPositions] = useState([]);
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [connecting, setConnecting] = useState(null);

  useEffect(() => {
    if (positions.length === 0) return;
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [positions.length]);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return PAIRS;
    return PAIRS.filter(p => `${p.base}/${p.quote}`.includes(q) || p.base.includes(q) || p.quote.includes(q));
  }, [query]);

  const totalTVL = useMemo(() => PAIRS.reduce((a, p) => a + p.tvl, 0), []);
  const totalVol = useMemo(() => PAIRS.reduce((a, p) => a + p.vol, 0), []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }, []);

  const connectWallet = async (kind) => {
    const provider = kind === "metamask" ? window.ethereum : window.BinanceChain;
    if (!provider) {
      showToast(kind === "metamask" ? "MetaMask não detectada neste navegador." : "Binance Wallet não detectada neste navegador.");
      return;
    }
    try {
      setConnecting(kind);
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      let balanceEth = null;
      try {
        const balHex = await provider.request({ method: "eth_getBalance", params: [address, "latest"] });
        balanceEth = parseInt(balHex, 16) / 1e18;
      } catch (_) { /* balance optional */ }
      setConnectedWallet({ kind, address, balance: balanceEth });
      setWalletModalOpen(false);
      showToast(`Carteira conectada: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (err) {
      showToast("Conexão recusada ou falhou. Tente novamente.");
    } finally {
      setConnecting(null);
    }
  };

  const disconnectWallet = () => {
    setConnectedWallet(null);
    showToast("Carteira desconectada");
  };

  const toggleSelectionMode = () => {
    setSelectionMode((v) => !v);
    setSelectedIds([]);
  };

  const toggleSelect = (id) => {
    setSelectedIds((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 2) return cur;
      return [...cur, id];
    });
  };

  const selectedPools = selectedIds.map((id) => PAIRS.find((p) => p.id === id));

  const totalLiveEarned = useMemo(
    () => positions.reduce((acc, pos) => acc + earnedSince(pos, now), 0),
    [positions, now]
  );
  const totalCollected = useMemo(
    () => positions.reduce((acc, pos) => acc + pos.collectedTotal, 0),
    [positions]
  );

  const openConfigureModal = () => {
    const cfgs = {};
    selectedPools.forEach((p) => { cfgs[p.id] = { ...DEFAULT_CONFIG }; });
    setModalConfigs(cfgs);
    setActiveTab(0);
    setModalOpen(true);
  };

  const confirmModalPositions = () => {
    const now = Date.now();
    const newPositions = selectedPools.map((p) => {
      const cfg = modalConfigs[p.id];
      return {
        id: `${p.id}-${now}-${Math.random().toString(16).slice(2, 6)}`,
        pool: p,
        config: cfg,
        depositUSD: depositValueUSD(p, cfg),
        createdAt: now,
        lastCollectAt: now,
        collectedTotal: 0,
      };
    });
    setPositions((cur) => [...newPositions, ...cur]);
    setModalOpen(false);
    setSelectionMode(false);
    setSelectedIds([]);
    showToast(`${newPositions.length} posição(ões) simulada(s) criada(s) com sucesso`);
  };

  const confirmDrawerPosition = () => {
    const now = Date.now();
    setPositions((cur) => [{
      id: `${drawerPool.id}-${now}`,
      pool: drawerPool,
      config: drawerConfig,
      depositUSD: depositValueUSD(drawerPool, drawerConfig),
      createdAt: now,
      lastCollectAt: now,
      collectedTotal: 0,
    }, ...cur]);
    showToast(`Posição simulada em ${drawerPool.base}/${drawerPool.quote} criada`);
    setDrawerPool(null);
    setDrawerConfig(DEFAULT_CONFIG);
  };

  const collectPosition = (posId) => {
    if (!connectedWallet) {
      setWalletModalOpen(true);
      showToast("Conecte sua carteira para coletar os rendimentos");
      return;
    }
    const now2 = Date.now();
    let collectedAmount = 0;
    setPositions((cur) => cur.map((pos) => {
      if (pos.id !== posId) return pos;
      const earned = earnedSince(pos, now2);
      collectedAmount = earned;
      return { ...pos, collectedTotal: pos.collectedTotal + earned, lastCollectAt: now2 };
    }));
    showToast(`Você coletou ${fmtMoney(collectedAmount)} em ${connectedWallet.address.slice(0, 6)}...${connectedWallet.address.slice(-4)}`);
  };

  return (
    <div className="novex-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        .novex-root {
          --bg: #0D0F1C;
          --surface: #171A33;
          --surface2: #1E1B4B;
          --surface3: #262357;
          --border: #322C6B;
          --teal: #5B2EFF;
          --teal-dim: #3D1FB0;
          --amber: #00D4FF;
          --coral: #EF6461;
          --mint: #7CFFEA;
          --text: #EDEEFB;
          --muted: #8B8FBF;
          --muted2: #565A94;
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          position: relative;
          padding-bottom: 80px;
          overflow-x: hidden;
        }
        .novex-root * { box-sizing: border-box; }
        .mono { font-family: 'JetBrains Mono', monospace; }

        /* ---------------- Topbar ---------------- */
        .topbar {
          position: sticky; top: 0; z-index: 45; background: rgba(10,20,32,0.85); backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border); padding: 12px 32px; display: flex; align-items: center;
          justify-content: space-between;
        }
        .topbar__brand { display: flex; align-items: center; gap: 8px; }
        .brand-mark--sm { width: 24px; height: 24px; border-radius: 7px; }
        .brand-name--sm { font-size: 14px; }
        .wallet-connect-btn {
          background: linear-gradient(150deg, var(--teal), var(--teal-dim)); border: none; color: #FFFFFF;
          font-weight: 600; font-size: 12.5px; padding: 9px 16px; border-radius: 9px; cursor: pointer;
          display: flex; align-items: center; gap: 7px;
        }
        .wallet-chip {
          background: var(--surface2); border: 1px solid var(--teal-dim); color: var(--text);
          font-size: 12.5px; padding: 8px 14px; border-radius: 9px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
          display: flex; align-items: center; gap: 8px;
        }
        .wallet-chip:hover { border-color: var(--coral); }
        .wallet-chip__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--teal); flex-shrink: 0; }
        .wallet-chip__balance { color: var(--muted); font-size: 11px; margin-left: 4px; }

        /* ---------------- Wallet modal ---------------- */
        .modal--narrow { width: 380px; }
        .wallet-modal__hint { font-size: 12.5px; color: var(--muted); line-height: 1.5; margin-bottom: 18px; }
        .wallet-options { display: flex; flex-direction: column; gap: 10px; }
        .wallet-option {
          display: flex; align-items: center; gap: 12px; background: var(--surface2); border: 1px solid var(--border);
          border-radius: 12px; padding: 12px 14px; cursor: pointer; text-align: left; transition: 0.15s;
        }
        .wallet-option:hover:not(:disabled) { border-color: var(--teal-dim); background: var(--surface3); }
        .wallet-option:disabled { opacity: 0.6; cursor: wait; }
        .wallet-option__icon {
          width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center;
          color: #0A1420; font-weight: 700; font-family: 'Exo 2', sans-serif; flex-shrink: 0;
        }
        .wallet-option__info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .wallet-option__name { font-size: 14px; font-weight: 600; }
        .wallet-option__status { font-size: 11px; color: var(--muted); }
        .wallet-option__spinner {
          width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--border);
          border-top-color: var(--teal); animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .wallet-modal__footnote { font-size: 11px; color: var(--muted2); line-height: 1.5; margin-top: 16px; }

        /* ---------------- Hero ---------------- */
        .hero {
          position: relative;
          padding: 40px 32px 64px;
          overflow: hidden;
          border-bottom: 1px solid var(--border);
        }
        .hero__wave-wrap {
          position: absolute; inset: 0; opacity: 0.35; pointer-events: none;
        }
        .hero__wave {
          position: absolute; bottom: -20px; left: 0; width: 200%; height: 140px;
          animation: drift 14s linear infinite;
        }
        .hero__wave--slow { animation-duration: 22s; opacity: 0.6; bottom: -35px; }
        @keyframes drift {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hero__content { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }
        .brand-row { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .brand-mark {
          width: 34px; height: 34px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .brand-name {
          font-family: 'Exo 2', sans-serif; font-weight: 700; font-size: 21px; letter-spacing: -0.02em;
        }
        .brand-tag {
          font-size: 11px; color: var(--muted); border: 1px solid var(--border); padding: 2px 8px;
          border-radius: 20px; margin-left: 4px; letter-spacing: 0.03em;
        }
        .hero__headline {
          font-family: 'Exo 2', sans-serif; font-weight: 600; font-size: 34px;
          line-height: 1.15; max-width: 620px; letter-spacing: -0.01em; margin: 0 0 12px;
        }
        .hero__sub { color: var(--muted); font-size: 15px; max-width: 520px; margin-bottom: 30px; }
        .hero__stats { display: flex; gap: 36px; flex-wrap: wrap; }
        .hstat__label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
        .hstat__value { font-family: 'Exo 2', sans-serif; font-size: 26px; font-weight: 600; margin-top: 4px; }
        .hstat__value--teal { color: var(--teal); }

        /* ---------------- Toolbar ---------------- */
        .toolbar {
          max-width: 1100px; margin: 28px auto 0; padding: 0 32px;
          display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap;
        }
        .search-box {
          flex: 1; min-width: 220px; display: flex; align-items: center; gap: 8px;
          background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
          padding: 10px 14px;
        }
        .search-box input {
          background: none; border: none; outline: none; color: var(--text); font-size: 14px; width: 100%;
        }
        .search-box input::placeholder { color: var(--muted2); }
        .select-toggle {
          background: var(--surface); border: 1px solid var(--border); color: var(--text);
          padding: 10px 16px; border-radius: 10px; font-size: 13px; cursor: pointer;
          display: flex; align-items: center; gap: 8px; font-weight: 500; transition: 0.15s;
        }
        .select-toggle:hover { border-color: var(--teal-dim); }
        .select-toggle--on { background: rgba(45,212,191,0.12); border-color: var(--teal); color: var(--teal); }

        /* ---------------- Grid ---------------- */
        .grid-wrap { max-width: 1100px; margin: 22px auto 0; padding: 0 32px; }
        .pool-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 14px;
        }
        .pool-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
          padding: 16px; cursor: pointer; transition: transform 0.15s, border-color 0.15s, background 0.15s;
          position: relative;
        }
        .pool-card:hover { transform: translateY(-2px); border-color: var(--teal-dim); background: var(--surface2); }
        .pool-card--selected { border-color: var(--teal); background: rgba(45,212,191,0.07); }
        .pool-card--disabled { opacity: 0.4; cursor: not-allowed; }
        .pool-card--disabled:hover { transform: none; border-color: var(--border); background: var(--surface); }
        .pool-card__top { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .pair-icons { display: flex; align-items: center; }
        .token-avatar {
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: #0A1420; border: 2px solid var(--surface);
        }
        .pool-card__title { display: flex; flex-direction: column; gap: 3px; flex: 1; }
        .pool-card__pair { font-family: 'Exo 2', sans-serif; font-weight: 600; font-size: 15px; }
        .fee-badge {
          font-size: 10px; color: var(--muted); background: var(--surface3); width: fit-content;
          padding: 2px 7px; border-radius: 20px; font-family: 'JetBrains Mono', monospace;
        }
        .select-check {
          width: 20px; height: 20px; border-radius: 6px; border: 1.5px solid var(--muted2);
          display: flex; align-items: center; justify-content: center; color: var(--bg); flex-shrink: 0;
        }
        .select-check--on { background: var(--teal); border-color: var(--teal); }
        .pool-card__stats { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .stat { display: flex; flex-direction: column; gap: 3px; }
        .stat__label { font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .stat__value { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500; }
        .stat__value--apr { color: var(--amber); }
        .depth-bar {
          height: 5px; border-radius: 4px; background: var(--surface3); overflow: hidden; position: relative;
        }
        .depth-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, var(--teal-dim), var(--teal));
          transition: width 0.3s;
        }

        /* ---------------- Floating select bar ---------------- */
        .float-bar {
          position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%);
          background: var(--surface2); border: 1px solid var(--teal-dim); border-radius: 14px;
          padding: 12px 14px 12px 20px; display: flex; align-items: center; gap: 18px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.45); z-index: 40; animation: rise 0.25s ease;
        }
        @keyframes rise { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .float-bar__text { font-size: 13px; color: var(--muted); }
        .float-bar__text b { color: var(--text); }
        .btn-primary {
          background: linear-gradient(150deg, var(--teal), var(--teal-dim)); border: none; color: #FFFFFF;
          font-weight: 600; font-size: 13.5px; padding: 10px 18px; border-radius: 10px; cursor: pointer;
        }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-ghost {
          background: none; border: 1px solid var(--border); color: var(--muted); padding: 10px 14px;
          border-radius: 10px; cursor: pointer; font-size: 13px;
        }

        /* ---------------- Drawer & Modal ---------------- */
        .overlay {
          position: fixed; inset: 0; background: rgba(6,12,20,0.6); backdrop-filter: blur(2px);
          z-index: 50; display: flex; justify-content: flex-end;
          animation: fadeIn 0.2s ease;
        }
        .overlay--center { justify-content: center; align-items: center; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .drawer {
          width: 380px; max-width: 92vw; height: 100%; background: var(--surface);
          border-left: 1px solid var(--border); padding: 24px; overflow-y: auto;
          animation: slideIn 0.25s ease;
        }
        @keyframes slideIn { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .modal {
          width: 460px; max-width: 92vw; max-height: 86vh; background: var(--surface);
          border: 1px solid var(--border); border-radius: 16px; padding: 22px; overflow-y: auto;
          animation: pop 0.2s ease;
        }
        @keyframes pop { from { transform: scale(0.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .panel-title { font-family: 'Exo 2', sans-serif; font-size: 17px; font-weight: 600; }
        .icon-btn { background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px; }
        .icon-btn:hover { color: var(--text); }
        .pool-summary-row { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }

        .tabs { display: flex; gap: 6px; margin-bottom: 18px; }
        .tab-btn {
          flex: 1; background: var(--surface2); border: 1px solid var(--border); color: var(--muted);
          padding: 8px; border-radius: 9px; cursor: pointer; font-size: 12.5px; display: flex;
          align-items: center; justify-content: center; gap: 6px;
        }
        .tab-btn--on { border-color: var(--teal); color: var(--teal); background: rgba(45,212,191,0.08); }

        .configurator { display: flex; flex-direction: column; gap: 18px; }
        .config-section { display: flex; flex-direction: column; gap: 10px; }
        .config-label-row { display: flex; align-items: center; justify-content: space-between; }
        .config-label { font-size: 12.5px; color: var(--muted); font-weight: 500; }
        .config-hint { font-size: 10.5px; color: var(--muted2); display: flex; align-items: center; gap: 4px; }
        .range-presets { display: flex; gap: 8px; }
        .preset-btn {
          flex: 1; background: var(--surface2); border: 1px solid var(--border); color: var(--muted);
          padding: 8px; border-radius: 8px; cursor: pointer; font-size: 12px;
        }
        .preset-btn--on { border-color: var(--amber); color: var(--amber); background: rgba(242,169,59,0.08); }
        .range-inputs { display: flex; align-items: center; gap: 10px; }
        .range-input {
          flex: 1; display: flex; align-items: center; gap: 6px; background: var(--surface2);
          border: 1px solid var(--border); border-radius: 9px; padding: 8px 10px;
        }
        .range-input span { font-size: 11px; color: var(--muted); }
        .range-input input {
          background: none; border: none; outline: none; color: var(--text); font-family: 'JetBrains Mono', monospace;
          width: 100%; font-size: 13px;
        }
        .range-unit { color: var(--muted) !important; }
        .amount-row {
          display: flex; align-items: center; gap: 10px; background: var(--surface2);
          border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; margin-bottom: 8px;
        }
        .amount-row input {
          flex: 1; background: none; border: none; outline: none; color: var(--text);
          font-family: 'JetBrains Mono', monospace; font-size: 14px;
        }
        .amount-symbol { font-size: 12.5px; color: var(--muted); font-weight: 500; }
        .apr-preview {
          display: flex; align-items: center; gap: 8px; background: rgba(242,169,59,0.08);
          border: 1px solid rgba(242,169,59,0.25); border-radius: 10px; padding: 10px 12px; font-size: 12.5px;
          color: var(--muted);
        }
        .apr-preview b { color: var(--amber); }
        .projection-row { display: flex; gap: 8px; }
        .projection-card {
          flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px;
          padding: 10px; display: flex; flex-direction: column; gap: 4px; align-items: center;
        }
        .projection-card__label {
          font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em;
        }
        .projection-card__value {
          font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; color: var(--teal);
        }
        .projection-note { font-size: 10.5px; color: var(--muted2); line-height: 1.4; }

        .modal-footer { display: flex; gap: 10px; margin-top: 20px; }
        .modal-footer .btn-primary, .modal-footer .btn-ghost { flex: 1; }

        /* ---------------- Positions ---------------- */
        .positions-wrap { max-width: 1100px; margin: 42px auto 0; padding: 0 32px; }
        .section-title-row {
          display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 14px;
          margin-bottom: 14px;
        }
        .section-title {
          font-family: 'Exo 2', sans-serif; font-size: 16px; font-weight: 600;
          display: flex; align-items: center; gap: 8px;
        }
        .earn-summary { display: flex; gap: 22px; }
        .earn-summary__item { display: flex; flex-direction: column; gap: 3px; align-items: flex-end; }
        .earn-summary__value { font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 500; }
        .earn-summary__value--live { color: var(--mint); }
        .empty-state {
          border: 1px dashed var(--border); border-radius: 14px; padding: 34px; text-align: center;
          color: var(--muted); font-size: 13.5px;
        }
        .position-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
          padding: 14px 16px; display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 10px;
        }
        .position-left { display: flex; align-items: center; gap: 12px; }
        .position-pair { font-family: 'Exo 2', sans-serif; font-weight: 600; font-size: 14px; }
        .position-range { font-size: 11.5px; color: var(--muted); margin-top: 2px; }
        .position-badge {
          font-size: 10.5px; background: rgba(45,212,191,0.12); color: var(--teal);
          padding: 3px 9px; border-radius: 20px; font-weight: 500;
        }
        .position-right { display: flex; align-items: center; gap: 16px; }
        .earn-block { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .earn-block__label {
          font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.03em;
          display: flex; align-items: center; gap: 4px;
        }
        .earn-block__value {
          font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; color: var(--mint);
        }
        .earn-block__collected { font-size: 10px; color: var(--muted2); font-family: 'JetBrains Mono', monospace; }
        .btn-collect {
          background: var(--surface3); border: 1px solid var(--teal-dim); color: var(--teal);
          padding: 8px 14px; border-radius: 9px; font-size: 12.5px; font-weight: 500; cursor: pointer;
          display: flex; align-items: center; gap: 6px; white-space: nowrap; transition: 0.15s;
        }
        .btn-collect:hover:not(:disabled) { background: rgba(45,212,191,0.15); }
        .btn-collect:disabled { opacity: 0.35; cursor: not-allowed; }

        /* ---------------- Toast ---------------- */
        .toast {
          position: fixed; top: 22px; left: 50%; transform: translateX(-50%);
          background: var(--surface2); border: 1px solid var(--teal); color: var(--text);
          padding: 12px 20px; border-radius: 10px; font-size: 13px; z-index: 60;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 8px;
          animation: rise 0.25s ease;
        }

        @media (max-width: 640px) {
          .hero { padding: 28px 18px 48px; }
          .hero__headline { font-size: 26px; }
          .toolbar, .grid-wrap, .positions-wrap { padding: 0 18px; }
        }
      `}</style>

      {/* ---------- TOPBAR ---------- */}
      <div className="topbar">
        <div className="topbar__brand">
          <div className="brand-mark brand-mark--sm"><NovexMark size={15} /></div>
          <span className="brand-name brand-name--sm">NOVEX</span>
        </div>
        {connectedWallet ? (
          <button className="wallet-chip" onClick={disconnectWallet} title="Clique para desconectar">
            <span className="wallet-chip__dot" />
            {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}
            {connectedWallet.balance !== null && (
              <span className="wallet-chip__balance mono">{connectedWallet.balance.toFixed(3)} ETH</span>
            )}
          </button>
        ) : (
          <button className="wallet-connect-btn" onClick={() => setWalletModalOpen(true)}>
            <Wallet size={14} /> Conectar carteira
          </button>
        )}
      </div>

      {/* ---------- HERO ---------- */}
      <div className="hero">
        <div className="hero__wave-wrap">
          <svg className="hero__wave hero__wave--slow" viewBox="0 0 1600 200" preserveAspectRatio="none">
            <path d="M0,120 C200,180 400,60 600,110 C800,160 1000,40 1200,100 C1400,150 1500,90 1600,120 L1600,200 L0,200 Z" fill="#16243A" />
          </svg>
          <svg className="hero__wave" viewBox="0 0 1600 200" preserveAspectRatio="none">
            <path d="M0,140 C220,90 380,170 600,130 C820,90 980,170 1200,130 C1380,100 1500,140 1600,120 L1600,200 L0,200 Z" fill="#1C8A7C" opacity="0.5" />
          </svg>
        </div>
        <div className="hero__content">
          <div className="brand-row">
            <div className="brand-mark"><NovexMark size={19} /></div>
            <span className="brand-name">NOVEX</span>
            <span className="brand-tag">protocolo de liquidez · dados simulados</span>
          </div>
          <h1 className="hero__headline">Conecte. Forneça liquidez. Ganhe recompensas.</h1>
          <p className="hero__sub">Explore {PAIRS.length} pares no estilo Uniswap V3. Nenhuma carteira é conectada e nenhum fundo real é movimentado — tudo aqui é simulação para validar o produto.</p>
          <div className="hero__stats">
            <div>
              <div className="hstat__label">TVL total (simulado)</div>
              <div className="hstat__value hstat__value--teal">{fmtUSD(totalTVL)}</div>
            </div>
            <div>
              <div className="hstat__label">Volume 24h</div>
              <div className="hstat__value">{fmtUSD(totalVol)}</div>
            </div>
            <div>
              <div className="hstat__label">Pares disponíveis</div>
              <div className="hstat__value">{PAIRS.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- TOOLBAR ---------- */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} color="#7189A6" />
          <input
            placeholder="Buscar par (ex: ETH, SOL, USDT...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className={`select-toggle ${selectionMode ? "select-toggle--on" : ""}`} onClick={toggleSelectionMode}>
          <Check size={14} /> {selectionMode ? "Cancelar seleção" : "Selecionar até 2 pools"}
        </button>
      </div>

      {/* ---------- GRID ---------- */}
      <div className="grid-wrap">
        <div className="pool-grid">
          {filtered.map((pool) => (
            <PoolCard
              key={pool.id}
              pool={pool}
              selectionMode={selectionMode}
              selected={selectedIds.includes(pool.id)}
              disabled={selectionMode && selectedIds.length >= 2 && !selectedIds.includes(pool.id)}
              onOpen={(p) => { setDrawerPool(p); setDrawerConfig(DEFAULT_CONFIG); }}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      </div>

      {/* ---------- POSITIONS ---------- */}
      <div className="positions-wrap">
        <div className="section-title-row">
          <div className="section-title"><Droplets size={16} color="#2DD4BF" /> Minhas posições (simuladas)</div>
          {positions.length > 0 && (
            <div className="earn-summary">
              <div className="earn-summary__item">
                <span className="config-label">Rendendo agora</span>
                <span className="earn-summary__value earn-summary__value--live">{fmtMoney(totalLiveEarned)}</span>
              </div>
              <div className="earn-summary__item">
                <span className="config-label">Já coletado</span>
                <span className="earn-summary__value">{fmtMoney(totalCollected)}</span>
              </div>
            </div>
          )}
        </div>

        {positions.length === 0 ? (
          <div className="empty-state">Você ainda não criou posições. Clique em uma pool ou selecione até 2 para configurar liquidez.</div>
        ) : (
          positions.map((pos) => {
            const live = earnedSince(pos, now);
            return (
              <div className="position-card" key={pos.id}>
                <div className="position-left">
                  <PairIcons base={pos.pool.base} quote={pos.pool.quote} />
                  <div>
                    <div className="position-pair">{pos.pool.base}/{pos.pool.quote}</div>
                    <div className="position-range">
                      Faixa: {pos.config.rangeMode === "full" ? "total" : `${pos.config.min}% / +${pos.config.max}%`}
                      {" · "}Depositado: {fmtMoney(pos.depositUSD)}
                    </div>
                  </div>
                </div>

                <div className="position-right">
                  <div className="earn-block">
                    <span className="earn-block__label"><TrendingUp size={11} /> lucro gerado</span>
                    <span className="earn-block__value">{fmtMoney(live)}</span>
                    {pos.collectedTotal > 0 && (
                      <span className="earn-block__collected">coletado: {fmtMoney(pos.collectedTotal)}</span>
                    )}
                  </div>
                  <button
                    className="btn-collect"
                    disabled={live < 0.0001}
                    onClick={() => collectPosition(pos.id)}
                  >
                    <Wallet size={13} /> Coletar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ---------- FLOATING SELECTION BAR ---------- */}
      {selectionMode && selectedIds.length > 0 && (
        <div className="float-bar">
          <span className="float-bar__text"><b>{selectedIds.length}</b> pool{selectedIds.length > 1 ? "s" : ""} selecionada{selectedIds.length > 1 ? "s" : ""} (máx. 2)</span>
          <button className="btn-primary" onClick={openConfigureModal}>Configurar liquidez</button>
        </div>
      )}

      {/* ---------- DRAWER (single pool, click direto) ---------- */}
      {drawerPool && (
        <div className="overlay" onClick={() => setDrawerPool(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <span className="panel-title">Adicionar liquidez</span>
              <button className="icon-btn" onClick={() => setDrawerPool(null)}><X size={18} /></button>
            </div>
            <div className="pool-summary-row">
              <PairIcons base={drawerPool.base} quote={drawerPool.quote} />
              <div>
                <div className="position-pair">{drawerPool.base}/{drawerPool.quote}</div>
                <span className="fee-badge">{drawerPool.fee.toFixed(2)}% fee</span>
              </div>
            </div>
            <LiquidityConfigurator pool={drawerPool} config={drawerConfig} onChange={setDrawerConfig} />
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setDrawerPool(null)}>Cancelar</button>
              <button className="btn-primary" onClick={confirmDrawerPosition}>Confirmar (demo)</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- MODAL (até 2 pools selecionadas) ---------- */}
      {modalOpen && selectedPools.length > 0 && (
        <div className="overlay overlay--center" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <span className="panel-title">Configurar {selectedPools.length} pool{selectedPools.length > 1 ? "s" : ""}</span>
              <button className="icon-btn" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>

            {selectedPools.length > 1 && (
              <div className="tabs">
                {selectedPools.map((p, i) => (
                  <button
                    key={p.id}
                    className={`tab-btn ${activeTab === i ? "tab-btn--on" : ""}`}
                    onClick={() => setActiveTab(i)}
                  >
                    <PairIcons base={p.base} quote={p.quote} /> {p.base}/{p.quote}
                  </button>
                ))}
              </div>
            )}

            {(() => {
              const p = selectedPools[activeTab] || selectedPools[0];
              const cfg = modalConfigs[p.id] || DEFAULT_CONFIG;
              return (
                <>
                  <div className="pool-summary-row">
                    <PairIcons base={p.base} quote={p.quote} />
                    <div>
                      <div className="position-pair">{p.base}/{p.quote}</div>
                      <span className="fee-badge">{p.fee.toFixed(2)}% fee</span>
                    </div>
                  </div>
                  <LiquidityConfigurator
                    pool={p}
                    config={cfg}
                    onChange={(newCfg) => setModalConfigs((cur) => ({ ...cur, [p.id]: newCfg }))}
                  />
                </>
              );
            })()}

            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={confirmModalPositions}>
                Confirmar {selectedPools.length} posiç{selectedPools.length > 1 ? "ões" : "ão"} (demo)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- WALLET MODAL ---------- */}
      {walletModalOpen && (
        <div className="overlay overlay--center" onClick={() => setWalletModalOpen(false)}>
          <div className="modal modal--narrow" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <span className="panel-title">Conectar carteira</span>
              <button className="icon-btn" onClick={() => setWalletModalOpen(false)}><X size={18} /></button>
            </div>
            <p className="wallet-modal__hint">
              Necessária para coletar rendimentos. A NOVEX nunca pede sua frase de recuperação nem chaves privadas —
              toda assinatura acontece dentro da própria extensão da carteira.
            </p>
            <div className="wallet-options">
              <button className="wallet-option" onClick={() => connectWallet("metamask")} disabled={connecting === "metamask"}>
                <div className="wallet-option__icon" style={{ background: "linear-gradient(160deg,#F6851B,#E2761B)" }}>M</div>
                <div className="wallet-option__info">
                  <span className="wallet-option__name">MetaMask</span>
                  <span className="wallet-option__status">
                    {typeof window !== "undefined" && window.ethereum ? "Detectada neste navegador" : "Não detectada"}
                  </span>
                </div>
                {connecting === "metamask" && <span className="wallet-option__spinner" />}
              </button>
              <button className="wallet-option" onClick={() => connectWallet("binance")} disabled={connecting === "binance"}>
                <div className="wallet-option__icon" style={{ background: "linear-gradient(160deg,#F0B90B,#D9A400)" }}>B</div>
                <div className="wallet-option__info">
                  <span className="wallet-option__name">Binance Wallet</span>
                  <span className="wallet-option__status">
                    {typeof window !== "undefined" && window.BinanceChain ? "Detectada neste navegador" : "Não detectada"}
                  </span>
                </div>
                {connecting === "binance" && <span className="wallet-option__spinner" />}
              </button>
            </div>
            <p className="wallet-modal__footnote">
              Se nenhuma for detectada, instale a extensão no seu navegador e recarregue esta página.
              Dentro do preview do Claude a extensão pode não ser detectada por causa do sandbox — funciona normalmente
              quando o app é publicado ou rodado localmente.
            </p>
          </div>
        </div>
      )}

      {/* ---------- TOAST ---------- */}
      {toast && (
        <div className="toast"><Check size={15} color="#2DD4BF" /> {toast}</div>
      )}
    </div>
  );
}
