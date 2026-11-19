import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface Props {
  open: boolean;
  onDismiss: () => void;
}

export function AuthModal({ open, onDismiss }: Props) {
  const { toast } = useApp();
  const { signInWithEmail, signUpWithEmail, authModalMode } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Sincronizar el modo cuando se abre el modal
  useEffect(() => {
    if (open) {
      setMode(authModalMode || 'login');
      setErrorMsg('');
      setInfoMsg('');
    }
  }, [open, authModalMode]);

  // Manejar tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setErrorMsg('');
    setInfoMsg('');
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onDismiss();
  };

  // Reglas de validación y recomendaciones de seguridad de contraseña
  const passwordRules = useMemo(() => {
    return [
      {
        id: 'length',
        label: 'Mínimo 8 caracteres',
        valid: password.length >= 8,
      },
      {
        id: 'uppercase',
        label: 'Al menos una letra mayúscula (A-Z)',
        valid: /[A-Z]/.test(password),
      },
      {
        id: 'number',
        label: 'Al menos un número (0-9)',
        valid: /[0-9]/.test(password),
      },
      {
        id: 'special',
        label: 'Un símbolo o carácter especial (!@#$%...)',
        valid: /[^A-Za-z0-9]/.test(password),
      },
    ];
  }, [password]);

  const fulfilledCount = passwordRules.filter((r) => r.valid).length;

  const strengthMeta = useMemo(() => {
    if (password.length === 0) return { label: 'Introduce tu contraseña', color: '#8C8273', percent: 0 };
    if (fulfilledCount === 1) return { label: 'Débil', color: '#E17055', percent: 25 };
    if (fulfilledCount === 2) return { label: 'Regular', color: '#E67E22', percent: 50 };
    if (fulfilledCount === 3) return { label: 'Buena', color: '#27AE60', percent: 75 };
    return { label: '¡Muy segura!', color: '#3BA676', percent: 100 };
  }, [fulfilledCount, password.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Por favor completa todos los campos obligatorios');
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
        setErrorMsg('Por favor ingresa tu nombre completo');
        setSubmitting(false);
        return;
      }

      const res = await signUpWithEmail(email, password, fullName);
      setSubmitting(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        toast('Cuenta creada con éxito', 'success');
        setInfoMsg('¡Cuenta creada con éxito! Si tu proyecto requiere confirmación por email, revisa tu casilla.');
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    }
  };

  if (!open) return null;

  const inputCls =
    'w-full rounded-2xl px-4 py-3 text-base outline-none transition-all bg-white border border-[#E4DCCE] text-stone-900 focus:border-[#3BA676] shadow-2xs';
  const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-[#5C5245] flex items-center';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200"
      style={{
        background: 'rgba(28, 25, 23, 0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="w-full max-w-[420px] rounded-[28px] p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto no-scrollbar relative animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: '#F4EFE6',
          border: '1.5px solid #E4DCCE',
        }}
      >
        {/* Barra superior con encabezado e icono de cerrar */}
        <div className="flex items-center justify-between pb-1 border-b border-[#E4DCCE]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3BA676] text-white flex items-center justify-center text-lg shadow-xs">
              {mode === 'login' ? '🔑' : '✨'}
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1C1917] tracking-tight leading-tight">
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>
              <p className="text-xs text-[#5C5245] font-medium leading-none mt-0.5">
                {mode === 'login'
                  ? 'Accede a tu cuenta de EnergyLoop'
                  : 'Empieza a registrar tu nutrición y hábitos'}
              </p>
            </div>
          </div>

          {/* Botón de cerrar */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C5245] hover:text-[#1C1917] hover:bg-[#EAE4D7] transition-all duration-150 active:scale-90"
          >
            ✕
          </button>
        </div>

        {/* Notificaciones de error o info */}
        {errorMsg && (
          <div className="rounded-2xl p-3 bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs font-medium flex items-start gap-2 shadow-2xs">
            <span className="font-bold">⚠️</span>
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {infoMsg && (
          <div className="rounded-2xl p-3 bg-[#DDF0E4] border border-[#BEDECB] text-[#164E35] text-xs font-medium flex items-start gap-2 shadow-2xs">
            <span className="font-bold">✅</span>
            <div className="flex-1">{infoMsg}</div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Solo en Crear Cuenta: Nombre completo */}
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>
                <span>Nombre completo</span>
                <span className="text-red-500 font-bold ml-1">*</span>
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

          {/* Campo Correo Electrónico (con asterisco rojo) */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>
              <span>Correo Electrónico</span>
              <span className="text-red-500 font-bold ml-1">*</span>
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

          {/* Campo Contraseña (con asterisco rojo) */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>
              <span>Contraseña</span>
              <span className="text-red-500 font-bold ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputCls} pr-11`}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 text-sm transition-colors"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          {/* Ítems en lista de recomendaciones para la contraseña */}
          <div
            className="rounded-2xl p-3 flex flex-col gap-2 transition-all duration-200"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E4DCCE',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5C5245]">
                Recomendaciones de seguridad
              </span>
              <span
                className="text-[10px] font-black uppercase tracking-wider"
                style={{ color: strengthMeta.color }}
              >
                {password.length > 0 ? `${strengthMeta.label} (${fulfilledCount}/4)` : '4 requisitos'}
              </span>
            </div>

            {/* Mini barra de progreso de seguridad */}
            <div className="w-full h-1.5 bg-[#EAE4D7] rounded-full overflow-hidden flex gap-1">
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  className="flex-1 h-full rounded-full transition-all duration-300"
                  style={{
                    background:
                      fulfilledCount > step
                        ? strengthMeta.color
                        : '#E4DCCE',
                  }}
                />
              ))}
            </div>

            {/* Lista interactiva de requisitos que se van tildando */}
            <div className="flex flex-col gap-1.5 pt-1">
              {passwordRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center gap-2 text-xs transition-all duration-200"
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-200 shrink-0 ${
                      rule.valid
                        ? 'bg-[#3BA676] text-white shadow-2xs scale-105'
                        : 'border-2 border-[#D1C7B7] text-transparent bg-[#F4EFE6]'
                    }`}
                  >
                    ✓
                  </div>
                  <span
                    className={`text-[11px] leading-tight transition-colors duration-200 ${
                      rule.valid
                        ? 'text-[#164E35] font-bold line-through decoration-[#3BA676]/60'
                        : 'text-[#78716C] font-normal'
                    }`}
                  >
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Botón de acción principal */}
          <div className="pt-1">
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
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

        {/* Enlace sutil para alternar entre Iniciar Sesión y Crear Cuenta */}
        <div className="text-center pt-0.5">
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
              ¿No tienes cuenta aún?{' '}
              <span className="text-[#3BA676] font-black">Crear cuenta</span>
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
              ¿Ya tienes una cuenta?{' '}
              <span className="text-[#3BA676] font-black">Iniciar sesión</span>
            </button>
          )}
        </div>

        {/* Nota de seguridad al pie */}
        <div className="text-center pt-1 border-t border-[#E4DCCE]/60">
          <p className="text-[10px] text-[#8C8273] font-medium leading-relaxed">
            🔒 Datos protegidos con cifrado de extremo a extremo y seguridad Supabase RLS.
          </p>
        </div>
      </div>
    </div>
  );
}
