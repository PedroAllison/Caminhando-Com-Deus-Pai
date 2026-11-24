# 🪔 Caminhando com Deus Pai

App mobile (React Native + Expo) para devocionais diários: escolha um versículo, receba uma reflexão personalizada por IA,
registre o que Deus falou com você e mantenha sua **lamparina acesa** todos os dias, junto com seus amigos.

## Funcionalidades
- Cadastro inicial: nome, idade, sexo, versão da Bíblia e horários de lembrete
- Leitura por livro, capítulo e versículo(s) na NVI completa, embutida no app (funciona offline)
- Reflexão personalizada (idade, sexo, histórico e um tema variado), gerada pelo **Google Gemini (gratuito)**
- Campo de registro pessoal + resposta da IA ao que a pessoa escreveu
- Lamparina animada (acende ao concluir, fumaça quando apagada), sequência de dias e recorde
- Notificações locais diárias nos horários escolhidos
- Comunidade: código de amizade, lamparinas dos amigos, reflexões compartilhadas com "Amém"
- Diário com o histórico dos devocionais

## Rodando
```bash
npm install
npx expo install --fix   # alinha as versões com o SDK do Expo
cp .env.example .env     # preencha as chaves
npx expo start           # abra no celular com o app Expo Go
```
> Notificações exigem um aparelho físico. No Android com Expo Go o SDK 53+ limita notificações; para testar 100%, gere um development build: `npx expo run:android`.

## Backend (Supabase - plano grátis)
1. Crie um projeto em https://supabase.com
2. **Authentication > Providers**: ative *Anonymous sign-ins*
3. **SQL Editor**: rode `supabase/migrations/001_init.sql`
4. Pegue uma chave gratuita do Gemini em https://aistudio.google.com/apikey
5. Publique a função de IA:
   ```bash
   npx supabase login
   npx supabase link --project-ref ttimduupbjoqceycshus
   npx supabase secrets set GEMINI_API_KEY=sua_chave
   npx supabase functions deploy devocional
   ```
6. Coloque `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` no `.env`

Sem o Supabase configurado, o app funciona offline com reflexões de reserva (sem comunidade).

## Sobre a versão bíblica
O texto da NVI fica em `assets/biblia/nvi` (um JSON por livro), extraído dos PDFs. A NVI é protegida por direitos autorais (Biblica); para publicar o app nas lojas, obtenha a licença de uso.

## Estrutura
```
app/                 telas (expo-router)
  onboarding.tsx     cadastro inicial
  devocional.tsx     fluxo livro → capítulo → versículos → reflexão → registro
  (tabs)/            Hoje (lamparina), Comunidade, Diário
src/components/      Lamparina animada e componentes de UI
src/lib/             bíblia, IA, armazenamento, notificações, comunidade
supabase/            SQL e Edge Function (Gemini)
```
