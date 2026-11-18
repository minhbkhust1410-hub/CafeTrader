import { useEffect, useState, useRef } from 'react';
import { chillAudio } from '../audio/chillAudio';

type TerminalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onWinTrade?: (profitText: string) => void;
};

type TickerSymbol = 'BTC/USDT' | 'ETH/USDT' | 'GOLD (XAU)' | 'SOL/USDT' | 'DXY' | 'SPX 500';

type TickerInfo = {
  symbol: TickerSymbol;
  name: string;
  price: number;
  basePrice: number;
  change: number;
  decimals: number;
  prefix: string;
};

type Candle = {
  o: number;
  c: number;
  h: number;
  l: number;
  up: boolean;
  vol: number;
};

type ActiveTrade = {
  side: 'LONG' | 'SHORT';
  symbol: TickerSymbol;
  entryPrice: number;
  size: number;
  pnl: number;
  secondsLeft: number;
};

const INITIAL_TICKERS: Record<TickerSymbol, TickerInfo> = {
  'BTC/USDT': { symbol: 'BTC/USDT', name: 'Bitcoin Perpetual', price: 96540, basePrice: 96540, change: 2.64, decimals: 1, prefix: '$' },
  'ETH/USDT': { symbol: 'ETH/USDT', name: 'Ethereum Spot', price: 3485.2, basePrice: 3485.2, change: 1.92, decimals: 1, prefix: '$' },
  'GOLD (XAU)': { symbol: 'GOLD (XAU)', name: 'Gold Spot Bullion', price: 2678.5, basePrice: 2678.5, change: 0.78, decimals: 1, prefix: '$' },
  'SOL/USDT': { symbol: 'SOL/USDT', name: 'Solana High Speed', price: 218.45, basePrice: 218.45, change: 4.15, decimals: 2, prefix: '$' },
  'DXY': { symbol: 'DXY', name: 'US Dollar Index', price: 102.45, basePrice: 102.45, change: -0.32, decimals: 2, prefix: '' },
  'SPX 500': { symbol: 'SPX 500', name: 'US Equities Index', price: 5992.4, basePrice: 5992.4, change: 0.48, decimals: 1, prefix: '$' },
};

const TRADER_INSIGHTS = [
  {
    title: 'Bảo Toàn Vốn & Sự Thư Thái',
    text: 'Thị trường tài chính luôn mở cửa mỗi ngày. Đừng bao giờ đánh đổi sự bình an tâm trí lấy những dao động ngắn hạn.',
    author: 'Triết lý Trader Tĩnh Lặng',
  },
  {
    title: 'Kỷ Luật Là Tự Do',
    text: 'Biết cắt lỗ khi sai là biểu hiện cao nhất của sự trưởng thành. Hãy chấp nhận rủi ro với nụ cười nhẹ nhàng bên tách cà phê.',
    author: 'Nguyên tắc Vàng CafeTrader',
  },
  {
    title: 'Kiên Nhẫn Chờ Điểm Vào Hoàn Hảo',
    text: '90% thời gian của một Master Trader là quan sát, học hỏi và chờ đợi con sóng thuận buồm xuôi gió.',
    author: 'Jesse Livermore',
  },
  {
    title: 'Đừng Để Cảm Xúc Điều Khiển Vị Thế',
    text: 'Tham lam và sợ hãi là hai mặt của cùng một đồng xu. Khi nhấp một ngụm trà nóng, hãy quan sát tâm mình trước khi quan sát đồ thị.',
    author: 'Chánh niệm trong Giao dịch',
  },
];

function generateInitialCandles(): Candle[] {
  const list: Candle[] = [];
  let last = 180;
  for (let i = 0; i < 20; i++) {
    const delta = (Math.sin(i * 0.7) + Math.cos(i * 1.3)) * 14 + (Math.random() - 0.48) * 16;
    const open = last;
    const close = Math.max(90, Math.min(270, open + delta));
    last = close;
    const high = Math.max(open, close) + Math.random() * 12 + 2;
    const low = Math.min(open, close) - Math.random() * 12 - 2;
    list.push({
      o: Math.round(open),
      c: Math.round(close),
      h: Math.round(high),
      l: Math.round(low),
      up: close >= open,
      vol: Math.round(30 + Math.random() * 70),
    });
  }
  return list;
}

