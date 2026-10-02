/* Cenas, números e modo apresentação. Todos os números vêm de window.ZC (tools/calc.py). */
(function () {
  const ZC = window.ZC, { brl, sleep } = window.PhoneUtil;
  const SOLTO = document.createElement('div');
  const $ = s => document.querySelector(s) || SOLTO, $$ = s => [...document.querySelectorAll(s)];
  const pct = (v, d = 1) => v.toFixed(d).replace('.', ',') + '%';
  const n0 = v => Math.round(v).toLocaleString('pt-BR');
  const br0 = v => (v < 0 ? '-' : '') + 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const get = p => p.split('.').reduce((o, k) => o == null ? o : o[k], ZC);
  const brlk = v => 'R$ ' + (v / 1000).toFixed(1).replace('.', ',') + ' mil';
  const sg = v => (v >= 0 ? '+' : '') + br0(v);
  const FMT = { int: n0, pct: v => pct(v), pct100: v => pct(v * 100), pctpp: v => pct(v), brl0: br0, brlp: v => '+' + br0(v), brlk, brlkp: v => '+' + brlk(v) };
  const M = ZC.modelo, RD = ZC.rede, MR = RD.modelo;

  /* ------------------------------------------------ ligações de números */
  $$('[data-v]').forEach(el => { const v = get(el.dataset.v); if (v != null) el.textContent = (FMT[el.dataset.f] || String)(v); });

  /* ------------------------------------------------ 1 funil */
  const F = ZC.funil, RF = RD.funil, RP = RD.passagens, MES = RD.funil_mes;
  const etapas = [['Visitas', RF.visitas], ['Abriram item', RF.itens], ['Sacola', RF.carrinho], ['Checkout', RF.checkout], ['Pedidos', RF.pedidos]];
  $('#barras').innerHTML = etapas.map(([r, v]) => `<div class="barra-l"><span class="rot">${r}</span><div class="trilho"><i class="jp" data-w="${100 * v / RF.visitas}"></i></div><span class="val">${pct(100 * v / RF.visitas)}<small>${n0(v / 2)} por mês</small></span></div>`).join('');
  const mm = k => { const v = MES.map(m => m[k]); return `3 meses: ${pct(Math.min(...v))} a ${pct(Math.max(...v))}`; };
  const PASS = [['Visita → item', RP.vis_item, 'vis_item', 0], ['Item → sacola', RP.item_carr, 'item_carr', RP.sairam_item_mes], ['Sacola → checkout', RP.carr_chk, 'carr_chk', 0], ['Checkout → pedido', RP.chk_ped, 'chk_ped', RP.sairam_chk_mes]];
  $('#passos4').innerHTML = PASS.map(([r, a, k, sai]) => `<div class="p4 ${sai ? 'perde' : 'vence'}"><span>${r}</span><b>${pct(a)}</b><small>${mm(k)}</small><em>${sai ? `sai ${pct(100 - a, 0)}` : 'passa bem'}</em></div>`).join('');
  const por100 = [RF.itens, RF.carrinho, RF.pedidos].map(v => (100 * v / RF.visitas).toFixed(v === RF.pedidos ? 1 : 0).replace('.', ','));
  $('#vazaLead').innerHTML = `De cada 100 visitas, <b>${por100[0]}</b> abrem um item, <b>${por100[1]}</b> põem na sacola e <b>${por100[2]}</b> viram pedido.`;
  $('#vazaFonte').textContent = 'BI Tastefy Insights › Conversão: 28 franquias Zé Coxinha no iFood, média de agosto e setembro, todas as marcas da loja. Clientes: BI › Explorador.';

  /* ------------------------------------------------ 2 hoje x novo */
  const mix = ZC.simulacao, lz = ZC.novo_itens.find(i => i.id === 'n-lanche'), f10 = ZC.novo_itens.find(i => i.id === 'n-festa10');
  const c100 = ZC.economia_atual.find(e => /100 Salgadinhos \+ Coca/.test(e.nome)), uCoca = ZC.novo_itens.find(i => i.id === 'n-100').upsell.find(u => u.id === 'u-coca2l');
  const HOR = RD.horario, hmax = Math.max(...HOR.map(h => h.v));
  const hbars = `<div class="hbars">${HOR.filter(h => h.v > 1000).map(h => `<i class="${/^1[4-7]h$/.test(h.h) ? 'pk' : ''}" style="height:${Math.max(8, 100 * h.v / hmax)}%"><em>${h.h.replace('até ', '')}</em></i>`).join('')}</div>`;
  const HXN = [
    { etp: 'Item → sacola', h: ['4 escolhas', `obrigatórias para pedir o campeão. É a tela em que a rede perde ${pct(RP.sairam_item_pct, 0)}.`], n: ['1 toque', 'Mix do Zé, com os 4 sabores mais pedidos.'] },
    { etp: 'Visita → item', h: [`${RD.nfb.lancamentos_100} vendas`, `dos 3 lançamentos do topo da vitrine, em 3 meses, nas cozinhas NFB que vendem Zé Coxinha. O campeão vendeu ${n0(RD.mix[0].qtd)}. Na Jardim da Penha: zero em 30 dias.`], n: ['Top 3', 'campeões da rede no topo, com selo "mais pedido". Lançamento vira sabor do Mix.'] },
    { etp: 'Item → sacola', h: [br0(f10.avulso < 119.99 ? 119.99 - f10.avulso : 0), `a mais que o separado no Combo para 10, e ${br0(-c100.economia)} no 100 + Coca.`], n: [br0(f10.economia), 'de economia real e escrita. Nenhum combo fica mais caro do que montar pelo item.'] },
    { etp: 'Sacola → pedido', h: [pct(RD.perda_peq.share), 'dos pedidos são caixas de 10 e 20, abaixo do pedido mínimo.'], n: [br0(lz.preco), 'Lanche do Zé: toda entrada já passa o mínimo.'] },
    { etp: 'Ticket', h: ['0 bebida', `oferecida no campeão, que está em ${pct(RD.campeao_pedidos_pct, 0)} dos pedidos.`], n: [br0(uCoca.preco), 'Coca 2 L sugerida pelo preço exato do combo.'] },
    { etp: 'Horário', h: [pct(RD.horario_pico_pct, 0), 'das vendas da rede caem entre 14h e 18h. Hoje, só uma oferta escondida aparece nessa hora.', hbars], n: ['14h', 'a categoria Lanche da tarde sobe para o topo, todo dia.'] },
  ];
  $('#hxn').innerHTML = HXN.filter(r => r.etp !== 'Item → sacola' && r.etp !== 'Horário').map(r => `<div class="hx rev"><span class="etp">${r.etp}</span><div class="h"><b>${r.h[0]}</b><p>${r.h[1]}</p>${r.h[2] || ''}</div><i class="seta">→</i><div class="n"><b>${r.n[0]}</b><p>${r.n[1]}</p></div></div>`).join('');
  $('#hxnFonte').textContent = 'Hoje = vitrine padrão da rede (a mesma da JP em 30/09). Vendas por item: BI › Explorador, marca Zé Coxinha nas cozinhas NFB (não inclui franquias), julho a setembro. Jardim da Penha: Portal do iFood, 30 dias até 30/09.';
  $('#faixaTxt').innerHTML = (t => t + t)(['Mix do Zé em 1 toque', 'Toda entrada passa o mínimo', 'Economia de verdade', 'Serve X pessoas', 'Lanche da tarde às 14h', 'A sugestão que deixa margem', 'Raspou, ganhou'].map(s => `<span>${s}</span>`).join(''));

  /* ------------------------------------------------ 3 corrida */
  const pa = new Phone($('#celA'), 'atual', { onEvent: () => placar() });
  const pn = new Phone($('#celN'), 'novo', { onEvent: () => placar() });
  let esc = { a: 0, n: 0 }, iniciou = false;
  $('.placar').insertAdjacentHTML('afterbegin', '<img class="ze-pop" src="assets/img/m/ze-apaixonado.webp" alt="">');
  $('#btnCorrida').insertAdjacentHTML('beforebegin', '<div class="carimbo" id="carimbo"></div>');
  function placar() {
    if (!iniciou) { if (previa) { mostraPrevia(); return; } ['pA-toq', 'pN-toq', 'pA-esc', 'pN-esc', 'pA-tic', 'pN-tic', 'pA-mar', 'pN-mar'].forEach(i => $('#' + i).textContent = '·'); return; }
    $('.placar').classList.remove('previa');
    const ta = pa.totais(), tn = pn.totais(), z = (v, f) => v ? f(v) : '·';
    $('#pA-toq').textContent = z(pa.toques, String); $('#pN-toq').textContent = z(pn.toques, String);
    $('#pA-esc').textContent = z(esc.a, String); $('#pN-esc').textContent = z(esc.n, String);
    $('#pA-tic').textContent = z(ta.preco, br0); $('#pN-tic').textContent = z(tn.preco, br0);
    $('#pA-mar').textContent = z(ta.preco && ta.margem, br0); $('#pN-mar').textContent = z(tn.preco && tn.margem, br0);
    return;
    $('#pA-toq').textContent = pa.toques; $('#pN-toq').textContent = pn.toques;
    $('#pA-esc').textContent = esc.a; $('#pN-esc').textContent = esc.n;
    $('#pA-tic').textContent = br0(ta.preco); $('#pN-tic').textContent = br0(tn.preco);
    $('#pA-mar').textContent = br0(ta.margem); $('#pN-mar').textContent = br0(tn.margem);
  }
  const RODADAS = [
    { nome: 'A galera', txt: 'A caixa de 100, o pedido mais comum. Hoje: 4 escolhas e nenhuma bebida. No novo: Mix do Zé em 1 toque e a Coca 2 L por R$ 17,00.',
      a: async p => { await p.tocar(p.card('100 Salgadinhos 50% off')); for (const s of ['Mini Coxinha De Frango', 'Mini Bolinha De Queijo', 'Mini Quibe', 'Mini Coxinha De Pernil']) { await p.tocar(p.opcao(s), 250); esc.a++; placar(); } await p.tocar(p.q('.p-item .add')); await p.tocar(p.q('.barra-sacola')); await p.tocar(p.q('.p-sac .seguir')); await p.tocar(p.q('.p-rev .fazer')); },
      n: async p => { await p.tocar(p.card('100 Salgadinhos', true)); await p.tocar(p.opcao('Mix do Zé')); esc.n++; placar(); await p.tocar(p.opcao('Coca-Cola 2 L')); await p.tocar(p.q('.p-item .add')); await p.tocar(p.q('.barra-sacola')); await p.tocar(p.q('.p-sac .seguir')); await p.tocar(p.q('.p-rev .fazer')); } },
    { nome: 'Só pra mim', txt: 'O lanche de uma pessoa. Hoje: o combo de R$ 19,99 não passa o mínimo e o cliente volta para procurar outro item. No novo: o Lanche do Zé passa sozinho.',
      a: async p => { await p.tocar(p.card('Coxinha do Zé + Coca Mini')); await p.tocar(p.opcao('Coxinha de Frango')); esc.a++; await p.tocar(p.opcao('Coca-Cola Mini')); esc.a++; placar(); await p.tocar(p.q('.p-item .add')); await p.tocar(p.q('.barra-sacola'), 1300); p.toast('Faltam ' + brl(ZC.pedido_minimo - 19.99) + ' para o pedido mínimo'); await sleep(900); await p.tocar(p.q('.p-sac .volta')); await p.tocar(p.card('5x Coxinhas 35g')); await p.tocar(p.q('.p-item .add')); esc.a++; placar(); await p.tocar(p.q('.barra-sacola')); await p.tocar(p.q('.p-sac .seguir')); await p.tocar(p.q('.p-rev .fazer')); },
      n: async p => { await p.tocar(p.card('Lanche do Zé', true)); await p.tocar(p.opcao('Coxinha de Frango')); esc.n++; placar(); await p.tocar(p.opcao('12 Mini Churros')); await p.tocar(p.q('.p-item .add')); await p.tocar(p.q('.barra-sacola')); await p.tocar(p.q('.p-sac .seguir')); await p.tocar(p.q('.p-rev .fazer')); } },
  ];
  let rodada = 0, correndo = false;
  $('#rodadas').innerHTML = RODADAS.map((r, i) => `<button data-r="${i}" class="${i ? '' : 'on'}">${r.nome}</button>`).join('');
  $$('#rodadas button').forEach(b => b.onclick = async () => { if (correndo) return; rodada = +b.dataset.r; $$('#rodadas button').forEach(x => x.classList.toggle('on', x === b)); previa = null; prepCorrida(); await calcPrevia(); });
  let previa = null;
  async function calcPrevia() {
    pa.rapido = pn.rapido = true; iniciou = true; esc = { a: 0, n: 0 }; pa.reset(); pn.reset();
    const r = RODADAS[rodada]; await Promise.all([r.a(pa), r.n(pn)]);
    const ta = pa.totais(), tn = pn.totais(); previa = { a: [pa.toques, esc.a, ta.preco, ta.margem], n: [pn.toques, esc.n, tn.preco, tn.margem] };
    pa.rapido = pn.rapido = false; iniciou = false; esc = { a: 0, n: 0 }; pa.reset(); pn.reset(); mostraPrevia();
  }
  function mostraPrevia() {
    if (!previa) return; const f = [String, String, br0, br0], ids = ['toq', 'esc', 'tic', 'mar'];
    ids.forEach((k, i) => { $('#pA-' + k).textContent = f[i](previa.a[i]); $('#pN-' + k).textContent = f[i](previa.n[i]); });
    $('.placar').classList.add('previa');
  }
  function prepCorrida() { esc = { a: 0, n: 0 }; pa.reset(); pn.reset(); $('#corridaTxt').textContent = RODADAS[rodada].txt; gsap.set('#carimbo', { opacity: 0, scale: 0.6 }); gsap.set('.ze-pop', { opacity: 0 }); placar(); }
  function festa() {
    const ta = pa.totais(), tn = pn.totais(), dt = pa.toques - pn.toques;
    $('#carimbo').innerHTML = `${dt > 0 ? dt + ' toques a menos' : 'Mesmos toques'} · ${tn.margem >= ta.margem ? '+' : ''}${br0(tn.margem - ta.margem)} de margem<small>neste pedido, quando o cliente aceita a sugestão</small>`;
    gsap.fromTo('#carimbo', { opacity: 0, scale: 1.8, rotate: -8 }, { opacity: 1, scale: 1, rotate: -2, duration: 0.7, ease: 'back.out(2)' });

    const pl = $('.placar'), cores = ['#F4A734', '#F9C355', '#D84E35', '#fff', '#7fe0a5'];
    for (let k = 0; k < 44; k++) { const c = document.createElement('i'); c.className = 'conf'; c.style.background = cores[k % 5]; c.style.left = '50%'; c.style.top = '40%'; pl.appendChild(c);
      gsap.to(c, { x: (Math.random() - 0.5) * 520, y: (Math.random() - 0.8) * 360, rotate: Math.random() * 720, opacity: 0, duration: 1.4 + Math.random() * 0.8, ease: 'power3.out', onComplete: () => c.remove() }); }
  }
  const foco = q => { $('#ladoA').classList.toggle('foco', q === 'a'); $('#ladoN').classList.toggle('foco', q === 'n'); $('#ladoA').classList.toggle('espera', q === 'n'); $('#ladoN').classList.toggle('espera', q === 'a'); };
  async function correr() {
    if (correndo) return; correndo = true; iniciou = true; prepCorrida(); pa.lento = pn.lento = 1.6;
    const r = RODADAS[rodada];
    foco('a'); $('#btnCorrida').textContent = '… cardápio de hoje'; $('#corridaFase').textContent = 'Primeiro, o cardápio de hoje.';
    await sleep(700); await r.a(pa); pa.dedo.style.opacity = 0;
    foco('n'); $('#btnCorrida').textContent = '… cardápio novo'; $('#corridaFase').textContent = 'Agora, o mesmo pedido no cardápio novo.';
    await sleep(1500); await r.n(pn); pn.dedo.style.opacity = 0;
    foco(null); correndo = false; $('#btnCorrida').textContent = '↻ Rodar de novo'; $('#corridaFase').textContent = `Margem = preço × (1 − ${pct(100 * M.taxa)}) − CMV da Tabela.`; placar(); festa();
  }
  window.__corrida = { correr, set: i => { rodada = i; prepCorrida(); }, get ativo() { return correndo; } };
  $('#btnCorrida').onclick = correr; prepCorrida(); calcPrevia();
  // Card por nome exato (evita pegar "100 Salgadinhos + Coca")
  const cardOrig = Phone.prototype.card;
  Phone.prototype.card = function (txt, exato) { if (!exato) return cardOrig.call(this, txt); return [...this.el.querySelectorAll('.rolavel .card-i, .rolavel .dq')].find(b => b.querySelector('.nm').textContent.trim() === txt); };

  /* ------------------------------------------------ 4 novo + modo gestor */
  const ORIGEM = { 'n-100': '100-salg', 'n-50coca': '50-coca', 'n-lanche': 'coxinha-coca', 'n-20churros': '20-churros', 'n-25coca': '25-coca', 'n-25': '25-salg', 'n-50': '50-salg', 'n-100coca': '100-coca', 'n-festa6': 'festa-6' };
  const tot = mix.linhas.reduce((a, l) => a + l.rec_atual, 0);
  const share = k => { const l = mix.linhas.find(x => x.atual === ZC.atual_itens[k].nome); return l ? { q: l.qtd, rec: 100 * l.rec_atual / tot } : null; };
  const PORQUE = {
    'n-100': `Estrela da marca: ${n0(RD.mix[0].qtd)} caixas em 3 meses nas cozinhas NFB e ${pct(RD.nfb.campeao_share, 0)} da receita. O preço fica. Sai o "50% off de R$ 139,98" e entra uma âncora verdadeira: 4 caixas de 25 custariam R$ 99,96. Entra a Coca 2 L como sugestão por R$ 17,00, o preço exato do combo 100 + Coca, que hoje nem aparece.`,
    'n-50coca': 'Estrela, mantida. Ganha a economia escrita (R$ 9,99, real) e duas sugestões: 12 churros e 5 coxinhas. Aqui não tem "leve 100": ele montaria um 100 + Coca mais barato que o próprio combo.',
    'n-lanche': 'Substitui a Coxinha + Coca Mini de R$ 19,99, que custava R$ 0,01 a mais que separado e ficava abaixo do mínimo. Agora passa o mínimo sozinho, com economia real.',
    'n-tarde': `Hoje é uma oferta escondida por horário, a R$ 29,99 com CMV de 40%. A R$ 32,99 ainda economiza R$ 6,99 e pode vender até ${pct(-ZC.nagle[1].equilibrio, 0)} a menos sem perder margem (Nagle). Trava: se cair mais que isso, volta a R$ 29,99.`,
    'n-tarde-doce': 'O lanche da tarde completo, com churros no lugar do refri: margem maior que a do combo com Coca.',
    'n-20churros': 'Na JP, o mais visitado e o que menos converte. Continua igual no preço, mas o Mix do Zé troca a escolha de sabor por 1 toque.',
    'n-especial': 'Bauru ou empadão com Coca Mini e churros, o combo da Tabela a R$ 29,99 com economia escrita.',
    'n-25coca': 'Hoje R$ 37,99 com economia de R$ 1,99. Novo: R$ 36,99, economia de R$ 2,99. Quem quer mais tem o 50 + Coca 2 L logo acima, mais barato por unidade.',
    'n-25': 'Vira a menor caixa (sai a de 20, que tinha o mesmo preço por unidade e ficava abaixo do mínimo). As duas sugestões viram combo pelo preço exato: + R$ 12,00 vira o 25 + Coca Média, + R$ 25,00 vira a caixa de 50.',
    'n-50': `Estrela, mantida. "Leve 100 por + R$ 20,00" vira a caixa de 100, mas deixa só ${br0(ZC.rank_upsell.find(u => u.id === 'u-50p100').margem)} de margem. Por isso os churros vêm junto, pelo preço exato do combo 50 + 12 churros.`,
    'n-50churros': 'Novo. Trocar a Coca 2 L pelo churros no combo de 50 deixa R$ 2,81 a mais de margem.',
    'n-100coca': `Estrela nas cozinhas NFB (${n0(RD.mix[2].qtd)} vendas em 3 meses), mas custava R$ 0,01 a mais que separado. Fica R$ 3 mais barato, com economia real, e aparece como sugestão no 100.`,
    'n-festa6': 'Vai para R$ 94,99. Com a caixa de 100 a R$ 69,99, montar 100 + Coca + churros saía mais barato que a festa de 75. Agora a festa é o caminho mais barato, e a escada segue: 6, 10, 15 e 25 pessoas, com o preço por pessoa caindo a cada degrau (R$ 15,83, 11,30, 11,27 e 11,20).',
    'n-festa10': 'Na Tabela custava R$ 0,02 a mais que separado (100 + 24 churros + Coca 2 L = R$ 119,97). A R$ 112,99, economiza R$ 6,98: R$ 11,30 por pessoa. No 100 + Coca, os 24 churros sugeridos por R$ 26,00 fecham exatamente esta festa.',
    'n-festa15': 'R$ 168,99: R$ 11,27 por pessoa, abaixo de Festa 10 + 50 com Coca (R$ 172,98). Na Tabela, o de 15 custava o mesmo por pessoa que o de 10.',
    'n-hamb': 'Fase 2, depois do teste. O Hambúrguer Cheddar e Bacon está na Tabela CMV e fora da vitrine. Com 5 coxinhas e Coca Mini, economiza R$ 7,97.',
    'n-frango25': `Fase 2, depois do teste. Hoje o Franguinho só aparece em horário específico; nas cozinhas NFB vendeu ${brlk(RD.mix.filter(l => /^Franguinho/.test(l.nome)).reduce((a, l) => a + l.receita, 0))} em 3 meses. Com 25 salgadinhos, economiza R$ 5,99.`,
    'n-boxcoca': 'Fase 2, depois do teste. A Box Mista (1 kg de franguinho e batata) com Coca 2 L vira opção de festa, com economia de R$ 6,99.',
    'n-festa25': 'R$ 279,99: R$ 11,20 por pessoa, abaixo de Festa 15 + Festa 10, e com margem maior que a da Tabela. Troca os brigadeiros por churros para não criar insumo novo. CMV estimado pela reta da Tabela.',
  };
  function gestor(ev, p) {
    const g = $('#gestor');
    if (ev === 'item' && p.item) {
      const it = p.item, v = p.valorItem(), o = ORIGEM[it.id] && ZC.atual_itens[ORIGEM[it.id]];
      const mo = o ? o.preco * (1 - M.taxa) - o.cmv : null;
      g.innerHTML = `<h4>Modo gestor · item aberto</h4><div class="gt">${it.nome}</div><div class="gl">
        <span>Preço</span><b>${br0(it.preco)}</b><span>CMV (Tabela)</span><b>${br0(it.cmv)} · ${pct(it.cmv_pct)}</b>
        <span>Margem após iFood</span><b class="bom">${br0(it.margem)}</b>
        ${o ? `<span>Hoje: ${o.nome.slice(0, 26)}</span><b>${br0(o.preco)} · margem ${br0(mo)}</b>` : '<span>Hoje</span><b>item novo</b>'}
        ${it.economia ? `<span>Economia para o cliente</span><b class="bom">${br0(it.economia)}</b>` : ''}
        ${it.serve ? `<span>Serve · por pessoa</span><b>${it.serve} · ${br0(it.por_pessoa)}</b>` : ''}
        <span>Passa o pedido mínimo sozinho</span><b class="${it.passa_minimo ? 'bom' : 'ruim'}">${it.passa_minimo ? 'sim' : 'não'}</b>
        <span>Com o que foi marcado</span><b>${br0(v.preco)} · margem ${br0(v.margem)}</b></div>
        ${it.upsell && it.upsell.length ? `<div class="ups">${it.upsell.map(u => `<div><span>+ ${u.nome}</span><span>+${br0(u.preco)} · margem +${br0(u.margem)}</span></div>`).join('')}</div>` : ''}
        <div class="porque">${PORQUE[it.id] || ''}</div>${it.estimado ? '<div class="dica">CMV estimado a partir da reta da Tabela CMV.</div>' : ''}`;
    } else if (ev === 'sacola' || ev === 'sacola-aberta' || ev === 'concluido') {
      const t = p.totais();
      g.innerHTML = `<h4>Modo gestor · sacola</h4><div class="gt">${p.sacola.length} ${p.sacola.length > 1 ? 'itens' : 'item'} · ${br0(t.preco)}</div><div class="gl">
        <span>CMV</span><b>${br0(t.cmv)} · ${pct(100 * t.cmv / t.preco)}</b><span>iFood (${pct(100 * M.taxa)})</span><b>${br0(t.preco * M.taxa)}</b>
        <span>Margem de contribuição</span><b class="bom">${br0(t.margem)}</b><span>Ticket médio hoje (itens, cozinhas NFB)</span><b>${br0(RD.atual.ticket)}</b>
        <span>Margem média por pedido hoje</span><b>${br0(RD.atual.margem_pedido)}</b></div>
        <div class="porque">${ev === 'concluido' ? 'Pedido feito. No novo, a caixa leva a Raspadinha do Zé: o motivo para o segundo pedido.' : 'Na sacola, o "Peça também" só sugere o que ainda não está no pedido.'}</div>`;
    } else if (ev === 'reset' || ev === 'fechou' || !ev) {
      g.innerHTML = `<h4>Modo gestor</h4><div class="gt">Abra qualquer item no celular.</div><p style="opacity:.8;line-height:1.5;font-size:14px">Aqui aparecem o CMV da Tabela, a margem depois do iFood, o que era antes e por que o item mudou.</p>
        <div class="gl" style="margin-top:14px"><span>Categorias</span><b>${ZC.contagem.cats_atual}+4 → ${ZC.contagem.cats_novo}</b><span>Posições no cardápio</span><b>${ZC.contagem.posicoes_atual} → ${ZC.contagem.itens_novo}</b><span>Itens abaixo do mínimo</span><b>${ZC.abaixo_minimo.length} → 0 de entrada</b><span>Combos com economia falsa</span><b>3 → 0</b></div>`;
    }
  }
  const pNovo = new Phone($('#celNovo'), 'novo', { onEvent: ev => gestor(ev, pNovo) });
  gestor();
  $('#estrutura').innerHTML = ZC.novo_cats.map((c, i) => `<div class="cat rev" data-c="${c.id}"><span class="n">${i + 1}</span><div><b>${c.nome}</b><span>${c.sub || ''}${c.horario ? ' · aparece todo dia, 14h às 18h' : ''}</span></div></div>`).join('') +
    `<p class="antes">Hoje: ${ZC.contagem.cats_atual} categorias, mais 4 por dia ou horário, e o campeão em 4 delas.</p>`;
  $$('#estrutura .cat').forEach(el => el.onclick = () => { const b = pNovo.el.querySelector(`.cats button[data-c="${el.dataset.c}"]`); if (b) b.click(); });

  /* ------------------------------------------------ 5 ticket que vira margem */
  const UNI = ZC.rank_upsell.filter(u => { const m = ZC.rank_upsell.filter(x => x.nome === u.nome); return (m.find(x => !x.nota) || m[0]) === u; });
  const SPL = UNI.filter(u => /Leve 50|24 Mini|Coca-Cola 2|12 Mini|Leve 100/.test(u.nome)).sort((a, b) => b.margem - a.margem);
  $('#split').innerHTML = SPL.map(u => { const fi = u.preco * M.taxa, mg = u.margem, wI = 100 * fi / u.preco, wC = 100 * u.cmv / u.preco, wF = 100 * mg / u.preco;
    return `<div class="sp rev"><div class="sp-t"><b>${u.nome}</b><span>+${br0(u.preco)} no ticket</span></div>
      <div class="sp-bar"><i class="if" style="width:${wI}%"><em>${br0(fi)}</em></i><i class="cu" style="width:${wC}%"><em>${br0(u.cmv)}</em></i><i class="fi" style="width:${wF}%"><em>${br0(mg)}</em></i></div>
      <div class="sp-f">fica <b>${br0(mg)}</b> <small>${pct(wF, 0)}</small></div></div>`; }).join('');
  const MI = RD.margem_itens, mxO = MI[0].pct;
  $('#orig').innerHTML = MI.map(m => `<div class="og rev"><span>${m.nome.replace(' 50% off', '').replace('Coca-Cola Grande', 'Coca')}</span><div class="og-b"><i data-w="${100 * m.pct / mxO}"></i></div><b>${pct(m.pct, 0)}</b></div>`).join('');
  $('#origFonte').textContent = `% da margem após iFood e custo, nas vendas da marca no iFood (BI › Explorador, cozinhas NFB, jul a set). As caixas de 100 e de 50 fazem ${pct(MI[0].pct + MI[1].pct, 0)} da margem: por isso abrem o cardápio, e cada uma sugere o que mais deixa dinheiro.`;

  /* ------------------------------------------------ 7 comparativo + simulador */
  const C = RD.cenarios, A = RD.atual;
  function calc(s) {
    const L = MR.pedidos * MR.k_peq;
    const dr = Math.max(0, s.anexo * MR.up_preco - MR.up_atual), dc = Math.max(0, s.anexo * MR.up_cmv - MR.up_atual * 0.35);
    const rec = MR.rec_ped_novo2 + dr, cmv = MR.cmv_ped_novo2 + dc, mp = rec * (1 - MR.taxa) - cmv;
    const ped = (MR.pedidos - L) * (s.item_carr / MR.r_carr) * (s.chk_ped / MR.r_ped), extra = MR.novos * s.recompra;
    const recL = extra * (mp - MR.custo_premio) - (s.recompra > 0 ? ped * MR.custo_cartao : 0);
    const total = ped * mp + recL, hoje = MR.margem_total_atual;
    const r2 = v => Math.round(v * 100) / 100, ganho = r2(total - hoje);
    const pC = r2(MR.pedidos * (MR.marg_ped_mix - MR.marg_ped_atual)), pP = r2(-L * MR.m_up_peq), pS = r2((MR.pedidos - L) * (dr * (1 - MR.taxa) - dc)), pR = r2(recL);
    const ponte = [['Cardápio novo', 'preços, combos e mix, com os pedidos de hoje', pC], ['Saem as caixas de 10 e 20', `1 em 5 desiste: ${n0(L)} pedidos por mês a menos`, pP], ['Sugestões aceitas', 'upsell dentro do item', pS],
      ['Conversão', 'pedidos a mais na tela do item, já com a margem nova', r2(ganho - pC - pP - pS - pR)], ['Raspadinha', s.recompra > 0 ? `fase 2: voltas menos prêmio e ${br0(ped * MR.custo_cartao)} de cartões` : `fase 2, fora desta conta; ligada, custa ${br0(ped * MR.custo_cartao)} por mês em cartões`, pR]];
    const mes = { hoje, sugestoes: hoje + pC + pP + pS, conversao: total };
    return { conversao: 100 * ped / MR.visitas, pedidos: ped, ticket: rec, cmv_pct: 100 * cmv / rec, margem_pedido: mp, margem_visita: ped * mp / MR.visitas, total, extra, ponte, mes, ganho };
  }
  const SL = [
    { k: 'item_carr', r: 'Item → sacola', min: 38, max: 60, f: 100, s: `Rede hoje ${pct(100 * MR.r_carr)}, igual há 3 meses. Conservador: +${pct(RD.jp.lift_cons_pct)}, o salto que a JP precisa para igualar a concorrência.` },
    { k: 'chk_ped', r: 'Checkout → pedido', min: 30, max: 50, f: 100, s: `Rede hoje ${pct(100 * MR.r_ped)}. O conservador não mexe nesta etapa.` },
    { k: 'anexo', r: 'Pedidos com sugestão aceita', min: 10, max: 40, f: 100, s: `Hoje ${pct(ZC.upsell_atual.anexo_pct)} na JP (o BI não traz os complementos).` },
    { k: 'recompra', r: 'Clientes novos que voltam (raspadinha, fase 2)', min: 0, max: 10, f: 100, s: `${n0(MR.novos)} clientes novos por mês. Ligar custa cerca de ${br0(C[0].pedidos * MR.custo_cartao)} por mês em cartões antes da primeira volta; cada volta conta como pedido iFood, menos o prêmio.` },
  ];
  const CT = [{ nome: 'Piso: sem conversão', premissas: Object.assign({}, C[0].premissas, { item_carr: MR.r_carr }) }, { nome: 'Conservador: igualar a concorrência', premissas: C[0].premissas }, C[1], C[2]];
  let est = Object.assign({}, C[0].premissas);
  $('#sliders').innerHTML = SL.map(s => `<div class="sl"><label>${s.r}<b id="v-${s.k}"></b></label><small>${s.s}</small><input type="range" id="s-${s.k}" min="${s.min}" max="${s.max}" step="0.1"></div>`).join('') + '<p class="fonte">Arraste para testar as premissas. A fórmula é a mesma do tools/calc.py.</p>';
  function pintar() {
    SL.forEach(s => { $('#s-' + s.k).value = (est[s.k] * s.f).toFixed(1); $('#v-' + s.k).textContent = pct(est[s.k] * s.f); });
    const r = calc(est), d = (a, b) => (b >= a ? '+' : '') + pct(100 * (b - a) / a);
    const cA = 100 * MR.pedidos / MR.visitas;
    const cards = [['Conversão', pct(A.conversao), pct(r.conversao), d(cA, r.conversao)], ['Ticket (itens)', br0(A.ticket), br0(r.ticket), d(A.ticket, r.ticket)],
      ['CMV do pedido', pct(A.cmv_pct), pct(r.cmv_pct), (r.cmv_pct >= A.cmv_pct ? '+' : '') + (r.cmv_pct - A.cmv_pct).toFixed(1).replace('.', ',') + ' p.p.'],
      ['Margem por pedido', br0(A.margem_pedido), br0(r.margem_pedido), d(A.margem_pedido, r.margem_pedido)], ['Margem por visita', br0(A.margem_visita), br0(r.margem_visita), d(A.margem_visita, r.margem_visita)]];
    $('#compTop').innerHTML = cards.map(c => `<div class="ck4${c[0] === 'CMV do pedido' ? ' cmv' : ''}"><span>${c[0]}</span><div class="ab"><s>${c[1]}</s><b>${c[2]}</b></div><span class="dl">${c[3]}</span></div>`).join('');
    let lo = 0, hi = 0, cum = 0;
    r.ponte.forEach(p => { cum += p[2]; lo = Math.min(lo, cum); hi = Math.max(hi, cum); });
    const pad = (hi - lo) * 0.04, X = v => 100 * (v - lo + pad) / (hi - lo + 2 * pad); let acc = 0;
    const SC = RD.sem_conv;
    $('#ponte').innerHTML = `<h3>Ponte de margem por mês nas 28 lojas: de onde vem cada real</h3>` +
      `<div class="pt-l tot"><span>Hoje<small>${n0(A.pedidos)} pedidos por mês, mix real</small></span><div class="bx zero"><span class="z" style="left:${X(0)}%"></span></div><b>${br0(A.margem_total)}</b></div>` +
      r.ponte.map(([n, s, v]) => { const a0 = acc; acc += v; return `<div class="pt-l ${v < 0 ? 'neg' : ''}"><span>${n}<small>${s}</small></span><div class="bx"><span class="z" style="left:${X(0)}%"></span>${v ? `<i class="pb" style="left:${X(Math.min(a0, acc))}%;width:${Math.max(0.4, X(Math.max(a0, acc)) - X(Math.min(a0, acc)))}%"></i>` : ''}</div><b>${v >= 0 ? '+' : ''}${br0(v)}</b></div>`; }).join('') +
      `<div class="pt-l tot fim"><span>Com o cardápio novo<small>${r.ganho >= 0 ? '+' : ''}${br0(r.ganho)} por mês, ${pct(100 * (r.total / A.margem_total - 1))} sobre hoje</small></span><div class="bx"><span class="z" style="left:${X(0)}%"></span><i class="pb" style="left:${X(Math.min(0, r.ganho))}%;width:${Math.abs(X(r.ganho) - X(0))}%"></i></div><b>${br0(r.total)}</b></div>` +
      `<p class="fonte" style="margin-top:6px">As barras mostram só a variação sobre hoje, todas na mesma escala, de ${br0(lo)} a +${br0(hi)}. A linha fina é o zero.</p>` +
      `<div class="sens">E se a conversão dentro do item não mudar nada? Fica <b>${sg(SC.ganho)}</b> por mês: a proposta empata. Preços e sugestões só pagam a saída das caixas de 10 e 20 e os combos mais baratos. O empate fica em ${pct(SC.equilibrio_item_carr)} de item→sacola, e a rede oscilou entre ${pct(Math.min(...MES.map(m => m.item_carr)))} e ${pct(Math.max(...MES.map(m => m.item_carr)))} em 3 meses: sem ganho na tela do item, o resultado fica dentro do ruído. Por isso o teste mede essa tela primeiro e tem trava de volta.</div>`;

    $('#compFonte').innerHTML = `<b>O conservador</b> sobe o item→sacola da rede de ${pct(100 * MR.r_carr)} para ${pct(100 * C[0].premissas.item_carr)} (+${pct(RD.jp.lift_cons_pct)}, o mesmo salto que separa a JP da concorrência no Portal) e a sugestão aceita de 12% para 15%. Não mexe no checkout e não conta a raspadinha. Já desconta 1 em 5 clientes das caixas de 10 e 20 desistindo. Volume: marca ZC nas ${MR.lojas} franquias, média de agosto e setembro (${n0(A.visitas)} visitas e ${n0(A.pedidos)} pedidos por mês; conversão de ${pct(A.conversao)}, contra ${pct(RP.conversao)} somando todas as marcas da loja no funil). Ticket, CMV e mix: ${n0(RD.nfb.total.itens)} itens da marca ZC vendidos nas cozinhas NFB de julho a setembro (${brlk(RD.nfb.total.receita)}), refeitos no cardápio novo com o CMV da Tabela. O ticket de itens (${br0(A.ticket)}) fica abaixo do GMV por pedido das franquias (${br0(A.ticket_gmv)}, que inclui entrega): a margem fica do lado conservador. Comissão do contrato: ${pct(100 * M.taxa)}, já com o pagamento online. Com 26,2% (plano Entrega), a margem por visita iria de ${br0(RD.sens.atual)} para ${br0(RD.sens.cenarios[0])} no conservador: a conclusão não muda.`;
  }
  SL.forEach(s => $('#s-' + s.k).oninput = e => { est[s.k] = +e.target.value / s.f; $$('#cenTabs button').forEach(b => b.classList.remove('on')); pintar(); });
  $('#cenTabs').innerHTML = CT.map((c, i) => `<button data-c="${i}" class="${i === 1 ? 'on' : ''}">${c.nome}</button>`).join('');
  $$('#cenTabs button').forEach(b => b.onclick = () => { est = Object.assign({}, CT[+b.dataset.c].premissas); $$('#cenTabs button').forEach(x => x.classList.toggle('on', x === b)); pintar(); });
  pintar();
  const stt = {}; ZC.tabela.forEach(t => stt[t.status] = (stt[t.status] || 0) + 1);
  const pares = ZC.tabela.filter(t => t.margem != null && t.novo_margem != null), sobe = pares.filter(t => Math.round(t.novo_margem * 100) > Math.round(t.margem * 100)).length, cai = pares.filter(t => Math.round(t.novo_margem * 100) < Math.round(t.margem * 100)).length;
  if (document.querySelector('#cenTabs')) $('#cenTabs').insertAdjacentHTML('beforebegin', `<div class="faixa-tab"><b>Contra a Tabela CMV da Anani</b><span>Ponderado pelas vendas da marca, os preços e combos novos somam ${sg(RD.ponte[0].cardapio)} por mês. ${ZC.tabela.length} linhas: ${(stt['Mantido'] || 0) + (stt['Sem mudança'] || 0)} ficam, ${stt['Reprecificado'] || 0} mudam de preço, ${stt['Substituído'] || 0} são substituídas, ${stt['Removido'] || 0} saem, ${(stt['Vira opção'] || 0) + (stt['Vira sugestão'] || 0)} viram opção ou sugestão e 1 troca a âncora. Nos ${pares.length} itens com par, a margem sobe em ${sobe} e cai em ${cai}, de propósito: são os itens em que o preço caiu para a economia ser real, quase todos festas de baixo volume. Item a item no fim desta tela.</span></div>`);
  const LJ = RD.lojas.slice().sort((a, b) => b.ganho_cons - a.ganho_cons), mxL = LJ[0].ganho_cons, cvs = RD.lojas.map(l => l.conversao);
  $('#lojas').innerHTML = LJ.map(l => `<div class="lj"><span class="nm">${l.loja}${l.marcas > 1 ? ` <small>${l.marcas} marcas</small>` : ''}<small class="cv">${n0(l.pedidos_zc)} pedidos ZC em set · conversão da loja ${pct(l.conversao)}</small></span><div class="tr"><i data-w="${100 * l.ganho_cons / mxL}"></i></div><b>+${br0(l.ganho_cons)}</b></div>`).join('');
  $('#lojasFonte').textContent = `Rateio do ganho conservador da rede (+${br0(C[0].ganho)} por mês) pelos pedidos da marca ZC de setembro em cada loja. Nas 3 lojas com 2 marcas, os ${n0(RD.outras_marcas_set)} pedidos das outras marcas saem na proporção (estimado: o BI não abre a marca dentro da loja). Fonte: BI Tastefy Insights › Conversão › Por loja.`;
  // tabela item a item
  const linhas = ZC.novo_itens.map(n => { const o = ORIGEM[n.id] && ZC.atual_itens[ORIGEM[n.id]]; return { n, o, mo: o ? o.preco * (1 - M.taxa) - o.cmv : null, eo: o && o.partes ? o.partes.reduce((a, b) => a + b, 0) - o.preco : null }; });
  const tabVitrine = `<tr><th>Item novo</th><th>Vitrine JP</th><th>Novo</th><th>CMV novo</th><th>Margem hoje</th><th>Margem nova</th><th>Economia ao cliente</th></tr>` +
    ZC.novo_cats.map(c => `<tr class="grupo"><td colspan="7">${c.nome}</td></tr>` + linhas.filter(l => l.n.cat === c.id).map(l => `<tr><td class="nome-i" data-l="Item novo">${l.n.nome}${l.n.estimado ? ' *' : ''}</td><td data-l="Vitrine JP">${l.o ? br0(l.o.preco) : 'novo'}</td><td data-l="Novo">${br0(l.n.preco)}</td><td data-l="CMV novo">${pct(l.n.cmv_pct)}</td><td data-l="Margem hoje">${l.mo != null ? br0(l.mo) : '·'}</td><td data-l="Margem nova" class="${l.mo == null ? 'pos' : Math.round(l.n.margem * 100) > Math.round(l.mo * 100) ? 'pos' : Math.round(l.n.margem * 100) < Math.round(l.mo * 100) ? 'neg' : ''}">${br0(l.n.margem)}</td><td data-l="Economia ao cliente" class="${l.n.economia > 0 ? 'pos' : ''}">${l.eo != null ? (l.eo <= 0 ? `<span style="color:var(--vermelho)">${br0(l.eo)}</span> → ` : br0(l.eo) + ' → ') : ''}${l.n.economia ? br0(l.n.economia) : '·'}</td></tr>`).join('')).join('') +
    `<tr><td colspan="7" class="nome-i" style="text-align:left;font-size:11.5px;color:#6a4a4f">* CMV estimado pela reta da Tabela CMV. Margem = preço × (1 − ${pct(100 * M.taxa)}) − CMV. "Vitrine JP" = preço na loja em 30/09 com o CMV da Tabela.</td></tr>`;
  const COR = { 'Reancorado': '#b25b00', 'Mantido': '#1F8A4C', 'Reprecificado': '#b25b00', 'Substituído': '#93172D', 'Removido': '#AB2D2D', 'Vira opção': '#65605F', 'Vira sugestão': '#65605F', 'Sem mudança': '#9b8f86', 'Vira combo': '#0f7a6a' };
  let gAnt = '';
  const tabTabela = `<tr><th>Tabela CMV (Anani)</th><th>Preço</th><th>CMV</th><th>Margem</th><th>Decisão</th><th>No cardápio novo</th><th>Margem nova</th></tr>` +
    ZC.tabela.map(t => { const vazio = ZC.tabela.filter(x => x.grupo === t.grupo).every(x => x.status === 'Mantido' || x.status === 'Sem mudança') ? 1 : 0;
      const g = t.grupo !== gAnt ? `<tr class="grupo" data-vazio="${vazio}"><td colspan="7">${t.grupo}</td></tr>` : ''; gAnt = t.grupo;
      return g + `<tr data-fixo="${t.status === 'Mantido' || t.status === 'Sem mudança' ? 1 : 0}"><td class="nome-i" data-l="Tabela CMV">${t.nome}</td><td data-l="Preço">${br0(t.preco)}</td><td data-l="CMV">${t.cmv_pct != null ? pct(t.cmv_pct) : `${pct(t.cmv_est_pct)}*`}</td><td data-l="Margem">${t.margem != null ? br0(t.margem) : `${br0(t.margem_est)}*`}</td>
      <td data-l="Decisão"><b style="color:${COR[t.status]}">${t.status}</b></td><td class="nome-i" data-l="No cardápio novo" style="text-align:left">${t.novo ? `${t.novo} · ${br0(t.novo_preco)}` : ''}<small style="display:block;color:#6a4a4f;font-size:11.5px;line-height:1.35">${t.nota}</small></td>
      <td data-l="Margem nova" class="${t.novo_margem != null && t.margem != null ? (Math.round(t.novo_margem * 100) > Math.round(t.margem * 100) ? 'pos' : Math.round(t.novo_margem * 100) < Math.round(t.margem * 100) ? 'neg' : '') : ''}">${t.novo_margem != null ? br0(t.novo_margem) : '·'}</td></tr>`; }).join('') +
    `<tr><td colspan="7" class="nome-i" style="text-align:left;font-size:11.5px;color:#6a4a4f">* Sem CMV na Tabela (aparece 0%): estimado como coxinha + Coca Mini, com o CMV da própria Tabela. Margem = preço × (1 − ${pct(100 * M.taxa)}) − CMV da Tabela. Onde a margem nova é menor, o preço caiu para dar economia real ao cliente (ex.: 100 + Coca, que precisa vender 7,1% a mais para empatar). A vitrine da JP diverge da Tabela em ${ZC.diverge.length} itens: ${ZC.diverge.map(d => d.tabela + ' → ' + d.jp).join('; ')}.</td></tr>`;
  const MXR = RD.mix.filter(l => l.qtd >= 40 && !/^Demais/.test(l.nome));
  const tabRede = `<tr><th>Produto na rede (jul a set)</th><th>Vendas</th><th>Receita</th><th>Preço médio</th><th>Margem/un hoje</th><th>No cardápio novo</th><th>Margem/un nova</th></tr>` +
    MXR.map(l => { const dm = Math.round(l.margem_un_novo * 100) - Math.round(l.margem_un * 100);
      return `<tr><td class="nome-i" data-l="Produto">${l.nome}</td><td data-l="Vendas">${n0(l.qtd)}</td><td data-l="Receita">${br0(l.receita)}</td><td data-l="Preço médio">${br0(l.preco_medio)}</td><td data-l="Margem/un hoje">${br0(l.margem_un)}${l.cmv_conhecido ? '' : '*'}</td>
      <td class="nome-i" data-l="No cardápio novo" style="text-align:left">${l.novo ? l.novo + (l.sai ? '<small style="display:block;color:#6a4a4f;font-size:11.5px">sai a caixa pequena; 1 em 5 desiste</small>' : '') : '<span style="color:#9b8f86">fica igual</span>'}</td>
      <td data-l="Margem/un nova" class="${dm > 0 ? 'pos' : dm < 0 ? 'neg' : ''}">${br0(l.margem_un_novo)}</td></tr>`; }).join('') +
    `<tr><td colspan="7" class="nome-i" style="text-align:left;font-size:11.5px;color:#6a4a4f">Marca ZC nas cozinhas NFB, julho a setembro de 2026: ${n0(RD.nfb.total.itens)} itens, ${n0(RD.nfb.total.pedidos)} pedidos, ${br0(RD.nfb.total.receita)} (BI Tastefy Insights › Explorador). Itens com 40 vendas ou mais. Margem por unidade no preço médio praticado, com o CMV da Tabela; complementos pagos com CMV de 35%. Preço novo = preço médio da loja + a mudança da proposta. * Sem CMV na Tabela: 35% do preço.</td></tr>`;
  const nMuda = ZC.tabela.filter(t => t.status !== 'Mantido' && t.status !== 'Sem mudança').length;
  $('#tabTabs').innerHTML = `<button class="on" data-t="0">Tabela CMV (anterior) × novo</button><button data-t="1">Vendas da rede por item × novo</button><button data-t="2">Vitrine da JP hoje × novo</button><button data-f="1" class="on" style="margin-left:auto">Só o que muda (${nMuda} de ${ZC.tabela.length})</button>`;
  const tabs = [tabTabela, tabRede, tabVitrine];
  $('#tabela').innerHTML = tabs[0]; $('.tabela').classList.add('so-muda');
  $$('#tabTabs button[data-t]').forEach(b => b.onclick = () => { $('#tabela').innerHTML = tabs[+b.dataset.t]; $$('#tabTabs button[data-t]').forEach(x => x.classList.toggle('on', x === b)); calcStops(); });
  $('#tabTabs button[data-f]').onclick = e => { const on = $('.tabela').classList.toggle('so-muda'); e.target.classList.toggle('on', on); e.target.textContent = on ? `Só o que muda (${nMuda} de ${ZC.tabela.length})` : 'Mostrando todos os itens'; calcStops(); };

  $('#playV').onclick = () => { const v = $('#vid'); v.controls = true; v.play(); $('#playV').style.display = 'none'; };
  $('#vid').addEventListener('play', () => { $('#playV').style.display = 'none'; $('#vid').controls = true; });

  /* ------------------------------------------------ 8 raspadinha */
  const RS = ZC.raspadinha;
  const RR = RD.raspadinha;
  $('#contasRasp').innerHTML = [[br0(RS.custo_cartao), 'por cartão impresso (R$ 265 + frete a cada 1.000)'], [n0(Math.ceil(RR.equilibrio_ifood)) + ' em 100', 'clientes voltando, mesmo pelo iFood e já pagando o prêmio, cobrem o custo dos cartões'], [br0(C[0].pedidos * MR.custo_cartao), `por mês em cartões, no volume do conservador (${n0(C[0].pedidos)} pedidos)`]]
    .map(c => `<div class="conta"><b>${c[0]}</b><span>${c[1]}</span></div>`).join('');
  (function raspa() {
    const cv = $('#raspa'), ctx = cv.getContext('2d'); let pronto = false;
    function pinta() { const r = cv.getBoundingClientRect(); if (!r.width) return; cv.width = r.width * 2; cv.height = r.height * 2; ctx.fillStyle = '#b9b4b1'; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#65605f'; ctx.font = '700 26px Inter'; ctx.textAlign = 'center'; ctx.fillText('RASPE AQUI', cv.width / 2, cv.height / 2 + 9); ctx.globalCompositeOperation = 'destination-out'; pronto = true; }
    let down = false; const risca = e => { if (!down || !pronto) return; const r = cv.getBoundingClientRect(), p = e.touches ? e.touches[0] : e; ctx.beginPath(); ctx.arc((p.clientX - r.left) * 2, (p.clientY - r.top) * 2, 28, 0, 7); ctx.fill(); };
    cv.addEventListener('pointerdown', e => { down = true; risca(e); }); addEventListener('pointerup', () => down = false); cv.addEventListener('pointermove', risca);
    window.__raspaPinta = pinta; setTimeout(pinta, 300);
  })();

  /* ------------------------------------------------ 7 mais opções */
  $('#novas').innerHTML = RD.novas.map((o, i) => `<div class="nv rev"><span class="nn">${i + 1}</span><span class="tp ${o.tipo === 'Produto novo' ? 'p' : o.tipo === 'Teste' ? 't' : 'a'}">${o.tipo}</span><h3>${o.titulo}</h3>${o.preco ? `<div class="pm"><b>${br0(o.preco)}</b><span>margem ${br0(o.margem)}</span></div>` : ''}<p>${o.dado}</p></div>`).join('');
  $('#novasFonte').textContent = 'Os 3 produtos novos entram na fase 2, depois do teste, para não misturar os efeitos. Ficam fora da conta do conservador. Vendas: BI › Explorador, marca Zé Coxinha nas cozinhas NFB, julho a setembro.';

  /* ------------------------------------------------ anexo: mundo */
  const BENCH = [
    { mk: 'Chick-fil-A · catering', h: 'Cada bandeja diz quantos alimenta', p: 'Nuggets: 64 servem 8, 120 servem 15, 200 servem 25. A conta de "quantos pedir" já vem feita.', zc: 'Festas de 6, 10, 15 e 25 pessoas com "serve X" e preço por pessoa caindo a cada degrau.', a: 'chick-fil-a.com/customer-support/ordering-and-payment/catering-orders' },
    { mk: 'Tim Hortons · Timbits e Dunkin\' · Munchkins', h: 'Três tamanhos por contagem, preço por unidade caindo', p: 'Timbits em 10, 20 e 50 (de £0,57 para £0,40 cada no Reino Unido). Munchkins em 10, 25 e 50.', zc: 'Escada 25, 50 e 100 com "R$ 1,00 cada" e "R$ 0,70 cada" na descrição. Saem 10 e 20, tamanhos vizinhos.', a: 'deliveroo.co.uk (Tim Hortons UK) · ezcater.com (Dunkin\')' },
    { mk: 'Wingstop', h: 'Mais sabores nas caixas maiores', p: 'No Party Pack de 50 peças, o cliente escolhe até 4 sabores. Vendas digitais: 73,2% do sistema no ano fiscal de 2025.', zc: 'Sabores crescem com a caixa: até 3 na de 25, 4 na de 50 e 5 na de 100.', a: 'wingstop.com/menu/group-packs · SEC 10-K' },
    { mk: 'Raising Cane\'s', h: 'Menu enxuto, adicionais claros', p: 'Um produto, poucos combos. Para festa, bandejas de 25 a 300 tiras com "serve", e bebida e acompanhamento por pessoa.', zc: '7 categorias sem duplicados. A caixa é a base, e Coca e churros entram como sugestão.', a: 'zerocater.com/blog/raising-canes-catering-guide' },
    { mk: 'McDonald\'s e Starbucks · rewards', h: 'O segundo pedido é desenhado', p: 'US$ 30 bilhões em vendas de membros do MyMcDonald\'s Rewards em 2024. Starbucks: estrelas e desafios no app.', zc: 'Raspadinha do Zé na caixa, Fidelidade do iFood com meta de 3 pedidos e resgate que leva ao app próprio.', a: 'restaurantdive.com · doctorofcredit.com' },
    { mk: 'Crumbl', h: 'Sabor da vez, com prazo', p: 'Desde jan/2026: 6 sabores fixos e 4 que mudam toda semana. A novidade vira motivo de visita.', zc: 'Os lançamentos saem das caixas de 100 que não vendem e entram como "Sabor da vez" dentro do Mix, com rodízio mensal.', a: 'nbcnewyork.com (Crumbl menu changes)' },
  ];
  $('#bench').innerHTML = BENCH.map(b => `<div class="bc rev"><span class="mk">${b.mk}</span><h3>${b.h}</h3><p>${b.p}</p><div class="zc"><b>No Zé:</b> ${b.zc}</div><a>${b.a}</a></div>`).join('');

  /* ------------------------------------------------ 10 prova */
  const RT = RD.teste, dias = k => RT.lojas.find(l => l.lojas === k).dias, semanas = Math.ceil(dias(14) / 7);
  $('#t3').innerHTML = [
    `<div class="tc rev"><h3>A métrica que decide</h3><div class="big">${br0(A.margem_visita)}</div><p style="margin:8px 0 12px;font-size:14.5px;line-height:1.45">de margem por visita hoje na rede: conversão, ticket e margem num número só.</p><ul><li>Adota se subir e nenhuma trava estourar</li><li>Volta se cair com 95% de confiança</li><li>Meta: ${br0(C[0].margem_visita)} (+${pct(100 * RT.efeito_rel)})</li></ul></div>`,
    `<div class="tc rev"><h3>As travas</h3><ul><li>Nota da loja não cai mais de 0,1</li><li>Cancelamento e atraso não sobem</li><li>CMV do pedido abaixo de 36% (hoje ${pct(A.cmv_pct)})</li><li>Trava estourou por 7 dias: volta o cardápio antigo</li></ul></div>`,
    `<div class="tc rev"><h3>O desenho</h3><ul><li>14 lojas com o novo, 14 sem, pareadas por volume</li><li>2 semanas de A/A, depois ${semanas} semanas de teste</li><li>${dias(14)} dias é o piso com 14 lojas; numa loja só, mais de um ano</li><li>Conversão e GMV do BI; CMV pela Tabela, no mix de cada loja</li></ul></div>`,
  ].join('');

  /* ------------------------------------------------ 11 riscos */
  const NG = ZC.nagle;
  const convBar = calc(C[0].premissas).ponte[3][2];
  const NF = [NG[0].equilibrio].concat(ZC.nagle_festas.map(f => f.equilibrio)), qFestas = RD.mix.filter(l => /^Combo para/.test(l.nome)).reduce((a, l) => a + l.qtd, 0);
  const RISCOS = [
    ['Uma premissa carrega o ganho', `Todo o ganho do conservador depende da tela do item (${pct(100 * MR.r_carr)} → ${pct(100 * C[0].premissas.item_carr)}). Sem isso, fica ${sg(RD.sem_conv.ganho)} por mês: empata. É a primeira coisa que o teste mede.`],
    ['Tirar o "50% off" do campeão', `Ele é ${pct(RD.nfb.campeao_share, 0)} da receita. A âncora nova é verdadeira (4 caixas de 25 = R$ 99,96). <b>Volta</b> se a conversão do item cair 5 pontos em 2 semanas.`],
    ['Sem as caixas de 10 e 20', `São ${pct(RD.perda_peq.share)} dos pedidos. A conta já desconta 1 em 5 desistindo (${br0(-RD.perda_peq.margem)} por mês). <b>Volta</b> a caixa de 20 se cair mais que isso.`],
    ['Preços que caem e sobem', `O 100 + Coca e as festas caem para a economia ser real e precisam vender de ${pct(Math.min(...NF))} a ${pct(Math.max(...NF))} a mais para empatar. O café da tarde sobe de R$ 29,99 para R$ 32,99, na faixa forte: pode vender até ${pct(-NG[1].equilibrio)} a menos e empatar. <b>Volta</b> se cair mais.`],
    ['Duas bases de dados', 'Funil, volume e horário vêm das franquias; mix e ticket, das cozinhas NFB, que vendem o mesmo cardápio base. Cada base só é comparada com ela mesma.'],
    ['E se a comissão subir?', `A conta usa os ${pct(100 * M.taxa)} do contrato. Mesmo com 26,2% (plano Entrega), a margem por visita iria de ${br0(RD.sens.atual)} para ${br0(RD.sens.cenarios[0])}. A conclusão não muda.`],
  ];
  $('#listaRiscos').innerHTML = RISCOS.map(r => `<div class="rc rev"><h4>${r[0]}</h4><p>${r[1]}</p></div>`).join('');

  /* ------------------------------------------------ 12 implantação e fontes */
  const ROT = [['0-5 min', 'Criar as 7 categorias. "Lanche da tarde" todo dia, das 14h às 18h.'],
    ['5-12 min', 'Colar nome, texto, preço e "serve" dos itens que ficam.'],
    ['12-20 min', 'Criar os itens novos: Lanche do Zé, Tarde doce e salgada, 50 + churros e as festas.'],
    ['20-26 min', 'Complementos: "Sabores" com o Mix do Zé e "Completa o pedido".'],
    ['26-30 min', 'Pausar (sem excluir) lançamentos em caixa de 100, 10 e 20 e duplicados.'],
    ['Dia 1', 'Marcar o início do teste e exportar o Desempenho.']];
  $('#roteiro').innerHTML = ROT.map(r => `<div class="rt rev"><b>${r[0]}</b><p>${r[1]}</p></div>`).join('');
  const top4 = ZC.sabores.slice(0, 4).map(s => s[0]), parte = n => { const b = Math.floor(n / 4), r = n % 4; return top4.map((s, i) => `${b + (i < r ? 1 : 0)} ${s.toLowerCase()}`).join(', '); };
  $('#ficha').innerHTML = [25, 50, 100].map(n => `<div><b>Caixa de ${n}</b>${parte(n)}</div>`).join('');
  $('#fontes').innerHTML = ['BI Tastefy Insights (Lovable, projeto do Thiago): Conversão (funil das franquias ZC por mês, marca e loja), Performance › Horário (marca Zé Coxinha, iFood, 26/02 a 30/09/2026) e Explorador (produtos e clientes da marca ZC nas cozinhas NFB), lidos em 01/10/2026, só leitura.', 'Portal do Parceiro iFood, Zé Coxinha Jardim da Penha (loja-caso): Desempenho (Vendas, Cardápio, Clientes) e vitrine, lidos em 30/09/2026, últimos 30 dias.', 'Tabela CMV Zé Coxinha iFood (Anani).', 'iFood: planos e comissões (parceiros.ifood.com.br/restaurante/planos), Mais vendidos, disponibilidade por horário, Fidelidade, Cupom Flexível (blog-parceiros.ifood.com.br).', 'Termos e condições iFood, cláusulas 3.3 e 4.4.', 'Lei 5.768/1971 e Portaria SEAE/ME 7.638/2022 (gov.br).',
    'Traster, Foundations of Menu Planning, cap. 7 e 11.', 'Nagle, Müller e Gruyaert, The Strategy and Tactics of Pricing, cap. 4 e 9.', 'Harhut, Using Behavioral Science in Marketing, cap. 5 e 11.', 'Barden, Decoded, cap. 2 e 5.', 'Sandland e Orsbourn, Delivering the Digital Restaurant, cap. 13.', 'Kohavi, Tang e Xu, Trustworthy Online Controlled Experiments, cap. 7 e 17.', 'Miller et al., Food and Beverage Cost Control (workbook), cap. 10.', 'Siebert, Franchise Your Business.', 'Chick-fil-A, Tim Hortons, Dunkin\', Wingstop, Raising Cane\'s, McDonald\'s, Starbucks e Crumbl (links na pesquisa).']
    .map(f => `<li>${f}</li>`).join('');
  $('#fimTxt').innerHTML = `No conservador, a conversão da rede vai de ${pct(A.conversao)} para ${pct(C[0].conversao)}: <b>+${br0(C[0].ganho)}</b> por mês nas 28 lojas (${brlk(RD.ganho_ano)} por ano), sem insumo novo.`;
  $('#dec3').innerHTML = `<div><b>Testar em 14 lojas por ${semanas} semanas</b>Sobe em 30 minutos por loja com a planilha. As outras 14 ficam como controle. A raspadinha vem depois.</div>
    <div><b>Adota se subir</b>Adota se subir sem estourar trava. Volta se cair com 95% de confiança. Inconclusivo: estende 3 semanas.</div>
    <div><b>Volta sozinho</b>Trava estourou por 7 dias, o cardápio antigo volta. São até ${2 + semanas + 3} semanas no calendário.</div>`;

  (function () {
    const ze = $('#hero .ze img'); if (!ze || matchMedia('(pointer:coarse)').matches) return;
    const rx = gsap.quickTo(ze, 'rotationY', { duration: 0.6, ease: 'power3' }), ry = gsap.quickTo(ze, 'rotationX', { duration: 0.6, ease: 'power3' }),
      tx = gsap.quickTo(ze, 'x', { duration: 0.8, ease: 'power3' }), ty = gsap.quickTo(ze, 'y', { duration: 0.8, ease: 'power3' });
    gsap.set(ze, { transformPerspective: 900 });
    $('#hero').addEventListener('mousemove', e => { const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5; rx(nx * 16); ry(-ny * 10); tx(nx * 26); ty(ny * 18); });
    gsap.to('#hero .ze', { y: -12, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  })();

  /* ------------------------------------------------ hero: funil de partículas */
  (function particulas() {
    const cv = $('#funil'), ctx = cv.getContext('2d'); let W, H, dpr, parts = [];
    const niveis = [RP.vis_item / 100, RP.item_carr / 100, RP.carr_chk / 100, RP.chk_ped / 100];
    function tam() { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function nasce() { let fim = 4; for (let k = 0; k < 4; k++) if (Math.random() > niveis[k]) { fim = k; break; } return { x: W * (0.56 + Math.random() * 0.4), y: -10, v: 0.6 + Math.random() * 0.9, r: 2 + Math.random() * 2.5, fim, a: 1, dx: 0 }; }
    tam(); addEventListener('resize', tam);
    let vis = true; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(cv);
    function loop() {
      try {
        requestAnimationFrame(loop); if (!vis) return;
        ctx.clearRect(0, 0, W, H);
        if (parts.length < 260) parts.push(nasce());
        ctx.fillStyle = 'rgba(147,23,45,.55)'; ctx.beginPath();
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i], nivelY = H * (0.2 + 0.17 * p.fim);
          p.y += p.v * 1.6;
          if (p.fim < 4 && p.y > nivelY) { p.dx += (p.x > W * 0.76 ? 0.12 : -0.12); p.a -= 0.02; }
          p.x += p.dx;
          if (p.a <= 0 || p.y > H + 10) { parts.splice(i, 1); continue; }
          ctx.moveTo(p.x + p.r, p.y); ctx.arc(p.x, p.y, p.r * (p.fim === 4 && p.y > H * 0.88 ? 1.6 : 1), 0, 6.283);
        }
        ctx.fill();
      } catch (e) { console.warn(e); }
    }
    loop();
  })();

  /* ------------------------------------------------ rolagem, cenas, apresentação */
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
  lenis.on('scroll', e => { window.__lenisY = e.scroll; ScrollTrigger.update(); if (window.__site && window.__site.ready) subStop(); }); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  const secs = $$('section');
  $('#dots').innerHTML = secs.map((s, i) => `<button title="${s.dataset.nome}" data-i="${i}"></button>`).join('');
  $$('#dots button').forEach(b => b.onclick = () => goSec(+b.dataset.i, true));
  function contar(sec) {
    if (sec.id === 'hero') { const el = $('#kMcv'), o = { v: 0 }; gsap.to(o, { v: C[0].ganho, duration: 2.2, delay: 0.6, ease: 'power2.out', onUpdate: () => el.textContent = '+' + brlk(o.v) }); }
    sec.querySelectorAll('.vaza>b, .hx b, .kpi b:not(#kMcv), .conta b').forEach(el => {
      if (el.dataset.contou) return; el.dataset.contou = 1; const txt = el.textContent, m = txt.match(/^([^\d]*)([\d.]+)(,\d+)?(.*)$/);
      if (!m) return; const alvo = parseFloat(m[2].replace(/\./g, '')), dec = m[3] ? m[3].length - 1 : 0, o = { v: 0 };
      if (!(alvo > 0)) return;
      gsap.to(o, { v: alvo + (m[3] ? parseFloat('0.' + m[3].slice(1)) : 0), duration: 1.4, ease: 'power2.out', onUpdate: () => {
        const v = o.v; el.textContent = m[1] + (dec ? v.toFixed(dec).replace('.', ',') : Math.round(v).toLocaleString('pt-BR')) + m[4]; }, onComplete: () => el.textContent = txt });
    });
  }
  function revelar(sec, instant) {
    if (!instant) contar(sec);
    if (!instant && sec.id === 'margem' && !sec.dataset.mz) { sec.dataset.mz = 1; gsap.from('#split .sp-bar i', { width: 0, duration: 0.8, ease: 'power3.out', stagger: 0.05, delay: 0.4 }); }
    if (!instant && sec.id === 'comparativo' && !sec.dataset.ponte) { sec.dataset.ponte = 1; gsap.from('#ponte .pb', { width: 0, duration: 0.9, ease: 'power3.out', stagger: 0.3, delay: 0.5 }); }
    const els = sec.querySelectorAll('.rev:not(.feito)'); if (!els.length) return;
    els.forEach(e => e.classList.add('feito'));
    if (instant) gsap.set(els, { opacity: 1, y: 0 }); else gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07 });
    sec.querySelectorAll('[data-w]').forEach(b => { if (instant) b.style.width = b.dataset.w + '%'; else gsap.to(b, { width: b.dataset.w + '%', duration: 1.3, ease: 'power3.out', delay: 0.2 }); });
  }
  let atualI = 0;
  secs.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 62%', end: 'bottom 38%', onToggle: st => { if (st.isActive) { atualI = i; tema(s); $('#cenaNome').textContent = s.dataset.nome; $$('#dots button').forEach((b, j) => b.classList.toggle('on', j === i)); revelar(s); if (s.id === 'volta' && window.__raspaPinta) window.__raspaPinta(); if (s.id === 'corrida' && !s.dataset.rodou && window.__site.ready && !auto) { s.dataset.rodou = 1; setTimeout(() => { if (atualI === i) window.__corrida.correr(); }, 2600); } } } }));
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: st => $('#progresso').style.width = (st.progress * 100) + '%' });
  // paradas: topo de cada seção e, nas seções mais altas que a tela, pontos extras até o fim dela
  let STOPS = [], stopI = 0;
  var GUIA_EXTRA = GUIA_EXTRA || {}; GUIA_EXTRA = { vaza: ['E 62% desistem na conta final.'], novo: ['Mix do Zé em 1 toque, e a sugestão sai mais barata que o avulso.'], };
  var GUIA = { filme: ['ze-joia', 'Dá o play: é 1 minuto.'], vaza: ['ze-forte', '54% saem na tela do item. É ali que a gente mexe!'], hoje: ['zefa-oi', 'À esquerda o de hoje, à direita o novo.'],
    corrida: ['ze-bike', 'Primeiro o de hoje. Depois o novo.'], novo: ['zefa-abraco', 'Abre um item e olha o modo gestor.'], opcoes: ['ze-joia', 'Tudo com insumo que a rede já tem.'],
    margem: ['ze-forte', 'Olha o amarelo: é o que fica pra loja.'], volta: ['ze-apaixonado', 'Raspou, ganhou!'],
    mundo: ['ze-surf', 'Quem vende por contagem lá fora já faz assim.'], prova: ['ze-forte', 'Um número decide. Três protegem.'], implantar: ['zefa-oi', '30 minutos no Portal por loja.'] };
  var guiaAtual = null;
  function guia(s) {
    if (!GUIA) return; const g = GUIA[s.id], el = $('#guia'); if (!el) return;
    if (!g) { if (guiaAtual === '') return; guiaAtual = ''; if (window.__guiaTl) window.__guiaTl.kill(); window.__guiaTl = gsap.to(el, { opacity: 0, y: 30, scale: 0.8, duration: 0.3 }); return; }
    const k = s.__sub || 0, fala = k && GUIA_EXTRA && GUIA_EXTRA[s.id] ? GUIA_EXTRA[s.id][Math.min(k, GUIA_EXTRA[s.id].length) - 1] : g[1], chave = s.id + '|' + fala;
    if (guiaAtual === chave) return; guiaAtual = chave; if (window.__guiaTl) window.__guiaTl.kill();
    const bal = el.querySelector('.bal');
    window.__guiaTl = gsap.timeline().to(el, { opacity: 0, y: 20, scale: 0.85, duration: 0.18 }).call(() => { el.querySelector('img').src = `assets/img/m/${g[0]}.webp`; bal.textContent = fala; })
      .to(el, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(2.2)' }).fromTo(bal, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3 }, '-=0.2');
  }
  var PASSO_SEC = { hero: 'hoje', filme: 'hoje', vaza: 'hoje', hoje: 'hoje', corrida: 'hoje', novo: 'hoje', margem: 'hoje', comparativo: 'hoje', opcoes: 'hoje', volta: 'hoje', mundo: 'conversao', prova: 'conversao', riscos: 'conversao', implantar: 'conversao', decisao: 'conversao' };
  var MCVP = calc(C[0].premissas).mes, teseO = { v: MCVP.hoje }, teseAlvo = MCVP.hoje;
  const rs0 = v => 'R$ ' + n0(v);
  $('#teseHud b').textContent = rs0(MCVP.hoje);
  var teseSec = '';
  function tese(s, forcar) {
    if (!MCVP) return; const passo = forcar || PASSO_SEC[s.id] || 'hoje';
    const r2 = v => Math.round(v), di = $('#teseDelta');
    if (s.id !== teseSec) { teseSec = s.id; gsap.killTweensOf(di); di.textContent = ''; }
    const alvo = MCVP[passo];
    if (!window.__site || !window.__site.ready) { gsap.killTweensOf(teseO); teseAlvo = alvo; teseO.v = alvo; $('#teseHud b').textContent = rs0(alvo); return; }
    if (s.id === 'decisao') { di.textContent = '+' + rs0(MCVP.conversao - MCVP.hoje) + ' sobre hoje'; gsap.fromTo(di, { opacity: 0 }, { opacity: 1, duration: 0.5 }); }
    if (Math.abs(alvo - teseAlvo) < 0.001) return;
    const d = r2(alvo) - r2(teseAlvo), de = teseAlvo; teseAlvo = alvo;
    const atualiza = () => {
      gsap.to(teseO, { v: alvo, duration: 1.2, ease: 'power2.out', onUpdate: () => $('#teseHud b').textContent = rs0(teseO.v) });
      if (d > 0) { gsap.fromTo('#teseHud', { scale: 1 }, { scale: 1.35, duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1, repeatDelay: 0.6 });
        if (s.id === teseSec && s.id !== 'decisao') { di.textContent = passo === 'conversao' ? '+' + rs0(MCVP.conversao - MCVP.hoje) + ' sobre hoje' : '+' + rs0(d); gsap.fromTo(di, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.4 }); } }
    };
    if (passo === 'conversao' && d > 0 && !tese.grande && window.__site && window.__site.ready) { tese.grande = true; grande(de, alvo, atualiza); }
    else atualiza();
  }
  function grande(de, ate, fim) {
    const o = { v: de }, el = $('#teseBig');
    el.querySelector('.car').textContent = '+' + br0(C[0].ganho) + ' por mês sobre hoje';
    window.__voando = true;
    gsap.timeline().set(el, { autoAlpha: 1, scale: 0.6 }).to(el, { scale: 1, duration: 0.4, ease: 'back.out(1.8)' })
      .to(o, { v: ate, duration: 1.1, ease: 'power2.out', onUpdate: () => el.querySelector('b').textContent = rs0(o.v) }, '<')
      .fromTo(el.querySelector('.car'), { scale: 2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, '-=0.3')
      .to(el, { autoAlpha: 0, scale: 0.35, x: innerWidth * 0.25, y: -innerHeight * 0.42, duration: 0.5, ease: 'power2.in', delay: 0.7 })
      .set(el, { x: 0, y: 0 }).call(() => { window.__voando = false; fim && fim(); });
  }
  function tema(s) { guia(s); tese(s); document.body.dataset.tema = s.classList.contains('escuro') ? 'escuro' : (s.classList.contains('tinta') || s.id === 'corrida' || s.id === 'filme') ? 'tinta' : s.classList.contains('mostarda') || s.id === 'hero' ? 'mostarda' : 'claro';
    $('#hud .logo').src = document.body.dataset.tema === 'mostarda' ? 'assets/img/m/logo-vinho.webp' : (document.body.dataset.tema === 'claro' ? 'assets/img/m/logo.webp' : 'assets/img/m/logo-branco.webp'); }
  function calcStops() {
    STOPS = []; const vh = innerHeight, HUD = 110;
    secs.forEach((s, si) => {
      const top = s.offsetTop, fim = top + s.offsetHeight; STOPS.push({ y: top, si });
      if (s.offsetHeight <= vh * 1.12) return;
      const blocos = [...s.querySelectorAll('.wrap > *, .wrap > div > *')].map(b => b.getBoundingClientRect().top + scrollY - HUD).filter(y => y > top + 60 && y < fim - vh * 0.3).sort((a, b) => a - b);
      let cur = top; const tit = s.querySelector('h2');
      while (cur + vh < fim - 8) {
        const cand = blocos.filter(y => y > cur + 80 && y <= cur + vh * 0.9);
        let nxt = cand.length ? cand[cand.length - 1] : cur + vh * 0.8;
        if (nxt > fim - vh) nxt = fim - vh;
        if (tit) { const r = tit.getBoundingClientRect(), t0 = r.top + scrollY, t1 = r.bottom + scrollY; if (t0 < nxt + HUD && t1 > nxt + HUD) nxt = t1 - HUD + 14; }
        if (nxt - cur < vh * 0.35) { if (fim - vh - cur < vh * 0.35) break; nxt = Math.max(nxt, cur + vh * 0.35); }
        STOPS.push({ y: nxt, si }); cur = nxt;
      }
    });
    if (window.__site) window.__site.stops = STOPS.length;
  }
  function stopAtual() { const y = (window.__lenisY != null ? window.__lenisY : scrollY) + 4; let k = 0; STOPS.forEach((s, i) => { if (s.y <= y) k = i; }); return k; }
  function go(i, anim) {
    i = Math.max(0, Math.min(STOPS.length - 1, i)); const st = STOPS[i], s = secs[st.si];
    if (anim) lenis.scrollTo(st.y, { duration: 1.1, easing: t => 1 - Math.pow(1 - t, 3) }); else { lenis.scrollTo(st.y, { immediate: true, force: true }); revelar(s, true); }
    atualI = st.si; stopI = i; ultimoStop = -1; setTimeout(subStop, anim ? 1150 : 60); $('#cenaNome').textContent = s.dataset.nome; $$('#dots button').forEach((b, j) => b.classList.toggle('on', j === st.si));
  }
  const goSec = (si, anim) => go(STOPS.findIndex(s => s.si === si), anim);
  var ultimoStop = -1;
  function subStop() { if (!STOPS.length) return; const k = stopAtual(); if (k === ultimoStop) return; const si = STOPS[k].si; if (si !== atualI) return; ultimoStop = k; const first = STOPS.findIndex(s => s.si === si); secs[si].__sub = k - first; guia(secs[si]); if (secs[si].id === 'comparativo') tese(secs[si], secs[si].__sub >= 1 ? 'conversao' : null); }
  function checaGuia() { const livre = (innerWidth - Math.min(1320, innerWidth - 160)) / 2; document.body.classList.toggle('com-guia', livre >= 230 && innerHeight >= 700); }
  checaGuia(); addEventListener('resize', checaGuia);
  let auto = null;
  async function autoplay() {
    if (auto) { clearTimeout(auto); auto = null; document.body.classList.remove('auto'); $('#btnAuto').textContent = '▶ Apresentar'; return; }
    document.body.classList.add('auto'); $('#btnAuto').textContent = '❚❚ Pausar';
    const passo = async () => {
      if (!auto) return;
      const k = stopAtual(), sid = secs[STOPS[k].si].id;
      if (sid === 'corrida' && !window.__corrida.ativo && !passo.fez) { passo.fez = true; await window.__corrida.correr(); await sleep(2500); }
      if (k >= STOPS.length - 1) { autoplay(); return; }
      go(k + 1, true); const nid = secs[STOPS[k + 1].si].id; auto = setTimeout(passo, nid === 'corrida' ? 2200 : 7000);
    };
    auto = setTimeout(passo, 1500);
  }
  $('#btnAuto').onclick = autoplay;
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); if (window.__voando) return; go(stopAtual() + 1, true); }
    else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); const k = stopAtual(); go(STOPS[k].y < scrollY - 8 ? k : k - 1, true); }
    else if (e.key === 'Home') { e.preventDefault(); go(0, true); }
    else if (e.key === 'End') { e.preventDefault(); go(STOPS.length - 1, true); }
    else if (e.key.toLowerCase() === 'a') autoplay();
    else if (e.key.toLowerCase() === 'c') { goSec(secs.findIndex(s => s.id === 'corrida'), true); setTimeout(() => window.__corrida.correr(), 1200); }
    else if (e.key.toLowerCase() === 'v') { goSec(secs.findIndex(s => s.id === 'filme'), true); setTimeout(() => $('#playV').click(), 1200); }
  });

  function ajustaCel() {
    document.body.classList.add('cel-fixo');
    for (let n = 0; n < 2; n++) $$('#celA, #celN, #celNovo').forEach(c => {
      const sec = c.closest('section'), topo = c.getBoundingClientRect().top - sec.getBoundingClientRect().top;
      const k = Math.max(0.5, Math.min(1, (innerHeight - topo - 26) / 740));
      c.style.transform = `scale(${k})`; c.style.marginBottom = `${-740 * (1 - k)}px`; c.style.marginLeft = c.style.marginRight = `${-360 * (1 - k) / 2}px`;
    });
  }
  ajustaCel(); addEventListener('resize', ajustaCel);
  window.__site = { stops: secs.length, ready: false, go: i => go(i, false), next: d => go(stopAtual() + (d || 1), true) };
  calcStops(); addEventListener('resize', () => { calcStops(); ScrollTrigger.refresh(); });

  /* ------------------------------------------------ preloader que aquece */
  (async function aquecer() {
    const imgs = [...new Set([...$$('img')].map(i => i.src).concat(['100-salg', '100-coca', '50-coca', '25-coca', '20-churros', 'coxinha-coca', 'coxinha-grande', 'festa-6', '50-salg', '25-salg', '5-coxinhas'].flatMap(k => [`assets/img/p/${k}.webp`, `assets/img/p/${k}-s.webp`])))];
    let n = 0; const barra = $('#pre .barra i');
    await Promise.all(imgs.map(src => { const im = new Image(); im.src = src; return im.decode().catch(() => {}).then(() => { n++; barra.style.width = (100 * n / imgs.length) + '%'; }); }));
    await document.fonts.ready;
    ajustaCel(); ScrollTrigger.refresh(); calcStops();
    const raf = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    document.documentElement.classList.add('aquecer');
    for (const st of STOPS) { window.scrollTo(0, st.y); await raf(); }
    document.documentElement.classList.remove('aquecer'); lenis.scrollTo(0, { immediate: true, force: true }); await raf();
    tema(secs[0]); revelar(secs[0]);
    $('#pre').classList.add('fora'); window.__site.ready = true;
  })();
})();
