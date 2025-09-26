import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useState, createContext } from "react";
class Semana {
    primeiroDia;
    agendamentos;
    constructor(primeiroDia, agendamentos) {
        this.primeiroDia = primeiroDia;
        this.agendamentos = agendamentos;
    }
}
class Agendamento {
    nome;
    estágio;
    tipo;
    conteúdo;
    responsável;
    data;
    constructor(nome, estágio, tipo, conteúdo, responsável, data) {
        this.nome = nome;
        this.estágio = estágio;
        this.tipo = tipo;
        this.conteúdo = conteúdo;
        this.responsável = responsável;
        this.data = data;
    }
}
const SemanaContext = createContext(new Semana(new Date(2025, 8, 25, 15), [new Agendamento('Maria Clara Andrade', 'kids 2', "Escolar", "Estudar algom kk", "Alexandra", new Date(2025, 8, 25, 14))]));
export default function Agenda() {
    return (_jsxs("div", { className: "w-dvw h-dvh", children: [_jsx(Header, {}), _jsx(ScheduleTable, {})] }));
}
function Header() {
    let [user, setUser] = useState('Juliana Ramos');
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "relative h-12 w-full flex justify-between items-center p-2 text-lg bg-gray-50 shadow-md z-10 overflow-visible", children: [_jsx("h1", { children: _jsx("b", { children: "Agenda Lab" }) }), _jsxs("h1", { children: ["Usu\u00E1rio: ", _jsxs("span", { className: "font-bold", children: [" ", user] })] })] }) }));
}
function ScheduleTable() {
    return (_jsxs("table", { className: "w-full table-fixed", children: [_jsx("thead", { className: "sticky top-0 border-b-2 w-full", children: _jsxs("tr", { className: "w-full text-xl font-bold text-center border-b-2", children: [_jsx("td", { className: "bg-purple-100 py-2 border-r-2 last:border-0 w-36", children: "Hor\u00E1rio" }), _jsx("td", { className: "bg-purple-100 py-2 border-r-2 last:border-0", children: "Segunda-feira" }), _jsx("td", { className: "bg-purple-100 py-2 border-r-2 last:border-0", children: "Ter\u00E7a-feira" }), _jsx("td", { className: "bg-purple-100 py-2 border-r-2 last:border-0", children: "Quarta-feira" }), _jsx("td", { className: "bg-purple-100 py-2 border-r-2 last:border-0", children: "Quinta-feira" }), _jsx("td", { className: "bg-purple-100 py-2 border-r-2 last:border-0", children: "Sexta-feira" }), _jsx("td", { className: "bg-purple-100 py-2 border-r-2 last:border-0", children: "S\u00E1bado" })] }) }), _jsxs("tbody", { children: [_jsx(TableRow, { startTime: 14, endTime: '14h45' }), _jsx(TableRow, { startTime: 15, endTime: '15h45' }), _jsx(TableRow, { startTime: 16, endTime: '16h45' }), _jsx(TableRow, { startTime: 17, endTime: '17h45' }), _jsx(TableRow, { startTime: 18, endTime: '18h45' })] })] }));
}
function TableRow({ startTime, endTime }) {
    return (_jsxs("tr", { className: "text-xl text-center h-16", children: [_jsxs("td", { className: "select-none hover:bg-amber-200 transition-all border-t-2 bg-amber-100", children: [startTime, " at\u00E9 ", endTime] }), _jsx(RowData, {})] }));
}
function RowData(props) {
    let semana = useContext(SemanaContext);
    return (_jsx("td", { className: "select-none cursor-pointer transition-all text-left text-lg border-x-2", children: _jsx("table", { children: _jsxs("tbody", { className: "border-collapse", children: [_jsx(Session, { agendamento: semana.agendamentos[0] }), _jsx("tr", { children: _jsx("td", { className: "border-b-2 h-16", children: "+ Adicionar aluno" }) })] }) }) }));
}
function Session({ agendamento }) {
    if (!agendamento)
        return null;
    return (_jsxs("tr", { className: "border-b-2", children: [_jsxs("p", { children: [_jsx("b", { children: "Aluno:" }), " ", agendamento.nome] }), _jsxs("p", { children: [_jsxs("b", { children: ["Conte\u00FAdo: ", agendamento.tipo] }), " ", " - " + agendamento.conteúdo] }), _jsxs("p", { children: [_jsx("b", { children: "Est\u00E1gio:" }), " ", agendamento.estágio] }), _jsxs("p", { children: [_jsx("b", { children: "Respons\u00E1vel:" }), " ", agendamento.responsável] })] }));
}
//# sourceMappingURL=Agenda.js.map