export default function TraderTerminalModal({ isOpen, onClose, onWinTrade }: TerminalModalProps) {
  const [insightIdx, setInsightIdx] = useState(0);
  const [activeTimeframe, setActiveTimeframe] = useState<'15M' | '1H' | '4H' | '1D'>('1H');
  const [activeSymbol, setActiveSymbol] = useState<TickerSymbol>('BTC/USDT');
  const [tickers, setTickers] = useState<Record<TickerSymbol, TickerInfo>>(INITIAL_TICKERS);
  const [candles, setCandles] = useState<Candle[]>(generateInitialCandles);
  const [demoBalance, setDemoBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cafetrader_demo_balance');
      return saved ? Number(saved) : 10000;
    } catch {
      return 10000;
    }
  });
  const [activeTrade, setActiveTrade] = useState<ActiveTrade | null>(null);
  const [lastTradeResult, setLastTradeResult] = useState<{ win: boolean; text: string } | null>(null);
  const [autoMarketPulse, setAutoMarketPulse] = useState(true);

  // Sync demo balance to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cafetrader_demo_balance', String(demoBalance));
    } catch { }
  }, [demoBalance]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Procedural Live Market Engine (Ticks & Candlesticks Auto-Update)
  useEffect(() => {
    if (!isOpen || !autoMarketPulse) return;

    let tickCounter = 0;
    const interval = window.setInterval(() => {
      tickCounter++;

      // 1. Update prices for all tickers
      setTickers((prev) => {
        const next = { ...prev };
        (Object.keys(next) as TickerSymbol[]).forEach((sym) => {
          const item = next[sym];
          const volatility = sym === 'BTC/USDT' ? 24 : sym === 'ETH/USDT' ? 3.5 : sym === 'SOL/USDT' ? 0.8 : sym === 'GOLD (XAU)' ? 1.2 : 0.08;
          const delta = (Math.random() - 0.49) * volatility;
          const newPrice = Math.max(1, Math.round((item.price + delta) * (10 ** item.decimals)) / (10 ** item.decimals));
          const changeDelta = (Math.random() - 0.5) * 0.02;
          next[sym] = {
            ...item,
            price: newPrice,
            change: Math.round((item.change + changeDelta) * 100) / 100,
          };
        });
        return next;
      });

      // 2. Real-time candle expansion / formation
      setCandles((prevCandles) => {
        const list = [...prevCandles];
        const lastIdx = list.length - 1;
        const current = list[lastIdx];
        const step = (Math.random() - 0.48) * 6;
        const newC = Math.max(60, Math.min(290, current.c + step));
        const newH = Math.max(current.h, newC);
        const newL = Math.min(current.l, newC);

        list[lastIdx] = {
          ...current,
          c: Math.round(newC),
          h: Math.round(newH),
          l: Math.round(newL),
          up: newC >= current.o,
          vol: Math.min(100, current.vol + 1),
        };

        // Every 8 ticks, push a brand new candle
        if (tickCounter % 8 === 0) {
          const nextOpen = list[lastIdx].c;
          list.shift();
          list.push({
            o: nextOpen,
            c: nextOpen,
            h: nextOpen,
            l: nextOpen,
            up: true,
            vol: 25,
          });
        }
        return list;
      });
    }, 1400);

    return () => window.clearInterval(interval);
  }, [isOpen, autoMarketPulse]);

  // Active Trade Countdown & Settlement Lifecycle (Dopamine Chill Engine)
  const currentPrice = tickers[activeSymbol].price;
  useEffect(() => {
    if (!activeTrade) return;

    const timer = window.setInterval(() => {
      setActiveTrade((trade) => {
        if (!trade) return null;
        const nextSeconds = trade.secondsLeft - 1;

        // Calculate live PnL with leverage
        const priceDiff = trade.side === 'LONG' ? currentPrice - trade.entryPrice : trade.entryPrice - currentPrice;
        const pnlPercent = priceDiff / trade.entryPrice;
        const livePnl = Math.round(pnlPercent * trade.size * 10 * 10) / 10;

        if (nextSeconds <= 0) {
          // Settle trade at expiry
          settleTrade(trade, livePnl);
          return null;
        }

        return {
          ...trade,
          pnl: livePnl,
          secondsLeft: nextSeconds,
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeTrade, currentPrice]);

  const settleTrade = (trade: ActiveTrade, finalPnl: number) => {
    const isWin = finalPnl > 0;
    const profitText = `${finalPnl >= 0 ? '+' : ''}$${Math.abs(finalPnl)}`;

    if (isWin) {
      chillAudio.playCashRegister();
      setDemoBalance((bal) => Math.round(bal + finalPnl));
      setLastTradeResult({ win: true, text: `🎉 THẮNG LỚN! Lợi nhuận ${profitText} chốt thành công!` });
      onWinTrade?.(`${trade.symbol} ${trade.side} ${profitText}`);
    } else {
      chillAudio.playUiClick();
      setDemoBalance((bal) => Math.max(0, Math.round(bal + finalPnl)));
      setLastTradeResult({ win: false, text: `🛡️ Đã cắt lỗ ${profitText}. Bảo toàn vốn để chờ nhịp sóng tiếp theo.` });
    }

    window.setTimeout(() => setLastTradeResult(null), 5000);
  };

  const startTrade = (side: 'LONG' | 'SHORT') => {
    chillAudio.playUiClick();
    chillAudio.playOrderFilled();
    const tradeSize = 1000;
    setActiveTrade({
      side,
      symbol: activeSymbol,
      entryPrice: currentPrice,
      size: tradeSize,
      pnl: 0,
      secondsLeft: 12,
    });
  };

  const closeTradeEarly = () => {
    if (!activeTrade) return;
    settleTrade(activeTrade, activeTrade.pnl);
    setActiveTrade(null);
  };

  if (!isOpen) return null;

  const currentTicker = tickers[activeSymbol];
  const rsiValue = Math.round(52 + (currentTicker.change * 2.8));

  return (
    <div className="terminal-overlay" onClick={onClose}>
      <div className="terminal-modal" onClick={(e) => e.stopPropagation()}>
        {/* Terminal Header */}
        <div className="terminal-header">
          <div className="terminal-title">
            <span className="terminal-dot pulse" />
            <strong>TRADER TERMINAL · MÀN HÌNH THEO DÕI THỊ TRƯỜNG LIVE</strong>
            <span className="terminal-tag">PRO AUTO-PULSE</span>
            <button
              type="button"
              className={`terminal-pulse-btn ${autoMarketPulse ? 'active' : ''}`}
              onClick={() => {
                chillAudio.playUiClick();
                setAutoMarketPulse(!autoMarketPulse);
              }}
              title="Bật/Tắt tự động cập nhật thị trường thời gian thực"
            >
              {autoMarketPulse ? '🟢 Auto-Update: BẬT' : '⚪ Auto-Update: TẮT'}
            </button>
          </div>

          <div className="terminal-header-right">
            <div className="demo-balance-badge" title="Tài khoản Paper Trading thử nghiệm">
              <span className="balance-label">VỐN THỬ NGHIỆM:</span>
              <strong className="balance-amount">${demoBalance.toLocaleString()} DEMO</strong>
            </div>
            <button className="terminal-close-btn" onClick={onClose} aria-label="Đóng màn hình">
              ✕
            </button>
          </div>
        </div>

        {/* Live Ticker Cards Selector */}
        <div className="terminal-tickers">
          {(Object.values(tickers) as TickerInfo[]).map((t) => {
            const isSelected = activeSymbol === t.symbol;
            return (
              <div
                key={t.symbol}
                className={`ticker-card ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  chillAudio.playUiClick();
                  setActiveSymbol(t.symbol);
                }}
                title={`Nhấp để xem đồ thị và giao dịch ${t.symbol}`}
              >
                <div className="ticker-meta">
                  <strong>{t.symbol}</strong>
                  <small>{t.name}</small>
                </div>
                <div className="ticker-val">
                  <span className="ticker-price">
                    {t.prefix}{t.price.toLocaleString(undefined, { minimumFractionDigits: t.decimals, maximumFractionDigits: t.decimals })}
                  </span>
                  <span className={`ticker-change ${t.change >= 0 ? 'up' : 'down'}`}>
                    {t.change >= 0 ? '▲ +' : '▼ '}{t.change}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Chart Area */}
        <div className="terminal-chart-box">
          <div className="chart-toolbar">
            <div className="timeframe-buttons">
              {(['15M', '1H', '4H', '1D'] as const).map((tf) => (
                <button
                  key={tf}
                  className={`tf-btn ${activeTimeframe === tf ? 'active' : ''}`}
                  onClick={() => {
                    chillAudio.playUiClick();
                    setActiveTimeframe(tf);
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="chart-indicators-summary">
              <span>Đang xem: <strong className="txt-symbol">{activeSymbol}</strong></span>
              <span>RSI(14): <strong>{rsiValue} ({rsiValue > 65 ? 'Overbought' : rsiValue < 35 ? 'Oversold' : 'Neutral'})</strong></span>
              <span>MACD: <strong className={currentTicker.change >= 0 ? 'txt-up' : 'txt-down'}>{currentTicker.change >= 0 ? 'Bullish Expansion' : 'Bearish Pullback'}</strong></span>
              <span>24h Vol: <strong>$52.4B</strong></span>
            </div>
          </div>

          {/* Dynamic Real-Time Candlestick Chart */}
          <div className="candlestick-display">
            <div className="chart-grid-lines">
              <div className="grid-line" />
              <div className="grid-line" />
              <div className="grid-line" />
              <div className="grid-line" />
            </div>

            {/* Current Price Tracker Line */}
            <div
              className="price-tracker-line"
              style={{
                bottom: `${Math.min(92, Math.max(8, (candles[candles.length - 1].c / 300) * 100))}%`,
              }}
            >
              <span className={`price-tag-bubble ${currentTicker.change >= 0 ? 'up' : 'down'}`}>
                {currentTicker.prefix}{currentTicker.price.toLocaleString()}
              </span>
            </div>

            {/* Candles Stream */}
            <div className="simulated-candles">
              {candles.map((candle, i) => {
                const bottomPercent = (Math.min(candle.o, candle.c) / 300) * 100;
                const heightPercent = Math.max(3, (Math.abs(candle.c - candle.o) / 300) * 100);
                const wickBottom = (candle.l / 300) * 100;
                const wickHeight = Math.max(4, ((candle.h - candle.l) / 300) * 100);
                const isCurrent = i === candles.length - 1;

                return (
                  <div key={i} className={`candle-col ${isCurrent ? 'current' : ''}`}>
                    {/* Wick */}
                    <div
                      className={`candle-wick ${candle.up ? 'up' : 'down'}`}
                      style={{
                        bottom: `${wickBottom}%`,
                        height: `${wickHeight}%`,
                      }}
                    />
                    {/* Body */}
                    <div
                      className={`candle-body ${candle.up ? 'up' : 'down'}`}
                      style={{
                        bottom: `${bottomPercent}%`,
                        height: `${heightPercent}%`,
                      }}
                    />
                    {/* Volume Bar */}
                    <div
                      className={`candle-vol ${candle.up ? 'up' : 'down'}`}
                      style={{ height: `${candle.vol * 0.35}px` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dopamine Chill Paper Trading Interactive Bar */}
        <div className="dopamine-trade-panel">
          <div className="trade-panel-info">
            <span className="trade-panel-title">⚡ QUICK PAPER TRADE · THỬ THÁCH DỰ ĐOÁN NẾN 12S</span>
            <small>Vào lệnh demo $1,000 đón sóng nến. Chốt lời xanh giòn giã nhận ngay Dopamine & +150 XP!</small>
          </div>

          {activeTrade ? (
            <div className="active-trade-box">
              <div className="trade-meta">
                <span className={`trade-badge ${activeTrade.side.toLowerCase()}`}>
                  {activeTrade.side === 'LONG' ? '🟢 LONG' : '🔴 SHORT'}
                </span>
                <span>Giá vào: <strong>${activeTrade.entryPrice.toLocaleString()}</strong></span>
                <span>Giá hiện tại: <strong>${currentPrice.toLocaleString()}</strong></span>
                <span>Thời gian: <strong className="timer-sec">{activeTrade.secondsLeft}s</strong></span>
              </div>

              <div className={`trade-pnl-pill ${activeTrade.pnl >= 0 ? 'win' : 'loss'}`}>
                {activeTrade.pnl >= 0 ? '▲ +' : '▼ '}${Math.abs(activeTrade.pnl)}
              </div>

              <button
                type="button"
                className="close-trade-btn"
                onClick={closeTradeEarly}
              >
                Chốt Lệnh Ngay
              </button>
            </div>
          ) : (
            <div className="trade-actions-row">
              <button
                type="button"
                className="trade-btn trade-btn--long"
                onClick={() => startTrade('LONG')}
              >
                <span>🟢 MUA / LONG</span>
                <small>Dự đoán nến bật tăng</small>
              </button>

              <button
                type="button"
                className="trade-btn trade-btn--short"
                onClick={() => startTrade('SHORT')}
              >
                <span>🔴 BÁN / SHORT</span>
                <small>Dự đoán nến đảo chiều</small>
              </button>
            </div>
          )}
        </div>

        {/* Trade Result Banner */}
        {lastTradeResult && (
          <div className={`trade-result-banner ${lastTradeResult.win ? 'win' : 'loss'}`}>
            {lastTradeResult.text}
          </div>
        )}

        {/* Trader Zen Philosophy Carousel */}
        <div className="terminal-philosophy">
          <div className="philosophy-header">
            <span className="philosophy-badge">✦ TƯ DUY & CHÁNH NIỆM TRADER</span>
            <div className="philosophy-nav">
              <button
                className="phil-btn"
                onClick={() => setInsightIdx((idx) => (idx > 0 ? idx - 1 : TRADER_INSIGHTS.length - 1))}
              >
                ◀
              </button>
              <span>{insightIdx + 1} / {TRADER_INSIGHTS.length}</span>
              <button
                className="phil-btn"
                onClick={() => setInsightIdx((idx) => (idx + 1) % TRADER_INSIGHTS.length)}
              >
                ▶
              </button>
            </div>
          </div>

          <div className="philosophy-content">
            <h4>{TRADER_INSIGHTS[insightIdx].title}</h4>
            <p>“{TRADER_INSIGHTS[insightIdx].text}”</p>
            <small>— {TRADER_INSIGHTS[insightIdx].author}</small>
          </div>
        </div>
      </div>
    </div>
  );
}
