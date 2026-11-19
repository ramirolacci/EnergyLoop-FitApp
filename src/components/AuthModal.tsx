import { useState, useEffect } from 'react';
import {
  PModal,
  PHeading,
  PText,
  PInlineNotification,
  PSpinner,
} from '@porsche-design-system/components-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface Props {
  open: boolean;
  onDismiss: () => void;
}

export function AuthModal({ open, onDismiss }: Props) {
  const { theme, toast } = useApp();
  const { signInWithEmail, signUpWithEmail, authModalMode } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (open) {
      setMode(authModalMode || 'login');
      setErrorMsg('');
      setInfoMsg('');
    }
  }, [open, authModalMode]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setErrorMsg('');
    setInfoMsg('');
  };

  const handleClose = () => {
    resetForm();
    onDismiss();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Por favor completa todos los campos requeridos');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSubmitting(true);

    if (mode === 'login') {
      const res = await signInWithEmail(email, password);
      setSubmitting(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        toast('¡Bienvenido de nuevo!', 'success');
        handleClose();
      }
    } else {
      if (!fullName.trim()) {
        setErrorMsg('Por favor ingresa tu nombre');
        setSubmitting(false);
        return;
      }

      const res = await signUpWithEmail(email, password, fullName);
      setSubmitting(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        toast('Cuenta creada con éxito', 'success');
        setInfoMsg('¡Cuenta creada! Si tu proyecto tiene confirmación de email activada, revisa tu casilla.');
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    }
  };

  const inputCls = 'w-full rounded-2xl px-4 py-3 text-base outline-none transition-all bg-white border border-[#E4DCCE] text-stone-900 focus:border-[#3BA676] shadow-2xs';
  const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-[#5C5245]';

  return (
    <PModal
      open={open}
      onDismiss={handleClose}
      theme={theme}
      dismissButton={true}
      fullscreen={{ base: true, s: false }}
    >
      {/* Header específico para cada pantalla (sin switches redundantes) */}
      <div slot="header" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#3BA676] text-white flex items-center justify-center text-lg shadow-xs">
          {mode === 'login' ? '🔑' : '✨'}
        </div>
        <div>
          <PHeading size="small" tag="h2" theme={theme}>
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </PHeading>
          <PText size="xx-small" theme={theme} style={{ color: '#5C5245' }}>
            {mode === 'login' 
              ? 'Accede a tu cuenta de EnergyLoop' 
              : 'Empieza a registrar tu nutrición y entrenamientos'}
          </PText>
        </div>
      </div>

      <div className="flex flex-col gap-4 py-2">
        {errorMsg && (
          <PInlineNotification
            state="error"
            heading="Atención"
            description={errorMsg}
            theme={theme}
          />
        )}

        {infoMsg && (
          <PInlineNotification
            state="success"
            heading="¡Listo!"
            description={infoMsg}
            theme={theme}
          />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Solo en Crear Cuenta */}
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>
                Nombre completo
              </label>
              <input
                type="text"
                placeholder="Ej. Martín Gómez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputCls}
                disabled={submitting}
                autoFocus
              />
            </div>
          )}

          {/* Campo Correo Electrónico */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              disabled={submitting}
              autoCapitalize="none"
              autoCorrect="off"
              autoFocus={mode === 'login'}
            />
          </div>

          {/* Campo Contraseña */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              disabled={submitting}
            />
          </div>

          {/* Botón de acción principal */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
              style={{
                background: '#3BA676',
                border: '1.5px solid #339468',
                color: '#FFFFFF',
              }}
            >
              {submitting ? (
                <PSpinner size="small" theme={theme} />
              ) : mode === 'login' ? (
                <>
                  <span>Iniciar Sesión</span>
                  <span>➔</span>
                </>
              ) : (
                <>
                  <span>Crear Cuenta</span>
                  <span>✨</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Enlace sutil para alternar si se equivocó de botón en la bienvenida */}
        <div className="text-center pt-1">
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className="text-[11px] font-bold text-[#5C5245] hover:text-[#1C1917] hover:underline transition-all"
            >
              ¿No tienes cuenta aún? <span className="text-[#3BA676]">Crear cuenta</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className="text-[11px] font-bold text-[#5C5245] hover:text-[#1C1917] hover:underline transition-all"
            >
              ¿Ya tienes una cuenta? <span className="text-[#3BA676]">Iniciar sesión</span>
            </button>
          )}
        </div>

        <div className="text-center pt-2">
          <PText
            size="xx-small"
            theme={theme}
            style={{ color: '#8C8273' }}
          >
            Tus datos de salud y nutrición están protegidos con cifrado y seguridad RLS de extremo a extremo.
          </PText>
        </div>
      </div>
    </PModal>
  );
}
