import { describe, expect, it } from 'vitest';
import { parseStoredJson } from './storage';

describe('leitura segura do armazenamento local', () => {
  it('retorna o conteúdo JSON válido', () => {
    expect(parseStoredJson('{"campus":"campus_1"}', {})).toEqual({ campus: 'campus_1' });
  });

  it('retorna o valor padrão quando não existe conteúdo', () => {
    expect(parseStoredJson(null, ['padrão'])).toEqual(['padrão']);
  });

  it('retorna o valor padrão quando o JSON está corrompido', () => {
    expect(parseStoredJson('{inválido', { safe: true })).toEqual({ safe: true });
  });
});
