import { useState } from "react";
import svgPaths from "../imports/Wireframe10/svg-8264lkbyw7";
import imgMockup from "figma:asset/d82e277605fb807ff0e86dd082a368e1fd1b58a6.png";
import imgUsuaria from "../imports/Usuaria.png";
import imgInterfaz from "../imports/Interfaz.png";
import imgCapaceLogo from "../imports/Capace_logo.png";
import imgParaguayFlag from "../imports/Paraguay_bandera.png";
import imgBeneficios from "../imports/3_Beneficios.svg";
import imgBeneficiosPng from "../imports/3_Beneficios.png";

// Paraguay Flag Component
function ParaguayFlag({ className }: { className?: string }) {
  return (
    <img src={imgParaguayFlag} alt="Bandera Paraguay" className={className} />
  );
}

// Success Modal Component
function SuccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl px-12 py-16 max-w-[900px] mx-6 shadow-2xl">
        {/* Close button X */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-black hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 8L24 24M24 8L8 24" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-['Barlow'] text-center mb-8 tracking-tight">
          ¡SOLICITUD ENVIADA CON EXITO!
        </h2>

        {/* Message */}
        <p className="text-lg md:text-xl text-center mb-12 max-w-[700px] mx-auto leading-relaxed">
          Recibimos tu información correctamente. Muy pronto nos contactaremos contigo vá WhatsApp para brindarte más detalle sobre la convocatoria.
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full bg-[#04071C] text-white rounded-full py-4 px-8 text-lg font-medium hover:bg-[#0a0d24] transition-colors"
        >
          CERRAR
        </button>
      </div>
    </div>
  );
}

// Google Sheets integration
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwDlcZW4OWuDwGQwG0sSbWZLmGiw_ZGHCbrxdMWCwDm8r5l5Ef4YYNVmluXGPyCnNOg/exec";

const normalizeDominio = (value: string): string => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  const valueWithProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const url = new URL(valueWithProtocol);
    const hostname = url.hostname.toLowerCase();

    if (!hostname.includes(".") || hostname.startsWith(".") || hostname.endsWith(".")) {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
};

