import { useState } from 'react';
import {
  PModal,
  PHeading,
  PText,
  PButton,
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
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
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

  const surfaceColor = theme === 'dark' ? '#202330' : '#f7f4ee';
  const borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e9e4d8';
  const inputCls = `w-full rounded-2xl px-4 py-3 text-base outline-none transition-all ${
    theme === 'dark'
      ? 'bg-[#181b22] border border-white/10 text-slate-100 focus:border-[#4eba87]'
      : 'bg-white border border-[#e9e4d8] text-slate-900 focus:border-[#4eba87]'
  }`;

  return (
    <PModal
      open={open}
      onDismiss={handleClose}
      theme={theme}
      dismissButton={true}
      fullscreen={{ base: true, s: false }}
    >
      <div slot="header" className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#4eba87] flex items-center justify-center text-lg shadow-sm">
          ⚡
        </div>
        <div>
          <PHeading size="small" tag="h2" theme={theme}>
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </PHeading>
          <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#94a3b8' : '#78716c' }}>
            {mode === 'login' ? 'Sincroniza tus registros en la nube' : 'Empieza a transformar tu rendimiento'}
          </PText>
        </div>
      </div>

      <div className="flex flex-col gap-5 py-2">
        {/* Toggle Mode Pills */}
        <div
          className="flex p-1 rounded-2xl"
          style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-[#4eba87] text-white shadow-xs'
                : theme === 'dark'
                ? 'text-[#94a3b8] hover:text-white'
                : 'text-[#706453] hover:text-black'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'register'
                ? 'bg-[#4eba87] text-white shadow-xs'
                : theme === 'dark'
                ? 'text-[#94a3b8] hover:text-white'
                : 'text-[#706453] hover:text-black'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#afb0b3]">
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

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#afb0b3]">
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
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#afb0b3]">
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

          <div className="pt-2">
            <div
              style={{
                borderRadius: '9999px',
                overflow: 'hidden',
                width: '100%',
                transform: 'translateZ(0)',
              }}
            >
              <PButton
                variant="primary"
                type="submit"
                theme={theme}
                disabled={submitting}
                style={{ width: '100%', margin: 0 }}
              >
                {submitting ? (
                  <PSpinner size="small" theme={theme} />
                ) : mode === 'login' ? (
                  'Ingresar'
                ) : (
                  'Registrarme'
                )}
              </PButton>
            </div>
          </div>
        </form>

        <div className="text-center">
          <PText
            size="xx-small"
            theme={theme}
            style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}
          >
            Tus datos de salud y nutrición están protegidos con cifrado y seguridad RLS de extremo a extremo.
          </PText>
        </div>
      </div>
    </PModal>
  );
}
