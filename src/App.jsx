import React, { useState, useEffect } from 'react';
import { getStorage, setStorage, KEYS } from './services/storage';
import { initialAgents, initialAdvertisers, initialCars, initialLeads } from './data/initialData';
import { DEFAULT_CAR_FEATURES } from './data/carFeatures';
import Home from './pages/Home';
import AgentDashboard from './pages/AgentDashboard';
import AgentStorefront from './pages/AgentStorefront';
import AdvertiserDashboard from './pages/AdvertiserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CarDetailModal from './components/car/CarDetailModal';
import LoginForm from './components/auth/LoginForm';
import AgentRegisterForm from './components/auth/AgentRegisterForm';
import AdvertiserRegisterForm from './components/auth/AdvertiserRegisterForm';
import Toast from './components/common/Toast';
import './styles/index.css';

export function App() {
  const [view, setView] = useState('home');
  const [agents, setAgents] = useState(initialAgents);
  const [advertisers, setAdvertisers] = useState(initialAdvertisers);
  const [cars, setCars] = useState(initialCars);
  const [leads, setLeads] = useState(initialLeads);
  const [carFeatures, setCarFeatures] = useState(DEFAULT_CAR_FEATURES);

  const [currentAgent, setCurrentAgent] = useState(null);
  const [currentAdvertiser, setCurrentAdvertiser] = useState(null);
  const [selectedCar, setSelectedCar] = useState(initialCars[0]);
  const [activeStorefrontAgent, setActiveStorefrontAgent] = useState(null);

  const [agentTab, setAgentTab] = useState('overview');
  const [adminTab, setAdminTab] = useState('overview');
  const [advertiserTab, setAdvertiserTab] = useState('overview');

  const [includeAdmin, setIncludeAdmin] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [attribution, setAttribution] = useState('PLATFORM');

  // Initial localStorage load and URL parameter check
  useEffect(() => {
    const timer = setTimeout(() => {
      const storedAgents = getStorage(KEYS.AGENTS, initialAgents);
      const storedAdvertisers = getStorage(KEYS.ADVERTISERS, initialAdvertisers);
      const storedCars = getStorage(KEYS.CARS, initialCars);
      const storedLeads = getStorage(KEYS.LEADS, initialLeads);
      const storedFeatures = getStorage(KEYS.CAR_FEATURES, DEFAULT_CAR_FEATURES);

      setAgents(storedAgents);
      setAdvertisers(storedAdvertisers);
      setCars(storedCars);
      setLeads(storedLeads);
      setCarFeatures(storedFeatures);

      const params = new URLSearchParams(window.location.search);
      const carId = params.get('car');
      const refCode = params.get('ref');
      const viewParam = params.get('view');

      if (refCode) {
        const foundAgent = storedAgents.find(
          (a) => a.code === refCode || a.code.toLowerCase() === refCode.toLowerCase()
        );
        if (foundAgent) {
          setActiveStorefrontAgent(foundAgent);
        } else {
          setActiveStorefrontAgent(storedAgents[0]);
        }

        try {
          const firstTouch = JSON.parse(localStorage.getItem(KEYS.FIRST_TOUCH) || 'null');
          const isFresh = firstTouch && Date.now() - firstTouch.createdAt < 30 * 24 * 60 * 60 * 1000;

          if (!isFresh) {
            localStorage.setItem(
              KEYS.FIRST_TOUCH,
              JSON.stringify({ agentCode: refCode, createdAt: Date.now() })
            );
            setAttribution(refCode);
          } else {
            setAttribution(firstTouch.agentCode);
          }
        } catch {
          setAttribution(refCode);
        }

        if (viewParam === 'storefront') {
          setView('storefront');
          return;
        }
      }

      if (carId) {
        const foundCar = storedCars.find((c) => c.id === carId);
        if (foundCar) setSelectedCar(foundCar);
        setView('customer');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    setStorage(KEYS.AGENTS, agents);
  }, [agents]);

  useEffect(() => {
    setStorage(KEYS.ADVERTISERS, advertisers);
  }, [advertisers]);

  useEffect(() => {
    setStorage(KEYS.CARS, cars);
  }, [cars]);

  useEffect(() => {
    setStorage(KEYS.LEADS, leads);
  }, [leads]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2800);
  };

  const handleBackToHome = () => {
    window.history.replaceState({}, '', window.location.pathname);
    setView('home');
  };

  const handleSelectCar = (car, refCode) => {
    setSelectedCar(car);
    if (refCode) {
      setAttribution(refCode);
    } else {
      try {
        const firstTouch = JSON.parse(localStorage.getItem(KEYS.FIRST_TOUCH) || 'null');
        const isFresh = firstTouch && Date.now() - firstTouch.createdAt < 30 * 24 * 60 * 60 * 1000;
        setAttribution(isFresh ? firstTouch.agentCode : 'PLATFORM');
      } catch {
        setAttribution('PLATFORM');
      }
    }

    const query = refCode ? `?ref=${refCode}&car=${car.id}` : `?car=${car.id}`;
    window.history.replaceState({}, '', query);
    setView('customer');
  };

  const handlePreviewStorefront = (agentCode, carId) => {
    const foundAgent = agents.find((a) => a.code === agentCode) || currentAgent || agents[0];
    setActiveStorefrontAgent(foundAgent);
    if (carId) {
      const foundCar = cars.find((c) => c.id === carId);
      if (foundCar) setSelectedCar(foundCar);
      setView('customer');
    } else {
      setView('storefront');
    }
  };

  return (
    <main>
      {view === 'home' && (
        <Home
          cars={cars}
          onRegister={() => setView('register')}
          onAdvertiserRegister={() => setView('advertiser-register')}
          onLogin={() => {
            setIncludeAdmin(true);
            setView('login');
          }}
          onMobileLogin={() => {
            setIncludeAdmin(false);
            setView('login');
          }}
          onSelect={handleSelectCar}
        />
      )}

      {view === 'storefront' && (
        <AgentStorefront
          agent={activeStorefrontAgent || agents[0]}
          cars={cars}
          onSelectCar={handleSelectCar}
          onBackHome={handleBackToHome}
          onLeadSubmitted={(newLead) => {
            setLeads((prev) => [newLead, ...prev]);
          }}
          showToast={showToast}
        />
      )}

      {view === 'register' && (
        <AgentRegisterForm
          onBack={handleBackToHome}
          onNavigateToLogin={() => setView('login')}
          onComplete={(newAgent) => {
            setAgents((prev) => [...prev, newAgent]);
            setView('login');
            showToast('สมัครสำเร็จ กรุณารอแอดมินอนุมัติบัญชี');
          }}
        />
      )}

      {view === 'advertiser-register' && (
        <AdvertiserRegisterForm
          onBack={handleBackToHome}
          onNavigateToLogin={() => setView('login')}
          onComplete={(newAdvertiser) => {
            setAdvertisers((prev) => [...prev, newAdvertiser]);
            setView('login');
            showToast('ส่งใบสมัครเต็นท์แล้ว กรุณารอแอดมินอนุมัติ');
          }}
        />
      )}

      {view === 'login' && (
        <LoginForm
          agents={agents}
          advertisers={advertisers}
          includeAdmin={includeAdmin}
          onBack={handleBackToHome}
          onNavigateToRegister={() => setView('register')}
          onNavigateToAdvertiserRegister={() => setView('advertiser-register')}
          onAgent={(agent) => {
            setCurrentAgent(agent);
            setView('agent');
          }}
          onAdmin={() => setView('admin')}
          onAdvertiser={(adv) => {
            setCurrentAdvertiser(adv);
            setView('advertiser');
          }}
        />
      )}

      {view === 'agent' && currentAgent && (
        <AgentDashboard
          agent={currentAgent}
          cars={cars}
          leads={leads}
          tab={agentTab}
          setTab={setAgentTab}
          onLogout={handleBackToHome}
          onPreview={handleSelectCar}
          onPreviewStorefront={handlePreviewStorefront}
          showToast={showToast}
        />
      )}

      {view === 'admin' && (
        <AdminDashboard
          agents={agents}
          setAgents={setAgents}
          advertisers={advertisers}
          setAdvertisers={setAdvertisers}
          cars={cars}
          setCars={setCars}
          leads={leads}
          setLeads={setLeads}
          carFeatures={carFeatures}
          setCarFeatures={setCarFeatures}
          tab={adminTab}
          setTab={setAdminTab}
          onLogout={handleBackToHome}
          showToast={showToast}
        />
      )}

      {view === 'advertiser' && currentAdvertiser && (
        <AdvertiserDashboard
          advertiser={currentAdvertiser}
          onUpdate={(updated) => {
            setAdvertisers((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            setCurrentAdvertiser(updated);
          }}
          cars={cars}
          setCars={setCars}
          carFeatures={carFeatures}
          tab={advertiserTab}
          setTab={setAdvertiserTab}
          onLogout={handleBackToHome}
          showToast={showToast}
        />
      )}

      {view === 'customer' && (
        <CarDetailModal
          car={selectedCar}
          agents={agents}
          attribution={attribution}
          carFeatures={carFeatures}
          onBack={handleBackToHome}
          onLead={(newLead) => {
            setLeads((prev) => [newLead, ...prev]);
            showToast('ส่งข้อมูลแล้ว ทีม CLUBROD จะติดต่อกลับ');
          }}
        />
      )}

      <Toast message={toastMsg} />
    </main>
  );
}

export default App;
