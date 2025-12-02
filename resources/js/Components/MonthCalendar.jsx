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

  const dayBadge = (text, color) => (
    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mr-1" style={{ backgroundColor: color, color: '#1F2937' }}>{text}</span>
  );

  const dayCell = (day) => {
    if (!day) return <div className="h-24 border bg-white" style={{ borderColor: '#E5E7EB' }} />;
    const bucket = days?.[day] || { concept: [], ingediend: [], goedgekeurd: [], afgekeurd: [], opnames: [] };

    // Totals per status in uren (afgerond), met 2 spaties tussen letter en waarde
    const sumMinutes = (arr) => (arr || []).reduce((acc, it) => acc + (typeof it?.minuten === 'number' ? Math.max(0, it.minuten) : 0), 0);
    const sumAbsMinutes = (arr) => (arr || []).reduce((acc, it) => acc + (typeof it?.minuten === 'number' ? Math.abs(it.minuten) : 0), 0);
    const toHours = (mins) => Math.round(mins / 60);

    const conceptH = toHours(sumMinutes(bucket.concept));
    const ingediendH = toHours(sumMinutes(bucket.ingediend));
    const goedgekeurdH = toHours(sumMinutes(bucket.goedgekeurd));
    const afgekeurdH = toHours(sumMinutes(bucket.afgekeurd));
    const opnamesH = toHours(sumAbsMinutes(bucket.opnames));
    return (
      <div className="h-24 border p-1 overflow-hidden" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
        <div className="text-xs font-semibold mb-1" style={{ color: '#374151' }}>{day}</div>
        <div className="space-x-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {bucket.concept?.length > 0 && dayBadge(`C  ${conceptH}`, '#E5E7EB')}
          {bucket.ingediend?.length > 0 && dayBadge(`I  ${ingediendH}`, '#FDE68A')}
          {bucket.goedgekeurd?.length > 0 && dayBadge(`G  ${goedgekeurdH}`, '#BBF7D0')}
          {bucket.afgekeurd?.length > 0 && dayBadge(`A  ${afgekeurdH}`, '#FCA5A5')}
          {bucket.opnames?.length > 0 && dayBadge(`O  ${opnamesH}`, '#E9D5FF')}
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
        <span>Legenda (letter  +  uren):</span>
        {dayBadge('C  Concept', '#E5E7EB')}
        {dayBadge('I  Ingediend', '#FDE68A')}
        {dayBadge('G  Goedgekeurd', '#BBF7D0')}
        {dayBadge('A  Afgekeurd', '#FCA5A5')}
        {dayBadge('O  Opname', '#E9D5FF')}
      </div>
    </div>
  );
}
