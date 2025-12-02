import { router } from '@inertiajs/react';
import { useMemo } from 'react';

export default function MonthCalendar({ data, basePath = '/dashboard' }) {
  if (!data) return null;

  const { visible, calendar, days } = data;
  const { year, month, daysInMonth, firstWeekday } = calendar || {};

  const weeks = useMemo(() => {
    if (!calendar) return [];
    // Build a 6x7 grid (weeks x days) starting from Monday (ISO)
    const result = [];
    let currentDay = 1;
    const offset = ((firstWeekday + 6) % 7); // convert ISO 1..7 to 0..6 with Mon=0
    for (let w = 0; w < 6; w++) {
      const row = [];
      for (let d = 0; d < 7; d++) {
        const index = w * 7 + d;
        if (index < offset || currentDay > daysInMonth) {
          row.push(null);
        } else {
          row.push(currentDay);
          currentDay++;
        }
      }
      result.push(row);
    }
    return result;
  }, [calendar]);

  const goTo = (y, m) => {
    // Preserve existing query params (e.g., medewerker, zoek) while changing year/month
    const params = new URLSearchParams(window.location.search);
    params.set('year', y);
    params.set('month', m);
    router.visit(`${basePath}?${params.toString()}`, { preserveScroll: true, preserveState: true });
  };

  const prevMonth = () => {
    let y = year, m = month - 1;
    if (m < 1) { m = 12; y = year - 1; }
    goTo(y, m);
  };
  const nextMonth = () => {
    let y = year, m = month + 1;
    if (m > 12) { m = 1; y = year + 1; }
    goTo(y, m);
  };

  const dayBadge = (text, color, title) => (
    <span
      className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mr-1"
      style={{ backgroundColor: color, color: '#1F2937' }}
      title={title}
    >
      {text}
    </span>
  );

  const dayCell = (day) => {
    if (!day) return <div className="h-24 border bg-white" style={{ borderColor: '#E5E7EB' }} />;
    const bucket = days?.[day] || { concept: [], ingediend: [], goedgekeurd: [], afgekeurd: [], opnames: [] };

    // Totals per status in minuten → weergeven als H:MM (bijv. 0:45 of 2:20)
    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const sumMinutes = (arr) => (arr || []).reduce((acc, it) => acc + Math.max(0, toNum(it?.minuten)), 0);
    const sumAbsMinutes = (arr) => (arr || []).reduce((acc, it) => acc + Math.abs(toNum(it?.minuten)), 0);
    const fmtHMM = (mins) => {
      const m = Math.max(0, Math.round(mins));
      const h = Math.floor(m / 60);
      const mm = String(m % 60).padStart(2, '0');
      return `${h}:${mm}`;
    };

    const conceptM = sumMinutes(bucket.concept);
    const ingediendM = sumMinutes(bucket.ingediend);
    const goedgekeurdM = sumMinutes(bucket.goedgekeurd);
    const afgekeurdM = sumMinutes(bucket.afgekeurd);
    const opnamesM = sumAbsMinutes(bucket.opnames);

    // Tooltips (reden tonen per item)
    const tooltipFromItems = (items, fallbackLabel = '') => {
      if (!items || items.length === 0) return undefined;
      try {
        return items
          .map((it) => {
            const m = Math.abs(toNum(it?.minuten));
            const h = Math.floor(m / 60);
            const mm = String(m % 60).padStart(2, '0');
            const tijd = `${h}:${mm}`;
            const reden = (it?.reden && String(it.reden).trim().length > 0) ? it.reden : fallbackLabel;
            return `${tijd} – ${reden ?? ''}`.trim();
          })
          .join('\n');
      } catch (e) {
        return undefined;
      }
    };

    const tipCon = tooltipFromItems(bucket.concept, 'Concept');
    const tipIng = tooltipFromItems(bucket.ingediend, 'Ingediend');
    const tipGoed = tooltipFromItems(bucket.goedgekeurd, 'Goedgekeurd');
    const tipAfk = tooltipFromItems(bucket.afgekeurd, 'Afgekeurd');
    const tipOpn = tooltipFromItems(bucket.opnames, 'Opname');
    return (
      <div className="h-24 border p-1 overflow-hidden" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
        <div className="text-xs font-semibold mb-1" style={{ color: '#374151' }}>{day}</div>
        <div className="space-x-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {bucket.concept?.length > 0 && dayBadge(`Con: ${fmtHMM(conceptM)}`, '#E5E7EB', tipCon)}
          {bucket.ingediend?.length > 0 && dayBadge(`Ing: ${fmtHMM(ingediendM)}`, '#FDE68A', tipIng)}
          {bucket.goedgekeurd?.length > 0 && dayBadge(`Goed: ${fmtHMM(goedgekeurdM)}`, '#BBF7D0', tipGoed)}
          {bucket.afgekeurd?.length > 0 && dayBadge(`Afk: ${fmtHMM(afgekeurdM)}`, '#FCA5A5', tipAfk)}
          {bucket.opnames?.length > 0 && dayBadge(`Opn: ${fmtHMM(opnamesM)}`, '#93C5FD', tipOpn)}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="px-3 py-1 rounded border text-sm" style={{ borderColor: '#E5E7EB' }}>Vorige</button>
        <div className="text-sm font-semibold" style={{ color: '#1F2937' }}>{year}-{String(month).padStart(2, '0')}</div>
        <button onClick={nextMonth} className="px-3 py-1 rounded border text-sm" style={{ borderColor: '#E5E7EB' }}>Volgende</button>
      </div>

      {!visible && (
        <div className="p-4 border rounded" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', color: '#6B7280' }}>
          Kalender niet beschikbaar: dit jaar is nog niet gestart of vorig jaar is niet afgesloten.
        </div>
      )}

      {visible && (
        <div className="grid grid-cols-7 gap-0 border" style={{ borderColor: '#E5E7EB' }}>
          {/* Weekday headers (Ma t/m Zo) */}
          {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((w, i) => (
            <div key={`wh-${i}`} className="p-2 text-xs font-semibold text-center" style={{ backgroundColor: '#F3F4F6', color: '#374151', borderRight: i < 6 ? '1px solid #E5E7EB' : undefined }}>{w}</div>
          ))}
          {/* Weeks */}
          {weeks.map((row, ri) => (
            <div key={`w-${ri}`} className="contents">
              {row.map((d, di) => (
                <div key={`d-${ri}-${di}`}>{dayCell(d)}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs" style={{ color: '#6B7280' }}>
        <span>Legenda:</span>
        {dayBadge('Con: Concept', '#E5E7EB')}
        {dayBadge('Ing: Ingediend', '#FDE68A')}
        {dayBadge('Goed: Goedgekeurd', '#BBF7D0')}
        {dayBadge('Afk: Afgekeurd', '#FCA5A5')}
        {dayBadge('Opn: Opname', '#93C5FD')}
      </div>
    </div>
  );
}
