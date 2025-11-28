import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const HRDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/hr/dashboard');
      setStats(response.data);
    } catch (error) {
      toast.error('Kon dashboard niet laden');
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
              HR Dashboard
            </h1>
            <p className="text-text-secondary">Welkom, {user.voornaam}</p>
          </div>
          <Button variant="secondary" onClick={logout}>
            Uitloggen
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card hover className="text-center">
            <div className="text-warning text-3xl mb-2">⏳</div>
            <h3 className="text-sm font-semibold text-text-secondary">
              Te Beoordelen
            </h3>
            <p className="text-3xl font-bold text-lavender mt-2">
              {stats?.statistieken?.te_beoordelen || 0}
            </p>
          </Card>

          <Card hover className="text-center">
            <div className="text-success text-3xl mb-2">📅</div>
            <h3 className="text-sm font-semibold text-text-secondary">
              Deze Week
            </h3>
            <p className="text-3xl font-bold text-mint mt-2">
              {stats?.statistieken?.deze_week || 0}
            </p>
          </Card>

          <Card hover className="text-center">
            <div className="text-lavender text-3xl mb-2">👥</div>
            <h3 className="text-sm font-semibold text-text-secondary">
              Medewerkers
            </h3>
            <p className="text-3xl font-bold text-peach mt-2">
              {stats?.statistieken?.medewerkers || 0}
            </p>
          </Card>

          <Card hover className="text-center">
            <div className="text-mint text-3xl mb-2">⏱️</div>
            <h3 className="text-sm font-semibold text-text-secondary">
              Totaal Uren
            </h3>
            <p className="text-3xl font-bold text-lavender mt-2">
              {stats?.statistieken?.totaal_uren || 0}u
            </p>
          </Card>
        </div>

        {/* Recent Submissions */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text-primary">
              Recente Indieningen
            </h2>
            <Button variant="primary">Alles Bekijken</Button>
          </div>

          {stats?.recente_indieningen && stats.recente_indieningen.length > 0 ? (
            <div className="space-y-3">
              {stats.recente_indieningen.map((indiening) => (
                <div
                  key={indiening.id}
                  className="flex justify-between items-center p-4 bg-bg-primary rounded-lg hover:bg-opacity-70 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-text-primary">
                      {indiening.medewerker}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {new Date(indiening.datum).toLocaleDateString('nl-NL')} -{' '}
                      {indiening.formatted}
                    </p>
                    {indiening.reden && (
                      <p className="text-sm text-text-secondary italic mt-1">
                        "{indiening.reden}"
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="success" className="px-4 py-2">
                      ✅
                    </Button>
                    <Button variant="danger" className="px-4 py-2">
                      ❌
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-center py-8">
              Geen nieuwe indieningen
            </p>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Button variant="primary" className="w-full py-4">
            👥 Medewerkers Beheer
          </Button>
          <Button variant="secondary" className="w-full py-4">
            📊 Rapportages
          </Button>
          <Button variant="secondary" className="w-full py-4">
            📥 Export naar Excel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
