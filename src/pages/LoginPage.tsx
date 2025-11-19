import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Carregar script do Google Identity Services
  useEffect(() => {
    const handleCredentialResponse = async (response: { credential: string }) => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await login(response.credential);
        
        if (result.success) {
          navigate('/');
        } else {
          setError(result.error || 'Erro ao fazer login');
          setLoading(false);
        }
      } catch (err) {
        const error = err as Error;
        setError(error.message || 'Erro ao fazer login');
        setLoading(false);
      }
    };

    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (clientId && clientId !== 'your-google-client-id.apps.googleusercontent.com') {
          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleCredentialResponse,
              locale: 'pt-BR',
            });
            setScriptLoaded(true);
          } catch (err) {
            console.error('Erro ao inicializar Google Identity:', err);
            setError('Erro ao configurar login do Google. Verifique o Client ID.');
          }
        } else {
          const envFile = import.meta.env.VITE_GOOGLE_CLIENT_ID 
            ? 'configurado mas inválido' 
            : 'não encontrado';
          setError(
            `VITE_GOOGLE_CLIENT_ID ${envFile}. ` +
            'Edite o arquivo .env na pasta frontend e adicione seu Client ID do Google Cloud Console. ' +
            'Formato: VITE_GOOGLE_CLIENT_ID=xxxxxx-xxxxx.apps.googleusercontent.com'
          );
        }
      }
    };

    // Check if script is already loaded
    if (window.google && window.google.accounts) {
      initializeGoogle();
    } else {
      // Load the script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Wait a bit to ensure it's fully loaded
        setTimeout(initializeGoogle, 100);
      };
      
      script.onerror = () => {
        setError('Erro ao carregar Google Identity Services. Verifique sua conexão.');
      };
      
      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (!existingScript) {
        document.body.appendChild(script);
      } else {
        // If it already exists, try to initialize after a delay
        setTimeout(initializeGoogle, 500);
      }
    }
  }, [login, navigate]);

  // Render button when script is loaded and ref is available
  useEffect(() => {
    if (scriptLoaded && googleButtonRef.current && window.google?.accounts?.id) {
      // Check if already rendered
      if (googleButtonRef.current.children.length > 0) {
        return;
      }
      
      try {
        // Force pt-BR locale on document as well
        if (document.documentElement.lang !== 'pt-BR') {
          document.documentElement.lang = 'pt-BR';
        }
        
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            locale: 'pt-BR',
            shape: 'rectangular',
            use_fedcm_for_prompt: false
          }
        );
        console.log('Botão do Google renderizado com sucesso em português');
      } catch (err) {
        console.error('Erro ao renderizar botão do Google:', err);
        setError('Erro ao renderizar botão do Google. Tente recarregar a página.');
      }
    }
  }, [scriptLoaded, googleButtonRef.current]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-sky-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaGoogle className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Reservas</h1>
          <p className="text-gray-600">Faça login para continuar</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <FaSpinner className="animate-spin" />
            <span>Processando login...</span>
          </div>
        )}

        {/* Botão do Google renderizado diretamente */}
        {scriptLoaded ? (
          <div 
            ref={googleButtonRef}
            className="w-full flex justify-center mb-4"
            style={{ minHeight: '40px' }}
            id="google-signin-button"
          />
        ) : (
          <div className="w-full mb-4 flex items-center justify-center" style={{ minHeight: '40px' }}>
            <div className="text-gray-500 text-sm">Carregando botão do Google...</div>
          </div>
        )}

        {/* Botão alternativo caso o renderizado não funcione */}
        {/* {scriptLoaded && (
          <div className="text-center mt-2">
            <button
              onClick={handleManualLogin}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
            >
              Ou clique aqui para abrir popup do Google
            </button>
          </div>
        )} */}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Ao continuar, você concorda com nossos termos de uso
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

