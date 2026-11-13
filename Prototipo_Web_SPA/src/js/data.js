/**
 * Datos Iniciales y Semillas: Callejeros Río IV
 * Contextualizado en la ciudad de Río Cuarto, Córdoba, Argentina
 */

export const RIO_CUARTO_CENTER = {
  lat: -33.1235,
  lng: -64.3490,
  zoom: 14
};

export const BARRIOS_RIO_CUARTO = [
  'Banda Norte',
  'Alberdi',
  'Centro',
  'Macrocentro',
  'Castelli',
  'Bimaco',
  'Las Delicias',
  'Universidad',
  'Golf Club',
  'Paso del Indio',
  'Santa Rosa',
  'General Paz'
];

export const INITIAL_POIS = [
  {
    id: 'poi-vet-del-sol',
    name: 'Veterinaria Del Sol',
    type: 'veterinaria',
    typeLabel: 'Veterinaria & Urgencias 24h',
    badgeColor: 'bg-sky-700',
    status: 'open', // open | closed
    statusText: 'Abierto Ahora (Guardia)',
    address: 'Av. Marcelo T. de Alvear 1240, Banda Norte',
    phone: '0358 464-8899',
    hours: '24 horas de corrido',
    coords: [-33.1120, -64.3460],
    icon: '🏥'
  },
  {
    id: 'poi-vet-san-roque',
    name: 'Clínica Veterinaria San Roque',
    type: 'veterinaria',
    typeLabel: 'Clínica Veterinaria',
    badgeColor: 'bg-sky-700',
    status: 'open',
    statusText: 'Abierto hasta las 20:00 hs',
    address: 'Constitución 840, Centro',
    phone: '0358 463-2211',
    hours: 'Lun a Sáb: 08:30 a 20:00 hs',
    coords: [-33.1245, -64.3495],
    icon: '🏥'
  },
  {
    id: 'poi-guarderia-sueno',
    name: 'Guardería Canina Mi Sueño',
    type: 'guarderia',
    typeLabel: 'Guardería & Espacio de Tránsito',
    badgeColor: 'bg-[#0C832A]',
    status: 'closed',
    statusText: 'Cerrado (Abre mañana 08:00 hs)',
    address: 'Calle Pública s/n, Barrio Castelli',
    phone: '0358 155-123456',
    hours: 'Lun a Vie: 08:00 a 19:00 hs',
    coords: [-33.1380, -64.3600],
    icon: '🏡'
  },
  {
    id: 'poi-refugio-aparc',
    name: 'Refugio APARC Río Cuarto',
    type: 'refugio',
    typeLabel: 'Refugio Protector de Animales',
    badgeColor: 'bg-amber-600',
    status: 'open',
    statusText: 'Visitas y Adopciones Abiertas',
    address: 'Camino a Las Higueras km 2, Alberdi Este',
    phone: '0358 465-9900',
    hours: 'Todos los días: 10:00 a 18:00 hs',
    coords: [-33.1180, -64.3250],
    icon: '🐾'
  }
];

