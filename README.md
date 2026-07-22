# 0xGuto — template de blog

Template estático (HTML/CSS/JS puro, zero dependências de build) com estética
cyberpunk — inspirado em referências como hosh1.sh e utopiatokyo.com, mas
com nível de animação intermediário: sutil o suficiente pra não atrapalhar
a leitura, elaborado o suficiente pra ter identidade.

## Estrutura

```
blog/
├── index.html      → home: hero, stats, diretórios, últimas transmissões
├── malware.html     → log completo de análise de malware (filtro por tag)
├── ctf.html          → log completo de CTF (filtro por tag + dificuldade)
├── intel.html        → log completo de threat intel (filtro por tag)
├── post.html          → template de post individual
├── css/style.css      → design system completo
├── js/main.js          → rede animada, boot de terminal, contadores, filtros
└── README.md
```

## Como adicionar um post novo

1. Copie `post.html`, renomeie (ex: `meu-novo-post.html`)
2. Edite o conteúdo dentro de `<div class="post-body">`
3. Atualize o breadcrumb e a tag `<title>`
4. Adicione uma entrada correspondente na página de log da categoria certa
   (`malware.html`, `ctf.html` ou `intel.html`), copiando um bloco `.log-entry`
   existente e ajustando `data-tags` / `data-diff` (só CTF usa dificuldade)
5. Se quiser que apareça também na home, adicione a mesma entrada em
   `index.html` na seção `/var/log/últimas_transmissões`

## Sistema de filtros

Os filtros funcionam via atributos `data-*` nos elementos `.log-entry`:

```html
<div class="log-entry" data-tags="linux,ebpf" data-diff="hard">
```

- `data-tags`: lista separada por vírgula, usada pelos botões `data-group="tag"`
- `data-diff`: usado apenas em `ctf.html`, pelos botões `data-group="diff"`

Pra adicionar uma nova tag de filtro, basta criar um novo botão:
```html
<button class="filter-pill" data-group="tag" data-tag="minha-tag">minha-tag</button>
```
e usar `minha-tag` no `data-tags` das entradas correspondentes. Nenhuma
mudança de JS é necessária — o filtro é genérico.

## Tiers de dificuldade (CTF)

Classes prontas: `.diff-badge.easy`, `.medium`, `.hard`, `.insane` — cada
uma com cor própria já mapeada nas variáveis CSS (`--diff-easy`, etc.)

## Customização de cores

Tudo centralizado em `:root` no topo do `style.css`:

```css
--bg: #0d0e16;        /* fundo base */
--magenta: #ff3b81;   /* accent primário */
--cyan: #2de2e6;      /* accent secundário */
--amber: #ff9f1c;     /* tags/alertas */
--diff-easy: ...      /* tiers de dificuldade CTF */
```

## Migrando para Hugo ou Astro

Se o volume de posts crescer e editar HTML na mão ficar chato, o CSS/JS
são completamente reaproveitáveis num gerador estático — cada página de
log (`malware.html`, `ctf.html`, `intel.html`) vira um template que itera
sobre uma coleção de conteúdo com front matter (`tags`, `diff`, `date`).

## Fontes (Google Fonts, já linkadas no `<head>`)

- **Space Mono** — headers, logo, HUD, `.page-intro h1`
- **IBM Plex Sans** — corpo de texto
- **Fira Code** — código, status bar, tags, filtros

## Acessibilidade

- `prefers-reduced-motion` desliga rede animada, boot de terminal e contadores
- Estados de foco visíveis via teclado
- Contraste testado para leitura em fundo escuro
