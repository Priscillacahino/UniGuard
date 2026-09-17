# Auditoria de Permissões Android — UniGuard

> Revisão de minimização baseada no código atual. Deve ser refeita quando novas funcionalidades forem adicionadas.

## Resultado
| Permissão | Uso identificado | Decisão | Justificativa |
|---|---|---|---|
| INTERNET | Firebase e serviços remotos | manter | necessária para autenticação, Firestore, Storage e rede |
| ACCESS_FINE_LOCATION | localização de alta precisão | manter | usada no SOS |
| ACCESS_COARSE_LOCATION | fallback de localização | manter | usada quando precisão fina não está disponível |
| CAMERA | captura opcional de evidência | manter | usada via ActivityResultContracts.TakePicture |
| SEND_SMS | envio ao contato de emergência | manter | SmsManager é usado no fluxo Android |
| VIBRATE | nenhum uso encontrado no código atual | remover | princípio de menor privilégio |

## Observações
- o app usa `ACTION_DIAL`, portanto não precisa de `CALL_PHONE`;
- câmera está marcada como hardware opcional;
- telephony está marcado como hardware opcional;
- SOS deve continuar funcional sem câmera;
- ausência de localização deve ser comunicada sem inventar coordenadas;
- SMS é uma capacidade sensível e deve continuar sendo solicitado apenas no contexto do uso.

## Recomendações futuras
1. revisar se SMS continuará fazendo parte do produto após definição institucional;
2. solicitar permissões progressivamente e no contexto;
3. explicar finalidade antes da caixa de permissão;
4. evitar permissões em background enquanto não forem indispensáveis;
5. repetir esta auditoria a cada mudança relevante do Android.