export const INITIAL_ALERTS = [
  {
    id: 'alert-1',
    type: 'HERIDO',
    title: 'Perro mestizo atropellado necesita atención urgente',
    animalType: 'Perro',
    location: 'Banda Norte, cerca del Puente Colgante (Marcelo T. de Alvear 450)',
    coords: [-33.1155, -64.3472],
    timestamp: 'Hace 25 minutos',
    date: '2026-11-06T16:45:00',
    description: 'Es un perro mediano pelaje marrón claro. No puede mover las patas traseras por aparente choque. Está resguardado en la vereda de una panadería.',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    publisher: {
      isAnonymous: false,
      id: 'user-marcos',
      name: 'Marcos Rescatista',
      phone: '0358 154-998877',
      verified: true
    },
    status: 'active' // active | rescued
  },
  {
    id: 'alert-2',
    type: 'PERDIDO',
    title: 'Gato siamés con collar rojo extraviado',
    animalType: 'Gato',
    location: 'Barrio Alberdi, calle Paunero al 300',
    coords: [-33.1280, -64.3380],
    timestamp: 'Hace 2 horas',
    date: '2026-11-06T15:10:00',
    description: 'Responde al nombre de Oliver. Es muy asustadizo, tiene ojos celestes y un collar rojo con cascabel. Su familia lo busca desesperadamente.',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    publisher: {
      isAnonymous: false,
      id: 'user-lucas',
      name: 'Lucas Benítez',
      phone: '0358 154-123789',
      verified: true
    },
    status: 'active'
  },
  {
    id: 'alert-3',
    type: 'HERIDO',
    title: 'Cachorrito con herida en la pata en Plaza Roca',
    animalType: 'Perro',
    location: 'Centro, Plaza Roca frente a la Catedral',
    coords: [-33.1250, -64.3490],
    timestamp: 'Hace 4 horas',
    date: '2026-11-06T13:20:00',
    description: 'Cachorro cruza de unos 3 meses, renguea de una pata delantera. Un vecino le dio agua y comida pero necesita revisión médica.',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
    publisher: {
      isAnonymous: true,
      name: 'Vecino Anónimo',
      phone: '0358 155-778899',
      verified: false
    },
    status: 'active'
  },
  {
    id: 'alert-4',
    type: 'PERDIDO',
    title: 'Labrador mestizo avistado en Macrocentro',
    animalType: 'Perro',
    location: 'Macrocentro, Bv. Roca y Cabrera',
    coords: [-33.1210, -64.3540],
    timestamp: 'Ayer por la tarde',
    date: '2026-11-05T18:40:00',
    description: 'Labrador mestizo dócil con collar de cuero negro sin chapita. Avistado buscando a su dueño en los negocios de la cuadra.',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
    publisher: {
      isAnonymous: true,
      name: 'Usuario Anónimo',
      phone: '0358 156-332211',
      verified: false
    },
    status: 'active'
  }
];

export const INITIAL_ADOPTIONS = [
  {
    id: 'adop-1',
    name: 'Luna',
    type: 'Perro',
    gender: 'Hembra',
    age: 'Cachorro',
    ageText: '5 meses',
    location: 'Río Cuarto (Banda Norte)',
    zone: 'Banda Norte',
    size: 'Mediano',
    modality: 'Adopción Definitiva',
    coords: [-33.1110, -64.3490],
    health: ['Vacunada', 'Desparasitada', 'Compromiso de Castración'],
    story: 'Luna fue encontrada junto a sus hermanitos en un descampado de Banda Norte. Es dulce, juguetona y se lleva excelente con otros perros y niños.',
    images: [
      'https://images.unsplash.com/photo-1597633425046-08f5110420b5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80'
    ],
    publisher: {
      id: 'user-sofia',
      name: 'Sofía Gómez',
      phone: '0358 154-897612',
      role: 'Voluntaria Hogar de Tránsito'
    },
    publishedAt: '2026-11-03T10:00:00',
    status: 'available'
  },
  {
    id: 'adop-2',
    name: 'Milo',
    type: 'Gato',
    gender: 'Macho',
    age: 'Adulto',
    ageText: '2 años',
    location: 'Río Cuarto (Centro)',
    zone: 'Centro',
    size: 'Pequeño',
    modality: 'Adopción Definitiva',
    coords: [-33.1230, -64.3510],
    health: ['Castrado', 'Vacunado Triple Felina', 'Desparasitado'],
    story: 'Milo es un felino muy tranquilo y cariñoso que adora ronronear al sol. Ideal para departamento o casa con patio protegido.',
    images: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80'
    ],
    publisher: {
      id: 'user-lucas',
      name: 'Lucas Benítez',
      phone: '0358 154-123789',
      role: 'Rescatista Independiente'
    },
    publishedAt: '2026-11-04T16:30:00',
    status: 'available'
  },
  {
    id: 'adop-3',
    name: 'Rocco',
    type: 'Perro',
    gender: 'Macho',
    age: 'Adulto',
    ageText: '3 años',
    location: 'Río Cuarto (Alberdi)',
    zone: 'Alberdi',
    size: 'Grande',
    modality: 'Hogar de Tránsito',
    coords: [-33.1290, -64.3350],
    health: ['Castrado', 'Antirrábica al día'],
    story: 'Rocco fue recuperado de un cuadro de desnutrición severo y hoy está fuerte, activo y lleno de gratitud. Necesita un hogar de tránsito o familia con patio amplio.',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=600&q=80'
    ],
    publisher: {
      id: 'user-aparc',
      name: 'Refugio APARC',
      phone: '0358 465-9900',
      role: 'Organización Protectora'
    },
    publishedAt: '2026-11-05T12:15:00',
    status: 'available'
  },
  {
    id: 'adop-4',
    name: 'Mía',
    type: 'Gato',
    gender: 'Hembra',
    age: 'Anciano',
    ageText: '8 años',
    location: 'Río Cuarto (Macrocentro)',
    zone: 'Macrocentro',
    size: 'Pequeño',
    modality: 'Adopción Definitiva',
    coords: [-33.1205, -64.3560],
    health: ['Castrada', 'Chequeo geriátrico completo'],
    story: 'Mía perdió a su dueña mayor y busca un hogar sereno donde pasar sus años dorados. Es súper mansa y limpia.',
    images: [
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80'
    ],
    publisher: {
      id: 'user-sofia',
      name: 'Sofía Gómez',
      phone: '0358 154-897612',
      role: 'Voluntaria'
    },
    publishedAt: '2026-11-06T09:45:00',
    status: 'available'
  }
];

