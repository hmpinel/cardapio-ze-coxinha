/* Vitrine estilo app de delivery, montada a partir de window.ZC (gerado por tools/calc.py).
   modo "atual": cardápio real da loja JP em 30/09. modo "novo": proposta. */
(function () {
  const ZC = window.ZC;
  const TAXA = ZC.fonte.taxa_ifood;
  const ENTREGA = 14.99; // taxa exibida na vitrine em 30/09 (varia por endereço)
  const MIN = ZC.pedido_minimo;
  const brl = v => (v < 0 ? '-' : '') + 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const foto = (k, s) => k ? `assets/img/p/${k}${s ? '-s' : ''}.webp` : null;
  const SABORES = ZC.sabores.map(s => s[0]);
  const cmvChur = n => ({ 12: 5.07, 20: 7.76, 24: 9.11, 100: 33.66 })[n] || +(ZC.cmv_reta.churros[0] + ZC.cmv_reta.churros[1] * n).toFixed(2);
  const LINHA = ['Coxinha de Frango', 'Coxinha de Frango com Requeijão', 'Quibe de Carne', 'Enroladinho de Presunto e Queijo', 'Enroladinho de Salsicha'];

  /* ------------------------------------------------ datasets */
  function gruposAtual(id, it) {
    const sab = n => ({ nome: 'Escolha seus salgadinhos preferidos:', sub: `Escolha ${n} ${n > 1 ? 'opções' : 'opção'}.`, min: n, max: n,
      opcoes: ['Mini Coxinha De Frango', 'Mini Coxinha De Pernil com Barbecue', 'Mini Bolinha De Queijo', 'Novo! Mini Bolinha de Ricota com Alho Poró',
        'Novo! Mini Croquete de Carne com Cheddar', 'Novo! Mini Pastelzinho de Calabresa Especial (c/ Ricota)', 'Mini Pastelzinho de presunto e queijo',
        'Mini enroladinho de salsicha', 'Mini Quibe'].map(n => ({ nome: n })) });
    if (/^100-(salg|calabresa|croquete|ricota)$/.test(id)) return [sab(4), { nome: 'Peça Mais e Economize', sub: 'Escolha até 5 opções.', min: 0, max: 5,
      opcoes: [{ nome: '25 Mini Churros 30%off', desc: 'Mini Churros recheado com doce de leite.', preco: 19.99, cmv: cmvChur(25) }] }];
    if (id === 'coxinha-coca' || id === 'especial-coca') return [
      { nome: 'Escolha seu salgado', sub: 'Escolha 1 opção.', min: 1, max: 1, opcoes: LINHA.map(n => ({ nome: n })) },
      { nome: 'Escolha sua bebida', sub: 'Escolha 1 opção.', min: 1, max: 1, opcoes: [{ nome: 'Coca-Cola Mini' }, { nome: 'Coca-Cola Mini Sem Açúcar' }] }];
    if (/coca/.test(id)) return [sab(1), { nome: 'Escolha sua bebida', sub: 'Escolha 1 opção.', min: 1, max: 1, opcoes: [{ nome: 'Coca-Cola' }, { nome: 'Coca-Cola Sem Açúcar' }] }];
    if (/salg|churros/.test(id)) return [sab(1)];
    return [];
  }
  function atual() {
    const I = ZC.atual_itens, cats = [];
    ZC.atual_cats.forEach((c, ci) => cats.push({ id: 'a' + ci, nome: c.nome, itens: c.itens.map(k => Object.assign({ id: k, grupos: gruposAtual(k, I[k]) }, I[k])) }));
    return { modo: 'atual', destaques: cats[0], cats: cats.slice(1) };
  }
  function gruposNovo(it) {
    const g = [];
    if (it.un) {
      const max = it.un >= 100 ? 5 : it.un >= 50 ? 4 : 3;
      g.push({ nome: 'Sabores', sub: `Mix do Zé em 1 toque ou monte o seu (até ${max})`, min: 1, max, mix: true,
        opcoes: [{ nome: 'Mix do Zé', desc: 'Coxinha, bolinha de queijo, quibe e coxinha de pernil: os 4 mais pedidos', rec: true, mix: true }]
          .concat(SABORES.map(n => ({ nome: n }))) });
    }
    if (it.id === 'n-lanche') g.push({ nome: 'Escolha o salgado grande', sub: 'Escolha 1', min: 1, max: 1, opcoes: LINHA.map((n, i) => ({ nome: n, rec: i === 0 })) });
    if (it.id === 'n-especial') g.push({ nome: 'Escolha o salgado', sub: 'Escolha 1', min: 1, max: 1, opcoes: [{ nome: 'Bauru de Presunto e Queijo', rec: true }, { nome: 'Empadão de Frango' }] });
    if (it.upsell && it.upsell.length) g.push({ nome: 'Completa o pedido', sub: 'Opcional. Sai mais barato que o avulso', min: 0, max: 2, up: true,
      opcoes: it.upsell.map(u => ({ nome: u.nome, preco: u.preco, avulso: u.avulso, cmv: u.cmv, nota: u.nota })) });
    return g;
  }
  function novo() {
    const cats = ZC.novo_cats.map(c => ({ id: c.id, nome: c.nome, sub: c.sub, hora: c.horario, itens: ZC.novo_itens.filter(i => i.cat === c.id).map(i => Object.assign({ grupos: gruposNovo(i) }, i)) }));
    return { modo: 'novo', destaques: null, cats };
  }

  /* ------------------------------------------------ componente */
  class Phone {
    constructor(el, modo, opts = {}) {
      this.el = el; this.modo = modo; this.opts = opts; this.d = modo === 'novo' ? novo() : atual();
      this.sacola = []; this.toques = 0; this.onEvent = opts.onEvent || (() => {});
      el.innerHTML = `<div class="notch"></div><div class="tela"><div class="app"><div class="rolavel"></div>
        <div class="barra-sacola"><span>Ver sacola</span><span class="bs-v">R$ 0,00</span></div></div>
        <div class="painel p-item"></div><div class="painel p-sac"></div><div class="painel p-rev"></div><div class="painel p-ok"></div>
        <div class="toast"></div><div class="dedo"></div></div>`;
      this.tela = el.querySelector('.tela'); this.rol = el.querySelector('.rolavel'); this.dedo = el.querySelector('.dedo');
      this.bar = el.querySelector('.barra-sacola'); this.bar.onclick = () => { this.toque(); this.abrirSacola(); };
      this.render();
    }
    toque() { this.toques++; this.onEvent('toque', this); }
    reset() { this.sacola = []; this.toques = 0; this.el.querySelectorAll('.painel').forEach(p => p.classList.remove('on')); this.rol.scrollTop = 0; this.atualizarBarra(); this.onEvent('reset', this); }
    render() {
      const d = this.d, logo = 'assets/img/m/logo-emoji.webp';
      let h = `<div class="capa" style="background-image:url(assets/img/p/coxinha-grande.webp)"></div>
        <div class="loja-info"><div class="lg"><img src="${logo}" alt=""></div><h4>Zé Coxinha <span class="nota">★ 4,9</span></h4>
        <div class="meta">Pedido mínimo ${brl(MIN)} · 31-46 min · Entrega ${brl(ENTREGA)}</div></div>`;
      const todas = (d.destaques ? [d.destaques] : []).concat(d.cats);
      h += `<div class="cats">${todas.map((c, i) => `<button data-c="${c.id}" class="${i === 0 ? 'on' : ''}">${c.nome}</button>`).join('')}</div>`;
      if (d.destaques) {
        h += `<div class="sec-cat" data-sec="${d.destaques.id}"><h5>Destaques</h5></div><div class="destaques">` +
          d.destaques.itens.map((it, j) => `<button class="dq" data-cat="${d.destaques.id}" data-i="${j}"><div class="ft" style="background-image:url(${foto(it.foto, 1)})"></div>
          <div class="nm">${it.nome}</div><div class="pr ${it.de ? 'promo' : ''}">${brl(it.preco)} ${it.de ? `<s>${brl(it.de)}</s>` : ''}</div></button>`).join('') + '</div>';
      }
      d.cats.forEach(c => {
        h += `<div class="sec-cat" data-sec="${c.id}"><h5>${c.nome}</h5>${c.sub ? `<div class="cs">${c.sub}</div>` : ''}${c.hora ? `<span class="hora">Visível ${c.hora.replace('seg-sex', 'seg a sex').replace(/(\d\d:\d\d)-(\d\d:\d\d)/, '$1 às $2')}</span>` : ''}</div>`;
        c.itens.forEach((it, j) => { h += this.cardHTML(it, c.id, j); });
      });
      h += '<div style="height:90px"></div>';
      this.rol.innerHTML = h;
      this.rol.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { this.toque(); this.abrirItem(this.acharItem(b.dataset.cat, +b.dataset.i)); });
      this.rol.querySelectorAll('.cats button').forEach(b => b.onclick = () => { this.toque(); this.irCategoria(b.dataset.c); });
    }
    cardHTML(it, cid, j) {
      const f = foto(it.foto, 1), novo = this.modo === 'novo';
      const chips = novo ? (it.tags || []).map(t => `<span class="chip ${/Econom|por pessoa|cada/.test(t) ? 'v' : /Mais pedido/.test(t) ? 'r' : /Fase 2/.test(t) ? 'f2' : ''}">${t}</span>`).join('') : '';
      const serve = it.serve ? `<div class="serve">Serve ${it.serve} ${it.serve > 1 ? 'pessoas' : 'pessoa'}${novo && it.serve > 1 ? ` · ${brl(it.por_pessoa)} por pessoa` : ''}</div>` : '';
      const pr = it.apartir ? `A partir de ${brl(it.preco)}` : `${brl(it.preco)} ${it.de ? `<s>${brl(it.de)}</s>` : ''}${novo && it.avulso && it.economia > 0 ? `<s>${brl(it.avulso)}</s>` : ''}`;
      return `<button class="card-i" data-cat="${cid}" data-i="${j}" style="${f ? '' : 'grid-template-columns:1fr'}"><div><div class="nm">${it.nome}</div>
        ${chips ? `<div class="chips">${chips}</div>` : ''}<div class="ds">${it.desc || ''}</div>${serve}
        <div class="pr ${(it.de || (novo && it.economia > 0)) ? 'promo' : ''}">${pr}</div></div>${f ? `<div class="ft" style="background-image:url(${f})"></div>` : ''}</button>`;
    }
    irCategoria(cid) {
      // fecha item, sacola e revisão abertos e leva direto para a categoria
      const aberto = [...this.el.querySelectorAll('.painel.on')].length > 0;
      this.el.querySelectorAll('.painel').forEach(p => p.classList.remove('on'));
      this.rol.querySelectorAll('.cats button').forEach(x => x.classList.toggle('on', x.dataset.c === cid));
      const s = this.rol.querySelector(`[data-sec="${cid}"]`); if (s) this.rol.scrollTop = s.offsetTop - 40;
      if (aberto) this.onEvent('fechou', this);
    }
    acharItem(cid, j) { const c = (this.d.destaques && this.d.destaques.id === cid) ? this.d.destaques : this.d.cats.find(c => c.id === cid); return c.itens[j]; }

    /* ----- tela do item */
    abrirItem(it) {
      this.item = it; this.sel = it.grupos.map(() => []);
      const p = this.el.querySelector('.p-item'), novo = this.modo === 'novo';
      const eco = novo && it.economia > 0 ? `<span class="eco">Separado sai ${brl(it.avulso)}: você economiza ${brl(it.economia)}</span>` : '';
      let h = `<div class="topo"><button class="volta">‹</button><span>${it.nome.toUpperCase().slice(0, 34)}</span></div><div class="corpo">
        ${it.foto ? `<div class="it-ft" style="background-image:url(${foto(it.foto)})"></div>` : ''}
        <div class="it-cab"><h6>${it.nome}</h6><p>${it.desc || ''}</p>${it.serve ? `<p>Serve ${it.serve} ${it.serve > 1 ? 'pessoas' : 'pessoa'}${novo && it.serve > 1 ? ` · ${brl(it.por_pessoa)} por pessoa` : ''}</p>` : ''}
        <div class="pr">${brl(it.preco)} ${it.de ? `<s style="color:#a6a6a6;font-size:12px">${brl(it.de)}</s>` : ''}</div>${eco}</div>`;
      it.grupos.forEach((g, gi) => {
        h += `<div class="grp" data-g="${gi}"><div><b>${g.nome}</b><small>${g.sub || ''}</small></div>${g.min ? `<span class="obr">${g.max > 1 && g.min === g.max ? `0/${g.max} ` : ''}OBRIGATÓRIO</span>` : ''}</div>`;
        g.opcoes.forEach((o, oi) => {
          h += `<button class="op" data-g="${gi}" data-o="${oi}"><div class="t">${o.nome}${o.rec ? '<span class="rec">MAIS PEDIDO</span>' : ''}${o.desc ? `<small>${o.desc}</small>` : ''}${o.nota ? `<small>${o.nota}</small>` : ''}</div>
            <div style="display:flex;gap:10px;align-items:center">${o.preco ? `<span class="pp">${o.avulso ? `<s>${brl(o.avulso)}</s>` : ''}+ ${brl(o.preco)}</span>` : ''}<span class="ck ${g.max === 1 ? 'rd' : ''}"></span></div></button>`;
        });
      });
      h += `<div style="height:20px"></div></div><div class="rodape"><div class="qt">– <span style="color:#3e3e3e">1</span> +</div><button class="add" disabled><span>Adicionar</span><span class="add-v">${brl(it.preco)}</span></button></div>`;
      p.innerHTML = h; p.classList.add('on');
      p.querySelector('.volta').onclick = () => { this.toque(); p.classList.remove('on'); this.onEvent('fechou', this); };
      p.querySelectorAll('.op').forEach(b => b.onclick = () => { this.toque(); this.marcar(+b.dataset.g, +b.dataset.o); });
      p.querySelector('.add').onclick = () => { this.toque(); this.adicionar(); };
      this.checarItem(); this.onEvent('item', this);
    }
    marcar(gi, oi) {
      const g = this.item.grupos[gi], s = this.sel[gi], o = g.opcoes[oi];
      const i = s.indexOf(oi);
      if (i >= 0) s.splice(i, 1);
      else {
        if (g.mix) { if (o.mix) s.length = 0; else { const m = s.findIndex(x => g.opcoes[x].mix); if (m >= 0) s.splice(m, 1); } }
        if (g.max === 1) s.length = 0;
        if (s.length < g.max) s.push(oi);
      }
      this.checarItem(); this.onEvent('item', this);
    }
    grupoOk(g, s) { if (!g.min) return true; if (g.mix && s.some(x => g.opcoes[x].mix)) return true; return g.min === g.max ? s.length === g.min : s.length >= g.min; }
    checarItem() {
      const p = this.el.querySelector('.p-item'); let ok = true;
      this.item.grupos.forEach((g, gi) => {
        const s = this.sel[gi];
        p.querySelectorAll(`.op[data-g="${gi}"]`).forEach(b => b.classList.toggle('sel', s.includes(+b.dataset.o)));
        const gok = this.grupoOk(g, s); ok = ok && gok;
        const tag = p.querySelector(`.grp[data-g="${gi}"] .obr`);
        if (tag) { tag.classList.toggle('ok', gok); tag.textContent = gok ? '✓ PRONTO' : (g.max > 1 && g.min === g.max ? `${s.length}/${g.max} ` : '') + 'OBRIGATÓRIO'; }
      });
      const v = this.valorItem();
      p.querySelector('.add').disabled = !ok; p.querySelector('.add-v').textContent = brl(v.preco);
    }
    valorItem() {
      const it = this.item; let preco = it.preco, cmv = it.cmv || 0; const extras = [];
      it.grupos.forEach((g, gi) => this.sel[gi].forEach(oi => { const o = g.opcoes[oi]; if (o.preco) { preco += o.preco; cmv += o.cmv || 0; extras.push(o); } }));
      return { preco, cmv, extras, margem: preco * (1 - TAXA) - cmv };
    }
    adicionar() {
      const v = this.valorItem(), it = this.item;
      const detalhe = it.grupos.map((g, gi) => this.sel[gi].map(oi => g.opcoes[oi].nome).join(', ')).filter(Boolean).join(' · ');
      this.sacola.push({ nome: it.nome, detalhe, preco: v.preco, cmv: v.cmv, margem: v.margem, item: it, extras: v.extras });
      this.el.querySelector('.p-item').classList.remove('on'); this.atualizarBarra(); this.onEvent('sacola', this);
      if (this.el.querySelector('.p-sac').classList.contains('on')) this.abrirSacola();
    }
    totais() { const s = this.sacola.reduce((a, b) => ({ preco: a.preco + b.preco, cmv: a.cmv + b.cmv }), { preco: 0, cmv: 0 }); s.margem = s.preco * (1 - TAXA) - s.cmv; return s; }
    atualizarBarra() { const t = this.totais(); this.bar.classList.toggle('on', this.sacola.length > 0); this.bar.querySelector('.bs-v').textContent = brl(t.preco); }

    /* ----- sacola, revisão, confirmação */
    abrirSacola() {
      const p = this.el.querySelector('.p-sac'), t = this.totais(), falta = Math.max(0, MIN - t.preco), novo = this.modo === 'novo';
      let h = `<div class="topo"><button class="volta">‹</button><span>SACOLA</span></div><div class="corpo">
        <div class="sac-l" style="font-weight:700">Zé Coxinha</div>`;
      this.sacola.forEach(l => { h += `<div class="sac-l"><div>1x ${l.nome}<small>${l.detalhe}</small></div><b>${brl(l.preco)}</b></div>`; });
      if (falta > 0) h += `<div class="aviso-min"><b>Faltam ${brl(falta)} para o pedido mínimo de ${brl(MIN)}</b>Adicione mais itens para continuar.<div class="falta"><i style="width:${100 * t.preco / MIN}%"></i></div></div>`;
      if (novo && t.preco >= MIN) {
        const ja = new Set(this.sacola.flatMap(l => l.extras.map(e => e.nome)));
        const sug = [{ nome: 'Coca-Cola 2 L', preco: 19.99, cmv: 7.88, foto: '50-coca', re: /Coca/ }, { nome: '12 Mini Churros', preco: 14.99, cmv: 5.07, foto: '20-churros', re: /Churros/ }]
          .filter(s => ![...ja].some(n => s.re.test(n)) && !this.sacola.some(l => s.re.test(l.nome)));
        if (sug.length) h += `<div class="peca"><h6>Peça também</h6><div class="row">${sug.map((s, i) => `<button class="pc" data-s="${i}"><div class="ft" style="background-image:url(${foto(s.foto, 1)})"></div><b>${s.nome}</b><span>${brl(s.preco)}</span></button>`).join('')}</div></div>`;
        this._sug = sug;
      }
      h += `<div class="sac-tot"><div><span>Subtotal</span><span>${brl(t.preco)}</span></div><div><span>Taxa de entrega</span><span>${brl(ENTREGA)}</span></div>
        <div class="t"><span>Total</span><span>${brl(t.preco + ENTREGA)}</span></div></div></div>
        <div class="rodape"><button class="add seguir" ${falta > 0 ? 'disabled' : ''}><span>${falta > 0 ? 'Adicionar mais itens' : 'Continuar'}</span><span>${brl(t.preco + ENTREGA)}</span></button></div>`;
      p.innerHTML = h; p.classList.add('on');
      p.querySelector('.volta').onclick = () => { this.toque(); p.classList.remove('on'); };
      p.querySelectorAll('.pc').forEach(b => b.onclick = () => { this.toque(); const s = this._sug[+b.dataset.s]; this.sacola.push({ nome: s.nome, detalhe: 'Peça também', preco: s.preco, cmv: s.cmv, margem: s.preco * (1 - TAXA) - s.cmv, extras: [] }); this.atualizarBarra(); this.abrirSacola(); this.onEvent('sacola', this); });
      p.querySelector('.seguir').onclick = () => { this.toque(); this.abrirRevisao(); };
      this.onEvent('sacola-aberta', this);
    }
    abrirRevisao() {
      const p = this.el.querySelector('.p-rev'), t = this.totais();
      p.innerHTML = `<div class="topo"><button class="volta">‹</button><span>REVISAR PEDIDO</span></div><div class="corpo">
        <div class="sac-l"><div>Entregar em<small>Endereço do cliente · Hoje, 31-46 min</small></div></div>
        <div class="sac-l"><div>Pagamento<small>Pix pelo app</small></div></div>
        ${this.sacola.map(l => `<div class="sac-l"><div>1x ${l.nome}</div><b>${brl(l.preco)}</b></div>`).join('')}
        <div class="sac-tot"><div><span>Subtotal</span><span>${brl(t.preco)}</span></div><div><span>Taxa de entrega</span><span>${brl(ENTREGA)}</span></div>
        <div class="t"><span>Total</span><span>${brl(t.preco + ENTREGA)}</span></div></div></div>
        <div class="rodape"><button class="add fazer"><span>Fazer pedido</span><span>${brl(t.preco + ENTREGA)}</span></button></div>`;
      p.classList.add('on');
      p.querySelector('.volta').onclick = () => { this.toque(); p.classList.remove('on'); };
      p.querySelector('.fazer').onclick = () => { this.toque(); this.concluir(); };
    }
    concluir() {
      const p = this.el.querySelector('.p-ok'), novo = this.modo === 'novo';
      p.innerHTML = `<div class="topo"><span>PEDIDO FEITO</span></div><div class="ok-tela ${novo ? '' : 'e-so'}"><div><div class="v"></div><h6>${novo ? 'Pedido confirmado!' : 'Pedido confirmado. E só.'}</h6><p>${novo ? 'O Zé já está preparando seus salgadinhos.' : 'Nenhum motivo para voltar.'}</p>
        ${novo ? `<div class="rasp-mini"><img src="assets/img/m/ze-joia.webp" alt=""><div><b>Vai uma raspadinha na caixa</b><span>Raspou, ganhou: 5 coxinhas pra resgatar na loja.</span></div></div>` : ''}
        <p style="margin-top:14px"><button class="refazer" style="color:var(--ifood);font-weight:700">Fazer de novo</button></p></div></div>`;
      p.classList.add('on');
      p.querySelector('.refazer').onclick = () => this.reset();
      this.onEvent('concluido', this);
    }
    toast(msg, ms = 1800) { if (this.rapido) return; const t = this.el.querySelector('.toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('on'), ms); }

    /* ----- roteiro (corrida) */
    async tocar(el, pausa = 450) {
      if (!el) return;
      if (this.rapido) { el.click(); return; }
      const f = this.lento || 1;   // ritmo da corrida (1 = original; o site usa mais devagar)
      const sc = el.closest('.rolavel, .corpo');
      if (sc) { const top = el.offsetTop - sc.clientHeight * 0.35; if (Math.abs(sc.scrollTop - top) > 20) { sc.scrollTop = top; await sleep(420 * f); } }
      const r = el.getBoundingClientRect(), T = this.tela.getBoundingClientRect(), k = T.width / this.tela.offsetWidth;
      this.dedo.style.opacity = 1; this.dedo.style.left = (r.left + r.width / 2 - T.left) / k + 'px'; this.dedo.style.top = (r.top + r.height / 2 - T.top) / k + 'px';
      await sleep(520 * f); this.dedo.classList.remove('tap'); void this.dedo.offsetWidth; this.dedo.classList.add('tap'); el.click(); await sleep(pausa * f);
    }
    q(sel) { return this.el.querySelector(sel); }
    opcao(txt) { return [...this.el.querySelectorAll('.p-item .op')].find(b => b.textContent.includes(txt)); }
    card(txt) { return [...this.el.querySelectorAll('.rolavel .card-i, .rolavel .dq')].find(b => b.querySelector('.nm').textContent.trim().startsWith(txt)); }
  }
  window.Phone = Phone; window.PhoneUtil = { brl, sleep };
})();
