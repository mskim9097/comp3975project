import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AiChatBox from '../components/AiChatBox';
import MatchedItemsList from '../components/MatchedItemsList';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AiChatResponse, MatchItem, StructuredData } from '../types/ai';

function MainPage() {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const user = userString ? JSON.parse(userString) : null;

  const [assistantReply, setAssistantReply] = useState('');
  const [structuredData, setStructuredData] = useState<StructuredData | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);

  useEffect(() => {
    if (!token || !user) {
      navigate('/signin');
    }
  }, [token, user, navigate]);

  const handleAiResult = (result: AiChatResponse) => {
    setAssistantReply(result.assistant_reply);
    setStructuredData(result.structured_data);
    setMatches(result.matches);
  };

  return (
    <>
      <Header />

      <div className="auth-page d-flex justify-content-center align-items-center">
        <div className="auth-card text-center">
          <img
            src="/images/bcit-logo.png"
            alt="BCIT Logo"
            className="brand-logo mb-3"
          />

          <h1 className="auth-title">BCIT Lost &amp; Found</h1>
          <p className="auth-subtitle">Main Page</p>

          <div className="mt-4">
            <p className="text-muted mb-2">
              Welcome{user?.first_name ? `, ${user.first_name}` : ''}.
            </p>
            <p className="text-muted mb-0">
              Use the AI chat below to search for possible lost item matches.
            </p>
          </div>

          <div className="mt-4 text-start">
            {token && <AiChatBox token={token} onResult={handleAiResult} />}

            <MatchedItemsList
              assistantReply={assistantReply}
              structuredData={structuredData}
              matches={matches}
            />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default MainPage;