/** Coordenadas aproximadas por barrio (tomadas de los puntos ya cargados en el mapa). */
export const BARRIO_COORDS = {
  'Banda Norte': [-33.1155, -64.3472],
  'Alberdi': [-33.1280, -64.3380],
  'Centro': [-33.1250, -64.3490],
  'Macrocentro': [-33.1210, -64.3540],
  'Castelli': [-33.1380, -64.3600]
};

/** Calles y referencias principales de Río Cuarto para validar la ubicación de un reporte. */
export const CALLES_RIO_CUARTO = [
  'Alvear', 'Marcelo T. de Alvear', 'Sobremonte', 'Constitución', 'San Martín', 'Colón', 'Belgrano',
  'Rivadavia', 'Sarmiento', 'Roca', 'Santa Fe', 'Deán Funes', 'Lavalle', 'Fotheringham',
  'Buenos Aires', 'Paunero', 'Cabrera', 'Italia', 'Mitre', 'Moreno', '25 de Mayo', 'España',
  'Ituzaingó', 'Jujuy', 'Yrigoyen', 'Pellegrini', 'Libertad', 'Corrientes', 'Córdoba', 'Río Negro',
  'Puente Colgante', 'Plaza Roca', 'Plaza Mitre', 'Costanera', 'Ruta 8', 'Ruta 36', 'Circunvalación'
];

/**
 * Perfil base de ejemplo (autor de las publicaciones de muestra). Ya NO es una cuenta con la que se pueda
 * ingresar: las cuentas se crean desde cero en "Registrate".
 */
export const INITIAL_USER = {
  id: 'user-marcos',
  name: 'Marcos Rescatista',
  email: 'marcos@callejerosriocuarto.org',
  phone: '0358 154-998877',
  isAuthenticated: false,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  twoFactorEnabled: false,
  biometricsEnabled: true,
  notificationsEnabled: true,
  darkMode: false,
  searchRadiusKm: 5 // 1, 5 o 10
};

