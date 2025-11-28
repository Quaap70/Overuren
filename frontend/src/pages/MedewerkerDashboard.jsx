import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const MedewerkerDashboard = () => {
  const { user, logout } = useAuth();
  const [saldo, setSaldo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaldo();
  }, []);

  const fetchSaldo = async () => {
    try {
      const response = await api.get('/uren/mijn-saldo');
      setSaldo(response.data);
    } catch (error) {
      toast.error('Kon saldo niet ophalen');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-xl text-text-secondary">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Welkom, {user.voornaam}!
            </h1>
            <p className="text-text-secondary">Overuren Dashboard</p>
          </div>
          <Button variant="secondary" onClick={logout}>
            Uitloggen
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Saldo Card */}
          <Card className="col-span-full md:col-span-1 bg-gradient-to-br from-lavender to-mint text-center">
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Jouw Huidige Saldo
            </h2>
            <div className="text-5xl font-bold text-text-primary my-4">
              {saldo?.formatted || '0u 0m'}
            </div>
            <p className="text-sm text-text-secondary">
              Laatst bijgewerkt:{' '}
              {saldo?.laatst_bijgewerkt
                ? new Date(saldo.laatst_bijgewerkt).toLocaleDateString('nl-NL')
                : '-'}
            </p>
          </Card>

          {/* Quick Actions */}
          <Card className="col-span-full md:col-span-2">
            <h2 className="text-xl font-bold text-text-primary mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button variant="primary" className="w-full">
                ➕ Nieuwe Uren Invoeren
              </Button>
              <Button variant="secondary" className="w-full">
                📊 Mijn Overzicht
              </Button>
              <Button variant="secondary" className="w-full">
                📅 Week Overzicht
              </Button>
            </div>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card hover>
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold text-text-primary">Overgedragen Saldo</h3>
              <p className="text-2xl font-bold text-lavender mt-2">
                {Math.floor((saldo?.overgedragen || 0) / 60)}u{' '}
                {(saldo?.overgedragen || 0) % 60}m
              </p>
            </div>
          </Card>

          <Card hover>
            <div className="text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <h3 className="font-semibold text-text-primary">Dit Jaar</h3>
              <p className="text-2xl font-bold text-mint mt-2">
                {saldo?.jaar || new Date().getFullYear()}
              </p>
            </div>
          </Card>

          <Card hover>
            <div className="text-center">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="font-semibold text-text-primary">Status</h3>
              <p className="text-2xl font-bold text-success mt-2">Actief</p>
            </div>
          </Card>
        </div>

        {/* Placeholder for future features */}
        <Card className="mt-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">Recente Activiteit</h2>
          <p className="text-text-secondary text-center py-8">
            Nog geen recente activiteit. Start met het invoeren van je overuren!
          </p>
        </Card>
      </div>
    </div>
  );
};

export default MedewerkerDashboard;
