export declare class Semana {
    primeiroDia: Date;
    agendamentos: Array<Agendamento>;
    constructor(primeiroDia: Date, agendamentos: Array<Agendamento>);
}
export declare class Agendamento {
    nome: string;
    estágio: string;
    tipo: string;
    conteúdo: string;
    responsável: string;
    data: Date;
    constructor(nome: any, estágio: any, tipo: any, conteúdo: any, responsável: any, data: any);
}
export default function Agenda(): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Agenda.d.ts.map