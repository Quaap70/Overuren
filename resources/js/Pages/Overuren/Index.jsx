import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import { XMarkIcon, PlusIcon, PencilIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function OverurenIndex({ overuren, filters }) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        datum: '',
        minuten: '',
        reden: '',
        status: 'CONCEPT',
    });

    const formatMinutesToHoursMinutes = (minuten) => {
        const uren = Math.floor(Math.abs(minuten) / 60);
        const mins = Math.abs(minuten) % 60;
        const sign = minuten < 0 ? '-' : '';
        return `${sign}${uren}u ${mins}m`;
    };

    const getStatusBadgeStyle = (status) => {
        const styles = {
            CONCEPT: { backgroundColor: '#718096', color: '#FFFFFF' },
            INGEDIEND: { backgroundColor: '#D4A5FF', color: '#2D3748' },
            GOEDGEKEURD: { backgroundColor: '#BAFFC9', color: '#2D3748' },
            AFGEKEURD: { backgroundColor: '#FFB3BA', color: '#2D3748' },
        };
        return styles[status] || styles.CONCEPT;
    };

    const handleSubmit = (e, overrideStatus = null) => {
        e.preventDefault();

        const submitData = overrideStatus
            ? { ...data, status: overrideStatus }
            : data;

        if (editingId) {
            router.put(`/overuren/${editingId}`, submitData, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setEditingId(null);
                    setShowForm(false);
                },
            });
        } else {
            router.post('/overuren', submitData, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setShowForm(false);
                },
            });
        }
    };

    const handleEdit = (uur) => {
        setData({
            datum: uur.datum,
            minuten: uur.minuten,
            reden: uur.reden || '',
            status: uur.status,
        });
        setEditingId(uur.id);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (confirm('Weet je zeker dat je deze registratie wilt verwijderen?')) {
            router.delete(`/overuren/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmitForApproval = (id) => {
        if (confirm('Weet je zeker dat je deze registratie wilt indienen voor goedkeuring?')) {
            put(`/overuren/${id}`, {
                status: 'INGEDIEND',
            }, {
                preserveScroll: true,
            });
        }
    };

    const cancelEdit = () => {
        reset();
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <Layout>
            <Head title="Mijn Overuren" />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: '#2D3748' }}>
                        Mijn Overuren
                    </h1>
                    <p style={{ color: '#718096' }}>Beheer je overuren registraties</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => {
                        if (showForm && !editingId) {
                            setShowForm(false);
                            reset();
                        } else {
                            setShowForm(true);
                            setEditingId(null);
                            reset();
                        }
                    }}
                >
                    {showForm && !editingId ? (
                        <><XMarkIcon className="w-5 h-5 inline mr-1" /> Annuleren</>
                    ) : (
                        <><PlusIcon className="w-5 h-5 inline mr-1" /> Nieuwe Registratie</>
                    )}
                </Button>
            </div>

            {/* Form Card */}
            {showForm && (
                <Card className="mb-6">
                    <h2 className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
                        {editingId ? 'Bewerk Registratie' : 'Nieuwe Overuren Registratie'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Datum"
                                type="date"
                                value={data.datum}
                                onChange={(e) => setData('datum', e.target.value)}
                                error={errors.datum}
                                required
                            />
                            <Input
                                label="Minuten"
                                type="number"
                                value={data.minuten}
                                onChange={(e) => setData('minuten', e.target.value)}
                                placeholder="Bijv. 60 (voor 1 uur)"
                                error={errors.minuten}
                                required
                            />
                        </div>
                        <Input
                            label="Reden (optioneel)"
                            type="text"
                            value={data.reden}
                            onChange={(e) => setData('reden', e.target.value)}
                            placeholder="Waarom heb je overuren gemaakt?"
                            error={errors.reden}
                        />
                        <div className="flex gap-3 mt-4">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={processing}
                            >
                                {editingId ? 'Bijwerken' : 'Opslaan als Concept'}
                            </Button>
                            {!editingId && (
                                <Button
                                    type="button"
                                    variant="success"
                                    disabled={processing}
                                    onClick={(e) => handleSubmit(e, 'INGEDIEND')}
                                >
                                    Opslaan en Indienen
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={cancelEdit}
                            >
                                Annuleren
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Overuren List */}
            <Card>
                <h2 className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
                    Registraties
                </h2>

                {overuren.data && overuren.data.length > 0 ? (
                    <div className="space-y-3">
                        {overuren.data.map((uur) => (
                            <div
                                key={uur.id}
                                className="p-4 rounded-lg border-2"
                                style={{
                                    backgroundColor: '#F7FAFC',
                                    borderColor: '#E2E8F0',
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-semibold" style={{ color: '#2D3748' }}>
                                                {new Date(uur.datum).toLocaleDateString('nl-NL', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span
                                                className="px-3 py-1 rounded-full text-sm font-semibold"
                                                style={getStatusBadgeStyle(uur.status)}
                                            >
                                                {uur.status}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold mb-1" style={{ color: '#2D3748' }}>
                                            {uur.formatted_time}
                                        </p>
                                        {uur.reden && (
                                            <p className="text-sm italic" style={{ color: '#718096' }}>
                                                "{uur.reden}"
                                            </p>
                                        )}
                                        {uur.afkeur_reden && (
                                            <p className="text-sm mt-2 p-2 rounded" style={{ backgroundColor: '#FFB3BA', color: '#2D3748' }}>
                                                Afkeur reden: {uur.afkeur_reden}
                                            </p>
                                        )}
                                        <p className="text-xs mt-2" style={{ color: '#718096' }}>
                                            Week {uur.week_nummer} • Jaar {uur.jaar}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        {(uur.status === 'CONCEPT' || uur.status === 'AFGEKEURD') && (
                                            <>
                                                <Button
                                                    variant="secondary"
                                                    className="px-3 py-1 text-sm"
                                                    onClick={() => handleEdit(uur)}
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </Button>
                                                {uur.status === 'CONCEPT' && (
                                                    <Button
                                                        variant="success"
                                                        className="px-3 py-1 text-sm"
                                                        onClick={() => handleSubmitForApproval(uur.id)}
                                                    >
                                                        <CheckIcon className="w-4 h-4 inline mr-1" /> Indienen
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                        {uur.status === 'CONCEPT' && (
                                            <Button
                                                variant="danger"
                                                className="px-3 py-1 text-sm"
                                                onClick={() => handleDelete(uur.id)}
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8" style={{ color: '#718096' }}>
                        Nog geen overuren geregistreerd. Klik op "Nieuwe Registratie" om te beginnen!
                    </p>
                )}

                {/* Pagination */}
                {overuren.links && overuren.links.length > 3 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {overuren.links.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                className="px-4 py-2 rounded-lg transition-all"
                                style={{
                                    backgroundColor: link.active ? '#B8E6D1' : '#E2E8F0',
                                    color: link.active ? '#2D3748' : '#718096',
                                    cursor: link.url ? 'pointer' : 'not-allowed',
                                }}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </Card>
        </Layout>
    );
}