export default function App() {
  const [formData, setFormData] = useState({
    telefono: "",
    dominio: ""
  });

  const [formState, setFormState] = useState({
    isSubmitting: false,
    errors: {
      telefono: "",
      dominio: ""
    },
    submitError: ""
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [touched, setTouched] = useState({
    telefono: false,
    dominio: false
  });

  // Validation functions
  const validateDominio = (value: string): string => {
    if (!value.trim()) {
      return "El dominio web es requerido";
    }

    if (!normalizeDominio(value)) {
      return "Por favor ingresa un dominio válido (ej: tutienda.com.py, www.tutienda.com.py o https://www.tutienda.com.py)";
    }

    return "";
  };

  const validateTelefono = (value: string): string => {
    if (!value.trim()) {
      return "El teléfono es requerido";
    }

    // Paraguay phone validation (after +595, should be 9 digits)
    const phonePattern = /^[0-9]{9}$/;
    const cleanPhone = value.replace(/\s/g, "");

    if (!phonePattern.test(cleanPhone)) {
      return "El número debe tener 9 dígitos (ej: 981234567)";
    }

    return "";
  };

  const handleBlur = (field: "telefono" | "dominio") => {
    setTouched({ ...touched, [field]: true });

    let error = "";
    if (field === "telefono") {
      error = validateTelefono(formData.telefono);
    } else {
      error = validateDominio(formData.dominio);
      const normalizedDominio = normalizeDominio(formData.dominio);
      if (normalizedDominio) {
        setFormData({ ...formData, dominio: normalizedDominio });
      }
    }

    setFormState({
      ...formState,
      errors: { ...formState.errors, [field]: error }
    });
  };

  const handleChange = (field: "telefono" | "dominio", value: string) => {
    setFormData({ ...formData, [field]: value });

    // Clear error when user starts typing
    if (touched[field]) {
      setFormState({
        ...formState,
        errors: { ...formState.errors, [field]: "" }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ telefono: true, dominio: true });

    // Validate all fields
    const telefonoError = validateTelefono(formData.telefono);
    const dominioError = validateDominio(formData.dominio);
    const normalizedDominio = normalizeDominio(formData.dominio);

    if (telefonoError || dominioError) {
      setFormState({
        ...formState,
        errors: {
          telefono: telefonoError,
          dominio: dominioError
        }
      });
      return;
    }

    // Start submission
    setFormState({
      ...formState,
      isSubmitting: true,
      submitError: "",
      submitSuccess: false
    });

    try {
      // Send to Google Sheets
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Required for Google Apps Script
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telefono: `+595${formData.telefono}`,
          dominio: normalizedDominio,
          fecha: new Date().toISOString()
        })
      });

      // Note: With no-cors mode, we can't read the response
      // Assume success if no error was thrown
      setFormState({
        ...formState,
        isSubmitting: false,
        errors: { telefono: "", dominio: "" }
      });

      // Reset form
      setFormData({ telefono: "", dominio: "" });
      setTouched({ telefono: false, dominio: false });

      // Show success modal
      setShowSuccessModal(true);

    } catch (error) {
      setFormState({
        ...formState,
        isSubmitting: false,
        submitError: "Hubo un error al enviar tus datos. Por favor, intenta nuevamente."
      });
    }
  };

  return (
    <div className="bg-[#04071C] min-h-screen w-full relative overflow-hidden">
      {/* Background Effects - Halos superiores */}
      <div className="absolute left-1/2 top-[-200px] -translate-x-1/2 w-[1500px] h-[1500px] pointer-events-none opacity-60 md:opacity-80">
        <div className="absolute inset-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1809 1809">
            <g filter="url(#filter0_f_top_1)">
              <circle cx="904.5" cy="904.5" fill="#4D3CF7" r="504.5" style={{ mixBlendMode: "plus-lighter" }} />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="1809" id="filter0_f_top_1" width="1809" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_top_1" stdDeviation="250" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      <div className="absolute left-[20%] top-[-100px] w-[1200px] h-[1200px] pointer-events-none opacity-40 md:opacity-60">
        <div className="absolute inset-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1809 1809">
            <g filter="url(#filter0_f_top_2)">
              <circle cx="904.5" cy="904.5" fill="#5D9BFF" r="404.5" style={{ mixBlendMode: "plus-lighter" }} />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="1809" id="filter0_f_top_2" width="1809" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_top_2" stdDeviation="200" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      <div className="absolute right-[10%] top-[100px] w-[1000px] h-[1000px] pointer-events-none opacity-50 md:opacity-70">
        <div className="absolute inset-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1809 1809">
            <g filter="url(#filter0_f_top_3)">
              <circle cx="904.5" cy="904.5" fill="#4D3CF7" r="354.5" style={{ mixBlendMode: "plus-lighter" }} />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="1809" id="filter0_f_top_3" width="1809" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_top_3" stdDeviation="180" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 lg:px-[98px] py-6 md:h-[120px] gap-6 md:gap-0">
        <div className="flex items-center gap-8 md:gap-16">
          {/* Capace Logo */}
          <a href="https://www.capace.org.py/" target="_blank" rel="noopener noreferrer" className="h-[28px] md:h-[38px] w-[78px] md:w-[104px]">
            <img src={imgCapaceLogo} alt="Capace" className="w-full h-full object-contain hover:opacity-80 transition-opacity" />
          </a>

          {/* Giro Logo */}
          <a href="https://giro54latam.com/" target="_blank" rel="noopener noreferrer" className="h-[15px] md:h-[20.714px] w-[65px] md:w-[87px]">
            <svg className="block size-full hover:opacity-80 transition-opacity" fill="none" preserveAspectRatio="none" viewBox="0 0 87 20.7143">
              <path d={svgPaths.pbb11800} fill="white" />
              <path d={svgPaths.p28dd0500} fill="white" />
              <path d={svgPaths.pc95500} fill="white" />
              <path d={svgPaths.ped88600} fill="white" />
              <path d={svgPaths.p3e2f7480} fill="white" />
              <path d={svgPaths.pfedae00} fill="white" />
            </svg>
          </a>
        </div>

        <button
          onClick={() => {
            const formSection = document.getElementById('form-section');
            if (formSection) {
              formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="hidden md:flex bg-white rounded-full px-8 md:px-[70px] py-2.5 md:py-3 items-center justify-center gap-2.5 hover:bg-gray-100 transition-colors"
        >
          <span className="text-[#04071c] text-xs md:text-sm font-normal whitespace-nowrap">REGISTRÁ TU INTERÉS</span>
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12.127 7.94825H0.75C0.537167 7.94825 0.359 7.87642 0.2155 7.73275C0.0718332 7.58925 0 7.41108 0 7.19825C0 6.98542 0.0718332 6.80725 0.2155 6.66375C0.359 6.52008 0.537167 6.44825 0.75 6.44825H12.127L6.95775 1.279C6.80908 1.13033 6.73567 0.956332 6.7375 0.756999C6.7395 0.557665 6.818 0.380416 6.973 0.22525C7.12817 0.0804164 7.30383 0.00541641 7.5 0.00024974C7.69617 -0.00491693 7.87183 0.0700831 8.027 0.22525L14.3673 6.5655C14.4609 6.65917 14.5269 6.75792 14.5652 6.86175C14.6037 6.96558 14.623 7.07775 14.623 7.19825C14.623 7.31875 14.6037 7.43092 14.5652 7.53475C14.5269 7.63858 14.4609 7.73733 14.3673 7.831L8.027 14.1712C7.8885 14.3097 7.717 14.3806 7.5125 14.3837C7.308 14.3869 7.12817 14.3161 6.973 14.1712C6.818 14.0161 6.7405 13.8379 6.7405 13.6367C6.7405 13.4354 6.818 13.2572 6.973 13.102L12.127 7.94825Z" fill="#04071C" />
            </svg>
          </div>
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 md:px-12 lg:px-[98px] pt-8 md:pt-16 pb-12 md:pb-24">
        <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-6 justify-center md:justify-start">
          <div className="text-white text-lg md:text-[32px] font-['Barlow'] leading-tight md:leading-[80px]">PRIMERA EDICIÓN</div>
          <ParaguayFlag className="w-[35px] h-[22px] md:w-[56px] md:h-[35px] rounded overflow-hidden object-cover" />
          <div className="text-white text-lg md:text-[32px] font-['Barlow'] leading-tight md:leading-[80px]">PARAGUAY</div>
        </div>

        <h2 className="text-white text-4xl md:text-6xl lg:text-[80px] font-['Barlow'] leading-tight md:leading-[80px] tracking-tight md:tracking-[-3.2px] mb-12 md:mb-16 max-w-full lg:max-w-[1008px]">
          RANKING DE EXPERIENCIA DE USUARIO EN E-COMMERCE
        </h2>

        {/* Two column layout: Image left, Form right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left column - Image */}
          <div className="flex-shrink-0 w-full h-[300px] md:h-[400px] lg:h-[520px] rounded-[20px] md:rounded-[40px] overflow-hidden mix-blend-screen">
            <img src={imgMockup} alt="E-commerce mockup" className="w-full h-full object-cover" />
          </div>

          {/* Right column - Form */}
          <div className="bg-white rounded-3xl px-6 md:px-10 py-8 md:py-12">
            <h3 className="text-[#04071c] text-2xl md:text-3xl lg:text-[40px] font-['Barlow'] leading-tight tracking-tight mb-6 md:mb-8 text-center">
              RECIBÍ INFORMACIÓN SOBRE LA CONVOCATORIA
            </h3>

            <p className="text-[#04071c] text-base md:text-lg font-['Inter'] leading-normal mb-6 text-center">
              Dejá tus datos y te enviaremos los detalles para postular tu e-commerce a la primera edición del ranking.
            </p>

            {/* Error Message */}
            {formState.submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-red-800 font-semibold mb-1">Error al enviar</h4>
                    <p className="text-red-700 text-sm">{formState.submitError}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[#04071c] text-sm font-['Inter']">Dominio web</label>
                <input
                  type="text"
                  placeholder="www.tutienda.com.py"
                  value={formData.dominio}
                  onChange={(e) => handleChange("dominio", e.target.value)}
                  onBlur={() => handleBlur("dominio")}
                  className={`w-full bg-white rounded-xl px-4 py-3 md:py-4 text-sm text-gray-600 placeholder:text-gray-400 border transition-colors ${
                    touched.dominio && formState.errors.dominio
                      ? "border-red-500 focus:border-red-600"
                      : "border-[#04071c] focus:border-[#4D3CF7]"
                  } focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                    touched.dominio && formState.errors.dominio
                      ? "focus:ring-red-200"
                      : "focus:ring-[#4D3CF7]/20"
                  }`}
                />
                {touched.dominio && formState.errors.dominio && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formState.errors.dominio}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[#04071c] text-sm font-['Inter']">Teléfono de WhatsApp</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-gray-300">
                    <ParaguayFlag className="w-[24px] h-[15px] rounded overflow-hidden object-cover" />
                    <span className="text-[#04071c] text-sm">+595</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="981234567"
                    value={formData.telefono}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 9) {
                        handleChange("telefono", value);
                      }
                    }}
                    onBlur={() => handleBlur("telefono")}
                    className={`w-full bg-white rounded-xl pl-28 pr-4 py-3 md:py-4 text-sm text-gray-600 placeholder:text-gray-400 border transition-colors ${
                      touched.telefono && formState.errors.telefono
                        ? "border-red-500 focus:border-red-600"
                        : "border-[#04071c] focus:border-[#4D3CF7]"
                    } focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      touched.telefono && formState.errors.telefono
                        ? "focus:ring-red-200"
                        : "focus:ring-[#4D3CF7]/20"
                    }`}
                  />
                </div>
                {touched.telefono && formState.errors.telefono && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formState.errors.telefono}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={formState.isSubmitting}
                className={`w-full text-white rounded-full px-8 py-3.5 md:py-4 flex items-center justify-center gap-2.5 transition-all ${
                  formState.isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#04071c] hover:bg-[#0a0d24]"
                }`}
              >
                {formState.isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-normal">Enviando...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-normal">RECIBIR INFORMACIÓN</span>
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M1.80643 24L0 22.1935L19.6217 2.57143H7.71429V0H24V16.2857H21.4286V4.37839L1.80643 24Z" fill="white" />
                      </svg>
                    </div>
                  </>
                )}
              </button>

              <p className="text-[#04071c] text-xs md:text-sm font-['Inter'] leading-relaxed text-center mt-4 opacity-70">
                El registro no implica inscripción automática. CAPACE compartirá condiciones, cupos, cronograma y próximos pasos con las empresas interesadas.
              </p>
            </form>
          </div>
        </div>

        {/* Centered description text */}
        <div className="mt-12 md:mt-16">
          <p className="text-white text-xl md:text-2xl lg:text-[32px] font-['Inter'] leading-relaxed md:leading-[42px] tracking-tight md:tracking-[-0.64px] text-center max-w-[1030px] mx-auto">
            Descubrí cómo se compara la experiencia digital de tu e-commerce frente a otros referentes del mercado.
          </p>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="relative z-10 bg-[#04071C] py-8 md:py-12 overflow-hidden">
        <div className="flex items-center gap-2 md:gap-3 whitespace-nowrap">
          <div className="flex items-center gap-2 md:gap-3 animate-marquee">
            <div className="w-[35px] h-[35px] md:w-[51px] md:h-[51px] flex-shrink-0">
              <svg className="block size-full" fill="none" viewBox="0 0 50.8574 51">
                <path d={svgPaths.p2fd55900} fill="#4D3CF7" />
              </svg>
            </div>
            <span className="text-white text-3xl md:text-5xl lg:text-[64px] font-['Barlow'] leading-tight md:leading-[64px] tracking-tight md:tracking-[-2.56px]">PRIMERA EDICIÓN</span>
            <div className="w-[35px] h-[35px] md:w-[51px] md:h-[51px] flex-shrink-0">
              <svg className="block size-full" fill="none" viewBox="0 0 50.8574 51">
                <path d={svgPaths.p2fd55900} fill="#4D3CF7" />
              </svg>
            </div>
            <span className="text-white text-3xl md:text-5xl lg:text-[64px] font-['Barlow'] leading-tight md:leading-[64px] tracking-tight md:tracking-[-2.56px]">RANKING UX 2026</span>
            <div className="w-[35px] h-[35px] md:w-[51px] md:h-[51px] flex-shrink-0">
              <svg className="block size-full" fill="none" viewBox="0 0 50.8574 51">
                <path d={svgPaths.p2fd55900} fill="#4D3CF7" />
              </svg>
            </div>
            <span className="text-white text-3xl md:text-5xl lg:text-[64px] font-['Barlow'] leading-tight md:leading-[64px] tracking-tight md:tracking-[-2.56px]">PARAGUAY</span>

            {/* Duplicate for seamless loop */}
            <div className="w-[35px] h-[35px] md:w-[51px] md:h-[51px] flex-shrink-0">
              <svg className="block size-full" fill="none" viewBox="0 0 50.8574 51">
                <path d={svgPaths.p2fd55900} fill="#4D3CF7" />
              </svg>
            </div>
            <span className="text-white text-3xl md:text-5xl lg:text-[64px] font-['Barlow'] leading-tight md:leading-[64px] tracking-tight md:tracking-[-2.56px]">PRIMERA EDICIÓN</span>
            <div className="w-[35px] h-[35px] md:w-[51px] md:h-[51px] flex-shrink-0">
              <svg className="block size-full" fill="none" viewBox="0 0 50.8574 51">
                <path d={svgPaths.p2fd55900} fill="#4D3CF7" />
              </svg>
            </div>
            <span className="text-white text-3xl md:text-5xl lg:text-[64px] font-['Barlow'] leading-tight md:leading-[64px] tracking-tight md:tracking-[-2.56px]">RANKING UX 2026</span>
            <div className="w-[35px] h-[35px] md:w-[51px] md:h-[51px] flex-shrink-0">
              <svg className="block size-full" fill="none" viewBox="0 0 50.8574 51">
                <path d={svgPaths.p2fd55900} fill="#4D3CF7" />
              </svg>
            </div>
            <span className="text-white text-3xl md:text-5xl lg:text-[64px] font-['Barlow'] leading-tight md:leading-[64px] tracking-tight md:tracking-[-2.56px]">PARAGUAY</span>
          </div>
        </div>
      </section>

      {/* Context Section */}
      <section className="relative z-10 bg-[#04071C] px-6 md:px-12 lg:px-[100px] py-12 md:py-24">
        

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Columna izquierda - Título y Beneficios */}
          <div>
            <h3 className="text-white text-3xl md:text-5xl lg:text-[64px] font-['Barlow'] leading-tight md:leading-[64px] tracking-tight md:tracking-[-2.56px] max-w-full md:max-w-[616px] mb-8 md:mb-12">¿Por qué participar?</h3>
            {/* The image 3_Beneficios.svg was removed as per user request. It is kept in the section with Usuaria.png */}
          </div>

          {/* Columna derecha - Cuerpo */}
          <div className="text-white text-lg md:text-2xl lg:text-[32px] font-['Inter'] leading-relaxed md:leading-[42px] tracking-tight md:tracking-[-0.64px] max-w-full md:max-w-[610px] space-y-4">
            <p>Participar en el ranking permite saber qué tan sólida está la UX de tu ecommerce para convertir, dónde estás perdiendo oportunidades por fricción y cómo te comparás frente a criterios comunes del mercado.</p>
            
          </div>
        </div>
      </section>

      {/* Initiative Section */}
      <section className="relative z-10 bg-[#04071C] px-6 md:px-12 lg:px-[100px] py-12 md:py-24">
        <h2 className="text-white text-4xl md:text-6xl lg:text-[96px] font-['Barlow'] leading-tight md:leading-[80px] tracking-tight md:tracking-[-3.84px] mb-8 md:mb-12">BENEFICIOS</h2>

        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-16">
          {/* Columna izquierda - Imagen de beneficios */}
          <div className="flex-1 max-w-full lg:max-w-[610px]">
            <img src={imgBeneficiosPng} alt="Beneficios" className="w-full h-auto" />
          </div>

          {/* Columna derecha - Carrusel de imágenes */}
          <div className="flex-shrink-0 flex gap-4 md:gap-6 overflow-hidden">
            {/* Primera imagen - Usuaria (completa) */}
            <div className="w-[280px] md:w-[350px] lg:w-[452px] h-[400px] md:h-[550px] lg:h-[724px] rounded-[24px] md:rounded-[48px] overflow-hidden flex-shrink-0">
              <img src={imgUsuaria} alt="Usuario usando e-commerce" className="w-full h-full object-cover" />
            </div>

            {/* Segunda imagen - Interfaz (cortada) */}
            <div className="w-[200px] md:w-[250px] lg:w-[320px] h-[400px] md:h-[550px] lg:h-[724px] rounded-[24px] md:rounded-[48px] overflow-hidden flex-shrink-0">
              <img src={imgInterfaz} alt="Interfaz de e-commerce" className="w-full h-full object-cover object-left" />
            </div>
          </div>
        </div>
      </section>

      {/* Form Section - White Background */}
      <section id="form-section" className="relative z-10 bg-white rounded-tl-[24px] rounded-tr-[24px] md:rounded-tl-[48px] md:rounded-tr-[48px] px-6 md:px-12 lg:px-[98px] py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-12 md:mb-16">
            <div className="text-[#04071c] text-xl md:text-2xl lg:text-[32px] font-['Barlow'] leading-tight">PRIMERA EDICIÓN</div>
            <ParaguayFlag className="w-[35px] h-[22px] md:w-[56px] md:h-[35px] rounded overflow-hidden object-cover" />
            <div className="text-[#04071c] text-xl md:text-2xl lg:text-[32px] font-['Barlow'] leading-tight">PARAGUAY</div>
          </div>

          {/* Title spanning full width */}
          <h2 className="text-[#04071c] text-4xl md:text-5xl lg:text-[80px] font-['Barlow'] leading-tight md:leading-[80px] tracking-tight md:tracking-[-3.2px] mb-12 md:mb-16 max-w-[900px]">
            RECIBÍ INFORMACIÓN SOBRE LA CONVOCATORIA
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left column - Description aligned with form */}
            <div className="lg:pt-2">
              <p className="text-[#04071c] text-lg md:text-xl lg:text-[24px] font-['Inter'] leading-normal md:leading-relaxed tracking-tight">
                Dejá tus datos y te enviaremos los detalles para postular tu e-commerce a la primera edición del ranking.
              </p>
            </div>

            {/* Right column - Form */}
            <div>
              {/* Error Message */}
              {formState.submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-red-800 font-semibold mb-1">Error al enviar</h4>
                      <p className="text-red-700 text-sm">{formState.submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[#04071c] text-base font-['Inter']">Dominio web</label>
                  <input
                    type="text"
                    placeholder="www.tutienda.com.py"
                    value={formData.dominio}
                    onChange={(e) => handleChange("dominio", e.target.value)}
                    onBlur={() => handleBlur("dominio")}
                    className={`w-full bg-white rounded-2xl px-6 py-4 text-base text-gray-600 placeholder:text-gray-400 border-2 transition-colors ${
                      touched.dominio && formState.errors.dominio
                        ? "border-red-500 focus:border-red-600"
                        : "border-[#04071c] focus:border-[#4D3CF7]"
                    } focus:outline-none focus:ring-0`}
                  />
                  {touched.dominio && formState.errors.dominio && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formState.errors.dominio}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[#04071c] text-base font-['Inter']">Teléfono de WhatsApp</label>
                  <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 pr-4 border-r border-gray-300">
                      <ParaguayFlag className="w-[28px] h-[18px] rounded overflow-hidden object-cover" />
                      <span className="text-[#04071c] text-base">+595</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="Número de teléfono"
                      value={formData.telefono}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 9) {
                          handleChange("telefono", value);
                        }
                      }}
                      onBlur={() => handleBlur("telefono")}
                      className={`w-full bg-white rounded-2xl pl-36 pr-6 py-4 text-base text-gray-600 placeholder:text-gray-400 border-2 transition-colors ${
                        touched.telefono && formState.errors.telefono
                          ? "border-red-500 focus:border-red-600"
                          : "border-[#04071c] focus:border-[#4D3CF7]"
                      } focus:outline-none focus:ring-0`}
                    />
                  </div>
                  {touched.telefono && formState.errors.telefono && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formState.errors.telefono}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className={`w-full text-white rounded-full px-8 py-4 flex items-center justify-center gap-3 transition-all text-base font-medium ${
                    formState.isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#04071c] hover:bg-[#0a0d24]"
                  }`}
                >
                  {formState.isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>RECIBIR INFORMACIÓN</span>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M1.80643 24L0 22.1935L19.6217 2.57143H7.71429V0H24V16.2857H21.4286V4.37839L1.80643 24Z" fill="white" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-[#04071c] text-xs md:text-sm font-['Inter'] leading-relaxed text-center mt-4 opacity-70">
                  El registro no implica inscripción automática. CAPACE compartirá condiciones, cupos, cronograma y próximos pasos con las empresas interesadas.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-[#04071C] px-6 md:px-12 lg:px-[99px] py-12 md:py-16">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-12">
          <div className="max-w-full lg:max-w-[482px]">
            <p className="text-white text-xl md:text-2xl lg:text-[32px] font-['Inter'] leading-relaxed md:leading-[42px] tracking-tight md:tracking-[-0.64px]">Impulsando estándares para liderar conversaciones sobre <span className="font-bold">competitividad digital en Paraguay.</span></p>
          </div>

          <div className="space-y-12 md:space-y-16">
            <div>
              <p className="text-white text-base tracking-[-0.32px] mb-4">Síguenos</p>
              <div className="flex flex-wrap gap-3 md:gap-5">
                <a href="https://www.facebook.com/capace" target="_blank" rel="noopener noreferrer" className="bg-[#04071c] text-white text-sm text-center rounded-full px-5 md:px-6 py-1 hover:bg-[#0a0d24] transition-colors border border-white/20">
                  Facebook
                </a>
                <a href="https://www.linkedin.com/company/camara-paraguaya-de-comercio-electronico-capace-/" target="_blank" rel="noopener noreferrer" className="bg-[#04071c] text-white text-sm text-center rounded-full px-5 md:px-6 py-1 hover:bg-[#0a0d24] transition-colors border border-white/20">
                  LinkedIn
                </a>
                <a href="https://www.instagram.com/capacepy/" target="_blank" rel="noopener noreferrer" className="bg-[#04071c] text-white text-sm text-center rounded-full px-5 md:px-6 py-1 hover:bg-[#0a0d24] transition-colors border border-white/20">
                  Instagram
                </a>
                <a href="https://www.youtube.com/@CAPACEPY" target="_blank" rel="noopener noreferrer" className="bg-[#04071c] text-white text-sm text-center rounded-full px-5 md:px-6 py-1 hover:bg-[#0a0d24] transition-colors border border-white/20">
                  YouTube
                </a>
              </div>
            </div>

            <div>
              <p className="text-white text-base tracking-[-0.32px] mb-4">Contacto</p>
              <a href="mailto:secretaria@capace.org.py" className="text-white text-sm hover:underline">secretaria@capace.org.py</a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 md:pt-8">
          <p className="text-white text-xs md:text-sm text-center">
            © 2026 CAPACE — Cámara Paraguaya de Comercio Electrónico · Todos los derechos reservados
          </p>
        </div>
      </footer>

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </div>
  );
}