export const INITIAL_SESSIONS = [
  {
    id: 'sess-1',
    device: 'Samsung Galaxy A53 5G',
    location: 'Río Cuarto, Córdoba',
    isCurrent: true,
    lastActive: 'Activa ahora',
    ip: '181.164.22.104'
  },
  {
    id: 'sess-2',
    device: 'Google Chrome en Windows 11',
    location: 'Río Cuarto, Córdoba',
    isCurrent: false,
    lastActive: 'Ayer a las 21:15',
    ip: '181.164.22.104'
  },
  {
    id: 'sess-3',
    device: 'Motorola Moto G82',
    location: 'Córdoba Capital',
    isCurrent: false,
    lastActive: 'Hace 3 días',
    ip: '190.19.88.5'
  }
];

export const INITIAL_CONTACTS = [
  {
    id: 'contact-sofia',
    name: 'Sofía Gómez',
    phone: '0358 154-897612',
    role: 'Voluntaria APARC',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    online: true,
    isMuted: false,
    isBlocked: false
  },
  {
    id: 'contact-lucas',
    name: 'Lucas Benítez',
    phone: '0358 154-123789',
    role: 'Tránsito Canino',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    online: false,
    isMuted: false,
    isBlocked: false
  },
  {
    id: 'contact-vet-delsol',
    name: 'Dr. Matías (Vet Del Sol)',
    phone: '0358 464-8899',
    role: 'Médico Veterinario',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80',
    online: true,
    isMuted: false,
    isBlocked: false
  }
];

