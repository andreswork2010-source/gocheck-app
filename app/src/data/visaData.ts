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
    requirements: Requirement[];
}

export interface Country {
    id: string;
    name: string;
    flag: string; // emoji or url
    visas: VisaType[];
}

export const VISA_DATA: Country[] = [
    {
        id: 'es',
        name: 'España',
        flag: '🇪🇸',
        visas: [
            {
                id: 'tourist',
                name: 'Turismo (Estancia Corta)',
                description: 'Para viajes de placer, visita familiar o tránsito hasta 90 días.',
                maxDays: 90,
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Vigencia mínima de 3 meses post-viaje', priority: 'high', status: 'pending' },
                    { id: 'generated_visa_form', title: 'Formulario de Solicitud', description: 'Formulario oficial Schengen completado', priority: 'high', status: 'pending' },
                    { id: 'flight', title: 'Reserva de Vuelo', description: 'Ida y vuelta confirmada', priority: 'high', status: 'pending' },
                    { id: 'hotel', title: 'Alojamiento', description: 'Reserva de hotel o Carta de Invitación', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro Médico', description: 'Cobertura mínima €30.000', priority: 'high', status: 'pending' },
                    { id: 'funds', title: 'Medios Económicos', description: 'Extractos bancarios (3 últimos meses)', priority: 'medium', status: 'pending' }
                ]
            },
            {
                id: 'study',
                name: 'Estudios',
                description: 'Para cursar estudios en centro autorizado por más de 90 días.',
                maxDays: 365,
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Vigencia todo el periodo de estudios', priority: 'high', status: 'pending' },
                    { id: 'generated_visa_form', title: 'Formulario de Solicitud', description: 'Formulario oficial Schengen completado', priority: 'high', status: 'pending' },
                    { id: 'acceptance', title: 'Carta de Admisión', description: 'Centro de estudios oficial', priority: 'high', status: 'pending' },
                    { id: 'funds', title: 'Medios Económicos', description: 'Suficiencia para estancia y retorno', priority: 'high', status: 'pending' },
                    { id: 'insurance', title: 'Seguro Médico', description: 'Seguro público o privado autorizado', priority: 'high', status: 'pending' },
                    { id: 'criminal', title: 'Antecedentes Penales', description: 'Apostillados (si > 18 años)', priority: 'medium', status: 'pending' },
                    { id: 'health', title: 'Certificado Médico', description: 'Acreditar no padecer enfermedades graves', priority: 'medium', status: 'pending' }
                ]
            },
            {
                id: 'nomad',
                name: 'Nómada Digital',
                description: 'Para teletrabajadores de empresas extranjeras.',
                maxDays: 365,
                requirements: [
                    { id: 'pass', title: 'Pasaporte Vigente', description: 'Validez durante toda la estancia', priority: 'high', status: 'pending' },
                    { id: 'generated_visa_form', title: 'Formulario de Solicitud', description: 'Formulario oficial Schengen completado', priority: 'high', status: 'pending' },
                    { id: 'contract', title: 'Contrato Laboral', description: 'Con empresa fuera de España (>3 meses)', priority: 'high', status: 'pending' },
                    { id: 'degree', title: 'Título Profesional', description: 'O experiencia demostrable de 3 años', priority: 'high', status: 'pending' },
                    { id: 'social_security', title: 'Certificado Seg. Social', description: 'Cobertura en país de origen o convenio', priority: 'high', status: 'pending' },
                    { id: 'criminal', title: 'Antecedentes Penales', description: 'Últimos 2 años', priority: 'medium', status: 'pending' }
                ]
            }
        ]
    },
    {
        id: 'it',
        name: 'Italia',
        flag: '🇮🇹',
        visas: [
            {
                id: 'tourist',
                name: 'Turismo',
                description: 'Visita turística hasta 90 días.',
                maxDays: 90,
                requirements: [
                    { id: 'pass', title: 'Pasaporte', description: 'Validez 3 meses post-visita', priority: 'high', status: 'pending' },
                    { id: 'form', title: 'Formulario Schengen', description: 'Firmado y completado', priority: 'high', status: 'pending' },
                    { id: 'photo', title: 'Foto Biométrica', description: 'Fondo blanco, reciente', priority: 'high', status: 'pending' },
                    { id: 'funds', title: 'Demonstración de Fondos', description: 'Tabla oficial de Ministerio Interior', priority: 'high', status: 'pending' }
                ]
            }
        ]
    },
    {
        id: 'fr',
        name: 'Francia',
        flag: '🇫🇷',
        visas: [
            {
                id: 'tourist',
                name: 'Turismo',
                description: 'Turismo en zona Schengen (Francia).',
                maxDays: 90,
                requirements: [
                    { id: 'pass', title: 'Pasaporte', description: '2 hojas libres mínimo', priority: 'high', status: 'pending' },
                    { id: 'itinerary', title: 'Itinerario de Viaje', description: 'Plan detallado de estancia', priority: 'medium', status: 'pending' },
                    { id: 'insurance', title: 'Seguro de Viaje', description: 'Cobertura Schengen', priority: 'high', status: 'pending' }
                ]
            }
        ]
    },
    {
        id: 'de',
        name: 'Alemania',
        flag: '🇩🇪',
        visas: [
            {
                id: 'job_seeker',
                name: 'Búsqueda de Empleo',
                description: 'Para buscar trabajo cualificado (6 meses).',
                maxDays: 180,
                requirements: [
                    { id: 'degree', title: 'Título Reconocido', description: 'Homologación anabin/ZAB', priority: 'high', status: 'pending' },
                    { id: 'funds', title: 'Cuenta Bloqueada', description: 'Sperrkonto con fondos suficientes', priority: 'high', status: 'pending' },
                    { id: 'cv', title: 'Curriculum Vitae', description: 'Formato alemán/Europass', priority: 'medium', status: 'pending' },
                    { id: 'motivation', title: 'Carta de Motivación', description: 'Plan de búsqueda de empleo', priority: 'medium', status: 'pending' }
                ]
            }
        ]
    }
];
