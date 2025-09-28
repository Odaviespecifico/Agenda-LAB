import { describe, it, expect } from 'vitest';
import { deletefromDB } from './firebase.js';
import { Agendamento,Semana } from './Agenda.js';
describe('Gets the correct document', () => {
    it('should return expected value', () => {
        const result = deletefromDB(new Agendamento('João','kids 3','Escolar','reforço para prova','Juliana Ramos', new Date(2025,8,27,14,0,0)));
    });
});