export const INITIAL_CHATS = [
  {
    id: 'chat-sofia',
    type: 'direct',
    recipientId: 'contact-sofia',
    title: 'Sofía Gómez',
    lastMessage: 'Hola Marcos, ya tenemos lugar de tránsito para el perrito de Banda Norte.',
    timestamp: '16:40',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        senderId: 'contact-sofia',
        text: 'Hola Marcos, vi tu reporte del perro en el puente.',
        time: '16:35',
        isMe: false
      },
      {
        id: 'm2',
        senderId: 'user-marcos',
        text: 'Hola Sofi! Sí, está resguardado pero necesita traslado veterinario urgente.',
        time: '16:38',
        isMe: true
      },
      {
        id: 'm3',
        senderId: 'contact-sofia',
        text: 'Hola Marcos, ya tenemos lugar de tránsito para el perrito de Banda Norte.',
        time: '16:40',
        isMe: false
      }
    ]
  },
  {
    id: 'group-banda-norte',
    type: 'group',
    isChannel: true,
    zone: 'Banda Norte',
    title: 'Canal Barrial: Banda Norte',
    description: 'Coordinación comunitaria de rescates y tránsitos en el sector norte de Río Cuarto.',
    avatar: '🐕',
    lastMessage: 'Lucas: Estoy saliendo con el auto para buscar al perrito herido.',
    timestamp: '15:20',
    unreadCount: 0,
    isAdmin: true,
    members: [
      { id: 'user-marcos', name: 'Marcos Rescatista (Tú)', role: 'admin' },
      { id: 'contact-sofia', name: 'Sofía Gómez', role: 'admin' },
      { id: 'contact-lucas', name: 'Lucas Benítez', role: 'member' },
      { id: 'contact-vet-delsol', name: 'Dr. Matías (Vet Del Sol)', role: 'member' }
    ],
    messages: [
      {
        id: 'gm1',
        senderId: 'user-marcos',
        senderName: 'Marcos Rescatista',
        text: 'Equipo, activamos guardia para rescates en Banda Norte este fin de semana.',
        time: '14:50',
        isMe: true
      },
      {
        id: 'gm2',
        senderId: 'contact-lucas',
        senderName: 'Lucas Benítez',
        text: 'Lucas: Estoy saliendo con el auto para buscar al perrito herido.',
        time: '15:20',
        isMe: false
      }
    ]
  },
  {
    id: 'group-alberdi',
    type: 'group',
    isChannel: true,
    zone: 'Alberdi',
    title: 'Canal Barrial: Barrio Alberdi',
    description: 'Red comunitaria de vecinos y rescatistas del sector este (Alberdi).',
    avatar: '🐾',
    lastMessage: 'Sofía: Alerta de gato extraviado en calle Paunero.',
    timestamp: '13:10',
    unreadCount: 0,
    isAdmin: false,
    members: [
      { id: 'user-marcos', name: 'Marcos Rescatista (Tú)', role: 'member' },
      { id: 'contact-sofia', name: 'Sofía Gómez', role: 'admin' },
      { id: 'contact-lucas', name: 'Lucas Benítez', role: 'member' }
    ],
    messages: [
      {
        id: 'gma1',
        senderId: 'contact-sofia',
        senderName: 'Sofía Gómez',
        text: 'Vecinos de Alberdi, atentos a un siamés con collar rojo perdido en Paunero.',
        time: '13:10',
        isMe: false
      }
    ]
  },
  {
    id: 'group-centro',
    type: 'group',
    isChannel: true,
    zone: 'Centro',
    title: 'Canal Barrial: Centro & Macrocentro',
    description: 'Alertas urbanas y coordinación en Plaza Roca y zona cívica.',
    avatar: '🏛️',
    lastMessage: 'Dr. Matías: Guardia veterinaria disponible.',
    timestamp: '11:45',
    unreadCount: 0,
    isAdmin: false,
    members: [
      { id: 'user-marcos', name: 'Marcos Rescatista (Tú)', role: 'member' },
      { id: 'contact-vet-delsol', name: 'Dr. Matías (Vet Del Sol)', role: 'admin' }
    ],
    messages: [
      {
        id: 'gmc1',
        senderId: 'contact-vet-delsol',
        senderName: 'Dr. Matías',
        text: 'Veterinaria San Roque y Del Sol tienen guardia activa hoy para urgencias.',
        time: '11:45',
        isMe: false
      }
    ]
  },
  {
    id: 'group-castelli',
    type: 'group',
    isChannel: true,
    zone: 'Castelli',
    title: 'Canal Barrial: Castelli & Bimaco',
    description: 'Espacio de enlace vecinal para tránsitos y adopciones en el sector sur.',
    avatar: '🏡',
    lastMessage: 'Guardería Mi Sueño: Disponibilidad de 2 caniles temporales.',
    timestamp: 'Ayer',
    unreadCount: 0,
    isAdmin: false,
    members: [
      { id: 'user-marcos', name: 'Marcos Rescatista (Tú)', role: 'member' },
      { id: 'contact-lucas', name: 'Lucas Benítez', role: 'admin' }
    ],
    messages: [
      {
        id: 'gmcast1',
        senderId: 'contact-lucas',
        senderName: 'Lucas Benítez',
        text: 'Tenemos 2 lugares de tránsito abiertos para perritos medianos.',
        time: 'Ayer',
        isMe: false
      }
    ]
  }
];

export const INITIAL_ADOPTION_APPLICATIONS = [
  {
    id: 'app-1',
    petId: 'adop-1',
    petName: 'Luna',
    petType: 'Perro',
    applicantName: 'Camila Rossi',
    applicantPhone: '0358 154-223344',
    applicantEmail: 'camila.rossi@gmail.com',
    housingType: 'Casa con patio cerrado',
    hasOtherPets: 'Sí, un perro mestizo castrado de 4 años',
    dailyTime: '4 horas para paseos y juegos',
    commitment: true,
    date: '2026-11-06T11:30:00',
    status: 'pending' // pending | approved | rejected
  },
  {
    id: 'app-2',
    petId: 'adop-2',
    petName: 'Milo',
    petType: 'Gato',
    applicantName: 'Martín Suárez',
    applicantPhone: '0358 155-887766',
    applicantEmail: 'martin.suarez@hotmail.com',
    housingType: 'Departamento con red en balcón',
    hasOtherPets: 'No',
    dailyTime: 'Mucho tiempo (trabajo remoto)',
    commitment: true,
    date: '2026-11-05T17:15:00',
    status: 'approved'
  }
];

