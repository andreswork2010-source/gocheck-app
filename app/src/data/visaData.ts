export interface Requirement {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low'; // high = mandatory, medium = important, low = optional
    status: 'pending' | 'uploaded' | 'approved' | 'rejected';
}

export interface VisaType {
    id: string;
    name: string;
    description: string;
    maxDays: number;
    processingTime?: string; // e.g., "15-45 días"
    cost?: string; // e.g., "€80"
    requirements: Requirement[];
    specificGuidance?: string; // Texto adicional específico para este tipo de visa
}

export interface Country {
    id: string;
    name: string;
    flag: string; // emoji or url
    visas: VisaType[];
    consulateInfo?: {
        website?: string;
        appointmentSystem?: string;
        phone?: string;
    };
}

export const VISA_DATA: Country[] = [
    {
        id: 'es',
        name: 'España',
        flag: '🇪🇸',
        consulateInfo: {
            website: 'https://www.exteriores.gob.es',
            appointmentSystem: 'BLS International',
            phone: '+593 2 255 4141'
        },
        visas: [
            {
                id: 'tourist',
                name: 'Turismo (Estancia Corta)',
                description: 'Para viajes de placer, visita familiar o tránsito hasta 90 días.',
                maxDays: 90,
                processingTime: '15-45 días naturales',
                cost: '$106 USD (€90) + $20 BLS Fee',
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Vigencia mínima de 3 meses post-viaje', priority: 'high', status: 'pending' },
                    { id: 'generated_visa_form', title: 'Formulario de Solicitud', description: 'Formulario oficial Schengen completado', priority: 'high', status: 'pending' },
                    { id: 'photo', title: 'Foto Biométrica', description: '35x45mm, fondo blanco, reciente (máx 6 meses)', priority: 'high', status: 'pending' },
                    { id: 'flight', title: 'Reserva de Vuelo', description: 'Ida y vuelta confirmada (no necesita ser pagada)', priority: 'high', status: 'pending' },
                    { id: 'hotel', title: 'Alojamiento', description: 'Reserva de hotel o Carta de Invitación oficial', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro Médico', description: 'Cobertura mínima €30.000, válido en todo Schengen', priority: 'high', status: 'pending' },
                    { id: 'funds', title: 'Medios Económicos', description: 'Extractos bancarios (3-6 últimos meses) sellados', priority: 'high', status: 'pending' },
                    { id: 'employment', title: 'Carta Laboral', description: 'Indicando cargo, salario y autorización para viajar', priority: 'medium', status: 'pending' },
                    { id: 'property', title: 'Certificados de Propiedad', description: 'Bienes inmuebles o vehículos (prueba de arraigo)', priority: 'low', status: 'pending' }
                ],
                specificGuidance: 'Para turismo en España, el monto mínimo recomendado es €100 por día de estancia. La carta de invitación debe tramitarse en la Comisaría de Policía por el anfitrión residente en España.'
            },
            {
                id: 'family_reunification',
                name: 'Reagrupación Familiar',
                description: 'Para reunirse con familiar residente legal en España (cónyuge, hijos, padres).',
                maxDays: 365,
                processingTime: '3-6 meses',
                cost: '$106 USD (€90)',
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Vigencia durante toda la estancia prevista', priority: 'high', status: 'pending' },
                    { id: 'generated_visa_form', title: 'Formulario de Solicitud', description: 'Formulario nacional de visado completado', priority: 'high', status: 'pending' },
                    { id: 'photo', title: 'Foto Biométrica', description: '35x45mm, fondo blanco', priority: 'high', status: 'pending' },
                    { id: 'marriage_cert', title: 'Certificado de Matrimonio', description: 'Apostillado y traducido (si cónyuge)', priority: 'high', status: 'pending' },
                    { id: 'birth_cert', title: 'Certificado de Nacimiento', description: 'Apostillado y traducido (si hijo/padre)', priority: 'high', status: 'pending' },
                    { id: 'residence_proof', title: 'Prueba de Residencia del Reagrupante', description: 'NIE, TIE o certificado de registro', priority: 'high', status: 'pending' },
                    { id: 'income_proof', title: 'Medios Económicos del Reagrupante', description: 'Nóminas, contrato laboral, declaración IRPF', priority: 'high', status: 'pending' },
                    { id: 'housing', title: 'Vivienda Adecuada', description: 'Contrato de alquiler o escritura de propiedad', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro Médico', description: 'Pública o privada con cobertura completa', priority: 'high', status: 'pending' },
                    { id: 'criminal', title: 'Antecedentes Penales', description: 'Del país de origen y países donde haya residido (apostillados)', priority: 'medium', status: 'pending' }
                ],
                specificGuidance: 'El reagrupante debe demostrar medios económicos suficientes: IPREM x 150% para 2 personas, +50% por cada adicional. La vivienda debe cumplir con requisitos mínimos de habitabilidad.'
            },
            {
                id: 'work',
                name: 'Trabajo por Cuenta Ajena',
                description: 'Para trabajar en España con contrato de una empresa española.',
                maxDays: 365,
                processingTime: '1-3 meses',
                cost: '$106 USD (€90)',
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Vigencia durante el periodo de trabajo', priority: 'high', status: 'pending' },
                    { id: 'generated_visa_form', title: 'Formulario de Solicitud', description: 'Formulario nacional de visado', priority: 'high', status: 'pending' },
                    { id: 'photo', title: 'Foto Biométrica', description: '35x45mm, fondo blanco', priority: 'high', status: 'pending' },
                    { id: 'work_authorization', title: 'Autorización de Trabajo', description: 'Concedida por la Oficina de Extranjería en España', priority: 'high', status: 'pending' },
                    { id: 'contract', title: 'Contrato de Trabajo', description: 'Firmado por empleador español', priority: 'high', status: 'pending' },
                    { id: 'degree', title: 'Títulos Académicos', description: 'Homologados o apostillados según el puesto', priority: 'medium', status: 'pending' },
                    { id: 'criminal', title: 'Antecedentes Penales', description: 'Apostillados de últimos 5 años', priority: 'high', status: 'pending' },
                    { id: 'health', title: 'Certificado Médico', description: 'Acreditar no padecer enfermedades de cuarentena', priority: 'medium', status: 'pending' }
                ],
                specificGuidance: 'La autorización de trabajo debe ser solicitada primero por el empleador en España. Solo después de su aprobación puedes solicitar el visado en el consulado.'
            },
            {
                id: 'study',
                name: 'Estudios',
                description: 'Para cursar estudios en centro autorizado por más de 90 días.',
                maxDays: 365,
                processingTime: '1-2 meses',
                cost: '$106 USD (€90)',
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Vigencia todo el periodo de estudios + 6 meses', priority: 'high', status: 'pending' },
                    { id: 'generated_visa_form', title: 'Formulario de Solicitud', description: 'Formulario nacional de visado', priority: 'high', status: 'pending' },
                    { id: 'photo', title: 'Foto Biométrica', description: '35x45mm, fondo blanco', priority: 'high', status: 'pending' },
                    { id: 'acceptance', title: 'Carta de Admisión', description: 'Centro de estudios oficial o autorizado', priority: 'high', status: 'pending' },
                    { id: 'funds', title: 'Medios Económicos', description: 'IPREM mensual (€600) x meses de estancia', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro Médico', description: 'Seguro público o privado sin copagos', priority: 'high', status: 'pending' },
                    { id: 'criminal', title: 'Antecedentes Penales', description: 'Apostillados (si > 18 años)', priority: 'medium', status: 'pending' },
                    { id: 'health', title: 'Certificado Médico', description: 'Acreditar no padecer enfermedades graves', priority: 'medium', status: 'pending' }
                ],
                specificGuidance: 'Si eres menor de edad, necesitas autorización notarial de ambos padres. El centro educativo debe estar inscrito en el Registro de Centros Docentes.'
            },
            {
                id: 'nomad',
                name: 'Nómada Digital',
                description: 'Para teletrabajadores de empresas extranjeras.',
                maxDays: 365,
                processingTime: '1-2 meses',
                cost: '$106 USD (€90)',
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Validez durante toda la estancia', priority: 'high', status: 'pending' },
                    { id: 'generated_visa_form', title: 'Formulario de Solicitud', description: 'Formulario nacional de visado', priority: 'high', status: 'pending' },
                    { id: 'photo', title: 'Foto Biométrica', description: '35x45mm, fondo blanco', priority: 'high', status: 'pending' },
                    { id: 'contract', title: 'Contrato Laboral', description: 'Con empresa fuera de España (>3 meses antigüedad)', priority: 'high', status: 'pending' },
                    { id: 'degree', title: 'Título Profesional', description: 'Universitario o experiencia demostrable de 3 años', priority: 'high', status: 'pending' },
                    { id: 'income_proof', title: 'Prueba de Ingresos', description: 'Mínimo 200% IPREM (€2,400/mes)', priority: 'high', status: 'pending' },
                    { id: 'social_security', title: 'Seguro de Salud', description: 'Cobertura en España o convenio internacional', priority: 'high', status: 'pending' },
                    { id: 'criminal', title: 'Antecedentes Penales', description: 'Últimos 5 años, apostillados', priority: 'medium', status: 'pending' }
                ],
                specificGuidance: 'Puedes trabajar para varias empresas siempre que todas sean extranjeras. No puedes prestar servicios a empresas españolas con este visado.'
            },
            {
                id: 'entrepreneur',
                name: 'Emprendedor',
                description: 'Para desarrollar actividad empresarial innovadora en España.',
                maxDays: 365,
                processingTime: '2-4 meses',
                cost: '$106 USD (€90)',
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Vigencia durante el proyecto', priority: 'high', status: 'pending' },
                    { id: 'generated_visa_form', title: 'Formulario de Solicitud', description: 'Formulario nacional de visado', priority: 'high', status: 'pending' },
                    { id: 'photo', title: 'Foto Biométrica', description: '35x45mm, fondo blanco', priority: 'high', status: 'pending' },
                    { id: 'business_plan', title: 'Plan de Negocio', description: 'Detallado con proyecciones financieras', priority: 'high', status: 'pending' },
                    { id: 'enisa_approval', title: 'Informe Favorable ENISA', description: 'O incubadora/aceleradora reconocida', priority: 'high', status: 'pending' },
                    { id: 'funds', title: 'Medios Económicos', description: 'Suficientes para el proyecto y manutención', priority: 'high', status: 'pending' },
                    { id: 'degree', title: 'Formación Profesional', description: 'Relacionada con la actividad empresarial', priority: 'medium', status: 'pending' },
                    { id: 'criminal', title: 'Antecedentes Penales', description: 'Apostillados', priority: 'medium', status: 'pending' }
                ],
                specificGuidance: 'El proyecto debe tener carácter innovador y generar interés económico general para España. ENISA evalúa la viabilidad del proyecto.'
            }
        ]
    },
    {
        id: 'it',
        name: 'Italia',
        flag: '🇮🇹',
        consulateInfo: {
            website: 'https://ambquito.esteri.it',
            appointmentSystem: 'Prenot@mi'
        },
        visas: [
            {
                id: 'tourist',
                name: 'Turismo',
                description: 'Visita turística hasta 90 días.',
                maxDays: 90,
                processingTime: '15-30 días',
                cost: '€80',
                requirements: [
                    { id: 'pass', title: 'Pasaporte', description: 'Validez 3 meses post-visita, 2 páginas libres', priority: 'high', status: 'pending' },
                    { id: 'form', title: 'Formulario Schengen', description: 'Firmado y completado', priority: 'high', status: 'pending' },
                    { id: 'photo', title: 'Foto Biométrica', description: 'Fondo blanco, reciente', priority: 'high', status: 'pending' },
                    { id: 'flight', title: 'Reserva de Vuelo', description: 'Ida y vuelta', priority: 'high', status: 'pending' },
                    { id: 'hotel', title: 'Alojamiento', description: 'Reserva hotelera o Dichiarazione di Ospitalità', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro de Viaje', description: 'Mínimo €30,000', priority: 'high', status: 'pending' },
                    { id: 'funds', title: 'Demonstración de Fondos', description: 'Según tabla oficial del Ministerio del Interior italiano', priority: 'high', status: 'pending' }
                ],
                specificGuidance: 'Italia requiere €269.60 para los primeros 5 días, luego €44.93 por día adicional. La Dichiarazione di Ospitalità debe hacerse en la Questura italiana.'
            },
            {
                id: 'work',
                name: 'Trabajo Subordinado',
                description: 'Para trabajar con contrato de empresa italiana.',
                maxDays: 365,
                processingTime: '2-4 meses',
                cost: '€116',
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Vigencia durante el contrato', priority: 'high', status: 'pending' },
                    { id: 'nulla_osta', title: 'Nulla Osta', description: 'Autorización de trabajo emitida por Sportello Unico', priority: 'high', status: 'pending' },
                    { id: 'contract', title: 'Contrato de Trabajo', description: 'Propuesta de contrato del empleador', priority: 'high', status: 'pending' },
                    { id: 'photo', title: 'Foto Biométrica', description: 'Fondo blanco', priority: 'high', status: 'pending' },
                    { id: 'criminal', title: 'Certificato Penale', description: 'Antecedentes penales apostillados', priority: 'high', status: 'pending' }
                ],
                specificGuidance: 'El empleador debe solicitar primero el Nulla Osta en Italia. Italia tiene cuotas anuales de inmigración (Decreto Flussi) que limitan las autorizaciones.'
            }
        ]
    },
    {
        id: 'fr',
        name: 'Francia',
        flag: '🇫🇷',
        consulateInfo: {
            website: 'https://france-visas.gouv.fr',
            appointmentSystem: 'France-Visas'
        },
        visas: [
            {
                id: 'tourist',
                name: 'Turismo',
                description: 'Turismo en zona Schengen (Francia).',
                maxDays: 90,
                processingTime: '15-45 días',
                cost: '€80',
                requirements: [
                    { id: 'pass', title: 'Pasaporte', description: '2 hojas libres mínimo, vigencia 3 meses post-viaje', priority: 'high', status: 'pending' },
                    { id: 'form', title: 'Formulario Schengen', description: 'Completado en francés o inglés', priority: 'high', status: 'pending' },
                    { id: 'photo', title: 'Foto Biométrica', description: 'Normas OACI', priority: 'high', status: 'pending' },
                    { id: 'itinerary', title: 'Itinerario de Viaje', description: 'Plan detallado de estancia', priority: 'medium', status: 'pending' },
                    { id: 'hotel', title: 'Justificatif d\'hébergement', description: 'Reserva o Attestation d\'accueil', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro de Viaje', description: 'Cobertura Schengen €30,000', priority: 'high', status: 'pending' },
                    { id: 'funds', title: 'Recursos Financieros', description: 'Extractos bancarios + carta laboral', priority: 'high', status: 'pending' }
                ],
                specificGuidance: 'Francia requiere €120 por día si no tienes alojamiento pagado, €65 si tienes. La Attestation d\'accueil debe tramitarse en la Mairie francesa.'
            },
            {
                id: 'study',
                name: 'Estudios',
                description: 'Para estudiar en institución francesa.',
                maxDays: 365,
                processingTime: '1-3 meses',
                cost: '€99',
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Vigencia durante los estudios', priority: 'high', status: 'pending' },
                    { id: 'campus_france', title: 'Validación Campus France', description: 'Entrevista y aprobación obligatoria', priority: 'high', status: 'pending' },
                    { id: 'acceptance', title: 'Carta de Admisión', description: 'De institución educativa francesa', priority: 'high', status: 'pending' },
                    { id: 'funds', title: 'Recursos Económicos', description: 'Mínimo €615/mes (cuenta bloqueada o beca)', priority: 'high', status: 'pending' },
                    { id: 'housing', title: 'Justificante de Alojamiento', description: 'Residencia universitaria o contrato de alquiler', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro Médico', description: 'Cobertura en Francia', priority: 'high', status: 'pending' }
                ],
                specificGuidance: 'Todos los estudiantes deben pasar por Campus France antes de solicitar el visado. El proceso incluye entrevista obligatoria.'
            }
        ]
    },
    {
        id: 'de',
        name: 'Alemania',
        flag: '🇩🇪',
        consulateInfo: {
            website: 'https://www.auswaertiges-amt.de',
            appointmentSystem: 'Termin Online'
        },
        visas: [
            {
                id: 'job_seeker',
                name: 'Búsqueda de Empleo',
                description: 'Para buscar trabajo cualificado (6 meses).',
                maxDays: 180,
                processingTime: '6-12 semanas',
                cost: '€75',
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Vigencia durante la búsqueda', priority: 'high', status: 'pending' },
                    { id: 'degree', title: 'Título Reconocido', description: 'Homologación anabin/ZAB obligatoria', priority: 'high', status: 'pending' },
                    { id: 'funds', title: 'Cuenta Bloqueada (Sperrkonto)', description: 'Mínimo €1,027/mes x 6 meses = €6,162', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro Médico', description: 'Válido en Alemania para 6 meses', priority: 'high', status: 'pending' },
                    { id: 'cv', title: 'Curriculum Vitae', description: 'Formato alemán/Europass', priority: 'medium', status: 'pending' },
                    { id: 'motivation', title: 'Carta de Motivación', description: 'Plan de búsqueda de empleo en alemán', priority: 'medium', status: 'pending' }
                ],
                specificGuidance: 'El Sperrkonto debe abrirse en bancos autorizados (Fintiba, Deutsche Bank, etc.). Solo puedes retirar €1,027/mes. Necesitas alemán nivel B1 o inglés C1.'
            },
            {
                id: 'blue_card',
                name: 'Tarjeta Azul UE',
                description: 'Para profesionales altamente cualificados con oferta de trabajo.',
                maxDays: 365,
                processingTime: '4-12 semanas',
                cost: '€100',
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Vigencia durante el contrato', priority: 'high', status: 'pending' },
                    { id: 'degree', title: 'Título Universitario', description: 'Reconocido en Alemania (anabin)', priority: 'high', status: 'pending' },
                    { id: 'contract', title: 'Contrato de Trabajo', description: 'Salario mínimo €45,300/año (€58,400 para profesiones reguladas)', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro Médico', description: 'Público o privado alemán', priority: 'high', status: 'pending' }
                ],
                specificGuidance: 'La Tarjeta Azul permite residencia permanente tras 33 meses (21 si tienes alemán B1). Profesiones en demanda: IT, ingeniería, medicina.'
            }
        ]
    },
    {
        id: 'pt',
        name: 'Portugal',
        flag: '🇵🇹',
        consulateInfo: {
            website: 'https://www.vistos.mne.gov.pt',
            appointmentSystem: 'VFS Global'
        },
        visas: [
            {
                id: 'tourist',
                name: 'Turismo',
                description: 'Visita turística Schengen.',
                maxDays: 90,
                processingTime: '15-30 días',
                cost: '€80',
                requirements: [
                    { id: 'pass', title: 'Pasaporte', description: 'Vigencia 3 meses post-viaje', priority: 'high', status: 'pending' },
                    { id: 'form', title: 'Formulario Schengen', description: 'Completado y firmado', priority: 'high', status: 'pending' },
                    { id: 'photo', title: 'Foto Biométrica', description: 'Fondo blanco', priority: 'high', status: 'pending' },
                    { id: 'flight', title: 'Reserva de Vuelo', description: 'Ida y vuelta', priority: 'high', status: 'pending' },
                    { id: 'hotel', title: 'Alojamiento', description: 'Reserva o Termo de Responsabilidade', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro de Viaje', description: '€30,000 mínimo', priority: 'high', status: 'pending' },
                    { id: 'funds', title: 'Medios Económicos', description: '€75/día + €40 base', priority: 'high', status: 'pending' }
                ]
            },
            {
                id: 'd7',
                name: 'Visto D7 (Renta Pasiva)',
                description: 'Para personas con ingresos pasivos (pensionistas, rentistas).',
                maxDays: 365,
                processingTime: '2-4 meses',
                cost: '€90',
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Vigencia mínima 3 meses', priority: 'high', status: 'pending' },
                    { id: 'income_proof', title: 'Prueba de Ingresos Pasivos', description: 'Mínimo salario mínimo portugués (€820/mes)', priority: 'high', status: 'pending' },
                    { id: 'housing', title: 'Contrato de Arrendamiento', description: 'O escritura de propiedad en Portugal', priority: 'high', status: 'pending' },
                    { id: 'criminal', title: 'Certificado de Antecedentes', description: 'Apostillado', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro de Salud', description: 'Válido en Portugal', priority: 'high', status: 'pending' }
                ],
                specificGuidance: 'El D7 es ideal para jubilados y nómadas digitales. Puedes incluir familiares. Permite solicitar residencia permanente tras 5 años.'
            }
        ]
    },
    {
        id: 'nl',
        name: 'Países Bajos',
        flag: '🇳🇱',
        consulateInfo: {
            website: 'https://www.netherlandsworldwide.nl',
            appointmentSystem: 'VFS Global'
        },
        visas: [
            {
                id: 'tourist',
                name: 'Turismo',
                description: 'Visita Schengen.',
                maxDays: 90,
                processingTime: '15 días',
                cost: '€80',
                requirements: [
                    { id: 'pass', title: 'Pasaporte', description: 'Vigencia 3 meses post-viaje', priority: 'high', status: 'pending' },
                    { id: 'form', title: 'Formulario Schengen', description: 'En inglés o neerlandés', priority: 'high', status: 'pending' },
                    { id: 'photo', title: 'Foto Biométrica', description: 'Fondo blanco', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro de Viaje', description: '€30,000', priority: 'high', status: 'pending' },
                    { id: 'funds', title: 'Medios Económicos', description: '€34/día', priority: 'high', status: 'pending' }
                ]
            },
            {
                id: 'highly_skilled',
                name: 'Highly Skilled Migrant',
                description: 'Para profesionales altamente cualificados con empleador reconocido.',
                maxDays: 365,
                processingTime: '2-4 semanas',
                cost: '€350',
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Vigencia durante el contrato', priority: 'high', status: 'pending' },
                    { id: 'sponsor', title: 'Empleador Reconocido', description: 'Debe estar en lista IND de sponsors', priority: 'high', status: 'pending' },
                    { id: 'contract', title: 'Contrato de Trabajo', description: 'Salario mínimo según edad y educación', priority: 'high', status: 'pending' },
                    { id: 'degree', title: 'Título Universitario', description: 'O experiencia equivalente', priority: 'medium', status: 'pending' }
                ],
                specificGuidance: 'Salario mínimo 2024: €5,008/mes (<30 años con máster), €6,166/mes (>30 años). El empleador tramita el permiso.'
            }
        ]
    },
    {
        id: 'se',
        name: 'Suecia',
        flag: '🇸🇪',
        consulateInfo: {
            website: 'https://www.migrationsverket.se',
            appointmentSystem: 'VFS Global'
        },
        visas: [
            {
                id: 'tourist',
                name: 'Turismo',
                description: 'Visita Schengen.',
                maxDays: 90,
                processingTime: '15 días',
                cost: '€80',
                requirements: [
                    { id: 'pass', title: 'Pasaporte', description: 'Vigencia 3 meses post-viaje', priority: 'high', status: 'pending' },
                    { id: 'form', title: 'Formulario Schengen', description: 'En sueco o inglés', priority: 'high', status: 'pending' },
                    { id: 'photo', title: 'Foto Biométrica', description: 'Fondo claro', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro de Viaje', description: '€30,000', priority: 'high', status: 'pending' },
                    { id: 'funds', title: 'Medios Económicos', description: 'SEK 450/día (~€40)', priority: 'high', status: 'pending' }
                ]
            },
            {
                id: 'work',
                name: 'Permiso de Trabajo',
                description: 'Para trabajar en Suecia.',
                maxDays: 730,
                processingTime: '2-6 meses',
                cost: 'SEK 2,000 (~€180)',
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Vigencia durante el contrato', priority: 'high', status: 'pending' },
                    { id: 'job_offer', title: 'Oferta de Trabajo', description: 'Debe cumplir condiciones salariales y laborales suecas', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro de Salud', description: 'Cobertura completa', priority: 'high', status: 'pending' }
                ],
                specificGuidance: 'El salario debe cumplir con convenios colectivos suecos. Migrationsverket verifica que las condiciones sean justas.'
            }
        ]
    }
];
