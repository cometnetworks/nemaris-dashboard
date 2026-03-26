import { mutation } from "./_generated/server";

export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingProspects = await ctx.db.query("prospects").first();
    if (existingProspects) {
      return { status: "already_seeded" };
    }

    // Seed prospects
    const prospects = [
      {
        prospectId: "continental-automotive-120326",
        company: "Continental Automotive México",
        sector: "Manufactura (Automotriz)",
        location: "San Luis Potosí",
        priority: "Alta",
        score: 92,
        trigger: "Roles activos de implementación de S/4HANA que apoyan iniciativas de migración y despliegue.",
        needs: ["Preparación del landscape SAP Basis", "Infraestructura para migración a S/4HANA", "Soporte de rendimiento e integración"],
        projectStatus: "Migración activa / ventana de decisión",
        deciders: "Head of IT Mexico, SAP Program Manager",
        linkedinLinks: [
          { role: "Head of IT Mexico", url: "https://www.linkedin.com/search/results/all/?keywords=continental%20automotive%20mexico%20head%20IT" },
          { role: "SAP Program Manager", url: "https://www.linkedin.com/search/results/all/?keywords=continental%20automotive%20sap%20program%20manager" }
        ],
        emailSubject: "Apoyo a las iniciativas de infraestructura S/4HANA de Continental",
        emailBody: "Hola,\n\nHe notado que Continental está avanzando en iniciativas relacionadas con S/4HANA a lo largo de sus operaciones. En Nemaris nos especializamos en arquitectura SAP Basis y preparación de infraestructura para entornos SAP complejos.\n\nSi su equipo actualmente gestiona la preparación de landscapes, optimización de rendimiento o estabilización durante el despliegue, nos gustaría explorar cómo podríamos apoyar.\n\nSaludos cordiales,\nEquipo SAP Basis de Nemaris",
        followUpEmail: "Hola, retomo este correo porque las ventanas de migración S/4HANA suelen generar cuellos de botella en infraestructura. Nemaris puede aportar estabilidad durante las fases críticas.",
        ctaSugerido: "Revisar en 20 minutos cómo optimizar la preparación de landscape para S/4HANA.",
        discoveryNote: "Abrir con: '¿Qué flujos hoy les generan más riesgo o retrabajo en su actual arquitectura SAP?'. Luego profundizar en ownership, tiempos de caída y deuda técnica rumbo a S/4HANA.",
        reportDate: "2026-03-12",
        reportSource: "ChatGPT"
      },
      {
        prospectId: "assa-abloy-120326",
        company: "ASSA ABLOY México",
        sector: "Manufactura (Sistemas de Seguridad)",
        location: "Monterrey",
        priority: "Alta",
        score: 88,
        trigger: "Actividades de implementación de SAP S/4HANA Finance dentro de programas globales de TI.",
        needs: ["Soporte SAP Basis para despliegue", "Optimización de BD HANA", "Gobernanza de entornos SAP"],
        projectStatus: "Implementación global activa",
        deciders: "Global IT Director, SAP Transformation Lead",
        linkedinLinks: [
          { role: "Global IT Director", url: "https://www.linkedin.com/search/results/all/?keywords=assa%20abloy%20mexico%20IT%20director" },
          { role: "SAP Transformation Lead", url: "https://www.linkedin.com/search/results/all/?keywords=assa%20abloy%20sap%20transformation" }
        ],
        emailSubject: "Soporte SAP Basis para programas S/4HANA",
        emailBody: "Hola,\n\nActualmente estamos apoyando a organizaciones que operan entornos SAP que están evolucionando hacia plataformas S/4HANA. Dadas las iniciativas globales de SAP de ASSA ABLOY, pensé que podría ser valioso conectar.\n\nSaludos,\nNemaris",
        followUpEmail: "Hola, retomo este correo. Las implementaciones globales de S/4HANA Finance requieren gobernanza robusta de infraestructura. Nemaris puede complementar su equipo.",
        ctaSugerido: "Agendar 15 minutos para revisar sus necesidades de gobernanza SAP Basis.",
        discoveryNote: "Investigar el alcance de la implementación global S/4HANA Finance. Preguntar sobre SLAs, tiempos de respuesta y ownership del landscape.",
        reportDate: "2026-03-12",
        reportSource: "ChatGPT"
      },
      {
        prospectId: "grupo-bimbo-120326",
        company: "Grupo Bimbo",
        sector: "Manufactura (Alimentos)",
        location: "Ciudad de México",
        priority: "Media-Alta",
        score: 85,
        trigger: "Transformación digital en curso e iniciativas de modernización de sistemas empresariales a gran escala.",
        needs: ["Consolidación de landscape", "Migración a la nube", "Soporte operativo Basis"],
        projectStatus: "Transformación digital activa",
        deciders: "Global CIO, Director de Sistemas Empresariales",
        linkedinLinks: [
          { role: "Global CIO", url: "https://www.linkedin.com/search/results/all/?keywords=grupo%20bimbo%20CIO" },
          { role: "Director Sistemas", url: "https://www.linkedin.com/search/results/all/?keywords=grupo%20bimbo%20director%20sistemas%20empresariales" }
        ],
        emailSubject: "Soporte de infraestructura SAP para entornos globales de manufactura",
        emailBody: "Hola,\n\nGrandes grupos de manufactura como Bimbo suelen operar landscapes SAP altamente distribuidos. Nemaris se especializa en operaciones SAP Basis, consolidación de landscape y preparación para migración a la nube.\n\nSaludos,\nNemaris",
        followUpEmail: "Hola, retomo porque la consolidación de landscapes distribuidos es uno de los retos más frecuentes previo a cloud. Nemaris tiene experiencia en estos escenarios.",
        ctaSugerido: "Conversar 20 minutos sobre consolidación de landscape SAP global.",
        discoveryNote: "Preguntar sobre número de sistemas SAP, distribución geográfica y planes de cloud migration. ¿Quién es owner del landscape global?",
        reportDate: "2026-03-12",
        reportSource: "ChatGPT"
      },
      {
        prospectId: "femsa-120326",
        company: "FEMSA",
        sector: "Retail / Distribución",
        location: "Monterrey",
        priority: "Media-Alta",
        score: 84,
        trigger: "Modernización continua de ERP en divisiones de retail, logística y distribución.",
        needs: ["Escalamiento de entornos SAP", "Transición a la nube", "Gestión de rendimiento Basis"],
        projectStatus: "Modernización continua",
        deciders: "CIO, Director de Infraestructura TI",
        linkedinLinks: [
          { role: "CIO", url: "https://www.linkedin.com/search/results/all/?keywords=femsa%20CIO" },
          { role: "Director Infraestructura", url: "https://www.linkedin.com/search/results/all/?keywords=femsa%20director%20infraestructura%20TI" }
        ],
        emailSubject: "Soporte SAP Basis para grandes landscapes SAP en retail",
        emailBody: "Hola,\n\nLas organizaciones de retail que gestionan grandes entornos SAP suelen requerir capacidades sólidas de infraestructura para mantener rendimiento. Nemaris ofrece servicios especializados de SAP Basis.\n\nSaludos,\nNemaris",
        followUpEmail: "Hola, las divisiones de retail y logística con SAP suelen necesitar escalamiento dinámico. ¿Están evaluando opciones de cloud para sus entornos?",
        ctaSugerido: "Revisar en 15 minutos opciones de escalamiento SAP para retail.",
        discoveryNote: "Explorar el landscape actual por división (retail, logística, distribución). ¿Hay presión por migración a cloud? ¿Qué SLAs manejan?",
        reportDate: "2026-03-12",
        reportSource: "ChatGPT"
      },
      {
        prospectId: "ntt-data-120326",
        company: "NTT DATA México",
        sector: "Integrador SAP",
        location: "Ciudad de México",
        priority: "Alta",
        score: 95,
        trigger: "Contratación de consultores SAP S/4HANA Basis y expansión de equipos de transformación.",
        needs: ["Especialistas SAP Basis subcontratados", "Soporte para migración", "Infraestructura para grandes proyectos"],
        projectStatus: "Expansión de capacidad activa",
        deciders: "SAP Practice Director, Delivery Manager SAP",
        linkedinLinks: [
          { role: "SAP Practice Director", url: "https://www.linkedin.com/search/results/all/?keywords=ntt%20data%20mexico%20sap%20practice%20director" },
          { role: "Delivery Manager SAP", url: "https://www.linkedin.com/search/results/all/?keywords=ntt%20data%20mexico%20sap%20delivery%20manager" }
        ],
        emailSubject: "Colaboración SAP Basis para programas S/4HANA",
        emailBody: "Hola,\n\nNotamos que NTT DATA continúa expandiendo iniciativas SAP S/4HANA en México. Nemaris ofrece servicios especializados SAP Basis y frecuentemente colabora con integradores para reforzar equipos de delivery.\n\nSaludos,\nNemaris",
        followUpEmail: "Hola, retomo porque sabemos que los integradores frecuentemente necesitan refuerzo en SAP Basis para proyectos grandes. Nemaris puede integrarse rápidamente a sus equipos.",
        ctaSugerido: "Explorar modelo de colaboración SAP Basis para proyectos actuales.",
        discoveryNote: "Abordar como partnership, no como venta. Preguntar sobre proyectos activos donde necesiten refuerzo Basis. ¿Qué modelo de subcontratación prefieren?",
        reportDate: "2026-03-12",
        reportSource: "ChatGPT"
      }
    ];

    for (const p of prospects) {
      await ctx.db.insert("prospects", p);
    }

    // Seed report history
    await ctx.db.insert("reportHistory", {
      reportId: "report-120326",
      filename: "Daily SAP Prospect Intelligence Report-Mexico-120326.pdf",
      date: "2026-03-12",
      prospectsExtracted: 5,
      source: "ChatGPT",
      status: "processed"
    });

    // Seed one meeting
    await ctx.db.insert("meetings", {
      company: "Continental Automotive",
      date: "2026-03-20T10:00",
      link: "https://meet.google.com/abc-defg-hij",
      status: "por_realizar",
      notes: ""
    });

    return { status: "seeded", prospects: 5, reports: 1, meetings: 1 };
  },
});
