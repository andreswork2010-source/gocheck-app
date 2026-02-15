import { VISA_DATA } from '../data/visaData';

export interface UserProfile {
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
    civilStatus: string;
    profession: string;
    income: string;
    destination: string;
    visaType: string;
    days: number;
    photo?: File | null;
    photoUrl?: string;
}

export interface ScoreBreakdown {
    financial: number;
    ties: number;
    migration: number;
    documentation: number;
}

export interface AnalysisResult {
    totalScore: number;
    percentage: number;
    riskLevel: 'low' | 'moderate' | 'high';
    riskLabel: string;
    breakdown: ScoreBreakdown;
    strengths: Array<{ title: string; description: string; icon: string }>;
    weaknesses: Array<{ title: string; description: string; icon: string; suggestion?: string }>;
    recommendations: string[];
}

/**
 * Calcula la puntuación de probabilidad de aprobación de visa
 * basado en el perfil del usuario y documentos subidos
 */
export function calculateVisaScore(
    profile: UserProfile,
    uploadedDocs: Record<string, any>
): AnalysisResult {
    const scores: ScoreBreakdown = {
        financial: 0,
        ties: 0,
        migration: 0,
        documentation: 0
    };

    const strengths: Array<{ title: string; description: string; icon: string }> = [];
    const weaknesses: Array<{ title: string; description: string; icon: string; suggestion?: string }> = [];
    const recommendations: string[] = [];

    // 1. ANÁLISIS FINANCIERO (0-30 puntos)
    const monthlyIncome = parseFloat(profile.income) || 0;

    if (monthlyIncome >= 3000) {
        scores.financial = 30;
        strengths.push({
            title: 'Excelente solvencia económica',
            description: `Tus ingresos mensuales de $${monthlyIncome.toFixed(2)} superan ampliamente el mínimo requerido para visas Schengen.`,
            icon: 'account_balance_wallet'
        });
    } else if (monthlyIncome >= 2000) {
        scores.financial = 25;
        strengths.push({
            title: 'Buena estabilidad financiera',
            description: 'Tus ingresos demuestran capacidad para costear el viaje y estadía.',
            icon: 'account_balance_wallet'
        });
    } else if (monthlyIncome >= 1200) {
        scores.financial = 18;
        recommendations.push('Considera presentar extractos bancarios de los últimos 6 meses para reforzar tu solvencia.');
    } else if (monthlyIncome >= 600) {
        scores.financial = 10;
        weaknesses.push({
            title: 'Ingresos por debajo del promedio',
            description: 'Los consulados europeos suelen requerir demostrar al menos $1,500/mes para turismo.',
            icon: 'trending_down',
            suggestion: 'Presenta carta de patrocinio de un familiar o ahorros acumulados.'
        });
        recommendations.push('URGENTE: Consigue una carta de patrocinio o demuestra ahorros de al menos $3,000 USD.');
    } else {
        scores.financial = 5;
        weaknesses.push({
            title: 'Solvencia económica insuficiente',
            description: 'Tus ingresos declarados están muy por debajo del mínimo requerido.',
            icon: 'warning',
            suggestion: 'Necesitas un patrocinador financiero o demostrar ahorros significativos.'
        });
        recommendations.push('CRÍTICO: Sin patrocinio o ahorros, la probabilidad de rechazo es muy alta.');
    }

    // 2. VÍNCULOS CON PAÍS DE ORIGEN (0-25 puntos)
    let tiesScore = 0;

    // Estado civil (casado/unión = más arraigo)
    if (profile.civilStatus === 'casado' || profile.civilStatus === 'union') {
        tiesScore += 8;
        strengths.push({
            title: 'Vínculos familiares sólidos',
            description: 'Tu estado civil demuestra arraigo familiar en tu país de origen.',
            icon: 'family_restroom'
        });
    } else if (profile.civilStatus === 'soltero') {
        tiesScore += 3;
    }

    // Profesión estable
    const stableProfessions = ['ingeniero', 'doctor', 'abogado', 'profesor', 'contador', 'arquitecto', 'gerente'];
    const hasStableProfession = stableProfessions.some(p =>
        profile.profession.toLowerCase().includes(p)
    );

    if (hasStableProfession) {
        tiesScore += 10;
        strengths.push({
            title: 'Profesión cualificada',
            description: `Tu ocupación como ${profile.profession} es considerada estable y con alta empleabilidad.`,
            icon: 'work'
        });
    } else if (profile.profession.toLowerCase().includes('estudiante')) {
        tiesScore += 5;
    } else {
        tiesScore += 3;
        recommendations.push('Presenta certificado laboral con antigüedad mínima de 6 meses.');
    }

    // Edad (25-45 años = óptimo)
    const age = calculateAge(profile.birthDate);
    if (age >= 25 && age <= 45) {
        tiesScore += 7;
    } else if (age >= 18 && age < 25) {
        tiesScore += 4;
        weaknesses.push({
            title: 'Edad de riesgo migratorio',
            description: 'Los solicitantes menores de 25 años tienen mayor escrutinio por riesgo de migración irregular.',
            icon: 'person',
            suggestion: 'Refuerza tus vínculos con cartas de tu empleador o institución educativa.'
        });
    } else if (age > 45) {
        tiesScore += 5;
    }

    scores.ties = Math.min(tiesScore, 25);

    // 3. HISTORIAL MIGRATORIO (0-25 puntos)
    // Por ahora simulado, en producción se verificaría con datos reales
    const hasSchengenHistory = false; // Placeholder

    if (hasSchengenHistory) {
        scores.migration = 25;
        strengths.push({
            title: 'Historial Schengen limpio',
            description: 'Tus viajes previos a Europa demuestran cumplimiento de las normas migratorias.',
            icon: 'flight'
        });
    } else {
        scores.migration = 15;
        recommendations.push('Si has viajado a USA, Canadá o UK, presenta copias de esas visas como referencia.');
    }

    // 4. DOCUMENTACIÓN (0-20 puntos)
    let docsScore = 0;
    const requiredDocs = VISA_DATA
        .find(c => c.id === profile.destination)
        ?.visas.find(v => v.id === profile.visaType)
        ?.requirements.filter(r => r.priority === 'high') || [];

    const uploadedCount = Object.keys(uploadedDocs).length;
    const requiredCount = requiredDocs.length;

    if (uploadedCount >= requiredCount) {
        docsScore = 20;
        strengths.push({
            title: 'Documentación completa',
            description: `Has subido ${uploadedCount} de ${requiredCount} documentos obligatorios.`,
            icon: 'task_alt'
        });
    } else if (uploadedCount >= requiredCount * 0.7) {
        docsScore = 15;
        recommendations.push(`Te faltan ${requiredCount - uploadedCount} documentos obligatorios. Completa tu expediente.`);
    } else if (uploadedCount > 0) {
        docsScore = 8;
        weaknesses.push({
            title: 'Documentación incompleta',
            description: `Solo has subido ${uploadedCount} de ${requiredCount} documentos requeridos.`,
            icon: 'description',
            suggestion: 'Completa todos los documentos obligatorios antes de aplicar.'
        });
    } else {
        docsScore = 0;
        weaknesses.push({
            title: 'Sin documentos cargados',
            description: 'No has subido ningún documento. Esto es crítico para tu solicitud.',
            icon: 'error',
            suggestion: 'Ve a la sección de Documentos y sube al menos tu pasaporte y reserva de vuelo.'
        });
        recommendations.push('URGENTE: Sube tus documentos obligatorios lo antes posible.');
    }

    scores.documentation = docsScore;

    // CÁLCULO FINAL
    const totalScore = scores.financial + scores.ties + scores.migration + scores.documentation;
    const percentage = Math.round((totalScore / 100) * 100);

    let riskLevel: 'low' | 'moderate' | 'high';
    let riskLabel: string;

    if (percentage >= 75) {
        riskLevel = 'low';
        riskLabel = 'Riesgo Bajo';
    } else if (percentage >= 50) {
        riskLevel = 'moderate';
        riskLabel = 'Riesgo Moderado';
    } else {
        riskLevel = 'high';
        riskLabel = 'Riesgo Alto';
    }

    // Recomendaciones generales
    if (percentage < 60) {
        recommendations.push('Tu perfil necesita mejoras significativas antes de aplicar.');
    }
    if (scores.financial < 15) {
        recommendations.push('Prioriza demostrar solvencia económica con extractos bancarios o carta de patrocinio.');
    }
    if (scores.documentation < 10) {
        recommendations.push('Completa tu documentación antes de agendar cita consular.');
    }

    return {
        totalScore,
        percentage,
        riskLevel,
        riskLabel,
        breakdown: scores,
        strengths,
        weaknesses,
        recommendations
    };
}

/**
 * Calcula la edad a partir de la fecha de nacimiento
 */
export function calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}
