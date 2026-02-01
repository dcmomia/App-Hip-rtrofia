export const PROGRAM_DATA = {
    mesos: [
        {
            id: 1,
            name: "Adaptación Anatómica",
            weeks: [1, 2, 3, 4, 5],
            sessions: [
                {
                    id: "torso-a",
                    name: "TORSO (EMPUJE/TIRÓN)",
                    exercises: [
                        { id: "t1", name: "Press Máquina Convergente", sets: 3, reps: "10-12", rir: 3 },
                        { id: "t2", name: "Remo apoyado Unilateral (Polea)", sets: 3, reps: "10-12", rir: 3 },
                        { id: "t3", name: "Cruces de Poleas en Banco (45º)", sets: 2, reps: "12-15", rir: 2 },
                        { id: "t4", name: "Jalón al Pecho Unilateral", sets: 2, reps: "10-12", rir: 2 },
                        { id: "t5", name: "Extensiones Katana (Tríceps)", sets: 3, reps: "12-15", rir: 2 },
                        { id: "t6", name: "Curl Bayesian (Bíceps)", sets: 3, reps: "12-15", rir: 2 }
                    ]
                },
                {
                    id: "pierna-b",
                    name: "PIERNA (CONTROL DE RODILLA)",
                    exercises: [
                        { id: "p1", name: "Prensa 45º (Pies Altos)", sets: 3, reps: "12-15", rir: 3 },
                        { id: "p2", name: "Curl Femoral Sentado", sets: 3, reps: "12-15", rir: 2 },
                        { id: "p3", name: "Hip Thrust (Máquina o DB)", sets: 3, reps: "10-12", rir: 2 },
                        { id: "p4", name: "Elevación Talones de Pie", sets: 3, reps: "15-20", rir: 1 },
                        { id: "p5", name: "Cable Crunch", sets: 3, reps: "12-15", rir: 2 }
                    ]
                }
            ]
        },
        {
            id: 2,
            name: "Acumulación I",
            weeks: [6, 7, 8, 9, 10],
            sessions: [
                {
                    id: "push-1",
                    name: "DÍA 1: PUSH",
                    exercises: [
                        { id: "ps1", name: "Press Máquina Convergente", sets: 4, reps: "8-10", rir: 2 },
                        { id: "ps2", name: "Incline DB Press", sets: 3, reps: "10-12", rir: 2 },
                        { id: "ps3", name: "Cruces de Poleas (Desde abajo)", sets: 3, reps: "12-15", rir: 1 },
                        { id: "ps4", name: "Elevaciones Laterales Polea", sets: 4, reps: "15-20", rir: 1 },
                        { id: "ps5", name: "Extensiones Katana (Unilateral)", sets: 3, reps: "12-15", rir: 1 }
                    ]
                },
                {
                    id: "pull-1",
                    name: "DÍA 2: PULL",
                    exercises: [
                        { id: "pl1", name: "Jalón al Pecho Unilateral", sets: 4, reps: "10-12", rir: 2 },
                        { id: "pl2", name: "Remo en T (Pecho apoyado)", sets: 3, reps: "8-10", rir: 2 },
                        { id: "pl3", name: "Pullover en Polea (Unilateral)", sets: 3, reps: "12-15", rir: 1 },
                        { id: "pl4", name: "Face Pulls (Tumbado)", sets: 3, reps: "15-20", rir: 1 },
                        { id: "pl5", name: "Curl Predicador Unilateral", sets: 3, reps: "10-12", rir: 1 }
                    ]
                },
                {
                    id: "legs-1",
                    name: "DÍA 3: LEGS",
                    exercises: [
                        { id: "lg1", name: "Hack Squat (Controlada)", sets: 4, reps: "10-12", rir: 2 },
                        { id: "lg2", name: "Curl Femoral Tumbado", sets: 4, reps: "12-15", rir: 1 },
                        { id: "lg3", name: "Prensa 45º (Pies Altos)", sets: 3, reps: "12-15", rir: 2 },
                        { id: "lg4", name: "Aducción en Máquina", sets: 3, reps: "12-15", rir: 1 },
                        { id: "lg5", name: "Elevación Talones Sentado", sets: 4, reps: "15-20", rir: 1 }
                    ]
                }
            ]
        },
        {
            id: 3,
            name: "Acumulación II",
            weeks: [11, 12, 13, 14, 15],
            sessions: [
                {
                    id: "push-2",
                    name: "DÍA 1: PUSH (MAX STRENGTH)",
                    exercises: [
                        { id: "psh3_1", name: "Press Máquina Convergente", sets: 4, reps: "6-8", rir: 1 },
                        { id: "psh3_2", name: "Incline DB Press", sets: 4, reps: "8-10", rir: 1 },
                        { id: "psh3_3", name: "Cruces de Poleas (Pecho)", sets: 3, reps: "10-12", rir: 0 },
                        { id: "psh3_4", name: "Press Militar Máquina", sets: 3, reps: "8-10", rir: 1 },
                        { id: "psh3_5", name: "Extensiones Katana", sets: 4, reps: "10-12", rir: 1 }
                    ]
                },
                {
                    id: "pull-2",
                    name: "DÍA 2: PULL (MAX OVERLOAD)",
                    exercises: [
                        { id: "pll3_1", name: "Jalón al Pecho Unilateral", sets: 4, reps: "8-10", rir: 1 },
                        { id: "pll3_2", name: "Seated Cable Row (Neutro)", sets: 4, reps: "10-12", rir: 1 },
                        { id: "pll3_3", name: "Remo Unilateral Mancuerna", sets: 3, reps: "8-10", rir: 1 },
                        { id: "pll3_4", name: "Face Pulls Tumbado", sets: 4, reps: "15", rir: 0 },
                        { id: "pll3_5", name: "Curl Bayesian", sets: 4, reps: "10-12", rir: 0 }
                    ]
                },
                {
                    id: "legs-2",
                    name: "DÍA 3: LEGS (BRUTAL CAPACITY)",
                    exercises: [
                        { id: "lgs3_1", name: "Hack Squat (Deep)", sets: 4, reps: "8-10", rir: 1 },
                        { id: "lgs3_2", name: "Curl Femoral Sentado", sets: 4, reps: "10-12", rir: 0 },
                        { id: "lgs3_3", name: "Prensa 45º (Pies Altos)", sets: 4, reps: "12-15", rir: 1 },
                        { id: "lgs3_4", name: "Extensiones Cuádriceps", sets: 3, reps: "15-20", rir: 0 },
                        { id: "lgs3_5", name: "Elevación Talones de Pie", sets: 5, reps: "15", rir: 0 }
                    ]
                }
            ]
        },
        {
            id: 4,
            name: "Intensificación",
            weeks: [16, 17, 18, 19, 20],
            sessions: [
                {
                    id: "torso-heavy-empuje",
                    name: "DÍA 1: TORSO (EMPUJE PESADO)",
                    exercises: [
                        { id: "te4_1", name: "Press Máquina Convergente", sets: 3, reps: "6-8", rir: 1 },
                        { id: "te4_2", name: "Incline Machine Press", sets: 3, reps: "8-10", rir: 1 },
                        { id: "te4_3", name: "Cruces Poleas (45º)", sets: 3, reps: "10-12", rir: 1 },
                        { id: "te4_4", name: "Extensiones Katana", sets: 3, reps: "10-12", rir: 0 }
                    ]
                },
                {
                    id: "legs-heavy",
                    name: "DÍA 2: PIERNA (TENSIÓN PURA)",
                    exercises: [
                        { id: "lh4_1", name: "Hack Squat (Heavy)", sets: 3, reps: "6-8", rir: 1 },
                        { id: "lh4_2", name: "Curl Femoral Sentado", sets: 4, reps: "8-10", rir: 0 },
                        { id: "lh4_3", name: "Leg Press (Pies Altos)", sets: 3, reps: "10-12", rir: 1 },
                        { id: "lh4_4", name: "Elevación Talones de Pie", sets: 4, reps: "10-12", rir: 0 }
                    ]
                }
            ]
        },
        {
            id: 5,
            name: "Realización & Peak",
            weeks: [21, 22, 23, 24, 25],
            sessions: [
                {
                    id: "fb-a",
                    name: "SESIÓN A (ÉNFASIS TORSO)",
                    exercises: [
                        { id: "fa5_1", name: "Press Máquina Convergente", sets: 3, reps: "8-10", rir: 0 },
                        { id: "fa5_2", name: "Jalón al Pecho Unilateral", sets: 3, reps: "10-12", rir: 0 },
                        { id: "fa5_3", name: "Hack Squat (Controlada)", sets: 2, reps: "10-12", rir: 0 },
                        { id: "fa5_4", name: "Extensiones Katana", sets: 3, reps: "12-15", rir: 0 },
                        { id: "fa5_5", name: "Curl Bayesian", sets: 3, reps: "12-15", rir: 0 }
                    ]
                },
                {
                    id: "fb-b",
                    name: "SESIÓN B (ÉNFASIS PIERNA)",
                    exercises: [
                        { id: "fb5_1", name: "Prensa 45º (Pies Altos)", sets: 3, reps: "10-12", rir: 0 },
                        { id: "fb5_2", name: "Seated Cable Row (Neutro)", sets: 3, reps: "8-10", rir: 0 },
                        { id: "fb5_3", name: "Curl Femoral Sentado", sets: 3, reps: "12-15", rir: 0 },
                        { id: "fb5_4", name: "Elevaciones Laterales Polea", sets: 4, reps: "15-20", rir: 0 },
                        { id: "fb5_5", name: "Cable Crunch", sets: 3, reps: "12-15", rir: 0 }
                    ]
                }
            ]
        }
    ]
};
