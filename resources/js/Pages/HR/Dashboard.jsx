import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import { UsersIcon } from '@heroicons/react/24/outline';
import { theme } from '../../config/theme';
import route from 'ziggy-js';
import { Ziggy } from '../../ziggy';
import MonthCalendar from '../../Components/MonthCalendar';

export default function HRDashboard({ jaarActies, filters, medewerkerOptions, calendar, selectedMedewerker }) {
    // Type-to-select (combobox) state
    const [query, setQuery] = useState(filters?.zoek || '');
    const [openList, setOpenList] = useState(false);
    const listRef = useRef(null);
    const inputRef = useRef(null);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);

    // Keep query in sync when filters.zoek changes from server (e.g., back/forward nav)
    useEffect(() => {
        setQuery(filters?.zoek || '');
    }, [filters?.zoek]);
    const onSelectMedewerker = (id) => {
        const params = new URLSearchParams(window.location.search);
        if (id) params.set('medewerker', id);
        else params.delete('medewerker');
        // Bij expliciete selectie: verwijder zoekterm om verwarring te voorkomen
        params.delete('zoek');
        // reset to current month/year when changing medewerker
        const today = new Date();
        params.set('year', params.get('year') || today.getFullYear());
        params.set('month', params.get('month') || (today.getMonth() + 1));
        router.visit(`/hr/dashboard?${params.toString()}`, { preserveScroll: true, preserveState: true });
    };

    // Debounced search to update server options while preserving current selection
    useEffect(() => {
        const handle = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            if (query && query.trim().length > 0) params.set('zoek', query.trim()); else params.delete('zoek');
            router.visit(`/hr/dashboard?${params.toString()}`,
                { preserveScroll: true, preserveState: true, only: ['medewerkerOptions', 'filters'] }
            );
        }, 300);
        return () => clearTimeout(handle);
    }, [query]);

    // When options refresh, (re)set highlighted and candidate
    useEffect(() => {
        if (openList && query.trim().length > 0 && Array.isArray(medewerkerOptions) && medewerkerOptions.length > 0) {
            setHighlightedIndex(0);
            setSelectedCandidateId(medewerkerOptions[0].id);
        } else {
            setSelectedCandidateId(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [medewerkerOptions]);

    // removed: old onInputChange (replaced below with version that hides list when empty)

    const goMonth = (year, month) => {
        const params = new URLSearchParams(window.location.search);
        params.set('year', year);
        params.set('month', month);
        router.visit(`/hr/dashboard?${params.toString()}`, { preserveScroll: true, preserveState: true });
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter') {
            // Activate the current highlighted/selected candidate
            if (openList && Array.isArray(medewerkerOptions) && medewerkerOptions.length > 0) {
                const id = selectedCandidateId ?? medewerkerOptions[highlightedIndex]?.id ?? medewerkerOptions[0].id;
                onSelectMedewerker(id);
                setOpenList(false);
                e.preventDefault();
            } else {
                // List closed: if we already have a candidate, activate it.
                if (selectedCandidateId) {
                    onSelectMedewerker(selectedCandidateId);
                    setOpenList(false);
                    e.preventDefault();
                } else if (query.trim().length > 0) {
                    // Try to resolve from current options by exact/startsWith/includes
                    let idToUse = null;
                    if (Array.isArray(medewerkerOptions) && medewerkerOptions.length > 0) {
                        const lower = query.trim().toLowerCase();
                        const exact = medewerkerOptions.find(o => (o.naam || '').toLowerCase() === lower);
                        const starts = exact || medewerkerOptions.find(o => (o.naam || '').toLowerCase().startsWith(lower));
                        const includes = starts || medewerkerOptions.find(o => (o.naam || '').toLowerCase().includes(lower));
                        if (includes) idToUse = includes.id;
                    }
                    if (idToUse) {
                        onSelectMedewerker(idToUse);
                        setOpenList(false);
                        e.preventDefault();
                    } else {
                        // Fall back to search-only navigation; server will auto-select if single match
                        const params = new URLSearchParams(window.location.search);
                        params.set('zoek', query.trim());
                        params.delete('medewerker');
                        // Zet commit=1 zodat server bij exact match (full name) kan resolven
                        params.set('commit', '1');
                        setOpenList(false);
                        router.visit(`/hr/dashboard?${params.toString()}`, { preserveScroll: true, preserveState: true });
                        e.preventDefault();
                    }
                } else if (filters?.medewerker) {
                    // No candidate; keep current selection (refresh)
                    const params = new URLSearchParams(window.location.search);
                    setOpenList(false);
                    router.visit(`/hr/dashboard?${params.toString()}`, { preserveScroll: true, preserveState: true });
                    e.preventDefault();
                }
            }
        } else if (e.key === 'Tab') {
            // Tab selects current highlighted suggestion into the input, but does not navigate
            if (openList && Array.isArray(medewerkerOptions) && medewerkerOptions.length > 0) {
                e.preventDefault();
                const choice = medewerkerOptions[highlightedIndex] ?? medewerkerOptions[0];
                if (choice) {
                    setQuery(choice.naam);
                    setSelectedCandidateId(choice.id);
                    setOpenList(false);
                    // Place caret at end on next tick
                    requestAnimationFrame(() => {
                        if (inputRef.current) {
                            const el = inputRef.current;
                            el.focus();
                            el.setSelectionRange(el.value.length, el.value.length);
                        }
                    });
                }
            }
        } else if (e.key === 'Escape') {
            setOpenList(false);
        } else if (e.key === 'ArrowDown') {
            if (openList && Array.isArray(medewerkerOptions) && medewerkerOptions.length > 0) {
                e.preventDefault();
                const next = (highlightedIndex + 1) % medewerkerOptions.length;
                setHighlightedIndex(next);
                setSelectedCandidateId(medewerkerOptions[next].id);
                scrollActiveIntoView(next);
            }
        } else if (e.key === 'ArrowUp') {
            if (openList && Array.isArray(medewerkerOptions) && medewerkerOptions.length > 0) {
                e.preventDefault();
                const next = (highlightedIndex - 1 + medewerkerOptions.length) % medewerkerOptions.length;
                setHighlightedIndex(next);
                setSelectedCandidateId(medewerkerOptions[next].id);
                scrollActiveIntoView(next);
            }
        }
    };

    const onInputChange = (e) => {
        const val = e.target.value ?? '';
        setQuery(val);
        // Toon de lijst alleen als er een zoekterm is
        if (val.trim().length === 0) {
            setOpenList(false);
            setHighlightedIndex(0);
            setSelectedCandidateId(null);
        } else {
            setOpenList(true);
            // Probeer direct lokaal een match te vinden op basis van huidige opties
            if (Array.isArray(medewerkerOptions) && medewerkerOptions.length > 0) {
                const lower = val.toLowerCase();
                let idx = medewerkerOptions.findIndex(o => (o.naam || '').toLowerCase().startsWith(lower));
                if (idx === -1) {
                    idx = medewerkerOptions.findIndex(o => (o.naam || '').toLowerCase().includes(lower));
                }
                if (idx >= 0) {
                    setHighlightedIndex(idx);
                    setSelectedCandidateId(medewerkerOptions[idx].id);
                    scrollActiveIntoView(idx);
                } else {
                    setHighlightedIndex(0);
                    setSelectedCandidateId(null);
                }
            }
        }
    };

    const clearSelection = () => {
        // Wis medewerker-selectie en zoekterm, en sluit de lijst
        onSelectMedewerker('');
        setQuery('');
        setOpenList(false);
        setHighlightedIndex(0);
        setSelectedCandidateId(null);
        // Zet ook de zoekquery in de URL weg zodat opties leeg kunnen zijn
        const params = new URLSearchParams(window.location.search);
        params.delete('zoek');
        router.visit(`/hr/dashboard?${params.toString()}`, { preserveScroll: true, preserveState: true, only: ['medewerkerOptions', 'filters'] });
        // Focus terug naar input voor snelle verdere invoer
        requestAnimationFrame(() => inputRef.current?.focus());
    };

    // Ensure the active option is visible when navigating with arrows
    const scrollActiveIntoView = (index) => {
        const listEl = listRef.current;
        if (!listEl) return;
        const item = listEl.querySelector(`[data-index="${index}"]`);
        if (item && typeof item.scrollIntoView === 'function') {
            item.scrollIntoView({ block: 'nearest' });
        }
    };

    return (
        <Layout>
            <Head title="HR Dashboard" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1" style={{ color: theme.colors.neutral[800] }}>
                    HR Dashboard
                </h1>
                <p className="text-sm" style={{ color: theme.colors.neutral[500] }}>
                    Maandkalender per medewerker en jaarbeheer
                </p>
            </div>

            {/* Kalender + filters */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div className="w-full md:w-1/2 relative">
                        <label className="text-xs block mb-1" style={{ color: theme.colors.neutral[600] }}>Medewerker</label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={onInputChange}
                            onFocus={() => setOpenList(true)}
                            onKeyDown={onKeyDown}
                            placeholder="Type om te zoeken en selecteer met Enter..."
                            className="w-full px-3 py-2 rounded border"
                            style={{ borderColor: theme.colors.neutral[300] }}
                            role="combobox"
                            aria-expanded={openList}
                            aria-controls="medewerker-suggesties"
                            aria-autocomplete="list"
                        />
                        {/* Clear selection/button */}
                        {Number(filters?.medewerker) > 0 && (
                            <button
                                type="button"
                                onClick={clearSelection}
                                className="absolute right-2 top-8 text-sm px-2 py-0.5 rounded"
                                title="Reset selectie"
                                style={{ color: theme.colors.neutral[500] }}
                            >
                                ×
                            </button>
                        )}
                        {/* Suggestion list */}
                        {(() => {
                            const showList = openList && (query?.trim()?.length > 0) && Array.isArray(medewerkerOptions) && (medewerkerOptions.length > 0);
                            return showList ? (
                            <ul
                                id="medewerker-suggesties"
                                ref={listRef}
                                role="listbox"
                                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow"
                                style={{ borderColor: theme.colors.neutral[200] }}
                            >
                                {medewerkerOptions.map((o, idx) => (
                                    <li
                                        key={o.id}
                                        role="option"
                                        aria-selected={highlightedIndex === idx}
                                        data-index={idx}
                                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${highlightedIndex === idx ? 'bg-gray-100' : ''}`}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onMouseEnter={() => { setHighlightedIndex(idx); setSelectedCandidateId(o.id); }}
                                        onClick={() => { onSelectMedewerker(o.id); setOpenList(false); }}
                                    >
                                        {o.naam} <span className="text-xs text-gray-400">({o.afdeling})</span>
                                    </li>
                                ))}
                            </ul>
                            ) : null;
                        })()}
                    </div>
                </div>

                <div className="mt-4">
                    {filters?.medewerker ? (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium" style={{ color: theme.colors.neutral[700] }}>
                                    {selectedMedewerker ? (
                                        <>
                                            Kalender: <span className="font-semibold">{selectedMedewerker.naam}</span>{' '}
                                            <span className="text-xs px-2 py-0.5 rounded ml-1" style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}>
                                                {selectedMedewerker.afdeling}
                                            </span>
                                        </>
                                    ) : (
                                        'Kalender'
                                    )}
                                </div>
                                {calendar?.calendar && (
                                    <div className="text-xs" style={{ color: theme.colors.neutral[500] }}>
                                        {String(calendar.calendar.year)}-{String(calendar.calendar.month).padStart(2, '0')}
                                    </div>
                                )}
                            </div>
                            <MonthCalendar title="Month Calender"  data={calendar} basePath="/hr/dashboard" />
                        </>
                    ) : (
                        <p className="text-sm p-4 rounded border" style={{ color: theme.colors.neutral[600], borderColor: theme.colors.neutral[200] }}>
                            Selecteer eerst een medewerker om de kalender te tonen.
                        </p>
                    )}
                </div>
            </Card>

            {/* Jaarbeheer acties */}
            <Card>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: theme.colors.neutral[800] }}>
                            Jaarbeheer
                        </h2>
                        {jaarActies && (
                            <p className="text-xs mt-1" style={{ color: theme.colors.neutral[500] }}>
                                Huidig jaar: {jaarActies.huidigJaar} • Vorig jaar: {jaarActies.vorigJaar}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                        {/* Waarschuwing: ingediende (niet‑goedgekeurde) overuren in vorig jaar */}
                        {jaarActies && jaarActies.pendingPrevYearCount > 0 && (
                            <div className="text-xs px-3 py-2 rounded border" style={{
                                backgroundColor: theme.colors.warning[50],
                                color: theme.colors.warning[800],
                                borderColor: theme.colors.warning[200]
                            }}>
                                Er zijn {jaarActies.pendingPrevYearCount} ingediende overuren in {jaarActies.vorigJaar} die eerst beoordeeld moeten worden.
                            </div>
                        )}

                        {/* Eén knop: Sluit vorig jaar (indien open) + Start nieuw boekjaar */}
                        {jaarActies && !jaarActies.baselineHuidigBestaat && (
                            <Button
                                variant={jaarActies.pendingPrevYearCount > 0 ? 'secondary' : 'primary'}
                                size="sm"
                                disabled={jaarActies.pendingPrevYearCount > 0}
                                title={jaarActies.pendingPrevYearCount > 0 ? 'Niet beschikbaar: er staan nog ingediende overuren open in vorig jaar' : undefined}
                                onClick={() => {
                                    if (jaarActies.pendingPrevYearCount > 0) return;
                                    // Gebruik directe URL i.p.v. Ziggy route helper om klikproblemen te voorkomen
                                    router.post('/hr/jaar/rollover', { jaar: jaarActies.huidigJaar }, { preserveScroll: true });
                                }}
                            >
                                Start nieuw boekjaar ({jaarActies.huidigJaar})
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </Layout>
    );
}
